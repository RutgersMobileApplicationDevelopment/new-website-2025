'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Application } from '../types/application';
import { lerp, clamp, easeOutBack } from '../utils/math';

/* ────────────────────────────────────────────────────────────────────────────
 * ApplicationIcons
 *
 * Renders one 3D icon per entry in the `applications` array.
 * The count is never hard-coded — add/remove items in the data file and
 * the arc resizes automatically.
 *
 * Scroll behaviour (scroll 0.36–0.52):
 *   Icons pop upward with staggered easeOutBack.
 *   Appears after phone exits, before HTML content takes over.
 * ──────────────────────────────────────────────────────────────────────────── */

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

// ── Single icon ──────────────────────────────────────────────────────────────

function AppIcon({ app, index, total, onNavigate }: AppIconProps) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  // Stagger delay per icon (earlier icons appear first)
  const staggerDelay = index * 0.08;

  // Spread icons in an arc centred on the origin
  const angle =
    total > 1
      ? ((index - (total - 1) / 2) / (total - 1)) * Math.PI * 0.5
      : 0;
  const arcRadius = 3.5;
  const targetX = Math.sin(angle) * arcRadius;
  const targetY = -0.5 + Math.cos(angle) * 0.3;
  const targetZ = -Math.abs(Math.sin(angle)) * 1.0;

  useFrame(() => {
    if (!groupRef.current) return;
    // Icons appear at scroll 0.36→0.52 (after phone exits, before HTML)
    const raw = scroll.range(0.36, 0.16);
    const delayed = clamp((raw - staggerDelay * 0.5) / 0.7, 0, 1);
    const progress = easeOutBack(delayed);

    // Fade out as HTML content approaches
    const fadeOut = 1 - scroll.range(0.50, 0.06);

    // Scale + position
    const vis = progress * fadeOut;
    groupRef.current.scale.setScalar(vis);
    groupRef.current.position.x = lerp(0, targetX, progress);
    groupRef.current.position.y = lerp(targetY - 2, targetY, progress);
    groupRef.current.position.z = lerp(-2, targetZ, progress);
    groupRef.current.visible = vis > 0.01;

    // Hover emissive glow
    if (matRef.current) {
      matRef.current.emissiveIntensity = lerp(
        matRef.current.emissiveIntensity,
        hovered ? 0.8 : 0.2,
        0.1,
      );
    }
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
      <RoundedBox
        args={[1.2, 1.2, 0.2]}
        radius={0.2}
        smoothness={4}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          ref={matRef}
          color={app.accentColor}
          emissive={app.accentColor}
          emissiveIntensity={0.2}
          metalness={0.4}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Title below icon */}
      <Text
        position={[0, -0.85, 0.15]}
        fontSize={0.16}
        color="white"
        anchorX="center"
        anchorY="top"
        maxWidth={1.4}
      >
        {app.title}
      </Text>

      {/* Subtitle (optional) */}
      {app.subtitle && (
        <Text
          position={[0, -1.08, 0.15]}
          fontSize={0.1}
          color="#aaaaaa"
          anchorX="center"
          anchorY="top"
          maxWidth={1.4}
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
