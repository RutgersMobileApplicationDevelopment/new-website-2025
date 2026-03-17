import phoneLogoJson from './motifs/phone-logo.json';
import horizontalLogoJson from './motifs/horizontal-logo.json';
import maskSatelliteJson from './motifs/mask-satellite.json';
import type { ConstellationMotif, ConstellationMotifJson } from './types';

function finiteOrFallback(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeMotif(raw: ConstellationMotifJson): ConstellationMotif {
  const outlineThickness = finiteOrFallback(raw.outline?.thickness, 4);
  const outlineOpacity = finiteOrFallback(raw.outline?.opacity, 0.82);
  const brightness = finiteOrFallback(raw.outline?.brightness, 1);
  const sizeMultiplier = finiteOrFallback(raw.size?.multiplier, 1);
  const minSizeMultiplier = finiteOrFallback(raw.size?.min, 0.2);
  const maxSizeMultiplier = finiteOrFallback(raw.size?.max, 2);
  const maxTilt = finiteOrFallback(raw.tilt?.max, 0.14);
  const pointCount = Math.round(finiteOrFallback(raw.points?.count, 6));
  const pointJitter = finiteOrFallback(raw.points?.jitter, 0.006);
  const pointSizeMultiplier = finiteOrFallback(raw.points?.sizeMultiplier, 1);

  return {
    id: raw.id,
    name: raw.name,
    svgPath: raw.svgPath,
    outlineThickness,
    outlineOpacity,
    brightness,
    sizeMultiplier,
    minSizeMultiplier,
    maxSizeMultiplier,
    maxTilt,
    pointCount,
    pointJitter,
    pointSizeMultiplier,
  };
}

export const constellationRegistry: Record<string, ConstellationMotif> = {
  [phoneLogoJson.id]: normalizeMotif(phoneLogoJson as ConstellationMotifJson),
  [horizontalLogoJson.id]: normalizeMotif(horizontalLogoJson as ConstellationMotifJson),
  [maskSatelliteJson.id]: normalizeMotif(maskSatelliteJson as ConstellationMotifJson),
};

export function getMotifsByIds(ids: string[]): ConstellationMotif[] {
  return ids
    .map((id) => constellationRegistry[id])
    .filter((motif): motif is ConstellationMotif => Boolean(motif));
}
