import type { ConstellationPoint } from '@/components/constellations';

/* ────────────────────────────────────────────────────────────────────────────
 * Constellation Layer — Pure Utility Functions
 *
 * Stateless helpers used across the constellation sub-modules.
 * Nothing here touches React, Three.js, or the DOM.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Uniform random in [min, max). */
export function randomIn(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Clamp `value` to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Wrap `value` into the half-open interval [min, max). */
export function wrap(value: number, min: number, max: number): number {
  const span = max - min;
  if (span <= 0) return value;
  return ((((value - min) % span) + span) % span) + min;
}

/**
 * Mulberry32 — fast, seedable 32-bit PRNG.
 * Returns a closure that yields successive pseudo-random floats in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Squared Euclidean distance between two 2-D points. */
export function distanceSq(a: ConstellationPoint, b: ConstellationPoint): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

/** Return the contour point nearest to `candidate`. */
export function nearestContourPoint(
  candidate: ConstellationPoint,
  contourPoints: ConstellationPoint[],
): ConstellationPoint {
  let best = contourPoints[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const point of contourPoints) {
    const d = distanceSq(candidate, point);
    if (d < bestDistance) {
      bestDistance = d;
      best = point;
    }
  }

  return best;
}

/**
 * Squared distance between two 2-D points on a toroidal (wrapping) domain.
 * Used for collision avoidance during placement.
 */
export function toroidalDistanceSq(
  a: [number, number],
  b: [number, number],
  spanX: number,
  spanY: number,
): number {
  let dx = Math.abs(a[0] - b[0]);
  let dy = Math.abs(a[1] - b[1]);
  if (dx > spanX * 0.5) dx = spanX - dx;
  if (dy > spanY * 0.5) dy = spanY - dy;
  return dx * dx + dy * dy;
}

/**
 * Sample a warm star colour (RGB in [0,1]).
 * Distribution: ~35 % deep red, ~25 % orange, ~22 % gold, ~18 % white.
 */
export function sampleWarmStarColor(): [number, number, number] {
  const t = Math.random();

  if (t < 0.35) return [0.7 + Math.random() * 0.3, 0.04 + Math.random() * 0.12, 0.02 + Math.random() * 0.06];
  if (t < 0.6) return [0.85 + Math.random() * 0.15, 0.25 + Math.random() * 0.25, 0.04 + Math.random() * 0.1];
  if (t < 0.82) return [0.9 + Math.random() * 0.1, 0.78 + Math.random() * 0.15, 0.65 + Math.random() * 0.2];

  const v = 0.88 + Math.random() * 0.12;
  return [v, v, v];
}

/** Hermite smoothstep on [0, 1]. */
export function smoothstep01(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/** Return a value randomly jittered around `base` by ±`jitter`, clamped ≥ 0. */
export function randomAround(base: number, jitter: number): number {
  return Math.max(0, base + (Math.random() * 2 - 1) * jitter);
}

/**
 * Pick a deterministic constellation tint from the given palette.
 * Falls back to bright warm colours if no palette is provided.
 */
export function randomConstellationColor(seed: number, palette?: string[]): string {
  const pool = palette && palette.length > 0
    ? palette
    : ['#ff5544', '#ff7733', '#ee4422', '#ff9955', '#ffbb66', '#ffcc88'];
  return pool[seed % pool.length];
}
