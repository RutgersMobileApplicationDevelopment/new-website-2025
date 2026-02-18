"use client";

import { Canvas } from "@react-three/fiber";
import { ScrollControls, Scroll } from "@react-three/drei";
import { Suspense } from "react";
import StarField from "@/components/StarField";
import PhoneModel from "@/components/PhoneModel";
import HyperspaceEffect from "@/components/HyperspaceEffect";
import MainContent from "@/components/MainContent";

export default function HomePage() {
  return (
    <main className="h-screen w-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#050505"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          <ScrollControls pages={5} damping={0.25}>
            <StarField />
            <PhoneModel />
            <HyperspaceEffect />

            <Scroll html style={{ width: "100%" }}>
              <MainContent />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </main>
  );
}
