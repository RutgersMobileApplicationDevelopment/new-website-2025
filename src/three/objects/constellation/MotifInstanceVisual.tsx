'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { landingConstellationConfig } from '@/components/constellations';
import type { Bounds2D, ConstellationInstance, VisibilitySchedule } from './types';
import { clamp, randomConstellationColor, wrap } from './utils';
import { useSvgGuideData } from './svg-guide';
import { buildLocalPointBuffer, generateInstancePoints, getGuideTransform } from './placement';
import { computeOutlineFade } from './schedule';
import { TRACE_FRAGMENT, TRACE_VERTEX } from './shaders';

/* ────────────────────────────────────────────────────────────────────────────
 * MotifInstanceVisual
 *
 * Renders a single constellation instance:
 *   • Point-stars placed on the SVG contour (with twinkle)
 *   • Thickened SVG outline via a custom shader
 *   • Pacman-style toroidal wrapping — the instance's canonical tile is
 *     always rendered; up to 8 "ghost" tiles are toggled on only when
 *     the instance nears a domain edge, ensuring seamless wrap-around.
 *
 * The SVG outline fades according to the "2-6-2" visibility schedule while
 * the point-stars remain permanently visible and drift with the field.
 * ──────────────────────────────────────────────────────────────────────────── */

interface MotifInstanceVisualProps {
  instance: ConstellationInstance;
  /** This instance's stagger offset within the queue (seconds). */
  scheduleStartSeconds: number;
  /** World-space wrapping domain. */
  bounds: Bounds2D;
  /** Base per-frame world-space drift velocity. */
  drift: { x: number; y: number };
  /** Shared "2-6-2" visibility timing. */
  schedule: VisibilitySchedule;
  /** Mutable ref updated each frame by ConstellationLayer — ≥ 1.0 when scrolling. */
  scrollBoostRef: React.RefObject<number>;
}

export function MotifInstanceVisual({
  instance,
  scheduleStartSeconds,
  bounds,
  drift,
  schedule,
  scrollBoostRef,
}: MotifInstanceVisualProps) {
  const { gl } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const tileGroupRefs = useRef<Array<THREE.Group | null>>([]);
  const traceMatRefs = useRef<Array<THREE.ShaderMaterial | null>>([]);
  const motifStarMatRefs = useRef<Array<THREE.PointsMaterial | null>>([]);
  const twinklePhaseRef = useRef(Math.random() * Math.PI * 2);

  const guide = useSvgGuideData(instance.motif.svgPath);

  // ── Deterministic star points along the SVG contour ──────────────────
  const instancePoints = useMemo(
    () => (guide
      ? generateInstancePoints(
          guide.contourPoints,
          instance.motif.pointCount,
          instance.motif.pointJitter,
          instance.pointSeed,
        )
      : []),
    [guide, instance.motif.pointCount, instance.motif.pointJitter, instance.pointSeed],
  );

  const pointBuffer = useMemo(
    () => (guide ? buildLocalPointBuffer(guide, instancePoints) : new Float32Array(0)),
    [guide, instancePoints],
  );

  const guideTransform = useMemo(
    () => (guide ? getGuideTransform(guide) : { width: 1, height: 1, centerX: 0, centerY: 0 }),
    [guide],
  );

  // ── Outline colour & texture ─────────────────────────────────────────
  const traceColor = useMemo(
    () => new THREE.Color(randomConstellationColor(instance.pointSeed, landingConstellationConfig.colors))
      .multiplyScalar(instance.motif.brightness),
    [instance.pointSeed, instance.motif.brightness],
  );
  const texture = useLoader(THREE.TextureLoader, instance.motif.svgPath);
  const maxAnisotropy = useMemo(
    () => Math.max(1, Math.min(8, gl.capabilities.getMaxAnisotropy())),
    [gl],
  );

  // ── Toroidal tile offsets (9 tiles: canonical + 8 neighbours) ────────
  const offsets = useMemo(() => {
    const spanX = bounds.maxX - bounds.minX;
    const spanY = bounds.maxY - bounds.minY;
    return [
      [0, 0],
      [spanX, 0],
      [-spanX, 0],
      [0, spanY],
      [0, -spanY],
      [spanX, spanY],
      [spanX, -spanY],
      [-spanX, spanY],
      [-spanX, -spanY],
    ] as Array<[number, number]>;
  }, [bounds.maxX, bounds.minX, bounds.maxY, bounds.minY]);

  // Mutable position that is wrapped in-place every frame
  const positionRef = useRef<[number, number, number]>([...instance.position]);

  useEffect(() => {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = maxAnisotropy;
    texture.needsUpdate = true;

    const image = texture.image as { width?: number; height?: number } | undefined;
    const w = image?.width && image.width > 0 ? image.width : 1024;
    const h = image?.height && image.height > 0 ? image.height : 1024;

    traceMatRefs.current.forEach((material) => {
      if (!material) return;
      material.uniforms.uTexel.value.set(1 / w, 1 / h);
    });
  }, [texture, maxAnisotropy]);

  // ── Per-frame: drift, wrap, fade, twinkle, tile visibility ───────────
  useFrame((state, delta) => {
    if (!rootRef.current) return;

    // Advance position (scroll-boosted) and wrap inside the toroidal domain
    const boost = scrollBoostRef.current ?? 1;
    positionRef.current[0] = wrap(positionRef.current[0] + drift.x * boost * delta, bounds.minX, bounds.maxX);
    positionRef.current[1] = wrap(positionRef.current[1] + drift.y * boost * delta, bounds.minY, bounds.maxY);

    rootRef.current.position.set(
      positionRef.current[0],
      positionRef.current[1],
      positionRef.current[2],
    );

    // "2-6-2" outline fade
    const elapsed = state.clock.elapsedTime;
    const fade = computeOutlineFade(scheduleStartSeconds, elapsed, schedule);
    const pointCfg = landingConstellationConfig.constellationGeneration.pointStars;
    const twinkle = 1 + pointCfg.twinkleAmplitude
      * Math.sin(performance.now() * pointCfg.twinkleSpeed + twinklePhaseRef.current);

    const outlineOpacity = instance.motif.outlineOpacity * instance.motif.brightness;
    const thickness = Math.max(
      landingConstellationConfig.constellationGeneration.outline.minimumThickness,
      instance.motif.outlineThickness
        * landingConstellationConfig.constellationGeneration.outline.thicknessMultiplier,
    );
    const motifThickness = instance.motif.id === 'mask-satellite' ? thickness * 0.72 : thickness;

    // Push uniforms to every tile's trace material
    traceMatRefs.current.forEach((material) => {
      if (!material) return;
      material.uniforms.uFade.value = fade;
      material.uniforms.uOpacity.value = outlineOpacity;
      material.uniforms.uThickness.value = motifThickness;
    });

    // ── Ghost-tile visibility (pacman wrapping) ────────────────────────
    //
    // Compare against the wrapping domain (bounds) — NOT the viewport —
    // so the ghost tile appears exactly when the canonical tile nears the
    // boundary where wrap() teleports the position.  A generous margin
    // (proportional to the constellation's rendered footprint) ensures the
    // ghost fades in well before the canonical exits.
    const edgeMarginX = clamp(guideTransform.width * instance.scale * 0.6, 3, 14);
    const edgeMarginY = clamp(guideTransform.height * instance.scale * 0.6, 3, 14);
    const nearLeftEdge = positionRef.current[0] <= bounds.minX + edgeMarginX;
    const nearRightEdge = positionRef.current[0] >= bounds.maxX - edgeMarginX;
    const nearTopEdge = positionRef.current[1] >= bounds.maxY - edgeMarginY;
    const nearBottomEdge = positionRef.current[1] <= bounds.minY + edgeMarginY;

    offsets.forEach(([offsetX, offsetY], tileIndex) => {
      const group = tileGroupRefs.current[tileIndex];
      if (!group) return;

      // Canonical tile is always shown
      if (tileIndex === 0) {
        group.visible = true;
        return;
      }

      const needsLeft = offsetX > 0;
      const needsRight = offsetX < 0;
      const needsBottom = offsetY > 0;
      const needsTop = offsetY < 0;

      const xVisible = (!needsLeft && !needsRight)
        || (needsLeft && nearLeftEdge)
        || (needsRight && nearRightEdge);
      const yVisible = (!needsBottom && !needsTop)
        || (needsBottom && nearBottomEdge)
        || (needsTop && nearTopEdge);

      group.visible = xVisible && yVisible;
    });

    // Point-star appearance (always visible, independent of outline fade)
    motifStarMatRefs.current.forEach((material) => {
      if (!material) return;
      material.opacity = pointCfg.opacity * (0.85 + 0.35 * instance.motif.brightness);
      material.size = landingConstellationConfig.stars.size
        * instance.motif.pointSizeMultiplier
        * pointCfg.sizeMultiplier
        * twinkle;
    });
  });

  if (!guide || pointBuffer.length === 0) return null;

  return (
    <group ref={rootRef} position={instance.position}>
      {offsets.map(([ox, oy], tileIndex) => (
        <group
          key={tileIndex}
          ref={(group) => {
            tileGroupRefs.current[tileIndex] = group;
          }}
          position={[ox, oy, 0]}
        >
          <group
            rotation={[0, 0, instance.rotationZ]}
            scale={[instance.scale, instance.scale, 1]}
          >
            {/* Contour point-stars */}
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={pointBuffer.length / 3}
                  array={pointBuffer}
                  itemSize={3}
                  args={[pointBuffer, 3]}
                />
              </bufferGeometry>
              <pointsMaterial
                ref={(material) => {
                  motifStarMatRefs.current[tileIndex] = material;
                }}
                color="#fff8ea"
                size={
                  landingConstellationConfig.stars.size
                  * landingConstellationConfig.constellationGeneration.pointStars.sizeMultiplier
                  * instance.motif.pointSizeMultiplier
                }
                transparent
                opacity={landingConstellationConfig.constellationGeneration.pointStars.opacity}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </points>

            {/* Thickened SVG outline */}
            <mesh position={[guideTransform.centerX, guideTransform.centerY, 0]}>
              <planeGeometry args={[guideTransform.width, guideTransform.height]} />
              <shaderMaterial
                ref={(material) => {
                  traceMatRefs.current[tileIndex] = material;
                }}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexShader={TRACE_VERTEX}
                fragmentShader={TRACE_FRAGMENT}
                uniforms={{
                  uMap: { value: texture },
                  uColor: { value: traceColor },
                  uFade: { value: 0 },
                  uOpacity: { value: instance.motif.outlineOpacity },
                  uTexel: { value: new THREE.Vector2(1 / 1024, 1 / 1024) },
                  uThickness: {
                    value: Math.max(
                      landingConstellationConfig.constellationGeneration.outline.minimumThickness,
                      instance.motif.outlineThickness
                        * landingConstellationConfig.constellationGeneration.outline.thicknessMultiplier,
                    ),
                  },
                }}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}
