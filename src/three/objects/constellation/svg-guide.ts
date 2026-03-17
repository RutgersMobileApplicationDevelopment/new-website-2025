'use client';

import { useEffect, useState } from 'react';
import type { ConstellationPoint } from '@/components/constellations';
import type { SvgGuideData } from './types';
import { clamp } from './utils';

/* ────────────────────────────────────────────────────────────────────────────
 * Constellation Layer — SVG Guide Extraction & Caching
 *
 * Loads an SVG file, rasterises it off-screen, then extracts edge samples
 * from the alpha channel.  If rasterisation fails (e.g. CORS, missing
 * canvas support) it falls back to walking <path> geometry with
 * `getPointAtLength`.  Results are cached so each SVG is only processed once.
 * ──────────────────────────────────────────────────────────────────────────── */

// ── Module-level caches ────────────────────────────────────────────────────

const svgGuidePromiseCache = new Map<string, Promise<SvgGuideData>>();
const svgGuideDataCache = new Map<string, SvgGuideData>();

// ── Internal helpers ───────────────────────────────────────────────────────

/** Parse an SVG `viewBox` attribute into [minX, minY, width, height]. */
function parseViewBox(viewBox: string | null): [number, number, number, number] {
  if (!viewBox) return [0, 0, 1, 1];
  const values = viewBox.trim().split(/\s+/).map(Number);
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) return [0, 0, 1, 1];
  return [values[0], values[1], values[2] || 1, values[3] || 1];
}

/** Map a viewBox-space pixel to a normalised [0..1] point (y-flipped). */
function normalizePoint(
  x: number,
  y: number,
  bounds: { minX: number; minY: number; width: number; height: number },
): ConstellationPoint {
  const nx = clamp((x - bounds.minX) / bounds.width, 0, 1);
  const ny = clamp(1 - (y - bounds.minY) / bounds.height, 0, 1);
  return [Number(nx.toFixed(6)), Number(ny.toFixed(6))];
}

/**
 * Walk the rasterised alpha channel and collect pixels on shape edges.
 * A pixel is "edge" if it is opaque and at least one of its 8 neighbours
 * is transparent — a simple Sobel-like boundary detector.
 */
function buildEdgeSamplesFromAlpha(
  alpha: Uint8ClampedArray,
  width: number,
  height: number,
  normalizeBounds: { minX: number; minY: number; width: number; height: number },
): ConstellationPoint[] {
  const threshold = 18;
  const edgeSamples: ConstellationPoint[] = [];

  const alphaAt = (x: number, y: number) => alpha[(y * width + x) * 4 + 3];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const center = alphaAt(x, y);
      if (center <= threshold) continue;

      const n1 = alphaAt(x - 1, y);
      const n2 = alphaAt(x + 1, y);
      const n3 = alphaAt(x, y - 1);
      const n4 = alphaAt(x, y + 1);
      const n5 = alphaAt(x - 1, y - 1);
      const n6 = alphaAt(x + 1, y - 1);
      const n7 = alphaAt(x - 1, y + 1);
      const n8 = alphaAt(x + 1, y + 1);

      const isEdge = n1 <= threshold || n2 <= threshold || n3 <= threshold || n4 <= threshold
        || n5 <= threshold || n6 <= threshold || n7 <= threshold || n8 <= threshold;

      if (isEdge) {
        const px = normalizeBounds.minX + (x / Math.max(width - 1, 1)) * normalizeBounds.width;
        const py = normalizeBounds.minY + (y / Math.max(height - 1, 1)) * normalizeBounds.height;
        edgeSamples.push(normalizePoint(px, py, normalizeBounds));
      }
    }
  }

  return edgeSamples;
}

/** Remove near-duplicate points and uniformly down-sample to `maxCount`. */
function dedupeAndDownsample(points: ConstellationPoint[], maxCount: number): ConstellationPoint[] {
  if (points.length <= maxCount) return points;

  const unique = new Map<string, ConstellationPoint>();
  for (const point of points) {
    const key = `${Math.round(point[0] * 1000)}-${Math.round(point[1] * 1000)}`;
    if (!unique.has(key)) unique.set(key, point);
  }

  const deduped = Array.from(unique.values());
  if (deduped.length <= maxCount) return deduped;

  const sampled: ConstellationPoint[] = [];
  const step = deduped.length / maxCount;
  for (let i = 0; i < maxCount; i++) sampled.push(deduped[Math.floor(i * step)]);
  return sampled;
}

/** Compute bounding box for an array of normalised contour points. */
function computeContourBounds(contourPoints: ConstellationPoint[]) {
  let cMinX = Number.POSITIVE_INFINITY;
  let cMaxX = Number.NEGATIVE_INFINITY;
  let cMinY = Number.POSITIVE_INFINITY;
  let cMaxY = Number.NEGATIVE_INFINITY;

  contourPoints.forEach(([x, y]) => {
    if (x < cMinX) cMinX = x;
    if (x > cMaxX) cMaxX = x;
    if (y < cMinY) cMinY = y;
    if (y > cMaxY) cMaxY = y;
  });

  return {
    minX: Number.isFinite(cMinX) ? cMinX : 0,
    maxX: Number.isFinite(cMaxX) ? cMaxX : 1,
    minY: Number.isFinite(cMinY) ? cMinY : 0,
    maxY: Number.isFinite(cMaxY) ? cMaxY : 1,
  };
}

/**
 * Primary extraction pipeline: rasterise → edge-detect → normalise.
 * Falls back to walking `<path>` geometry if the canvas route fails.
 */
async function extractContourFromSvgText(svgText: string): Promise<SvgGuideData> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  const [minX, minY, width, height] = parseViewBox(svg?.getAttribute('viewBox') ?? null);
  const bounds = { minX, minY, width, height };

  // ── Try rasterisation first ────────────────────────────────────────────
  try {
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const bitmap = await createImageBitmap(blob);
    const sampleWidth = clamp(bitmap.width, 64, 640);
    const sampleHeight = clamp(bitmap.height, 64, 640);

    const canvas = document.createElement('canvas');
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('2d context unavailable');

    ctx.clearRect(0, 0, sampleWidth, sampleHeight);
    ctx.drawImage(bitmap, 0, 0, sampleWidth, sampleHeight);

    const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const edgeSamples = buildEdgeSamplesFromAlpha(imageData.data, sampleWidth, sampleHeight, bounds);
    const contourPoints = dedupeAndDownsample(edgeSamples, 2200);

    if (contourPoints.length > 20) {
      return {
        aspect: width / Math.max(height, 1),
        contourPoints,
        contourBounds: computeContourBounds(contourPoints),
      };
    }
  } catch {
    // Fall through to path-walking fallback
  }

  // ── Fallback: walk <path d="…"> geometry ───────────────────────────────
  const fallbackSamples: ConstellationPoint[] = [];
  const ns = 'http://www.w3.org/2000/svg';

  doc.querySelectorAll('path[d]').forEach((pathNode) => {
    const d = pathNode.getAttribute('d');
    if (!d) return;

    const tempPath = document.createElementNS(ns, 'path');
    tempPath.setAttribute('d', d);

    try {
      const totalLength = Math.max(1, tempPath.getTotalLength());
      const count = Math.max(120, Math.min(900, Math.round(totalLength / 6)));
      for (let i = 0; i <= count; i++) {
        const p = tempPath.getPointAtLength((totalLength * i) / count);
        fallbackSamples.push(normalizePoint(p.x, p.y, bounds));
      }
    } catch {
      // Skip unparseable paths
    }
  });

  const contourPoints = dedupeAndDownsample(fallbackSamples, 1800);
  return {
    aspect: width / Math.max(height, 1),
    contourPoints,
    contourBounds: computeContourBounds(contourPoints),
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

/** Fetch + extract SVG guide data, deduplicating in-flight requests. */
export async function loadSvgGuideData(svgPath: string): Promise<SvgGuideData> {
  if (svgGuideDataCache.has(svgPath)) return svgGuideDataCache.get(svgPath)!;

  if (!svgGuidePromiseCache.has(svgPath)) {
    const promise = fetch(svgPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch SVG: ${svgPath}`);
        return response.text();
      })
      .then((svgText) => extractContourFromSvgText(svgText));

    svgGuidePromiseCache.set(svgPath, promise);
  }

  const guide = await svgGuidePromiseCache.get(svgPath)!;
  svgGuideDataCache.set(svgPath, guide);
  return guide;
}

/** React hook — returns `null` until the guide is ready. */
export function useSvgGuideData(svgPath: string): SvgGuideData | null {
  const [guide, setGuide] = useState<SvgGuideData | null>(
    () => svgGuideDataCache.get(svgPath) ?? null,
  );

  useEffect(() => {
    let cancelled = false;

    loadSvgGuideData(svgPath)
      .then((data) => {
        if (!cancelled) setGuide(data);
      })
      .catch(() => {
        if (!cancelled) {
          setGuide({
            aspect: 1,
            contourPoints: [],
            contourBounds: { minX: 0, maxX: 1, minY: 0, maxY: 1 },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [svgPath]);

  return guide;
}

/** React hook — resolves *all* SVG guides in parallel and signals readiness. */
export function useAllGuides(paths: string[]): { ready: boolean; guides: Map<string, SvgGuideData> } {
  const [guides, setGuides] = useState<Map<string, SvgGuideData>>(() => new Map());

  useEffect(() => {
    let cancelled = false;

    Promise.all(paths.map(async (path) => [path, await loadSvgGuideData(path)] as const))
      .then((entries) => {
        if (cancelled) return;
        setGuides(new Map(entries));
      })
      .catch(() => {
        // Individual failures are silently swallowed; guide map stays partial
      });

    return () => {
      cancelled = true;
    };
  }, [paths]);

  return {
    ready: guides.size === paths.length,
    guides,
  };
}
