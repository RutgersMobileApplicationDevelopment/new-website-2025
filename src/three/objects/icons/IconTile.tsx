'use client';

import { RoundedBox } from '@react-three/drei';

/* ────────────────────────────────────────────────────────────────────────────
 * IconTile — Shared thick rounded-square base for 3D app icons.
 *
 * Inspired by the claymation-style iOS icons: a chunky rounded tile
 * with subtle physical material and a coloured top glow line.
 * Children are placed on the tile face (z = depth/2).
 * ──────────────────────────────────────────────────────────────────────────── */

interface IconTileProps {
  color: string;
  size?: number;
  depth?: number;
  children?: React.ReactNode;
}

export function IconTile({ color, size = 1.6, depth = 0.5, children }: IconTileProps) {
  return (
    <group>
      <RoundedBox args={[size, size, depth]} radius={size * 0.18} smoothness={6}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.05}
          roughness={0.45}
          clearcoat={0.3}
          clearcoatRoughness={0.35}
          envMapIntensity={0.5}
        />
      </RoundedBox>

      {/* Emblem / symbol positioned on the face */}
      <group position={[0, 0, depth / 2 + 0.01]}>
        {children}
      </group>
    </group>
  );
}
