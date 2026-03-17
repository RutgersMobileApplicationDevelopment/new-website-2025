'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { landingConstellationConfig } from '@/components/constellations';
import type { Bounds2D } from './types';
import { randomIn, wrap } from './utils';

/* ────────────────────────────────────────────────────────────────────────────
 * NebulaClouds
 *
 * Soft additive-blend spheres that drift horizontally in sync with the
 * constellation field.  Each cloud also bobs gently on a sine wave.
 * Three horizontal tiles (canonical + left/right) guarantee seamless
 * wrap-around at the domain edges.
 * ──────────────────────────────────────────────────────────────────────────── */

interface NebulaCloudsProps {
  bounds: Bounds2D;
  drift: { x: number; y: number };
  /** Mutable ref updated each frame — ≥ 1.0 when scrolling. */
  scrollBoostRef: React.RefObject<number>;
}

export function NebulaClouds({ bounds, drift, scrollBoostRef }: NebulaCloudsProps) {
  const cloudRootRefs = useRef<Array<THREE.Group | null>>([]);
  const spanX = bounds.maxX - bounds.minX;
  const nebulaDriftX = drift.x;

  // Three horizontal tiles for seamless wrap
  const offsets = useMemo(
    () => [
      [0, 0],
      [spanX, 0],
      [-spanX, 0],
    ] as Array<[number, number]>,
    [spanX],
  );

  // Stable random cloud definitions
  const clouds = useMemo(() => {
    const { nebulas, spread } = landingConstellationConfig;
    return Array.from({ length: nebulas.count }, () => ({
      baseY: randomIn(spread.minY - 4, spread.maxY + 4),
      position: [
        randomIn(spread.minX - 4, spread.maxX + 4),
        0,
        randomIn(spread.minZ - 18, spread.maxZ - 2),
      ] as [number, number, number],
      radius: randomIn(nebulas.sizeRange[0] * 1.9, nebulas.sizeRange[1] * 1.9),
      opacity: Math.min(0.32, randomIn(nebulas.opacityRange[0], nebulas.opacityRange[1]) * 2.2),
      color: nebulas.colors[Math.floor(Math.random() * nebulas.colors.length)],
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    cloudRootRefs.current.forEach((group, index) => {
      if (!group) return;
      const boost = scrollBoostRef.current ?? 1;
      group.position.x = wrap(group.position.x + nebulaDriftX * boost * delta, bounds.minX, bounds.maxX);
      const cloud = clouds[index];
      if (cloud) {
        group.position.y = cloud.baseY + Math.sin(t * 0.25 + cloud.phase) * 0.35;
      }
    });
  });

  return (
    <group>
      {clouds.map((cloud, i) => (
        <group
          key={i}
          ref={(group) => {
            cloudRootRefs.current[i] = group;
          }}
          position={cloud.position}
        >
          {offsets.map(([offsetX, offsetY], tile) => (
            <mesh key={tile} position={[offsetX, offsetY, 0]}>
              <sphereGeometry args={[cloud.radius, 16, 16]} />
              <meshBasicMaterial
                color={cloud.color}
                transparent
                opacity={cloud.opacity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
