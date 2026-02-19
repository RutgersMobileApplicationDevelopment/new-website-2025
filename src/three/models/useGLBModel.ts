'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Reusable hook for loading Sketchfab / GLB models with optional
 * material overrides. Designed for extensibility — future models
 * just call this with their path and overrides.
 *
 * @param path  URL to the .glb file (relative to /public)
 * @param materialOverrides  Map of material name → partial MeshStandardMaterial props
 * @returns  A cloned scene so each instance can be coloured independently
 */
export function useGLBModel(
  path: string,
  materialOverrides?: Record<string, Partial<THREE.MeshStandardMaterialParameters>>,
) {
  const { scene: original } = useGLTF(path);

  const scene = useMemo(() => {
    const clone = original.clone(true);

    if (materialOverrides) {
      clone.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        const mat = child.material as THREE.MeshStandardMaterial;
        if (!mat?.name) return;

        const overrides = materialOverrides[mat.name];
        if (!overrides) return;

        // Clone material so we don't mutate the cached original
        const newMat = mat.clone();
        Object.assign(newMat, overrides);

        // Handle Color objects (colour overrides arrive as hex strings)
        if (overrides.color !== undefined) {
          newMat.color = new THREE.Color(overrides.color);
        }
        if (overrides.emissive !== undefined) {
          newMat.emissive = new THREE.Color(overrides.emissive);
        }

        child.material = newMat;
      });
    }

    return clone;
  }, [original, materialOverrides]);

  return scene;
}

/**
 * Pre-load a GLB so it's ready before the component mounts.
 * Call at module level: `preloadGLB('/models/my-model.glb')`
 */
export function preloadGLB(path: string) {
  useGLTF.preload(path);
}
