'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import { HomeScene } from '@/three/scenes/HomeScene';
import { MainContent } from '@/components/MainContent';

interface SceneCanvasProps {
  onNavigate?: (route: string) => void;
}

/**
 * Full-viewport Three.js canvas with scroll-driven animation (5 pages).
 * HTML content sits below the 3D scene via drei's <Scroll html>.
 * Dynamically imported with `ssr: false` from the home page.
 */
export default function SceneCanvas({ onNavigate }: SceneCanvasProps) {
  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        <Suspense fallback={null}>
          <ScrollControls pages={5} damping={0.08}>
            <HomeScene onNavigate={onNavigate} />
            <Scroll html style={{ width: '100%' }}>
              <MainContent />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
}
