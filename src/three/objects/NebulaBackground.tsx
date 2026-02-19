'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Procedural nebula shader ─────────────────────────────────────────────────
// Renders on the inside of a large sphere surrounding the scene.

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  float n  = fbm(uv * 4.0 + uTime * 0.03);
  float n2 = fbm(uv * 6.0 - uTime * 0.02 + 3.14);

  vec3 dark   = vec3(0.02, 0.01, 0.02);
  vec3 red    = vec3(0.30, 0.04, 0.06);
  vec3 bright = vec3(0.50, 0.08, 0.12);

  vec3 color = mix(dark, red, n * 0.8);
  color = mix(color, bright, n2 * n * 0.5);

  // Vignette
  float vig = 1.0 - length(uv - 0.5) * 0.6;
  color *= vig * vig;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function NebulaBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
