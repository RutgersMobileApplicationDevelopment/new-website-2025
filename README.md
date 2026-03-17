# RUMAD Website 2025

A scroll-driven cinematic 3D landing page for **RUMAD** (Rutgers University Mobile Application Development), built with Next.js 15 and React Three Fiber.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node)

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (uses Turbopack)
npm run dev
```

Open **http://localhost:3000** in your browser.

### Other Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | [Next.js](https://nextjs.org) (App Router) | 15.5.5 |
| UI | [React](https://react.dev) | 19.1.0 |
| Language | [TypeScript](https://typescriptlang.org) | 5 |
| 3D Engine | [Three.js](https://threejs.org) | 0.181.2 |
| 3D React Bindings | [@react-three/fiber](https://r3f.docs.pmnd.rs) | 9.4.0 |
| 3D Helpers | [@react-three/drei](https://github.com/pmndrs/drei) | 10.7.7 |
| Animation | [Framer Motion](https://motion.dev) | 11+ |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 | 4 |
| Fonts | Audiowide · Rajdhani · Outfit (Google Fonts) | — |
| Bundler | Turbopack (via Next.js) | — |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage — loads 3D scene
│   ├── layout.tsx                # Root layout (metadata, fonts)
│   ├── globals.css               # Global styles, CSS tokens
│   ├── accelerator/page.tsx      # Accelerator program page
│   ├── incubator/page.tsx        # Incubator program page (full curriculum)
│   ├── eboard/page.tsx           # E-Board page
│   ├── contact/page.tsx          # Contact page
│   ├── pastwork/page.tsx         # Past work page
│   ├── programs/page.tsx         # Programs page
│   ├── team/page.tsx             # Team page
│   ├── webteam/page.tsx          # Web Team page
│   ├── events/page.tsx           # Events page
│   └── api/                      # API routes (aggregate, auth, rate-limit)
│
├── components/                   # React UI components
│   ├── SceneCanvas.tsx           # R3F Canvas + ScrollControls + PhoneScreenOverlay
│   ├── NavBar.tsx                # Fixed top nav with horizontal RUMAD logo
│   ├── Footer.tsx                # Fixed bottom bar (copyright + contact)
│   ├── MobileFallback.tsx        # Fallback UI for mobile devices
│   ├── ScrollHint.tsx            # Animated scroll-down indicator
│   ├── constellations/           # Constellation config & registry
│   │   ├── constellation-config.json  # Global settings + warm colour palette
│   │   ├── landingConfig.ts      # Parsed config for the landing page
│   │   ├── registry.ts           # Motif registry (normalises JSON → typed motifs)
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── index.ts              # Barrel export
│   │   └── motifs/               # Per-SVG motif configs
│   │       ├── phone-logo.json   # Vertical RUMAD logo
│   │       ├── horizontal-logo.json  # Horizontal RUMAD logo
│   │       └── mask-satellite.json   # Mask satellite
│   ├── phone-screen/             # Phone screen DOM overlay system
│   │   ├── phoneScreenBridge.ts  # R3F→DOM mutable state bridge
│   │   ├── PhoneScreenOverlay.tsx  # Pixel-accurate positioned wrapper
│   │   ├── PhoneScreenSplash.tsx # Phase 1: logo + title + socials
│   │   ├── PhoneScreenInfo.tsx   # Phase 2: info + program cards
│   │   └── index.ts              # Barrel export
│   └── incubator/               # Incubator page components (modular)
│       ├── index.ts              # Barrel export
│       ├── IncubatorHero.tsx     # Full-viewport hero with animated tagline
│       ├── TeamSection.tsx       # Team role cards (Frontend / Backend / Mentor)
│       ├── ScheduleSection.tsx   # Meeting & workshop schedule
│       ├── TimelineSection.tsx   # Interactive 9-week timeline (clickable)
│       ├── FAQSection.tsx        # Accordion FAQ
│       └── IncubatorCTA.tsx      # Apply CTA
│
├── three/                        # Three.js / R3F code
│   ├── models/
│   │   └── useGLBModel.ts        # Reusable GLB loader with material overrides
│   ├── objects/
│   │   ├── SketchfabPhone.tsx    # iPhone GLB + 3D→2D projection + colour cycling
│   │   ├── Starfield.tsx         # Warm vertex-colored star particles
│   │   ├── WarpField.tsx         # Warp-speed streak effect
│   │   ├── ApplicationIcons.tsx  # Data-driven program icons
│   │   └── constellation/        # Modular constellation rendering system
│   │       ├── ConstellationLayer.tsx  # Top-level orchestrator
│   │       ├── MotifInstanceVisual.tsx # Single constellation + ghost tiles
│   │       ├── MovingStars.tsx    # Variable-depth drifting starfield
│   │       ├── NebulaClouds.tsx   # Additive-blend nebula spheres
│   │       ├── placement.ts       # Collision-aware instance generation
│   │       ├── schedule.ts        # "2-6-2" visibility queue
│   │       ├── shaders.ts         # GLSL trace shaders
│   │       ├── svg-guide.ts       # SVG contour extraction
│   │       ├── utils.ts           # Pure utility functions
│   │       ├── types.ts           # TypeScript interfaces
│   │       └── index.ts           # Barrel export
│   ├── scenes/
│   │   └── HomeScene.tsx         # Scene composition layer
│   ├── types/
│   │   └── application.ts        # Application type definition
│   └── utils/
│       └── math.ts               # lerp, clamp, smoothstep, easeOutBack, etc.
│
├── data/
│   ├── applications.ts           # Registry of RUMAD programs
│   └── incubatorCurriculum.ts    # Incubator programme data (timeline, roles, FAQs)
│
└── hooks/
    ├── useIsMobile.ts            # Viewport-width detection hook
    ├── usePhoneScreen.ts         # Phone screen bridge subscriber hook
    └── useWheelForward.ts        # Wheel-event forwarding hook for overlays

public/
├── models/
│   └── iphone-17-pro.glb         # Sketchfab iPhone 17 Pro model (~2.3 MB)
├── constellations/               # SVG motifs for constellation outlines
│   ├── phone-logo.svg            # Vertical RUMAD logo
│   ├── horizontal-logo.svg       # Horizontal RUMAD logo
│   └── mask-satellite.svg        # Mask satellite
├── vertical-logo.png             # RUMAD vertical logo (for phone splash)
└── horizontal-logo.png           # RUMAD horizontal logo (for navbar)
```

---

## Architecture

### Scroll-Driven 3D Scene

The homepage uses **drei `ScrollControls`** (6 virtual pages, 0.04 damping) to drive every animation. The scroll timeline (`scroll.range(start, delta)`) controls:

1. **Constellation field** (always) — SVG-outlined constellations drift left-to-right with scroll-boosted speed, pacman-wrapping at screen edges
2. **Phone approach** (0 → 0.16) — iPhone flies in from z = −14 to z = 1.55
3. **Phone flip & settle** (0.04 → 0.5) — Back-to-front rotation, landscape tilt, zoom to fill screen
4. **Phone content Phase 1** (0.52 → 0.72) — RUMAD splash (logo + title + socials) fades in on the phone screen
5. **Phone content Phase 2** (0.80 → 0.98) — Info page with program cards scrolls into view on the phone screen

### Rendering Pipeline

```
page.tsx
  ├─ NavBar                     (fixed top nav, wheel-forwarded)
  ├─ SceneCanvas.tsx            (R3F <Canvas> + <ScrollControls>)
  │    ├─ HomeScene.tsx
  │    │    ├─ ConstellationLayer
  │    │    │    ├─ NebulaClouds
  │    │    │    ├─ MovingStars
  │    │    │    └─ MotifInstanceVisual ×N
  │    │    └─ SketchfabPhone   → writes to phoneScreenBridge
  │    └─ PhoneScreenOverlay    (DOM sibling, reads bridge via rAF)
  │         ├─ PhoneScreenSplash  (Phase 1)
  │         └─ PhoneScreenInfo    (Phase 2)
  └─ Footer                     (fixed bottom bar, wheel-forwarded)
```

### Constellation System

The constellation rendering is a fully modular, data-driven system:

- **Config-driven** — All behaviour (motif weights, visibility timing, placement spacing, colours) is defined in `constellation-config.json` and per-motif JSON files. No magic numbers in code.
- **Global warm palette** — A single `colors` array of bright reds, oranges, and golds ensures every constellation pops against the dark background.
- **"2-6-2" visibility cycle** — Each constellation fades in (2s), holds (6s), fades out (2s) on a staggered round-robin schedule.
- **Pacman wrapping** — Toroidal wrapping with up to 9 ghost tiles per instance for seamless edge transitions.
- **Flash regeneration** — After each cycle, all constellations flash out, regenerate with a new deterministic seed, and flash back in.
- **Scroll-boosted drift** — Scrolling speeds up the base left-to-right drift with a smoothed velocity multiplier.

### Phone Screen Content (DOM Overlay)

The phone screen content is rendered as plain HTML/CSS positioned precisely over the 3D phone model:

- **3D→2D projection** — `SketchfabPhone` projects the Display mesh's bounding box corners through the camera to get exact pixel coordinates each frame.
- **Bridge pattern** — A module-level mutable object (`phoneScreenBridge`) carries visibility, phase, and pixel bounds from R3F to DOM without React re-renders.
- **rAF-driven** — The overlay reads bridge state via `requestAnimationFrame`, directly manipulating DOM styles for 60fps positioning.
- **Container queries** — Content uses CSS `cqw` units, scaling responsively with the phone's dynamic screen size.

### Sketchfab Phone Model

The `SketchfabPhone` loads a Sketchfab-sourced iPhone 17 Pro GLB (`public/models/iphone-17-pro.glb`) via the reusable `useGLBModel` hook.

**Colour cycling**: The phone body continuously cycles through dark warm theme colours over a 24-second period using HSL interpolation. Glass materials are semi-transparent (0.65–0.7 opacity) for a frosted look. The Display material is set to a flat dark surface.

The model has 18 meshes and 15 named materials. `SketchfabPhone` also handles 3D-to-2D pixel projection of the screen corners, writing bounds to `phoneScreenBridge` for the DOM overlay.

### Reusable GLB Loader

`src/three/models/useGLBModel.ts` provides:
- `useGLBModel(path, materialOverrides)` — clones the scene, traverses meshes, applies per-material overrides
- `preloadGLB(path)` — call at module level to preload models

This is designed for extensibility — future Sketchfab models just call the same hook with their path and overrides.

### Incubator Page

A content-rich programme page built with modular Framer Motion components:
- **Hero** — gradient title, tagline, programme highlights
- **Team** — 3 role cards showing the 5-member team structure
- **Schedule** — meeting & workshop details side-by-side
- **Timeline** — interactive vertical timeline with 17 events, clickable for details, colour-coded by type (checkpoint, workshop, showcase, break, deadline, social)
- **FAQ** — accordion with 6 questions
- **CTA** — apply button

All curriculum data lives in `src/data/incubatorCurriculum.ts` — update it each semester.

### Warm Color Palette

A consistent warm aesthetic runs through the entire scene:

| Element | Colors |
|---------|--------|
| Phone body | Rose-gold, terracotta, copper, burnt orange, deep red, warm champagne, mahogany, dusty mauve |
| Starfield | Red, orange, gold, white (vertex-colored, weighted distribution) |
| Warp streaks | Red → orange → gold → cream gradient |
| Nebula clouds | Additive-blended warm spheres |
| CSS accent | `--color-accent: #cc1111`, `--color-accent-light: #ee2222` |
| Incubator | `#ee6622` (orange) accent throughout |

### Fonts

| Variable | Font | Usage |
|----------|------|-------|
| `--font-display` | Audiowide | Titles, large headings |
| `--font-heading` | Rajdhani | Nav links, buttons, labels |
| `--font-body` | Outfit | Body text, paragraphs |

### Mobile Support

The `useIsMobile` hook detects viewports < 768 px and renders `MobileFallback` — a gradient hero with program cards instead of the WebGL scene.

---

## CSS Tokens

Defined in `globals.css`:

```css
--background: #050505;
--foreground: #ededed;
--color-accent: #cc1111;
--color-accent-light: #ee2222;
```

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | 3D cinematic homepage |
| `/accelerator` | Accelerator program |
| `/incubator` | Incubator program (full curriculum) |
| `/webteam` | Web Team |
| `/events` | Events |
| `/eboard` | E-Board |
| `/contact` | Contact |
| `/pastwork` | Past work showcase |
| `/programs` | Programs overview |
| `/team` | Team members |
| `/api/aggregate` | Aggregate API |
| `/api/auth` | Auth API |
| `/api/rate-limit` | Rate-limit API |

---

## Branch Guide

| Branch | Purpose |
|--------|---------|
| `main` | Production |
| `ayush-frontend` | Primary frontend development |
| `sebby-frontend` | Sebastian's frontend experiments |
| `ayushmish-api` | API development |

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — framework features and API
- [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction) — React renderer for Three.js
- [drei](https://github.com/pmndrs/drei) — useful R3F helpers (ScrollControls, RoundedBox, Text, etc.)
- [Framer Motion](https://motion.dev) — animation library for React
- [Tailwind CSS v4](https://tailwindcss.com/docs) — utility-first CSS
- [RUMAD Website](https://rumad.club) — live club site