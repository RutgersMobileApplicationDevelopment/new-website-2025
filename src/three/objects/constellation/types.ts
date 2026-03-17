import type { ConstellationMotif, ConstellationPoint } from '@/components/constellations';

/* ────────────────────────────────────────────────────────────────────────────
 * Constellation Layer — Shared Types
 *
 * Every interface consumed by the constellation sub-modules lives here so
 * that circular-import issues are impossible and each module stays focused.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Processed SVG contour data used for star placement and outline rendering. */
export interface SvgGuideData {
  /** Width-to-height ratio of the source SVG viewBox. */
  aspect: number;
  /** Normalised [0..1] edge-sample points extracted from the SVG outline. */
  contourPoints: ConstellationPoint[];
  /** Bounding box of the normalised contour (in [0..1] space). */
  contourBounds: { minX: number; maxX: number; minY: number; maxY: number };
}

/** A fully resolved constellation instance ready to render. */
export interface ConstellationInstance {
  motif: ConstellationMotif;
  /** World-space [x, y, z] of the instance origin. */
  position: [number, number, number];
  /** Uniform scale applied to the motif geometry. */
  scale: number;
  /** Random tilt about the z-axis (radians). */
  rotationZ: number;
  /** Seed fed to the deterministic point-generator for this instance. */
  pointSeed: number;
  /** Index within the current generation batch (used for schedule lookup). */
  index: number;
}

/**
 * Per-instance timing parameters for the "2-6-2" visibility cycle.
 *
 * Each constellation fades in, holds at full opacity, then fades out.
 * `roundSeconds` and `warmupSeconds` are derived from the staggered queue
 * so the schedule wraps seamlessly.
 */
export interface VisibilitySchedule {
  fadeInSeconds: number;
  holdSeconds: number;
  fadeOutSeconds: number;
  /** Total duration of a single fade-in + hold + fade-out pass. */
  cycleSeconds: number;
  /** Full round length (including stagger offsets). */
  roundSeconds: number;
  /** Pre-roll time subtracted so the first batch appears promptly. */
  warmupSeconds: number;
}

/** Output of `buildQueueSchedule` — per-instance start offsets + round info. */
export interface QueueSchedulePlan {
  /** Per-instance start-time offsets (seconds into the round). */
  starts: number[];
  roundSeconds: number;
  warmupSeconds: number;
}

/** Pixel-space dimensions and centre of the SVG contour footprint. */
export interface GuideTransform {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/** Axis-aligned 2-D bounding box. */
export interface Bounds2D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
