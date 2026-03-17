/* ────────────────────────────────────────────────────────────────────────────
 * phoneScreenBridge
 *
 * Module-level mutable state bridging the R3F Canvas (SketchfabPhone)
 * and the DOM overlays (PhoneScreenSplash / PhoneScreenInfo).
 *
 * SketchfabPhone writes to this every frame; the overlay components
 * read it via requestAnimationFrame so React never re-renders.
 * ──────────────────────────────────────────────────────────────────────────── */

export const phoneScreenBridge = {
  visible: false,

  /** 0→1: splash fades in (logo + title + socials). */
  phase1: 0,
  /** 0→1: splash fades up and out. */
  phase1Out: 0,
  /** 0→1: info page fades in (after splash exits). */
  phase2: 0,
  /** 0→1: info page content scroll progress. */
  contentScroll: 0,

  /** Phone screen bounding box in CSS pixels (top-left origin). */
  screenLeft: 0,
  screenTop: 0,
  screenWidth: 0,
  screenHeight: 0,
};
