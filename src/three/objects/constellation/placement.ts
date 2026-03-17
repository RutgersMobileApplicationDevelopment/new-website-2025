import type { ConstellationMotif, ConstellationPoint } from '@/components/constellations';
import { landingConstellationConfig } from '@/components/constellations';
import type { Bounds2D, ConstellationInstance, GuideTransform, SvgGuideData } from './types';
import { clamp, mulberry32, nearestContourPoint, randomIn, toroidalDistanceSq } from './utils';

/* ────────────────────────────────────────────────────────────────────────────
 * Constellation Layer — Placement & Instance Generation
 *
 * Handles everything related to *where* and *how* constellation instances
 * end up in the scene:
 *   • Weighted motif selection
 *   • Edge-biased position sampling (avoids screen centre)
 *   • Collision-aware spacing with toroidal distance checks
 *   • Deterministic point-star generation along SVG contours
 * ──────────────────────────────────────────────────────────────────────────── */

// ── Guide geometry helpers ────────────────────────────────────────────────

/** Compute the world-space footprint transform for an SVG guide. */
export function getGuideTransform(guide: SvgGuideData): GuideTransform {
  if (guide.contourPoints.length === 0) {
    return { width: guide.aspect, height: 1, centerX: 0, centerY: 0 };
  }

  const { minX, maxX, minY, maxY } = guide.contourBounds;

  const width = Math.max((maxX - minX) * guide.aspect, 0.01);
  const height = Math.max(maxY - minY, 0.01);
  const centerX = ((minX + maxX) * 0.5 - 0.5) * guide.aspect;
  const centerY = (minY + maxY) * 0.5 - 0.5;

  return { width, height, centerX, centerY };
}

/** Half-diagonal of the guide's bounding box at the given scale. */
export function computeFootprintRadius(guide: SvgGuideData, scale: number): number {
  const transform = getGuideTransform(guide);
  const halfW = (transform.width * scale) * 0.5;
  const halfH = (transform.height * scale) * 0.5;
  return Math.sqrt(halfW * halfW + halfH * halfH);
}

// ── Motif weighting ──────────────────────────────────────────────────────

interface WeightedMotif {
  motif: ConstellationMotif;
  cumulativeWeight: number;
}

/** Build a cumulative-weight table for weighted random motif selection. */
export function buildMotifWeights(motifs: ConstellationMotif[]): WeightedMotif[] {
  const freqMap = landingConstellationConfig.constellationGeneration.motifFrequency;
  const items: WeightedMotif[] = [];
  let cumulative = 0;

  motifs.forEach((motif) => {
    const weight = Math.max(0, freqMap[motif.id] ?? 1);
    if (weight <= 0) return;
    cumulative += weight;
    items.push({ motif, cumulativeWeight: cumulative });
  });

  if (items.length === 0) {
    motifs.forEach((motif) => {
      cumulative += 1;
      items.push({ motif, cumulativeWeight: cumulative });
    });
  }

  return items;
}

/** Select a motif using the cumulative-weight table. */
export function pickMotifByWeight(
  weighted: WeightedMotif[],
  rng: () => number,
): ConstellationMotif {
  const totalWeight = weighted[weighted.length - 1].cumulativeWeight;
  const needle = rng() * totalWeight;

  for (const item of weighted) {
    if (needle <= item.cumulativeWeight) return item.motif;
  }

  return weighted[weighted.length - 1].motif;
}

// ── Position sampling ────────────────────────────────────────────────────

/**
 * Sample a position biased toward screen edges (top/bottom/left/right 27 %).
 * Rejects candidates that land inside a central ellipse to keep the phone
 * area clear.
 */
export function sampleEdgeBiasedPosition(
  bounds: Bounds2D,
  rng: () => number,
): [number, number] {
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const cx = (bounds.minX + bounds.maxX) * 0.5;
  const cy = (bounds.minY + bounds.maxY) * 0.5;
  const centerRx = width * 0.24;
  const centerRy = height * 0.2;

  for (let i = 0; i < 32; i++) {
    const zone = Math.floor(rng() * 4);
    let x: number;
    let y: number;

    if (zone === 0) {
      x = bounds.minX + rng() * width;
      y = bounds.maxY - rng() * (height * 0.27);
    } else if (zone === 1) {
      x = bounds.minX + rng() * width;
      y = bounds.minY + rng() * (height * 0.27);
    } else if (zone === 2) {
      x = bounds.minX + rng() * (width * 0.26);
      y = bounds.minY + rng() * height;
    } else {
      x = bounds.maxX - rng() * (width * 0.26);
      y = bounds.minY + rng() * height;
    }

    const nx = (x - cx) / centerRx;
    const ny = (y - cy) / centerRy;
    if (nx * nx + ny * ny > 1) return [x, y];
  }

  return [bounds.minX + rng() * width, bounds.minY + rng() * height];
}

// ── Collision detection ──────────────────────────────────────────────────

/** True if `candidate` is far enough from every existing footprint. */
export function shouldPlaceCandidate(
  candidate: [number, number],
  radius: number,
  existing: Array<{ x: number; y: number; radius: number }>,
  spanX: number,
  spanY: number,
  extraGap: number,
): boolean {
  for (const it of existing) {
    const minDistance = radius + it.radius + extraGap;
    if (toroidalDistanceSq(candidate, [it.x, it.y], spanX, spanY) < minDistance * minDistance) {
      return false;
    }
  }
  return true;
}

/** Minimum toroidal distance from a candidate to any existing footprint. */
function minToroidalDistance(
  candidate: [number, number],
  existing: Array<{ x: number; y: number; radius: number }>,
  spanX: number,
  spanY: number,
): number {
  if (existing.length === 0) return Number.POSITIVE_INFINITY;

  let minDist = Number.POSITIVE_INFINITY;
  for (const it of existing) {
    const d = Math.sqrt(toroidalDistanceSq(candidate, [it.x, it.y], spanX, spanY));
    if (d < minDist) minDist = d;
  }
  return minDist;
}

// ── Deterministic point-star generation ──────────────────────────────────

/**
 * Pick `count` points along the SVG contour with optional jitter.
 * Uses a seeded RNG so identical seeds always yield the same star layout.
 */
export function generateInstancePoints(
  contourPoints: ConstellationPoint[],
  count: number,
  jitter: number,
  seed: number,
): ConstellationPoint[] {
  if (contourPoints.length === 0 || count <= 0) return [];

  const rng = mulberry32(seed);
  const sorted = contourPoints.slice();
  const n = sorted.length;
  const used = new Set<number>();
  const points: ConstellationPoint[] = [];

  const stride = Math.max(1, Math.floor(n / count));

  for (let i = 0; i < count * 3 && points.length < count; i++) {
    const base = Math.floor((i * stride + rng() * stride) % n);
    if (used.has(base)) continue;
    used.add(base);

    let point = sorted[base];

    if (jitter > 0) {
      const candidate: ConstellationPoint = [
        clamp(point[0] + (rng() * 2 - 1) * jitter, 0, 1),
        clamp(point[1] + (rng() * 2 - 1) * jitter, 0, 1),
      ];
      point = nearestContourPoint(candidate, contourPoints);
    }

    points.push(point);
  }

  while (points.length < count) {
    points.push(sorted[Math.floor(rng() * n)]);
  }

  return points;
}

/**
 * Convert normalised [0..1] contour points into a flat Float32Array of
 * local-space 3-D positions (centred on the guide origin).
 */
export function buildLocalPointBuffer(guide: SvgGuideData, points: ConstellationPoint[]): Float32Array {
  const pts = points.length > 0 ? points : guide.contourPoints.slice(0, 6);
  const buffer = new Float32Array(pts.length * 3);
  pts.forEach(([x, y], idx) => {
    buffer[idx * 3] = (x - 0.5) * guide.aspect;
    buffer[idx * 3 + 1] = y - 0.5;
    buffer[idx * 3 + 2] = 0.01;
  });
  return buffer;
}

/** Sample a random tilt within the motif's allowed range. */
export function sampleTilt(rng: () => number, motif: ConstellationMotif): number {
  const magnitude = randomIn(0, motif.maxTilt);
  const sign = rng() > 0.5 ? 1 : -1;
  return magnitude * sign;
}

// ── Full instance batch generation ──────────────────────────────────────

/**
 * Generate a complete batch of `ConstellationInstance`s for the current
 * regeneration epoch.  Handles weighted motif selection, size clamping,
 * collision-aware placement, and guaranteed minimum-visible fallback.
 */
export function generateInstances(
  motifs: ConstellationMotif[],
  guides: Map<string, SvgGuideData>,
  bounds: Bounds2D & { minZ: number; maxZ: number },
  spanX: number,
  spanY: number,
  regenEpoch: number,
): ConstellationInstance[] {
  const generationCfg = landingConstellationConfig.constellationGeneration;
  const spread = landingConstellationConfig.spread;

  const requested = Math.max(0, generationCfg.count);
  const visibilityMin = Math.min(
    Math.max(1, generationCfg.visibleAtOnce.min),
    Math.max(1, requested),
  );

  const placed: ConstellationInstance[] = [];
  const occupied: Array<{ x: number; y: number; radius: number }> = [];
  const globalGap = generationCfg.spacing.minDistance;
  const motifWeighted = buildMotifWeights(motifs);

  // ── Primary placement pass ───────────────────────────────────────────
  for (let i = 0; i < requested; i++) {
    const seedRng = mulberry32(1783 + regenEpoch * 997 + i * 131 + motifs.length * 29);
    const motif = pickMotifByWeight(motifWeighted, seedRng);
    const guide = guides.get(motif.svgPath);
    if (!guide) continue;

    const jitter = generationCfg.sizing.sizeJitter;
    const sizeFactor = 1 + (seedRng() * 2 - 1) * jitter;
    const unclampedScale = generationCfg.sizing.averageSize * sizeFactor * motif.sizeMultiplier;
    const minScale = generationCfg.sizing.averageSize * motif.minSizeMultiplier;
    const maxScale = generationCfg.sizing.averageSize * motif.maxSizeMultiplier;
    const motifClampedScale = clamp(unclampedScale, minScale, maxScale);
    const scale = clamp(
      motifClampedScale,
      landingConstellationConfig.scaleRange[0],
      landingConstellationConfig.scaleRange[1],
    );
    const radius = computeFootprintRadius(guide, scale);

    let selected: [number, number] | null = null;
    let bestCandidate: [number, number] | null = null;
    let bestDistance = Number.NEGATIVE_INFINITY;

    for (let attempt = 0; attempt < generationCfg.spacing.placementAttemptsPerConstellation; attempt++) {
      const candidate = sampleEdgeBiasedPosition(bounds, seedRng);
      const d = minToroidalDistance(candidate, occupied, spanX, spanY);

      if (d > bestDistance) {
        bestDistance = d;
        bestCandidate = candidate;
      }

      if (shouldPlaceCandidate(candidate, radius, occupied, spanX, spanY, globalGap)) {
        selected = candidate;
        break;
      }
    }

    if (!selected && bestCandidate && shouldPlaceCandidate(bestCandidate, radius, occupied, spanX, spanY, globalGap * 0.8)) {
      selected = bestCandidate;
    }

    if (!selected) continue;

    occupied.push({ x: selected[0], y: selected[1], radius });
    const instanceIndex = placed.length;
    placed.push({
      motif,
      position: [selected[0], selected[1], randomIn(spread.minZ, spread.maxZ)],
      scale,
      rotationZ: sampleTilt(seedRng, motif),
      pointSeed: Math.floor(seedRng() * 1_000_000),
      index: instanceIndex,
    });
  }

  // ── Fallback: guarantee at least `visibilityMin` instances ─────────
  while (placed.length < visibilityMin) {
    const i = placed.length;
    const seedRng = mulberry32(7919 + regenEpoch * 307 + i * 211 + motifs.length * 17);
    const motif = pickMotifByWeight(motifWeighted, seedRng);
    const sizeFactor = 1 + (seedRng() * 2 - 1) * generationCfg.sizing.sizeJitter;
    const unclampedScale = generationCfg.sizing.averageSize * sizeFactor * motif.sizeMultiplier;
    const minScale = generationCfg.sizing.averageSize * motif.minSizeMultiplier;
    const maxScale = generationCfg.sizing.averageSize * motif.maxSizeMultiplier;
    const scale = clamp(
      clamp(unclampedScale, minScale, maxScale),
      landingConstellationConfig.scaleRange[0],
      landingConstellationConfig.scaleRange[1],
    );

    placed.push({
      motif,
      position: [
        randomIn(bounds.minX, bounds.maxX),
        randomIn(bounds.minY, bounds.maxY),
        randomIn(spread.minZ, spread.maxZ),
      ],
      scale,
      rotationZ: sampleTilt(seedRng, motif),
      pointSeed: Math.floor(seedRng() * 1_000_000),
      index: i,
    });
  }

  return placed;
}
