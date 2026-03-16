'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────────────────────────────
 * IconAmbientStage
 *
 * Ambient environment for the icon section:
 *   - stone-like floor platform
 *   - surrounding pillars
 *   - warm volumetric glow spheres
 *
 * Visible mainly during the icons section (scroll ~0.22 → 0.58).
 * ──────────────────────────────────────────────────────────────────────────── */

export function IconAmbientStage() {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const floorMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const pillarMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const hazeMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  const pillarPositions = useMemo(
    () => [
      [-6.2, -2.2, -3.2],
      [6.2, -2.2, -3.1],
      [-4.8, -2.2, 2.2],
      [4.8, -2.2, 2.4],
    ] as [number, number, number][],
    [],
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const inPhase = scroll.range(0.22, 0.08);
    const outPhase = 1 - scroll.range(0.58, 0.06);
    const visibility = Math.min(inPhase, outPhase);

    groupRef.current.visible = visibility > 0.01;

    if (floorMatRef.current) {
      floorMatRef.current.opacity = THREE.MathUtils.lerp(
        floorMatRef.current.opacity,
        0.75 * visibility,
        0.12,
      );
    }

    pillarMatsRef.current.forEach((mat) => {
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.82 * visibility, 0.1);
    });

    hazeMatsRef.current.forEach((mat, i) => {
      const drift = 0.12 + Math.sin(performance.now() * 0.00035 + i) * 0.05;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, drift * visibility, 0.08);
    });

    groupRef.current.rotation.y += delta * 0.0015;
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Floor platform */}
      <mesh position={[0, -3.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 16, 1, 1]} />
        <meshStandardMaterial
          ref={floorMatRef}
          color="#2a2019"
          roughness={0.88}
          metalness={0.05}
          transparent
          opacity={0}
        />
      </mesh>

      {/* Raised center slab */}
      <mesh position={[0, -3.2, 0]}>
        <boxGeometry args={[10.5, 0.38, 7.5]} />
        <meshStandardMaterial color="#3a2c22" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Pillars */}
      {pillarPositions.map((position, i) => (
        <group key={i} position={position as [number, number, number]}>
          <mesh position={[0, 1.7, 0]}>
            <cylinderGeometry args={[0.55, 0.7, 6.2, 14]} />
            <meshStandardMaterial
              ref={(mat) => {
                if (mat) pillarMatsRef.current[i] = mat;
              }}
              color="#2b201a"
              roughness={0.9}
              metalness={0.03}
              transparent
              opacity={0}
            />
          </mesh>
          <mesh position={[0, -1.55, 0]}>
            <cylinderGeometry args={[0.85, 0.9, 0.65, 14]} />
            <meshStandardMaterial color="#211914" roughness={0.9} metalness={0.02} />
          </mesh>
          <mesh position={[0, 4.95, 0]}>
            <boxGeometry args={[1.6, 0.8, 1.6]} />
            <meshStandardMaterial color="#241b15" roughness={0.88} metalness={0.02} />
          </mesh>
        </group>
      ))}

      {/* Warm background haze */}
      {[
        { pos: [0, 2.2, -11], size: 7.5, color: '#8e1b14' },
        { pos: [-4.8, 0.4, -9], size: 4.6, color: '#6f140f' },
        { pos: [5.2, -0.2, -9.4], size: 5.1, color: '#a2341f' },
      ].map((h, i) => (
        <mesh key={i} position={h.pos as [number, number, number]}>
          <sphereGeometry args={[h.size, 18, 18]} />
          <meshBasicMaterial
            ref={(mat) => {
              if (mat) hazeMatsRef.current[i] = mat;
            }}
            color={h.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
