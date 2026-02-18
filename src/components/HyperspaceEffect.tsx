"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";

const LINE_COUNT = 350;

export default function HyperspaceEffect() {
  const matRef = useRef<THREE.LineBasicMaterial>(null!);
  const scroll = useScroll();

  const { geometry, dirs, innerRadii, maxExtensions } = useMemo(() => {
    const dirs = new Float32Array(LINE_COUNT * 3);
    const innerRadii = new Float32Array(LINE_COUNT);
    const maxExtensions = new Float32Array(LINE_COUNT);
    const positions = new Float32Array(LINE_COUNT * 6);
    const colors = new Float32Array(LINE_COUNT * 6);

    for (let i = 0; i < LINE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.sin(phi) * Math.sin(theta);
      const dz = Math.cos(phi);

      dirs[i * 3] = dx;
      dirs[i * 3 + 1] = dy;
      dirs[i * 3 + 2] = dz;

      const inner = 0.2 + Math.random() * 1.8;
      innerRadii[i] = inner;
      maxExtensions[i] = 12 + Math.random() * 40;

      positions[i * 6] = dx * inner;
      positions[i * 6 + 1] = dy * inner;
      positions[i * 6 + 2] = dz * inner;
      positions[i * 6 + 3] = dx * inner;
      positions[i * 6 + 4] = dy * inner;
      positions[i * 6 + 5] = dz * inner;

      const t = Math.random();
      let r1: number, g1: number, b1: number;
      let r2: number, g2: number, b2: number;

      if (t < 0.35) {
        r1 = 0.9; g1 = 0.12; b1 = 0.04;
        r2 = 1.0; g2 = 0.45; b2 = 0.08;
      } else if (t < 0.65) {
        r1 = 1.0; g1 = 0.35; b1 = 0.08;
        r2 = 1.0; g2 = 0.82; b2 = 0.55;
      } else {
        r1 = 1.0; g1 = 0.75; b1 = 0.5;
        r2 = 1.0; g2 = 0.95; b2 = 0.88;
      }

      colors[i * 6] = r1;
      colors[i * 6 + 1] = g1;
      colors[i * 6 + 2] = b1;
      colors[i * 6 + 3] = r2;
      colors[i * 6 + 4] = g2;
      colors[i * 6 + 5] = b2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    return { geometry: geo, dirs, innerRadii, maxExtensions };
  }, []);

  useFrame(() => {
    const stretch = scroll.range(0.28, 0.18);
    const opIn = scroll.range(0.26, 0.04);
    const opOut = 1 - scroll.range(0.44, 0.08);
    const opacity = Math.min(opIn, opOut);

    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < LINE_COUNT; i++) {
      const dx = dirs[i * 3];
      const dy = dirs[i * 3 + 1];
      const dz = dirs[i * 3 + 2];
      const outer = innerRadii[i] + stretch * maxExtensions[i];

      arr[i * 6 + 3] = dx * outer;
      arr[i * 6 + 4] = dy * outer;
      arr[i * 6 + 5] = dz * outer;
    }
    posAttr.needsUpdate = true;

    if (matRef.current) {
      matRef.current.opacity = opacity;
    }
  });

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
