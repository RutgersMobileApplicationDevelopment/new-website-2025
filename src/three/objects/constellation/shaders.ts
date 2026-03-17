/* ────────────────────────────────────────────────────────────────────────────
 * Constellation Layer — GLSL Shaders
 *
 * Vertex + fragment pair used to render the thickened SVG trace outline.
 * The fragment samples 8 neighbours (plus centre) so the outline stays
 * legible even at small on-screen sizes.  `uThickness` controls how many
 * texels are sampled outward; `uFade` drives the 2-6-2 visibility cycle.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Pass-through vertex shader — just forwards UV to the fragment stage. */
export const TRACE_VERTEX = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Thickened-outline fragment shader.
 *
 * Samples the SVG texture alpha in a 3×3 neighbourhood scaled by
 * `uThickness * uTexel` to dilate thin strokes.  The final alpha is
 * modulated by `uFade` (visibility cycle) and `uOpacity` (per-motif).
 */
export const TRACE_FRAGMENT = `
uniform sampler2D uMap;
uniform vec3 uColor;
uniform float uFade;
uniform float uOpacity;
uniform vec2 uTexel;
uniform float uThickness;
varying vec2 vUv;

void main() {
  vec4 tex = texture2D(uMap, vUv);

  vec2 t = uTexel * uThickness;
  float thickAlpha = tex.a;
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2( t.x, 0.0)).a);
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2(-t.x, 0.0)).a);
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2(0.0,  t.y)).a);
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2(0.0, -t.y)).a);
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2( t.x,  t.y)).a);
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2(-t.x,  t.y)).a);
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2( t.x, -t.y)).a);
  thickAlpha = max(thickAlpha, texture2D(uMap, vUv + vec2(-t.x, -t.y)).a);

  if (thickAlpha < 0.001) discard;

  float alpha = thickAlpha * uFade * uOpacity;
  vec3 color = uColor * (1.1 + uFade * 0.18);

  gl_FragColor = vec4(color, alpha);
}
`;
