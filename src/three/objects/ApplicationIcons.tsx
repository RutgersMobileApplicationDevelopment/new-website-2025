'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { Application } from '../types/application';
import { lerp, clamp, easeOutBack } from '../utils/math';
import { AcceleratorIcon } from './icons/AcceleratorIcon';
import { IncubatorEgg } from './icons/IncubatorEgg';
import { EventsIcon } from './icons/EventsIcon';

/* ────────────────────────────────────────────────────────────────────────────
 * ApplicationIcons
 *
 * Physically 3D app-icon tiles floating in the star-filled ambient space.
 * Each program has its own unique 3D shape:
 *   - Accelerator: Red rounded tile + 3D rocket emblem
 *   - Incubator:   Standalone red/black dragon egg
 *   - Events:      Teal rounded tile + 3D calendar emblem
 *
 * Extended scroll range so users can linger with the icons.
 *
 * Timeline (7-page scroll):
 *   0.25–0.37  Icons pop in with staggered easeOutBack
 *   0.25–0.52  Icons float and are interactable
 *   0.52–0.57  Icons fade out before HTML content
 * ──────────────────────────────────────────────────────────────────────────── */

/** Map of program id → rendered 3D icon component. */
const ICON_COMPONENTS: Record<string, React.FC> = {
  accelerator: AcceleratorIcon,
  incubator: IncubatorEgg,
  events: EventsIcon,
};

interface ApplicationIconsProps {
  applications: Application[];
  onNavigate?: (route: string) => void;
}

interface AppIconProps {
  app: Application;
  index: number;
  total: number;
  onNavigate?: (route: string) => void;
}

// ── Layout helpers ───────────────────────────────────────────────────────────

/** Compute position in a wide arc for each icon. */
function getArcPosition(index: number, total: number) {
  const angle =
    total > 1
      ? ((index - (total - 1) / 2) / (total - 1)) * Math.PI * 0.55
      : 0;
  const arcRadius = 4.2;
  return {
    x: Math.sin(angle) * arcRadius,
    y: -0.3 + Math.cos(angle) * 0.4,
    z: -Math.abs(Math.sin(angle)) * 1.2,
  };
}

// ── Single icon wrapper ──────────────────────────────────────────────────────

function AppIcon({ app, index, total, onNavigate }: AppIconProps) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const staggerDelay = index * 0.1;
  const target = getArcPosition(index, total);

  // Get the right 3D component for this program
  const IconComponent = ICON_COMPONENTS[app.id];

  useFrame(() => {
    if (!groupRef.current) return;
    const time = performance.now() * 0.001;

    // ── Pop-in: scroll 0.25–0.37, staggered per icon ──
    const raw = scroll.range(0.25, 0.12);
    const delayed = clamp((raw - staggerDelay * 0.5) / 0.7, 0, 1);
    const popIn = easeOutBack(delayed);

    // ── Fade-out: scroll 0.52–0.06 ──
    const fadeOut = 1 - scroll.range(0.52, 0.06);

    const vis = popIn * fadeOut;

    // Position: animate from below into final arc position
    groupRef.current.position.x = lerp(0, target.x, popIn);
    groupRef.current.position.y = lerp(target.y - 3, target.y, popIn) + Math.sin(time * 0.5 + index) * 0.08;
    groupRef.current.position.z = lerp(-3, target.z, popIn);

    // Scale
    const hoverScale = hovered ? 1.08 : 1.0;
    groupRef.current.scale.setScalar(vis * hoverScale);
    groupRef.current.visible = vis > 0.01;

    // Gentle continuous rotation (slow tumble)
    groupRef.current.rotation.y = Math.sin(time * 0.3 + index * 2) * 0.15;
    groupRef.current.rotation.x = Math.sin(time * 0.25 + index * 1.3) * 0.08;
  });

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  const handleClick = useCallback(() => {
    onNavigate?.(app.route);
  }, [app.route, onNavigate]);

  return (
    <group ref={groupRef} scale={0}>
      {/* Hit-area mesh — invisible, covers the icon for pointer events */}
      <mesh
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[2, 2, 1]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* The actual 3D icon */}
      {IconComponent ? <IconComponent /> : null}

      {/* Title below icon */}
      <Text
        position={[0, -1.15, 0.2]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="top"
        maxWidth={2}
        font={undefined}
      >
        {app.title}
      </Text>

      {/* Subtitle */}
      {app.subtitle && (
        <Text
          position={[0, -1.4, 0.2]}
          fontSize={0.11}
          color="#aaaaaa"
          anchorX="center"
          anchorY="top"
          maxWidth={2}
          font={undefined}
        >
          {app.subtitle}
        </Text>
      )}
    </group>
  );
}

// ── Group wrapper ────────────────────────────────────────────────────────────

export function ApplicationIcons({ applications, onNavigate }: ApplicationIconsProps) {
  return (
    <group>
      {/* Environment for the physical materials on the icon tiles */}
      <Environment preset="city" environmentIntensity={0.3} />

      {applications.map((app, i) => (
        <AppIcon
          key={app.id}
          app={app}
          index={i}
          total={applications.length}
          onNavigate={onNavigate}
        />
      ))}
    </group>
  );
}
