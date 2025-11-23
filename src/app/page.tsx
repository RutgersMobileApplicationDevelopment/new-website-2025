"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

export default function HomePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#0d0d0d]">
      {/* 3D Background Layer */}
      <Canvas camera={{ position: [0, 0, 6], fov: 80 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        {/* Floating Shapes */}
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
          <mesh position={[-3, 1, 0]}>
            <dodecahedronGeometry args={[1]} />
            <meshStandardMaterial color="#ff4d4d" />
          </mesh>
        </Float>

        <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
          <mesh position={[2.7, -1, -1]}>
            <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
            <meshStandardMaterial color="#4d79ff" />
          </mesh>
        </Float>

        <Float speed={1.2} rotationIntensity={1} floatIntensity={0.8}>
          <mesh position={[0, -2, 1]}>
            <icosahedronGeometry args={[0.9]} />
            <meshStandardMaterial color="#39e6b0" />
          </mesh>
        </Float>

        {/* Optional controls (comment out if you want static shapes) */}
        {/* <OrbitControls enableZoom={false} /> */}
      </Canvas>

      {/* Foreground Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg">
          RUMAD
        </h1>
        <p className="text-gray-300 text-xl mt-4 max-w-xl drop-shadow-md">
          Rutgers Mobile App Development — building student-led software projects.
        </p>

        <div className="mt-10 flex gap-6 pointer-events-auto">
          <a
            href="/programs"
            className="px-6 py-3 bg-white text-black rounded-xl font-medium"
          >
            Programs
          </a>
          <a
            href="/team"
            className="px-6 py-3 bg-transparent border border-white text-white rounded-xl font-medium"
          >
            Team
          </a>
        </div>
      </div>
    </main>
  );
}
