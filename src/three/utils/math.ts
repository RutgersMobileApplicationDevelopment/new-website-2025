// ── Easing & interpolation helpers used throughout the scroll timeline ──

/** Linear interpolation between a and b by factor t ∈ [0,1]. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Hermite smoothstep — returns 0 when x ≤ edge0, 1 when x ≥ edge1,
 * and smoothly transitions between.
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 >= edge1) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Ease-out with slight overshoot (back ease). */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Map a global scroll offset (0..1) to a normalised 0..1 progress
 * within the segment defined by [start, end].
 */
export function segmentProgress(
  offset: number,
  start: number,
  end: number,
): number {
  return clamp((offset - start) / (end - start), 0, 1);
}
