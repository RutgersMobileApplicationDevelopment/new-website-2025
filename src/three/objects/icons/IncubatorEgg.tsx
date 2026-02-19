'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/* ────────────────────────────────────────────────────────────────────────────
 * IncubatorEgg — A standalone 3D dragon egg in red/black.
 *
 * Not on a tile — the egg IS the icon. Inspired by the Pokémon-style
 * incubator / dragon egg aesthetic. Built from:
 *   - Scaled sphere (egg shape)
 *   - Dark base colour with red vein/crack lines
 *   - Subtle glow at the cracks
 *   - Physical-material for that polished ceramic look
 * ──────────────────────────────────────────────────────────────────────────── */

const EGG_DARK = '#1a0808';
const EGG_RED = '#cc1111';
const VEIN_RED = '#ee3322';

/** Create a toroidal crack ring to wrap around the egg. */
function CrackRing({
  radius,
  y,
  rotZ = 0,
  color = VEIN_RED,
}: {
  radius: number;
  y: number;
  rotZ?: number;
  color?: string;
}) {
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, rotZ]}>
      <torusGeometry args={[radius, 0.008, 6, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Spot-style crack detail — small diamond shape. */
function CrackSpot({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale}>
      <octahedronGeometry args={[0.035, 0]} />
      <meshBasicMaterial
        color={VEIN_RED}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

export function IncubatorEgg() {
  // Egg geometry: sphere scaled taller (1, 1.35, 1) for egg proportions
  const eggGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.55, 32, 32);
    // Scale vertices to make it egg-shaped (narrower at top)
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const normY = y / 0.55; // -1 to 1
      // Narrow the top, widen the bottom
      const taper = 1 - normY * 0.18;
      pos.setX(i, pos.getX(i) * taper);
      pos.setZ(i, pos.getZ(i) * taper);
      // Stretch vertically
      pos.setY(i, y * 1.3);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group>
      {/* Main egg body */}
      <mesh geometry={eggGeo}>
        <meshPhysicalMaterial
          color={EGG_DARK}
          roughness={0.25}
          metalness={0.15}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Red patch overlay — large spots like dragon egg markings */}
      {[
        { pos: [0.25, 0.3, 0.35] as [number, number, number], s: 1.8 },
        { pos: [-0.2, -0.15, 0.4] as [number, number, number], s: 2.2 },
        { pos: [0.35, -0.3, -0.2] as [number, number, number], s: 1.5 },
        { pos: [-0.3, 0.35, -0.25] as [number, number, number], s: 1.9 },
        { pos: [0.1, -0.45, 0.2] as [number, number, number], s: 1.4 },
        { pos: [-0.15, 0.1, -0.42] as [number, number, number], s: 1.6 },
      ].map((spot, i) => (
        <mesh key={i} position={spot.pos} scale={spot.s * 0.08}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshPhysicalMaterial
            color={EGG_RED}
            roughness={0.3}
            metalness={0.1}
            clearcoat={0.4}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}

      {/* Crack lines — glowing veins across the surface */}
      <CrackRing radius={0.48} y={0.1} />
      <CrackRing radius={0.42} y={-0.2} rotZ={0.6} />
      <CrackRing radius={0.35} y={0.35} rotZ={-0.4} color="#ff5533" />

      {/* Crack junction spots */}
      <CrackSpot position={[0.42, 0.1, 0.22]} scale={1.3} />
      <CrackSpot position={[-0.35, -0.2, 0.3]} />
      <CrackSpot position={[0.15, 0.35, -0.38]} scale={1.1} />
      <CrackSpot position={[-0.3, 0.1, -0.35]} scale={0.9} />
      <CrackSpot position={[0.38, -0.35, -0.15]} scale={1.2} />

      {/* Inner glow — subtle red light from inside */}
      <pointLight position={[0, 0, 0]} color={EGG_RED} intensity={0.6} distance={2} />
    </group>
  );
}
