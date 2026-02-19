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
│   └── api/                      # API routes (aggregate, auth, rate-limit)
│
├── components/                   # React UI components
│   ├── SceneCanvas.tsx           # R3F Canvas + ScrollControls wrapper
│   ├── MainContent.tsx           # HTML content layer (Hero, Info, Footer)
│   ├── NavBar.tsx                # Fixed top nav with RUMAD logo
│   ├── MobileFallback.tsx        # Fallback UI for mobile devices
│   ├── ScrollHint.tsx            # Animated scroll-down indicator
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
│   │   ├── SketchfabPhone.tsx    # Sketchfab iPhone 17 Pro GLB w/ warm colours
│   │   ├── PhoneModel.tsx        # Legacy procedural phone (kept for reference)
│   │   ├── Starfield.tsx         # Warm vertex-colored star particles
│   │   ├── WarpField.tsx         # Warp-speed streak effect
│   │   ├── ApplicationIcons.tsx  # Data-driven program icons
│   │   └── NebulaBackground.tsx  # Procedural FBM nebula (reserved)
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
    └── useIsMobile.ts            # Viewport-width detection hook

public/
└── models/
    └── iphone-17-pro.glb         # Sketchfab iPhone 17 Pro model (~2.3 MB)
```

---

## Architecture

### Scroll-Driven 3D Scene

The homepage uses **drei `ScrollControls`** (5 virtual pages, 0.08 damping) to drive every animation. The scroll timeline (`scroll.range(start, delta)`) controls:

1. **Phone approach** (0 → 0.28) — iPhone flies in from z = −14 to z = 1.8
2. **Phone flip** (0.06 → 0.22) — Back-to-front rotation revealing the screen
3. **Warp streaks** (0.28 → 0.18) — Warm-colored speed lines stretch outward
4. **Application icons** (0.36 → 0.52) — Program icons pop in with easeOutBack stagger
5. **HTML content** (260 vh+) — Hero section, info, and footer fade in

### Rendering Pipeline

```
page.tsx
  └─ SceneCanvas.tsx            (R3F <Canvas> + <ScrollControls>)
       ├─ <Scroll>              (3D objects)
       │    └─ HomeScene.tsx
       │         ├─ Starfield
       │         ├─ WarpField
       │         ├─ SketchfabPhone  ← Sketchfab GLB model
       │         └─ ApplicationIcons
       └─ <Scroll html>         (HTML overlay)
            └─ MainContent.tsx
                 ├─ HeroSection
                 ├─ InfoSection
                 └─ Footer
```

### Sketchfab Phone Model

The `SketchfabPhone` loads a Sketchfab-sourced iPhone 17 Pro GLB (`public/models/iphone-17-pro.glb`) via the reusable `useGLBModel` hook.

**Warm colour randomisation**: On each mount a random colour is picked from the warm palette and applied to:
- `Frosted glass` — body back (main colour)
- `Tint back glass` — camera area (slightly darker)
- `Frame` — side frame (lighter, high metalness)
- `Aluminum` — metal accents (lightest, mirror-like)

The model has 18 meshes and 15 named materials. Other materials (Glass, Lens, Display, etc.) are left at their Sketchfab defaults.

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