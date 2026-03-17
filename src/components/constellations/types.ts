export type ConstellationPoint = [number, number];

export interface ConstellationMotif {
  id: string;
  name: string;
  svgPath: string;
  outlineThickness: number;
  outlineOpacity: number;
  brightness: number;
  sizeMultiplier: number;
  minSizeMultiplier: number;
  maxSizeMultiplier: number;
  maxTilt: number;
  pointCount: number;
  pointJitter: number;
  pointSizeMultiplier: number;
}

export interface ConstellationMotifJson {
  id: string;
  name: string;
  svgPath: string;
  outline?: {
    thickness?: number;
    opacity?: number;
    brightness?: number;
  };
  size?: {
    multiplier?: number;
    min?: number;
    max?: number;
  };
  tilt?: {
    max?: number;
  };
  points?: {
    count?: number;
    jitter?: number;
    sizeMultiplier?: number;
  };
}

export interface LandingConstellationConfig {
  enabled: boolean;
  motifs: string[];
  /** Global warm colour palette shared by all constellation outlines. */
  colors: string[];
  constellationGeneration: {
    count: number;
    motifFrequency: Record<string, number>;
    visibleAtOnce: {
      min: number;
      max: number;
      aggressiveness: number;
    };
    spacing: {
      minDistance: number;
      placementAttemptsPerConstellation: number;
    };
    sizing: {
      averageSize: number;
      sizeJitter: number;
    };
    timeline: {
      intervalUnits: number;
      fadeInUnits: number;
      holdUnits: number;
      fadeOutUnits: number;
      phoneMaxedScrollOffset: number;
    };
    regeneration: {
      resetSeconds: number;
      resetJitterSeconds: number;
      flashOutSeconds: number;
      hiddenBaseSeconds: number;
      hiddenJitterSeconds: number;
      flashInBaseSeconds: number;
      flashInJitterSeconds: number;
    };
    outline: {
      thicknessMultiplier: number;
      minimumThickness: number;
    };
    pointStars: {
      sizeMultiplier: number;
      opacity: number;
      twinkleAmplitude: number;
      twinkleSpeed: number;
    };
  };
  rotationRange: [number, number];
  spread: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
  scaleRange: [number, number];
  stars: {
    count: number;
    size: number;
    opacity: number;
    colors?: string[];
  };
  nebulas: {
    count: number;
    sizeRange: [number, number];
    opacityRange: [number, number];
    colors: string[];
  };
  animation: {
    driftPerSecond: [number, number];
    rotationPerSecond: [number, number];
    fadeInRange: [number, number];
    fadeOutRange: [number, number];
    perConstellationDelay: number;
    cycles: number;
  };
}
