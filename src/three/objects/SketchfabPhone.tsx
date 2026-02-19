'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGLBModel, preloadGLB } from '../models/useGLBModel';

/* ────────────────────────────────────────────────────────────────────────────
 * iPhone 17 Pro — Sketchfab GLB model with warm-colour randomisation.
 *
 * Recolourable materials:
 *   "Frosted glass"  — body back (main warm colour)
 *   "Tint back glass" — camera area tint
 *   "Frame"          — side frame (slightly lighter tint)
 *   "Aluminum"       — metal accents
 * ──────────────────────────────────────────────────────────────────────────── */

const MODEL_PATH = '/models/iphone-17-pro.glb';
preloadGLB(MODEL_PATH);

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

/** Lighten a hex colour by mixing with white. */
function lighten(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color('#ffffff'), amount);
  return '#' + c.getHexString();
}

/** Darken a hex colour by mixing with black. */
function darken(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color('#000000'), amount);
  return '#' + c.getHexString();
}

/* ──── Component ───────────────────────────────────────────────────────────── */

interface SketchfabPhoneProps {
  /** Force a specific back-panel colour (omit to randomise from warm palette) */
  backColor?: string;
}

export function SketchfabPhone({ backColor }: SketchfabPhoneProps) {
  const scroll = useScroll();
  const groupRef = useRef<THREE.Group>(null);

  // Pick stable random colour on mount
  const baseColor = useMemo(
    () => backColor ?? pickRandom(WARM_PALETTE),
    [backColor],
  );

  // Build material overrides keyed by the GLB's material names
  const overrides = useMemo(
    () => ({
      'Frosted glass': { color: baseColor, metalness: 0.4, roughness: 0.35 },
      'Tint back glass': { color: darken(baseColor, 0.15), metalness: 0.3, roughness: 0.3 },
      'Frame': { color: lighten(baseColor, 0.3), metalness: 0.85, roughness: 0.1 },
      'Aluminum': { color: lighten(baseColor, 0.4), metalness: 0.9, roughness: 0.08 },
    }),
    [baseColor],
  );

  const scene = useGLBModel(MODEL_PATH, overrides);

  useFrame(() => {
    if (!groupRef.current) return;
    const time = performance.now() * 0.001;

    // ── Approach (compressed for 7-page scroll) ─────────────────────
    const approach = scroll.range(0, 0.20);
    const z = THREE.MathUtils.lerp(-14, 1.8, approach);

    // ── Flip back → front ────────────────────────────────────────────
    const flip = scroll.range(0.04, 0.16);
    const rotY = THREE.MathUtils.lerp(Math.PI, 0, flip);

    // ── Scale up ─────────────────────────────────────────────────────
    const scaleUp = scroll.range(0.015, 0.185);
    const s = THREE.MathUtils.lerp(0.35, 1, scaleUp);

    // ── Exit ─────────────────────────────────────────────────────────
    const exit = scroll.range(0.20, 0.06);
    const exitScale = 1 - exit;

    // ── Float ────────────────────────────────────────────────────────
    const floatY = Math.sin(time * 0.6) * 0.12;
    const floatRotX = Math.sin(time * 0.45) * 0.03;
    const floatRotZ = Math.sin(time * 0.35) * 0.04;

    const finalScale = s * exitScale;
    groupRef.current.position.set(0, floatY, z);
    groupRef.current.rotation.set(floatRotX, rotY, floatRotZ);

    // The GLB is exported in metres — scale up to match scene
    const modelScale = 18 * finalScale;
    groupRef.current.scale.setScalar(modelScale);
    groupRef.current.visible = finalScale > 0.01;
  });

  // Screen emissive glow controlled by scroll
  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat?.name === 'Display') {
          const newMat = mat.clone();
          newMat.emissive = new THREE.Color('#cc1111');
          newMat.emissiveIntensity = 0.3;
          child.material = newMat;
        }
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef}>
      <Environment preset="city" environmentIntensity={0.35} />
      <primitive object={scene} />
    </group>
  );
}
