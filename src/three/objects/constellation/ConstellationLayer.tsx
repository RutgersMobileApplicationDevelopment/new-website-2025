'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';
import {
  getMotifsByIds,
  landingConstellationConfig,
} from '@/components/constellations';
import type { VisibilitySchedule } from './types';
import { randomAround, smoothstep01 } from './utils';
import { useAllGuides } from './svg-guide';
import { generateInstances } from './placement';
import { buildQueueSchedule, computeOutlineFade } from './schedule';
import { MotifInstanceVisual } from './MotifInstanceVisual';
import { NebulaClouds } from './NebulaClouds';
import { MovingStars } from './MovingStars';

/* ────────────────────────────────────────────────────────────────────────────
 * ConstellationLayer — Top-level orchestrator
 *
 * Composes every sub-layer of the constellation background:
 *   • NebulaClouds   — soft additive nebula spheres
 *   • MovingStars    — background star field (drift-matched with motifs)
 *   • MotifInstances — SVG-outlined constellations with contour stars
 *
 * Scroll-reactive drift:
 *   Scrolling in any direction adds a speed boost to the base left-to-right
 *   drift.  A `scrollBoostRef` (mutable ref) is updated each frame and
 *   passed to every child so they can read `scrollBoostRef.current` in
 *   their own `useFrame` without causing re-renders.
 *
 * Lifecycle:
 *   1. On mount, resolves all SVG guides in parallel.
 *   2. Once ready, generates a batch of collision-free instances.
 *   3. Instances are rendered with a staggered "2-6-2" visibility queue.
 *   4. After `resetSeconds` the whole batch flashes out, regenerates with
 *      a new seed, and flashes back in — looping indefinitely.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * How much a unit of scroll velocity multiplies the base drift.
 * Scroll offset is 0–1 across all pages, so per-frame delta is tiny
 * (≈0.001–0.01 while actively scrolling).  A large factor is needed
 * to produce a visible speed-up.
 */
const SCROLL_BOOST_FACTOR = 600;

/** Exponential smoothing factor for scroll velocity (0–1; lower = smoother). */
const SCROLL_SMOOTH = 0.12;

export function ConstellationLayer() {
  const { camera, viewport, size } = useThree();
  const scroll = useScroll();
  const motifs = useMemo(() => getMotifsByIds(landingConstellationConfig.motifs), []);
  const spread = landingConstellationConfig.spread;
  const generationCfg = landingConstellationConfig.constellationGeneration;
  const [regenEpoch, setRegenEpoch] = useState(0);
  const nebulaRootRef = useRef<THREE.Group>(null);

  // ── Scroll-reactive drift boost ──────────────────────────────────────
  const prevScrollOffsetRef = useRef(scroll.offset);
  const smoothedVelocityRef = useRef(0);

  /**
   * Shared mutable ref — children read `scrollBoostRef.current` every
   * frame to get the current drift multiplier (≥ 1.0).
   */
  const scrollBoostRef = useRef(1);

  // ── Flash / regeneration state machine ─────────────────────────────────
  const flashPhaseRef = useRef<'steady' | 'flash-out' | 'hidden' | 'flash-in'>('hidden');
  const flashStartRef = useRef<number>(performance.now());
  const flashDurationRef = useRef<number>(1);
  const flashVisibilityRef = useRef<number>(0);

  useEffect(() => {
    const regen = landingConstellationConfig.constellationGeneration.regeneration;
    if (regen.resetSeconds <= 0) return;

    const timeoutIds: number[] = [];
    let cancelled = false;

    const setPhase = (
      phase: 'steady' | 'flash-out' | 'hidden' | 'flash-in',
      durationMs: number,
    ) => {
      flashPhaseRef.current = phase;
      flashStartRef.current = performance.now();
      flashDurationRef.current = Math.max(1, durationMs);
    };

    const scheduleCycle = () => {
      if (cancelled) return;

      const resetDelay = randomAround(regen.resetSeconds, regen.resetJitterSeconds) * 1000;
      const flashOutMs = regen.flashOutSeconds * 1000;
      const hiddenMs = randomAround(regen.hiddenBaseSeconds, regen.hiddenJitterSeconds) * 1000;
      const flashInMs = randomAround(regen.flashInBaseSeconds, regen.flashInJitterSeconds) * 1000;

      timeoutIds.push(window.setTimeout(() => {
        if (cancelled) return;
        setPhase('flash-out', flashOutMs);

        timeoutIds.push(window.setTimeout(() => {
          if (cancelled) return;
          setPhase('hidden', hiddenMs);

          timeoutIds.push(window.setTimeout(() => {
            if (cancelled) return;
            setRegenEpoch((prev) => prev + 1);
            setPhase('flash-in', flashInMs);

            timeoutIds.push(window.setTimeout(() => {
              if (cancelled) return;
              setPhase('steady', 1);
              scheduleCycle();
            }, flashInMs));
          }, hiddenMs));
        }, flashOutMs));
      }, resetDelay));
    };

    setPhase('hidden', 1);
    const initialFlashInMs = Math.max(
      60,
      randomAround(regen.flashInBaseSeconds, regen.flashInJitterSeconds) * 1000,
    );
    timeoutIds.push(window.setTimeout(() => {
      if (cancelled) return;
      setRegenEpoch((prev) => prev + 1);
      setPhase('flash-in', initialFlashInMs);

      timeoutIds.push(window.setTimeout(() => {
        if (cancelled) return;
        setPhase('steady', 1);
        scheduleCycle();
      }, initialFlashInMs));
    }, 50));

    return () => {
      cancelled = true;
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [generationCfg.regeneration]);

  // ── World-space bounding box for the constellation domain ──────────────
  //
  // The wrapping domain must match the actual visible viewport so that
  // pacman-style wrapping is seamless — constellations/stars exiting the
  // right side immediately appear on the left with no invisible gap.
  //
  // We compute the viewport dimensions at the NEAREST constellation depth
  // (spread.maxZ) which gives the tightest visible width, then add a
  // small buffer so partial objects don't pop at the wrap edge.
  //
  // `size.width` / `size.height` are included as deps so the bounds
  // recompute when the browser window is resized.
  const bounds = useMemo(() => {
    const viewAtNearest = viewport.getCurrentViewport(
      camera,
      new THREE.Vector3(0, 0, spread.maxZ),
    );
    const halfW = viewAtNearest.width * 0.5 + 2;
    const halfH = viewAtNearest.height * 0.5 + 2;

    return {
      minX: -halfW,
      maxX: halfW,
      minY: -halfH,
      maxY: halfH,
      minZ: spread.minZ - 24,
      maxZ: spread.maxZ - 4,
    };
  }, [camera, viewport, spread.maxZ, spread.minZ, size.width, size.height]);

  const motifDrift = useMemo(
    () => ({
      x: landingConstellationConfig.animation.driftPerSecond[0],
      y: landingConstellationConfig.animation.driftPerSecond[1],
    }),
    [],
  );

  const spanX = bounds.maxX - bounds.minX;
  const spanY = bounds.maxY - bounds.minY;

  const motifPaths = useMemo(
    () => Array.from(new Set(motifs.map((motif) => motif.svgPath))),
    [motifs],
  );
  const { ready, guides } = useAllGuides(motifPaths);

  // ── Per-frame: scroll boost + flash visibility ─────────────────────────
  useFrame(() => {
    // Compute scroll velocity (absolute — any direction boosts speed)
    const rawVelocity = Math.abs(scroll.offset - prevScrollOffsetRef.current);
    prevScrollOffsetRef.current = scroll.offset;
    smoothedVelocityRef.current += (rawVelocity - smoothedVelocityRef.current) * SCROLL_SMOOTH;

    // Clamp the boost so it doesn't go insane
    scrollBoostRef.current = 1 + Math.min(smoothedVelocityRef.current * SCROLL_BOOST_FACTOR, 8);

    // Flash visibility
    if (!nebulaRootRef.current) return;

    const phase = flashPhaseRef.current;
    const elapsed = performance.now() - flashStartRef.current;
    const duration = Math.max(1, flashDurationRef.current);
    const t = smoothstep01(elapsed / duration);

    if (phase === 'steady') {
      flashVisibilityRef.current = 1;
    } else if (phase === 'flash-out') {
      flashVisibilityRef.current = 1 - t;
    } else if (phase === 'hidden') {
      flashVisibilityRef.current = 0;
    } else {
      flashVisibilityRef.current = t;
    }

    const s = Math.max(0.0001, flashVisibilityRef.current);
    nebulaRootRef.current.scale.setScalar(s);
  });

  // ── Generate collision-free constellation instances ────────────────────
  const instances = useMemo(() => {
    if (!landingConstellationConfig.enabled || motifs.length === 0 || !ready) return [];
    return generateInstances(motifs, guides, bounds, spanX, spanY, regenEpoch);
  }, [motifs, ready, guides, bounds, spanX, spanY, regenEpoch]);

  // ── Staggered "2-6-2" queue schedule (motif-aware round-robin) ───────
  const queuePlan = useMemo(() => {
    const cycleSeconds = Math.max(
      0.1,
      generationCfg.timeline.fadeInUnits
        + generationCfg.timeline.holdUnits
        + generationCfg.timeline.fadeOutUnits,
    );
    return buildQueueSchedule(
      instances,
      generationCfg.visibleAtOnce.min,
      generationCfg.visibleAtOnce.max,
      cycleSeconds,
      generationCfg.visibleAtOnce.aggressiveness,
      regenEpoch,
    );
  }, [
    instances,
    generationCfg.timeline.fadeInUnits,
    generationCfg.timeline.holdUnits,
    generationCfg.timeline.fadeOutUnits,
    generationCfg.visibleAtOnce.min,
    generationCfg.visibleAtOnce.max,
    generationCfg.visibleAtOnce.aggressiveness,
    regenEpoch,
  ]);

  const visibilitySchedule = useMemo<VisibilitySchedule>(() => {
    const fadeInSeconds = Math.max(0.1, generationCfg.timeline.fadeInUnits);
    const holdSeconds = Math.max(0, generationCfg.timeline.holdUnits);
    const fadeOutSeconds = Math.max(0.1, generationCfg.timeline.fadeOutUnits);
    const cycleSeconds = Math.max(0.2, fadeInSeconds + holdSeconds + fadeOutSeconds);

    return {
      fadeInSeconds,
      holdSeconds,
      fadeOutSeconds,
      cycleSeconds,
      roundSeconds: queuePlan.roundSeconds,
      warmupSeconds: queuePlan.warmupSeconds,
    };
  }, [
    generationCfg.timeline.fadeInUnits,
    generationCfg.timeline.holdUnits,
    generationCfg.timeline.fadeOutUnits,
    queuePlan.roundSeconds,
    queuePlan.warmupSeconds,
  ]);

  // ── Dev-mode diagnostics ──────────────────────────────────────────────
  const lastDebugLogRef = useRef(0);
  useFrame((state) => {
    if (process.env.NODE_ENV === 'production') return;
    const now = state.clock.elapsedTime;
    if (now - lastDebugLogRef.current < 1) return;
    lastDebugLogRef.current = now;

    let activeSvgCount = 0;
    instances.forEach((instance) => {
      const fade = computeOutlineFade(
        queuePlan.starts[instance.index] ?? 0,
        now,
        visibilitySchedule,
      );
      if (fade > 0.001) activeSvgCount += 1;
    });

    console.debug('[ConstellationLayer]', {
      activeSvgCount,
      totalInstances: instances.length,
      scrollBoost: scrollBoostRef.current.toFixed(2),
      roundSeconds: visibilitySchedule.roundSeconds,
    });
  });

  // ── Render tree ───────────────────────────────────────────────────────
  return (
    <group ref={nebulaRootRef}>
      <NebulaClouds bounds={bounds} drift={motifDrift} scrollBoostRef={scrollBoostRef} />
      <MovingStars bounds={bounds} drift={motifDrift} scrollBoostRef={scrollBoostRef} />

      {instances.map((instance, index) => (
        <MotifInstanceVisual
          key={`${instance.motif.id}-${index}`}
          instance={instance}
          scheduleStartSeconds={queuePlan.starts[index] ?? 0}
          bounds={bounds}
          drift={motifDrift}
          schedule={visibilitySchedule}
          scrollBoostRef={scrollBoostRef}
        />
      ))}
    </group>
  );
}
