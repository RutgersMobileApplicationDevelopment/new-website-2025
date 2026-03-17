'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { landingConstellationConfig } from '@/components/constellations';
import { randomIn, sampleWarmStarColor, wrap } from './utils';

/* ────────────────────────────────────────────────────────────────────────────
 * MovingStars
 *
 * A single background star field with stars randomly distributed across a
 * wide depth range.  All stars share the same world-space drift velocity
 * as constellations; natural perspective foreshortening means nearer stars
 * appear to drift faster on screen — producing organic parallax.
 *
 * Depth distribution:
 *   • ~30 % of stars sit within the constellation depth band
 *     (spread.minZ … spread.maxZ) so they visually blend with motif stars.
 *   • ~70 % extend further back (down to spread.minZ − 14), providing a
 *     receding backdrop of smaller, subtly slower points.
 *
 * Each star's z is individually randomised — no fixed tiers.
 *
 * Three horizontal tiles (canonical + left/right ghost) give seamless
 * pacman-style horizontal wrapping.
 * ──────────────────────────────────────────────────────────────────────────── */

interface MovingStarsProps {
  bounds: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number };
  drift: { x: number; y: number };
  /** Mutable ref updated each frame — ≥ 1.0 when scrolling. */
  scrollBoostRef: React.RefObject<number>;
}

export function MovingStars({ bounds, drift, scrollBoostRef }: MovingStarsProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const baseColorsRef = useRef<Float32Array | null>(null);
  const phasesRef = useRef<Float32Array | null>(null);
  const shimmerRef = useRef(0);

  const spanX = bounds.maxX - bounds.minX;
  const cfg = landingConstellationConfig;
  const spread = cfg.spread;

  const offsets = useMemo(
    () => [[0, 0], [spanX, 0], [-spanX, 0]] as Array<[number, number]>,
    [spanX],
  );

  /**
   * Star size: close to constellation point-star size so the two populations
   * are visually continuous.  sizeAttenuation naturally makes distant stars
   * appear smaller.
   */
  const starSize = cfg.stars.size * cfg.constellationGeneration.pointStars.sizeMultiplier * 0.8;

  /** Deepest z — extends well behind the constellation band for depth. */
  const deepZ = spread.minZ - 14;

  // ── Build geometry once ──────────────────────────────────────────────
  const geometry = useMemo(() => {
    const total = cfg.stars.count;
    const positions = new Float32Array(total * 3);
    const colors = new Float32Array(total * 3);
    const baseColors = new Float32Array(total * 3);
    const phases = new Float32Array(total);

    // 30 % in constellation band, 70 % extending deeper
    const constellationBandCount = Math.floor(total * 0.3);

    for (let i = 0; i < total; i++) {
      positions[i * 3] = randomIn(bounds.minX, bounds.maxX);
      positions[i * 3 + 1] = randomIn(bounds.minY, bounds.maxY);
      positions[i * 3 + 2] = i < constellationBandCount
        ? randomIn(spread.minZ, spread.maxZ)
        : randomIn(deepZ, spread.maxZ);

      const [r, g, b] = sampleWarmStarColor();
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
      baseColors[i * 3] = r;
      baseColors[i * 3 + 1] = g;
      baseColors[i * 3 + 2] = b;
      phases[i] = Math.random() * Math.PI * 2;
    }

    baseColorsRef.current = baseColors;
    phasesRef.current = phases;

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [bounds, spread.minZ, spread.maxZ, deepZ]);

  // ── Per-frame: drift positions + shimmer colours ─────────────────────
  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute | null;
    const colAttr = geom.getAttribute('color') as THREE.BufferAttribute | null;
    if (!posAttr || !colAttr || !baseColorsRef.current || !phasesRef.current) return;

    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;
    const base = baseColorsRef.current;
    const ph = phasesRef.current;

    const boost = scrollBoostRef.current ?? 1;
    const vx = drift.x * boost * delta;
    shimmerRef.current += delta;
    const t = shimmerRef.current;
    const starCount = ph.length;

    for (let i = 0; i < starCount; i++) {
      // Drift x (same world velocity as constellations)
      pos[i * 3] = wrap(pos[i * 3] + vx, bounds.minX, bounds.maxX);

      // Per-star warm shimmer
      const idx = i * 3;
      const intensity = 0.55 + 0.45 * Math.sin(t * 2.0 + ph[i]);
      col[idx] = base[idx] * intensity;
      col[idx + 1] = base[idx + 1] * intensity;
      col[idx + 2] = base[idx + 2] * intensity;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  });

  return (
    <group>
      {offsets.map(([ox, oy], i) => (
        <group key={i} position={[ox, oy, 0]}>
          <points ref={i === 0 ? pointsRef : undefined} geometry={geometry}>
            <pointsMaterial
              ref={i === 0 ? matRef : undefined}
              size={starSize}
              vertexColors
              transparent
              opacity={cfg.stars.opacity}
              sizeAttenuation
              depthWrite={false}
            />
          </points>
        </group>
      ))}
    </group>
  );
}
