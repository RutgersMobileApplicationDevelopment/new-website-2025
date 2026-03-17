'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

const STAR_COUNT = 3000;

/**
 * Rich warm-toned starfield with vertex colours (red / orange / gold / white)
 * plus soft additive-blend nebula clouds. Adapted from Sebby's branch.
 * Brightness subtly breathes with the constellation/phone handoff phase.
 */
export function Starfield() {
  const pointsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 8 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Warm colour distribution: reds → oranges → golds → whites
      const t = Math.random();
      if (t < 0.35) {
        // Deep red
        colors[i * 3] = 0.7 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.04 + Math.random() * 0.12;
        colors[i * 3 + 2] = 0.02 + Math.random() * 0.06;
      } else if (t < 0.6) {
        // Orange
        colors[i * 3] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 1] = 0.25 + Math.random() * 0.25;
        colors[i * 3 + 2] = 0.04 + Math.random() * 0.1;
      } else if (t < 0.82) {
        // Gold / warm white
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.78 + Math.random() * 0.15;
        colors[i * 3 + 2] = 0.65 + Math.random() * 0.2;
      } else {
        // Pure white
        const v = 0.88 + Math.random() * 0.12;
        colors[i * 3] = v;
        colors[i * 3 + 1] = v;
        colors[i * 3 + 2] = v;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    // Slow dual-axis rotation
    pointsRef.current.rotation.y += delta * 0.008;
    pointsRef.current.rotation.x += delta * 0.003;

    // Slight dim when constellations trace, then brighten for icon reveal
    const constellationsDim = scroll.range(0.14, 0.12) * 0.35;
    const iconBright = scroll.range(0.33, 0.08) * 0.4;
    const dimTarget = 1 - constellationsDim + iconBright;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, dimTarget, 0.08);

    // Subtle nebula rotation
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += delta * 0.003;
    }
  });

  return (
    <>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={0.18}
          vertexColors
          sizeAttenuation
          transparent
          opacity={1}
          depthWrite={false}
        />
      </points>

      {/* Additive nebula gas clouds */}
      <group ref={nebulaRef}>
        <mesh position={[12, 6, -35]}>
          <sphereGeometry args={[18, 16, 16]} />
          <meshBasicMaterial
            color="#2a0505"
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[-14, -8, -40]}>
          <sphereGeometry args={[22, 16, 16]} />
          <meshBasicMaterial
            color="#1a0303"
            transparent
            opacity={0.18}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[5, -12, -50]}>
          <sphereGeometry args={[25, 16, 16]} />
          <meshBasicMaterial
            color="#200505"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}
