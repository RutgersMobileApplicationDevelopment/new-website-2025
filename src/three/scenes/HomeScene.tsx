'use client';

import { ConstellationLayer } from '../objects/constellation';
import { SketchfabPhone } from '../objects/SketchfabPhone';

/* ────────────────────────────────────────────────────────────────────────────
 * HomeScene
 *
 * Composes every 3D layer. Camera is static at z=5, fov=75.
 * All animation driven by scroll via useScroll() inside each child.
 *
 * Timeline (fast 4-page scroll):
 *   0.00–0.10  Phone approaches and scales quickly
 *   0.03–0.28  Constellations trace in and untrace out among nebulas
 *   0.18+      Phone-screen HTML overlay fades in (inside phone bounds)
 * ──────────────────────────────────────────────────────────────────────────── */

export function HomeScene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -5]} intensity={0.3} color="#ff4444" />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#ff6666" />
      <pointLight position={[0, 1.2, 1.2]} intensity={0.52} color="#ff8a5f" />

      {/* Background layers */}
      <ConstellationLayer />

      {/* Foreground */}
      <SketchfabPhone />
    </>
  );
}
