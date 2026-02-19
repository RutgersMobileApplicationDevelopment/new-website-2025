'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { IconTile } from './IconTile';

/* ────────────────────────────────────────────────────────────────────────────
 * AcceleratorIcon — A red tile with a 3D rocket emblem.
 *
 * The rocket is built from basic geometries:
 *   - Cone nose cone
 *   - Cylinder body
 *   - Three fin boosters (box geometry, angled)
 *   - Exhaust nozzle ring
 * All in a cream/off-white colour matching the screenshot aesthetic.
 * ──────────────────────────────────────────────────────────────────────────── */

const CREAM = '#e8ddd0';
const DARK_CREAM = '#c4b5a2';
const FLAME = '#ff6633';

export function AcceleratorIcon() {
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.12, 0);
    shape.lineTo(0.03, 0.22);
    shape.lineTo(-0.03, 0.22);
    shape.closePath();
    return shape;
  }, []);

  return (
    <IconTile color="#cc1111">
      {/* Rocket body */}
      <group position={[0, 0.05, 0.12]} rotation={[0, 0, 0]}>
        {/* Nose cone */}
        <mesh position={[0, 0.32, 0]}>
          <coneGeometry args={[0.12, 0.22, 16]} />
          <meshPhysicalMaterial color={CREAM} roughness={0.4} metalness={0.05} clearcoat={0.2} />
        </mesh>

        {/* Body cylinder */}
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.38, 16]} />
          <meshPhysicalMaterial color={CREAM} roughness={0.4} metalness={0.05} clearcoat={0.2} />
        </mesh>

        {/* Window/porthole */}
        <mesh position={[0, 0.15, 0.121]}>
          <circleGeometry args={[0.045, 16]} />
          <meshPhysicalMaterial color="#88aacc" roughness={0.2} metalness={0.3} clearcoat={0.8} />
        </mesh>

        {/* Fin 1 — left */}
        <mesh position={[-0.15, -0.18, 0]} rotation={[0, 0, 0.3]}>
          <extrudeGeometry args={[finShape, { depth: 0.04, bevelEnabled: false }]} />
          <meshPhysicalMaterial color={DARK_CREAM} roughness={0.4} metalness={0.08} />
        </mesh>

        {/* Fin 2 — right */}
        <mesh position={[0.04, -0.18, 0]} rotation={[0, 0, -0.3]}>
          <extrudeGeometry args={[finShape, { depth: 0.04, bevelEnabled: false }]} />
          <meshPhysicalMaterial color={DARK_CREAM} roughness={0.4} metalness={0.08} />
        </mesh>

        {/* Fin 3 — back */}
        <mesh position={[-0.02, -0.18, -0.06]} rotation={[0.3, 0, 0]}>
          <extrudeGeometry args={[finShape, { depth: 0.04, bevelEnabled: false }]} />
          <meshPhysicalMaterial color={DARK_CREAM} roughness={0.4} metalness={0.08} />
        </mesh>

        {/* Exhaust nozzle */}
        <mesh position={[0, -0.17, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.06, 16]} />
          <meshPhysicalMaterial color="#888888" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Flame glow */}
        <mesh position={[0, -0.26, 0]}>
          <coneGeometry args={[0.07, 0.16, 8]} />
          <meshBasicMaterial
            color={FLAME}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </IconTile>
  );
}
