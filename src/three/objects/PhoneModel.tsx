'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, RoundedBox, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { smoothstep } from '../utils/math';

/* ────────────────────────────────────────────────────────────────────────────
 * Warm colour palette for the phone back panel.
 * On mount a random colour is picked. Pass `backColor` prop to override.
 * ──────────────────────────────────────────────────────────────────────────── */
const WARM_PALETTE = [
  '#c8a8a8', // rose-gold
  '#cc6644', // warm terracotta
  '#bb5533', // burnt sienna
  '#996644', // bronze
  '#cc4444', // warm red
  '#aa5566', // dusty rose
  '#cc8855', // amber
  '#884444', // dark cherry
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ────────────────────────────────────────────────────────────────────────────
 * Rounded rectangle shape (for screen geometry that matches body corners).
 * ──────────────────────────────────────────────────────────────────────────── */
function createRoundedRectShape(w: number, h: number, r: number) {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return shape;
}

/* ────────────────────────────────────────────────────────────────────────────
 * PhoneModel — Matches reference images:
 *   Front: Silver frame, blue bezel border, rounded dark-red screen,
 *          Dynamic Island notch, RUMAD logo
 *   Back:  Rose-gold/warm body, large camera module with 3 big lenses
 *          in triangle, flash + LiDAR dots, side buttons
 * ──────────────────────────────────────────────────────────────────────────── */

// Dimensions
const BODY_W = 1.4;
const BODY_H = 2.8;
const BODY_D = 0.18;
const BEZEL_R = 0.16;
const SCREEN_INSET = 0.055;
const SCREEN_W = BODY_W - SCREEN_INSET * 2;
const SCREEN_H = BODY_H - SCREEN_INSET * 2;
const SCREEN_R = BEZEL_R - 0.02; // slightly tighter than body corners

// Camera module (large, like reference)
const CAM_MODULE_W = 0.64;
const CAM_MODULE_H = 0.64;
const CAM_MODULE_D = 0.05;
const CAM_MODULE_R = 0.10;
const CAM_MODULE_X = -0.20;
const CAM_MODULE_Y = 0.82;
const LENS_RADIUS = 0.095; // big, prominent lenses
const LENS_RING_W = 0.018;

interface PhoneModelProps {
  backColor?: string;
}

export function PhoneModel({ backColor }: PhoneModelProps) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  const screenGlowRef = useRef<THREE.MeshPhysicalMaterial>(null);

  const resolvedBackColor = useMemo(
    () => backColor ?? pickRandom(WARM_PALETTE),
    [backColor],
  );

  // Pre-build rounded screen geometry once
  const screenShape = useMemo(
    () => createRoundedRectShape(SCREEN_W, SCREEN_H, SCREEN_R),
    [],
  );
  const screenGeo = useMemo(
    () => new THREE.ShapeGeometry(screenShape, 16),
    [screenShape],
  );

  useFrame(() => {
    if (!groupRef.current) return;
    const time = performance.now() * 0.001;

    const approach = scroll.range(0, 0.28);
    const z = THREE.MathUtils.lerp(-14, 1.8, approach);

    const flip = scroll.range(0.06, 0.22);
    const rotY = THREE.MathUtils.lerp(Math.PI, 0, flip);

    const scaleUp = scroll.range(0.02, 0.26);
    const s = THREE.MathUtils.lerp(0.35, 1, scaleUp);

    const exit = scroll.range(0.28, 0.08);
    const exitScale = 1 - exit;

    const floatY = Math.sin(time * 0.6) * 0.12;
    const floatRotX = Math.sin(time * 0.45) * 0.03;
    const floatRotZ = Math.sin(time * 0.35) * 0.04;

    const finalScale = s * exitScale;
    groupRef.current.position.set(0, floatY, z);
    groupRef.current.rotation.set(floatRotX, rotY, floatRotZ);
    groupRef.current.scale.setScalar(finalScale);
    groupRef.current.visible = finalScale > 0.01;

    if (screenGlowRef.current) {
      const flash = smoothstep(0, 0.15, approach);
      screenGlowRef.current.emissiveIntensity = flash * 0.5;
    }
  });

  const halfD = BODY_D / 2;
  const camZ = -halfD - CAM_MODULE_D; // back face of camera module

  // Lens positions (triangle, within module)
  const lensPositions: [number, number][] = [
    [CAM_MODULE_X - 0.14, CAM_MODULE_Y + 0.12],
    [CAM_MODULE_X + 0.14, CAM_MODULE_Y + 0.12],
    [CAM_MODULE_X, CAM_MODULE_Y - 0.14],
  ];

  return (
    <group ref={groupRef}>
      {/* ── Environment for reflections ──────────────────────────────── */}
      <Environment preset="city" environmentIntensity={0.3} />

      {/* ── Phone body (dark interior) ───────────────────────────────── */}
      <RoundedBox args={[BODY_W, BODY_H, BODY_D]} radius={BEZEL_R} smoothness={6}>
        <meshPhysicalMaterial
          color="#1c1c1e"
          metalness={0.6}
          roughness={0.25}
          clearcoat={0.2}
          clearcoatRoughness={0.15}
        />
      </RoundedBox>

      {/* ── Silver / titanium frame band ─────────────────────────────── */}
      <RoundedBox
        args={[BODY_W + 0.016, BODY_H + 0.016, BODY_D - 0.02]}
        radius={BEZEL_R + 0.006}
        smoothness={6}
      >
        <meshPhysicalMaterial
          color="#c0c0c4"
          metalness={0.95}
          roughness={0.06}
          clearcoat={1}
          clearcoatRoughness={0.03}
        />
      </RoundedBox>

      {/* ── Blue bezel border (between frame and screen) ─────────────── */}
      <mesh position={[0, 0, halfD + 0.0005]} geometry={screenGeo}>
        <meshBasicMaterial color="#1166ee" />
      </mesh>

      {/* ── Front screen (dark red starfield) — rounded shape ────────── */}
      <mesh
        position={[0, 0, halfD + 0.001]}
        geometry={screenGeo}
        scale={[0.96, 0.97, 1]}
      >
        <meshPhysicalMaterial
          ref={screenGlowRef}
          color="#220808"
          emissive="#cc1111"
          emissiveIntensity={0.3}
          metalness={0.05}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.06}
          reflectivity={0.4}
        />
      </mesh>

      {/* ── Screen glass reflection overlay ──────────────────────────── */}
      <mesh
        position={[0, 0, halfD + 0.0015]}
        geometry={screenGeo}
        scale={[0.96, 0.97, 1]}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.03}
          metalness={0}
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0.01}
        />
      </mesh>

      {/* ── RUMAD logo eyes on screen ────────────────────────────────── */}
      <mesh position={[-0.14, 0.15, halfD + 0.003]}>
        <planeGeometry args={[0.17, 0.12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.14, 0.15, halfD + 0.003]}>
        <planeGeometry args={[0.17, 0.12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>

      {/* ── RUMAD logo mouth ────────────────────────────────────────── */}
      <mesh position={[0, -0.05, halfD + 0.003]}>
        <planeGeometry args={[0.32, 0.05]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>

      {/* ── "RUMAD" text ────────────────────────────────────────────── */}
      <Text
        position={[0, -0.42, halfD + 0.003]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        RUMAD
      </Text>

      {/* ── Dynamic Island (notch) ──────────────────────────────────── */}
      <mesh position={[0, 1.05, halfD + 0.002]}>
        <planeGeometry args={[0.36, 0.08]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ── Back panel (full warm colour covering back) ──────────────── */}
      <RoundedBox
        args={[BODY_W - 0.01, BODY_H - 0.01, 0.005]}
        radius={BEZEL_R - 0.005}
        smoothness={6}
        position={[0, 0, -halfD - 0.002]}
      >
        <meshPhysicalMaterial
          color={resolvedBackColor}
          metalness={0.45}
          roughness={0.32}
          clearcoat={0.4}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      {/* ── Camera module housing (raised, rounded, large like ref) ──── */}
      <RoundedBox
        args={[CAM_MODULE_W, CAM_MODULE_H, CAM_MODULE_D]}
        radius={CAM_MODULE_R}
        smoothness={6}
        position={[CAM_MODULE_X, CAM_MODULE_Y, -halfD - CAM_MODULE_D / 2]}
      >
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.7}
          roughness={0.12}
          clearcoat={0.6}
          clearcoatRoughness={0.05}
        />
      </RoundedBox>

      {/* ── Three camera lenses (large, deep, with chrome rings) ─────── */}
      {lensPositions.map(([x, y], i) => (
        <group key={i} position={[x, y, camZ - 0.005]}>
          {/* Chrome ring outer */}
          <mesh rotation={[0, Math.PI, 0]}>
            <ringGeometry args={[LENS_RADIUS, LENS_RADIUS + LENS_RING_W, 48]} />
            <meshPhysicalMaterial
              color="#888888"
              metalness={1}
              roughness={0.04}
              clearcoat={1}
              clearcoatRoughness={0.02}
            />
          </mesh>
          {/* Lens barrel (black cylinder for depth) */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.012]}>
            <cylinderGeometry args={[LENS_RADIUS, LENS_RADIUS, 0.025, 48]} />
            <meshPhysicalMaterial
              color="#0a0a0a"
              metalness={0.6}
              roughness={0.08}
            />
          </mesh>
          {/* Lens glass — deep dark with reflection */}
          <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.001]}>
            <circleGeometry args={[LENS_RADIUS - 0.005, 48]} />
            <meshPhysicalMaterial
              color="#030308"
              metalness={0.2}
              roughness={0.02}
              clearcoat={1}
              clearcoatRoughness={0.0}
              reflectivity={1}
              ior={2.0}
            />
          </mesh>
          {/* Inner iris/pupil */}
          <mesh rotation={[0, Math.PI, 0]} position={[0, 0, -0.002]}>
            <circleGeometry args={[0.035, 32]} />
            <meshPhysicalMaterial
              color="#080820"
              metalness={0.9}
              roughness={0.01}
              clearcoat={1}
              clearcoatRoughness={0}
            />
          </mesh>
        </group>
      ))}

      {/* ── Flash LED (small, top-right of module) ───────────────────── */}
      <mesh
        position={[CAM_MODULE_X + 0.26, CAM_MODULE_Y + 0.18, camZ - 0.003]}
        rotation={[0, Math.PI, 0]}
      >
        <circleGeometry args={[0.03, 24]} />
        <meshPhysicalMaterial
          color="#e8e0d0"
          metalness={0.2}
          roughness={0.3}
          emissive="#ffe8c0"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* ── LiDAR sensor (small dark dot) ────────────────────────────── */}
      <mesh
        position={[CAM_MODULE_X + 0.26, CAM_MODULE_Y - 0.05, camZ - 0.003]}
        rotation={[0, Math.PI, 0]}
      >
        <circleGeometry args={[0.022, 24]} />
        <meshPhysicalMaterial
          color="#050505"
          metalness={0.5}
          roughness={0.1}
        />
      </mesh>

      {/* ── Side button (power, right) ───────────────────────────────── */}
      <mesh position={[BODY_W / 2 + 0.015, 0.35, 0]}>
        <boxGeometry args={[0.02, 0.24, 0.05]} />
        <meshPhysicalMaterial color="#b0b0b4" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* ── Side buttons (volume, left) ──────────────────────────────── */}
      <mesh position={[-BODY_W / 2 - 0.015, 0.55, 0]}>
        <boxGeometry args={[0.02, 0.16, 0.05]} />
        <meshPhysicalMaterial color="#b0b0b4" metalness={0.95} roughness={0.08} />
      </mesh>
      <mesh position={[-BODY_W / 2 - 0.015, 0.30, 0]}>
        <boxGeometry args={[0.02, 0.16, 0.05]} />
        <meshPhysicalMaterial color="#b0b0b4" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* ── Mute switch (small, left above volume) ───────────────────── */}
      <mesh position={[-BODY_W / 2 - 0.015, 0.78, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.04]} />
        <meshPhysicalMaterial color="#b0b0b4" metalness={0.95} roughness={0.08} />
      </mesh>
    </group>
  );
}
