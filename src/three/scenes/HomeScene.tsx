'use client';

import { Starfield } from '../objects/Starfield';
import { WarpField } from '../objects/WarpField';
import { SketchfabPhone } from '../objects/SketchfabPhone';
import { ApplicationIcons } from '../objects/ApplicationIcons';
import { applications } from '@/data/applications';

/* ────────────────────────────────────────────────────────────────────────────
 * HomeScene
 *
 * Composes every 3D layer. Camera is static at z=5, fov=75.
 * All animation driven by scroll via useScroll() inside each child.
 *
 * Timeline (using sebby-style scroll.range calls inside each object):
 *   0.00–0.28  Phone approaches from z=-14 → z=1.8, flips back→front
 *   0.28–0.36  Phone exits (scales to 0)
 *   0.26–0.52  Warp field fades in, stretches, then fades out
 *   0.52–1.00  Application icons and HTML content
 * ──────────────────────────────────────────────────────────────────────────── */

interface HomeSceneProps {
  onNavigate?: (route: string) => void;
}

export function HomeScene({ onNavigate }: HomeSceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, 2, -5]} intensity={0.3} color="#ff4444" />
      <pointLight position={[0, 0, 3]} intensity={0.4} color="#ff6666" />

      {/* Background layers */}
      <Starfield />
      <WarpField />

      {/* Interactive foreground */}
      <SketchfabPhone />
      <ApplicationIcons applications={applications} onNavigate={onNavigate} />
    </>
  );
}
