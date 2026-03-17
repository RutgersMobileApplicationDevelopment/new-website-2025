'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { HomeScene } from '@/three/scenes/HomeScene';
import { PhoneScreenOverlay, PhoneScreenSplash, PhoneScreenInfo } from '@/components/phone-screen';

/**
 * Full-viewport Three.js canvas with scroll-driven animation (6 pages).
 *
 * Phone-screen content is rendered as a DOM overlay OUTSIDE the Canvas,
 * wrapped in PhoneScreenOverlay which handles pixel-accurate positioning.
 * The splash (phase 1) and info (phase 2) are separate layers:
 *   - Splash fades in, then fades up and out
 *   - Info fades in after splash exits and scrolls with the background
 */
export default function SceneCanvas() {
  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        <Suspense fallback={null}>
          <ScrollControls pages={6} damping={0.04}>
            <HomeScene />
          </ScrollControls>
        </Suspense>
      </Canvas>

      {/* DOM overlay — positioned on the phone screen */}
      <PhoneScreenOverlay>
        <PhoneScreenInfo />
        <PhoneScreenSplash />
      </PhoneScreenOverlay>
    </div>
  );
}
