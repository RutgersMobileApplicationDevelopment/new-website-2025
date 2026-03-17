import type { LandingConstellationConfig } from './types';
import constellationGenerationJson from './constellation-config.json';

function finiteOrFallback(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

const rawJson = constellationGenerationJson as Record<string, unknown>;
const globalColors: string[] =
  Array.isArray(rawJson.colors) && rawJson.colors.length > 0
    ? (rawJson.colors as string[])
    : ['#ff5544', '#ff7733', '#ee4422', '#ff9955', '#ffbb66', '#ffcc88'];

const generation = (() => {
  const raw = constellationGenerationJson as {
    motifs?: {
      total?: unknown;
      weights?: Record<string, unknown>;
    };
    count?: unknown;
    motifWeights?: Record<string, unknown>;
    visibility?: {
      showAtOnce?: unknown;
      range?: { min?: unknown; max?: unknown };
      aggressiveness?: unknown;
    };
    visibleSvgCount?: { min?: unknown; max?: unknown };
    placement?: { minDistance?: unknown; attempts?: unknown };
    spacing?: { minDistance?: unknown; placementAttempts?: unknown };
    size?: { average?: unknown; jitter?: unknown };
    timing?: {
      cycleSeconds?: unknown;
      outline?: {
        fadeInSeconds?: unknown;
        holdSeconds?: unknown;
        fadeOutSeconds?: unknown;
      };
      visibilityCycle?: {
        cycleUnits?: unknown;
        fadeInUnits?: unknown;
        holdUnits?: unknown;
        fadeOutUnits?: unknown;
      };
      regeneration?: {
        jitter?: unknown;
        flashOut?: unknown;
        hidden?: unknown;
        hiddenJitter?: unknown;
        flashIn?: unknown;
        flashInJitter?: unknown;
        baseSeconds?: unknown;
        jitterSeconds?: unknown;
        flashOutSeconds?: unknown;
        hiddenSeconds?: unknown;
        hiddenJitterSeconds?: unknown;
        flashInSeconds?: unknown;
        flashInJitterSeconds?: unknown;
      };
    };
    outline?: { thicknessBoost?: unknown; minThickness?: unknown };
    points?: {
      size?: unknown;
      opacity?: unknown;
      twinkle?: unknown;
      twinkleSpeed?: unknown;
    };
  };

  const count = Math.max(1, Math.floor(finiteOrFallback(raw.motifs?.total, finiteOrFallback(raw.count, 12))));

  const motifFrequency = Object.fromEntries(
    Object.entries(raw.motifs?.weights ?? raw.motifWeights ?? {}).map(([id, value]) => [id, Math.max(0, finiteOrFallback(value, 1))]),
  );

  const showAtOnce = raw.visibility?.showAtOnce;
  const visibleOverride =
    showAtOnce === 'all'
      ? count
      : typeof showAtOnce === 'number' && Number.isFinite(showAtOnce)
        ? Math.max(1, Math.floor(showAtOnce))
        : undefined;
  const visibleMin = visibleOverride ?? Math.max(1, Math.floor(finiteOrFallback(raw.visibility?.range?.min, finiteOrFallback(raw.visibleSvgCount?.min, 2))));
  const visibleMax = visibleOverride ?? Math.max(visibleMin, Math.floor(finiteOrFallback(raw.visibility?.range?.max, finiteOrFallback(raw.visibleSvgCount?.max, 3))));
  const aggressiveness = finiteOrFallback(raw.visibility?.aggressiveness, 0.6);

  const sharedCycleValue = Math.max(
    2,
    finiteOrFallback(
      raw.timing?.cycleSeconds,
      finiteOrFallback(raw.timing?.regeneration?.baseSeconds, finiteOrFallback(raw.timing?.visibilityCycle?.cycleUnits, 15)),
    ),
  );
  const intervalUnits = Math.floor(sharedCycleValue);
  const fadeInUnits = Math.max(
    1,
    finiteOrFallback(raw.timing?.outline?.fadeInSeconds, finiteOrFallback(raw.timing?.visibilityCycle?.fadeInUnits, 1)),
  );
  const holdUnits = Math.max(
    0,
    finiteOrFallback(raw.timing?.outline?.holdSeconds, finiteOrFallback(raw.timing?.visibilityCycle?.holdUnits, 6)),
  );
  const fadeOutUnits = Math.max(
    1,
    finiteOrFallback(raw.timing?.outline?.fadeOutSeconds, finiteOrFallback(raw.timing?.visibilityCycle?.fadeOutUnits, 1)),
  );

  return {
    count,
    motifFrequency,
    visibleAtOnce: {
      min: visibleMin,
      max: visibleMax,
      aggressiveness,
    },
    spacing: {
      minDistance: Math.max(0, finiteOrFallback(raw.placement?.minDistance, finiteOrFallback(raw.spacing?.minDistance, 1.35))),
      placementAttemptsPerConstellation: Math.max(
        1,
        Math.floor(finiteOrFallback(raw.placement?.attempts, finiteOrFallback(raw.spacing?.placementAttempts, 220))),
      ),
    },
    sizing: {
      averageSize: Math.max(0.1, finiteOrFallback(raw.size?.average, 5.2)),
      sizeJitter: Math.max(0, Math.min(0.9, finiteOrFallback(raw.size?.jitter, 0.2))),
    },
    timeline: {
      intervalUnits,
      fadeInUnits,
      holdUnits,
      fadeOutUnits,
      phoneMaxedScrollOffset: 0.5,
    },
    regeneration: {
      resetSeconds: sharedCycleValue,
      resetJitterSeconds: Math.max(0, finiteOrFallback(raw.timing?.regeneration?.jitter, finiteOrFallback(raw.timing?.regeneration?.jitterSeconds, 0))),
      flashOutSeconds: Math.max(0.05, finiteOrFallback(raw.timing?.regeneration?.flashOut, finiteOrFallback(raw.timing?.regeneration?.flashOutSeconds, 0.7))),
      hiddenBaseSeconds: Math.max(0, finiteOrFallback(raw.timing?.regeneration?.hidden, finiteOrFallback(raw.timing?.regeneration?.hiddenSeconds, 2.5))),
      hiddenJitterSeconds: Math.max(
        0,
        finiteOrFallback(raw.timing?.regeneration?.hiddenJitter, finiteOrFallback(raw.timing?.regeneration?.hiddenJitterSeconds, 0.8)),
      ),
      flashInBaseSeconds: Math.max(0.05, finiteOrFallback(raw.timing?.regeneration?.flashIn, finiteOrFallback(raw.timing?.regeneration?.flashInSeconds, 0.9))),
      flashInJitterSeconds: Math.max(
        0,
        finiteOrFallback(raw.timing?.regeneration?.flashInJitter, finiteOrFallback(raw.timing?.regeneration?.flashInJitterSeconds, 0.4)),
      ),
    },
    outline: {
      thicknessMultiplier: Math.max(0.1, finiteOrFallback(raw.outline?.thicknessBoost, 1.2)),
      minimumThickness: Math.max(0.1, finiteOrFallback(raw.outline?.minThickness, 4.8)),
    },
    pointStars: {
      sizeMultiplier: Math.max(0.1, finiteOrFallback(raw.points?.size, 2.0)),
      opacity: Math.max(0, Math.min(1, finiteOrFallback(raw.points?.opacity, 0.62))),
      twinkleAmplitude: Math.max(0, Math.min(0.95, finiteOrFallback(raw.points?.twinkle, 0.12))),
      twinkleSpeed: Math.max(0, finiteOrFallback(raw.points?.twinkleSpeed, 0.008)),
    },
  };
})();

export const landingConstellationConfig: LandingConstellationConfig = {
  enabled: true,
  motifs: Object.keys(generation.motifFrequency),
  colors: globalColors,
  constellationGeneration: generation,
  rotationRange: [-1.15, 1.15],
  spread: {
    minX: -18,
    maxX: 18,
    minY: -8,
    maxY: 9,
    minZ: -34,
    maxZ: -18,
  },
  scaleRange: [3.8, 6.8],
  stars: {
    count: 2200,
    size: 0.16,
    opacity: 0.82,
    colors: ['#ffb89f', '#ff8e5f', '#ffe5bf', '#ffffff'],
  },
  nebulas: {
    count: 5,
    sizeRange: [9, 18],
    opacityRange: [0.05, 0.12],
    colors: ['#260709', '#3a0c10', '#2b0811', '#2f0e1a'],
  },
  animation: {
    driftPerSecond: [0.22, 0.065],
    rotationPerSecond: [0, 0],
    fadeInRange: [0.05, 0.3],
    fadeOutRange: [0.7, 0.96],
    perConstellationDelay: 0.006,
    cycles: 4,
  },
};
