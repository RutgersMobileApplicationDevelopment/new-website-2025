'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGLBModel, preloadGLB } from '../models/useGLBModel';
import { phoneScreenBridge } from '@/components/phone-screen/phoneScreenBridge';

/* ────────────────────────────────────────────────────────────────────────────
 * iPhone 17 Pro — Sketchfab GLB with warm-colour cycling.
 *
 * The Display mesh's actual geometry bounding box is projected to CSS
 * pixels each frame so the DOM overlay matches exactly.
 *
 * Phone body colour slowly cycles through the theme palette, keeping
 * the materials muted and semi-transparent so the phone doesn't
 * overpower the background.
 * ──────────────────────────────────────────────────────────────────────────── */

const MODEL_PATH = '/models/iphone-17-pro.glb';
preloadGLB(MODEL_PATH);

/** Dark, subdued warm theme colours — the phone phases between these. */
const THEME_COLORS = [
  new THREE.Color('#2a1212'),
  new THREE.Color('#24150f'),
  new THREE.Color('#1e1010'),
  new THREE.Color('#220e0e'),
  new THREE.Color('#1c1414'),
  new THREE.Color('#231018'),
];

/** Seconds for a full cycle through the palette. */
const COLOR_CYCLE_PERIOD = 24;

const _v = new THREE.Vector3();
const _colorA = new THREE.Color();
const _colorB = new THREE.Color();
const _currentColor = new THREE.Color();

interface SketchfabPhoneProps { backColor?: string }

export function SketchfabPhone({ backColor }: SketchfabPhoneProps) {
  const scroll = useScroll();
  const { size, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const displayMeshRef = useRef<THREE.Mesh | null>(null);
  const displayCornersRef = useRef<THREE.Vector3[] | null>(null);

  // Material refs for live colour cycling
  const glassMatsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  const overrideColor = useMemo(
    () => (backColor ? new THREE.Color(backColor) : null),
    [backColor],
  );

  // Static overrides — initial colours will be replaced each frame by cycling
  const overrides = useMemo(
    () => ({
      'Frosted glass': { color: '#2d1a1a', metalness: 0.25, roughness: 0.55, transparent: true, opacity: 0.7 },
      'Tint back glass': { color: '#221414', metalness: 0.2, roughness: 0.5, transparent: true, opacity: 0.65 },
      'Frame': { color: '#3a2828', metalness: 0.7, roughness: 0.15 },
      'Aluminum': { color: '#4a3838', metalness: 0.75, roughness: 0.12 },
      'Display': { color: '#080808', emissive: '#000000', emissiveIntensity: 0, metalness: 0, roughness: 1 },
    }),
    [],
  );

  const scene = useGLBModel(MODEL_PATH, overrides);

  // Find the Display mesh + collect glass materials for colour cycling
  useMemo(() => {
    glassMatsRef.current = [];
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat?.name) return;

      if (mat.name === 'Display') {
        displayMeshRef.current = child;
        child.geometry.computeBoundingBox();
        const bb = child.geometry.boundingBox!;
        displayCornersRef.current = [
          new THREE.Vector3(bb.min.x, bb.min.y, bb.max.z),
          new THREE.Vector3(bb.max.x, bb.min.y, bb.max.z),
          new THREE.Vector3(bb.max.x, bb.max.y, bb.max.z),
          new THREE.Vector3(bb.min.x, bb.max.y, bb.max.z),
        ];
      }

      if (['Frosted glass', 'Tint back glass', 'Frame', 'Aluminum'].includes(mat.name)) {
        glassMatsRef.current.push(mat);
      }
    });
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    const time = performance.now() * 0.001;
    const aspect = size.width / Math.max(size.height, 1);
    const isLandscape = aspect > 1.05;

    // ── Colour cycling ───────────────────────────────────────────────
    if (!overrideColor) {
      const t = (time % COLOR_CYCLE_PERIOD) / COLOR_CYCLE_PERIOD;
      const idx = t * THEME_COLORS.length;
      const i = Math.floor(idx) % THEME_COLORS.length;
      const j = (i + 1) % THEME_COLORS.length;
      const frac = idx - Math.floor(idx);
      _colorA.copy(THEME_COLORS[i]);
      _colorB.copy(THEME_COLORS[j]);
      _currentColor.copy(_colorA).lerp(_colorB, frac);

      for (const mat of glassMatsRef.current) {
        if (mat.name === 'Frame' || mat.name === 'Aluminum') {
          mat.color.copy(_currentColor).offsetHSL(0, -0.05, 0.08);
        } else {
          mat.color.copy(_currentColor);
        }
      }
    }

    const approach = scroll.range(0, 0.16);
    const zApproach = THREE.MathUtils.lerp(-14, 1.55, approach);

    const flip = scroll.range(0.04, 0.12);
    const rotY = THREE.MathUtils.lerp(Math.PI, 0, flip);

    const scaleUp = scroll.range(0.0, 0.2);
    const s = THREE.MathUtils.lerp(0.45, 1, scaleUp);

    const settle = scroll.range(0.2, 0.3);

    const floatY = Math.sin(time * 0.6) * 0.12;
    const floatRotX = Math.sin(time * 0.45) * 0.03;
    const floatRotZ = Math.sin(time * 0.35) * 0.04;

    const targetRotZ = isLandscape ? -Math.PI * 0.5 : 0;
    const rotX = THREE.MathUtils.lerp(floatRotX, 0, settle);
    const rotZ = THREE.MathUtils.lerp(floatRotZ, targetRotZ, settle);

    const targetScale = isLandscape
      ? THREE.MathUtils.clamp(3.2 + (1.7 - aspect) * 0.22, 2.9, 3.5)
      : THREE.MathUtils.clamp(2.85 + (1.1 - aspect) * 0.2, 2.55, 3.15);

    const zHold = isLandscape ? 1.02 : 1.08;
    const z = THREE.MathUtils.lerp(zApproach, zHold, settle);
    const y = THREE.MathUtils.lerp(floatY, 0, settle);
    const finalScale = THREE.MathUtils.lerp(s, targetScale, settle);

    groupRef.current.position.set(0, y, z);
    groupRef.current.rotation.set(rotX, rotY, rotZ);
    const modelScale = 18 * finalScale;
    groupRef.current.scale.setScalar(modelScale);
    groupRef.current.visible = finalScale > 0.01;

    // ── Content visibility & phase ────────────────────────────────────
    const showContent = flip >= 1.0 && settle >= 1.0;

    phoneScreenBridge.visible = showContent;

    // Phase 1: splash fades in (slow, deliberate)
    const p1 = scroll.range(0.52, 0.10);
    phoneScreenBridge.phase1 = showContent ? p1 : 0;

    // Phase 1 exit: splash fades up and out (starts well after full reveal)
    const p1Out = scroll.range(0.72, 0.08);
    phoneScreenBridge.phase1Out = showContent ? p1Out : 0;

    // Phase 2: info page fades in (after splash exits)
    const p2 = scroll.range(0.80, 0.06);
    phoneScreenBridge.phase2 = showContent ? p2 : 0;

    // Content scroll — background scroll drives the info content
    const cs = scroll.range(0.86, 0.12);
    phoneScreenBridge.contentScroll = showContent ? cs : 0;

    // ── Project Display mesh corners to CSS pixels ────────────────────
    if (showContent && displayMeshRef.current && displayCornersRef.current) {
      groupRef.current.updateMatrixWorld(true);

      const mesh = displayMeshRef.current;
      const corners = displayCornersRef.current;

      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (const localCorner of corners) {
        _v.copy(localCorner);
        _v.applyMatrix4(mesh.matrixWorld);
        _v.project(camera);

        const sx = (_v.x + 1) * 0.5 * size.width;
        const sy = (-_v.y + 1) * 0.5 * size.height;

        if (sx < minX) minX = sx;
        if (sx > maxX) maxX = sx;
        if (sy < minY) minY = sy;
        if (sy > maxY) maxY = sy;
      }

      phoneScreenBridge.screenLeft = minX;
      phoneScreenBridge.screenTop = minY;
      phoneScreenBridge.screenWidth = maxX - minX;
      phoneScreenBridge.screenHeight = maxY - minY;
    }
  });

  return (
    <group ref={groupRef}>
      <Environment preset="city" environmentIntensity={0.25} />
      <primitive object={scene} />
    </group>
  );
}
