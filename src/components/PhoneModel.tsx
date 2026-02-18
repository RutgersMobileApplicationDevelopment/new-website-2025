"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useScroll, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

export default function PhoneModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const scroll = useScroll();

  useFrame(() => {
    if (!groupRef.current) return;

    const approach = scroll.range(0, 0.28);
    const z = THREE.MathUtils.lerp(-14, 1.8, approach);

    const flip = scroll.range(0.06, 0.22);
    const rotY = THREE.MathUtils.lerp(Math.PI, 0, flip);

    const scaleUp = scroll.range(0.02, 0.26);
    const s = THREE.MathUtils.lerp(0.35, 1, scaleUp);

    const exit = scroll.range(0.28, 0.08);
    const exitScale = 1 - exit;

    const time = performance.now() * 0.001;
    const floatY = Math.sin(time * 0.6) * 0.12;
    const floatRotZ = Math.sin(time * 0.35) * 0.04;

    const finalScale = s * exitScale;
    groupRef.current.position.set(0, floatY, z);
    groupRef.current.rotation.set(0, rotY, floatRotZ);
    groupRef.current.scale.setScalar(finalScale);
    groupRef.current.visible = finalScale > 0.01;
  });

  return (
    <group ref={groupRef}>
      {/* Phone body */}
      <RoundedBox args={[1.4, 2.8, 0.12]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color="#1c1c1e" metalness={0.5} roughness={0.35} />
      </RoundedBox>

      {/* Front screen (red) */}
      <mesh position={[0, 0, 0.062]}>
        <planeGeometry args={[1.18, 2.48]} />
        <meshBasicMaterial color="#cc1111" />
      </mesh>

      {/* Logo eyes */}
      <mesh position={[-0.16, 0.18, 0.064]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.16, 0.18, 0.064]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Logo mouth */}
      <mesh position={[0, -0.06, 0.064]}>
        <planeGeometry args={[0.38, 0.06]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* RUMAD text on screen */}
      <Text
        position={[0, -0.45, 0.064]}
        fontSize={0.14}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        RUMAD
      </Text>

      {/* Back panel */}
      <mesh position={[0, 0, -0.062]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.18, 2.48]} />
        <meshStandardMaterial color="#c8a8a8" metalness={0.35} roughness={0.45} />
      </mesh>

      {/* Camera module */}
      <RoundedBox
        args={[0.42, 0.42, 0.025]}
        radius={0.06}
        smoothness={4}
        position={[-0.32, 0.95, -0.075]}
      >
        <meshStandardMaterial color="#151515" metalness={0.7} roughness={0.15} />
      </RoundedBox>

      {/* Camera lenses */}
      <mesh position={[-0.42, 1.05, -0.092]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[-0.22, 1.05, -0.092]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.05} />
      </mesh>
      <mesh position={[-0.32, 0.85, -0.092]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.05} />
      </mesh>
    </group>
  );
}
