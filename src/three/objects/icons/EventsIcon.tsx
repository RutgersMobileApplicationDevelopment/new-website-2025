'use client';

import { IconTile } from './IconTile';

/* ────────────────────────────────────────────────────────────────────────────
 * EventsIcon — A teal tile with a 3D calendar emblem.
 *
 * Calendar built from:
 *   - Main body box
 *   - Top header bar (darker)
 *   - Two ring loops (binding rings)
 *   - A row of small day dots
 *   - A highlighted "star" day marker
 * All in cream/off-white on the teal tile.
 * ──────────────────────────────────────────────────────────────────────────── */

const CREAM = '#e8ddd0';
const DARK_CREAM = '#c4b5a2';
const HIGHLIGHT = '#ffcc44';

export function EventsIcon() {
  return (
    <IconTile color="#2aab88">
      <group position={[0, 0, 0.08]}>
        {/* Calendar body */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.7, 0.62, 0.1]} />
          <meshPhysicalMaterial color={CREAM} roughness={0.4} metalness={0.05} clearcoat={0.2} />
        </mesh>

        {/* Header bar */}
        <mesh position={[0, 0.22, 0.01]}>
          <boxGeometry args={[0.72, 0.14, 0.1]} />
          <meshPhysicalMaterial color={DARK_CREAM} roughness={0.35} metalness={0.08} clearcoat={0.2} />
        </mesh>

        {/* Binding ring left */}
        <mesh position={[-0.18, 0.3, 0.06]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.04, 0.012, 8, 16]} />
          <meshPhysicalMaterial color="#999999" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Binding ring right */}
        <mesh position={[0.18, 0.3, 0.06]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.04, 0.012, 8, 16]} />
          <meshPhysicalMaterial color="#999999" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Day dot grid — 3×3 simplified */}
        {[
          [-0.18, 0.05],
          [0, 0.05],
          [0.18, 0.05],
          [-0.18, -0.1],
          [0, -0.1],
          [0.18, -0.1],
          [-0.18, -0.25],
          [0, -0.25],
          [0.18, -0.25],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.06]}>
            <boxGeometry args={[0.08, 0.08, 0.03]} />
            <meshPhysicalMaterial
              color={i === 4 ? HIGHLIGHT : '#d5caba'}
              roughness={0.4}
              metalness={0.05}
              emissive={i === 4 ? HIGHLIGHT : '#000000'}
              emissiveIntensity={i === 4 ? 0.3 : 0}
            />
          </mesh>
        ))}

        {/* Star on the highlighted day */}
        <mesh position={[0, -0.1, 0.1]} rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.035, 0]} />
          <meshBasicMaterial color={HIGHLIGHT} />
        </mesh>
      </group>
    </IconTile>
  );
}
