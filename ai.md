# Victor Yu — Portfolio Rebuild Plan
*For the AI that will vibe-code this. Read everything before writing a single line.*

---

## Who This Is For

Victor Yu — Computer Engineering student at the University of Waterloo. Firmware and embedded
systems focus. Projects span bare-metal ESP32 robotics, satellite firmware on ARM Cortex-R, and
browser-based simulation tooling. Wants a portfolio that looks like it was built by a robotics
startup, not a CS student.

---

## Aesthetic Direction

**Primary references (ranked):**
1. Apple iPhone/Mac Pro product pages — scroll-jacked 3D model that reacts to scroll position
2. Axibo.com — dark, sparse, serious, zero clutter, lots of negative space
3. Figure AI / 1X Technologies — robot as central visual hero, engineering tone

**Color palette (strict, do not deviate):**
```
Background:    #080808  (near-black, not pure black)
Surface:       #111111  (cards, sections)
Border:        #1e1e1e  (subtle separators)
Text primary:  #e8e8e8  (off-white)
Text muted:    #666666
Accent:        #00ff88  (cyan-green — ONLY for wireframe mode and micro-accents like link hovers)
```

**Typography:**
- `next/font` Geist Mono for code/tech labels and skill strip
- `next/font` Geist (or Inter) for prose and headings
- Hero heading: large, sparse, confident — weight 300 or 400, not bold
- Weights used: 300, 400, 600 only. Nothing decorative.

**Explicitly forbidden (the AI must not do any of these):**
- Glassmorphism (backdrop-filter blur on cards)
- Gradient blobs or mesh gradients in any section
- Grid of cards with rounded corners and box-shadows — the default vibe-coded look
- Particle backgrounds or confetti
- Animated gradient text
- `border-radius` greater than 4px anywhere
- Tailwind UI component patterns — Tailwind utilities are fine, component patterns are not
- AOS, Animate.css, or any CSS animation library — GSAP only, no exceptions
- Purple, blue, or orange accent colors
- Navbar hamburger menu on desktop
- Testimonials, stats counters, "hire me" CTAs, skill percentage bars
- Lorem ipsum — use `[PLACEHOLDER]` markers instead

---

## Tech Stack

```
Framework:     Next.js 16 (App Router, TypeScript)
3D:            Three.js via @react-three/fiber + @react-three/drei
Animations:    GSAP + ScrollTrigger
               (NOT Framer Motion — it conflicts with scroll-jacking and adds unnecessary bundle)
Styling:       Tailwind CSS v4 (utilities only)
Hosting:       Vercel (NOT GitHub Pages — need server capability for simulator proxy)
Domain:        vy038.github.io (CNAME to Vercel)
```

**Starting point:** `/home/admin/Projects/vy038.github.io/portfolio/`
This already has Next.js 16 + TypeScript + Tailwind v4 scaffolded. Add these packages:
```bash
npm install three @react-three/fiber @react-three/drei gsap
npm install -D @types/three
```
Do NOT use the `my-portfolio/` folder — wrong stack (Vite/React, not Next.js).

---

## File Structure

```
portfolio/
├── app/
│   ├── layout.tsx              # Root layout: fonts, metadata, global styles
│   ├── page.tsx                # Main single-page — assembles all section components
│   └── simulator/
│       └── page.tsx            # Full-viewport page that iframes the Lightsim backend
├── components/
│   ├── Hero.tsx                # Full-screen 3D model + name/title text
│   ├── SkillsStrip.tsx         # Single-row monospace skill list
│   ├── About.tsx               # Bio paragraph + animated SVG timeline
│   ├── Projects.tsx            # All project cards in vertical stack
│   ├── Contact.tsx             # Minimal links section
│   └── SimulatorModal.tsx      # Full-screen overlay containing /simulator iframe
├── lib/
│   └── gsap.ts                 # Register ScrollTrigger once, export gsap + ScrollTrigger
├── hooks/
│   └── useScrollProgress.ts    # Returns 0–1 scroll progress for a given element ref
└── public/
    └── models/
        └── talos.glb           # GLTF model — Victor must convert from CAD (see below)
```

---

## Section-by-Section Spec

### 1. Hero — Full Viewport

**Layout:** Text left (~40%), 3D canvas right (~60%). On scroll the model migrates left.

**Text:**
```
Victor Yu

Firmware & Embedded Systems Engineer
Computer Engineering @ University of Waterloo
```
Top-right: small links — GitHub · LinkedIn · Resume (not a full navbar, just inline text links).
Bottom-center: subtle scroll cue (thin animated line or arrow, fades out after first scroll).

**3D model behavior:**
- Load `public/models/talos.glb` using `useGLTF` from drei
- Wrap in `<Suspense fallback={<MinimalLoader />}>`
- `<MinimalLoader />` = centered pulsing dot, `#00ff88` color, no text
- Initial render: solid materials, warm key light (upper-left), dim rim light (right-rear)
- Idle: very slow Y-axis rotation, ~0.001 rad per frame via `useFrame`. Stops (or slows to 0)
  when the user starts scrolling — detect via ScrollTrigger `onEnterBack`/`onLeave`

**Scroll-driven transition (scrub, not triggered):**
As user scrolls from 0% → 100% of hero section height, GSAP ScrollTrigger `scrub: 1.5` drives:
1. Material: lerp from solid → wireframe (`MeshBasicMaterial`, color `#00ff88`, opacity 0.5)
2. Position: model translates from right-center → left side of screen (x: 0 → -30% viewport)
3. Y rotation: +15deg total
4. Scale: 1.0 → 0.85

After hero, the wireframe ghost persists faintly as a background element behind the Skills Strip.

**Technical implementation note:**
- GSAP cannot directly tween Three.js material properties through R3F's reconciler.
  Instead: use a `useRef<number>(0)` for `scrollProgress`, update it via ScrollTrigger's
  `onUpdate`, then read it inside `useFrame` to lerp materials each frame.
- Canvas: `style={{ pointerEvents: 'none' }}` — scroll must pass through to the page.
- DO NOT `pin` the hero section — the page scrolls normally, the model reacts.

**Mobile (<768px):** Hide `<Canvas>` entirely. Show a static `<Image>` of the robot instead.

---

### 2. Skills Strip

Full-width, `#111111` background, `1px solid #1e1e1e` top/bottom borders.

**Content (Geist Mono, ~14px, `#666666` text, brightens to `#e8e8e8` on hover):**
```
C / C++  ·  Python  ·  ARM Cortex  ·  FreeRTOS  ·  ESP-IDF  ·  Three.js  ·  Linux  ·  Git  ·  Docker
```

No icons. No progress bars. Plain text with `·` separators.
Entrance animation: fade up (`translateY: 20 → 0, opacity: 0 → 1`) when scrolled into view.

---

### 3. About

**Layout:** Two-column desktop (60/40), stacked mobile.

**Left — Bio:**
```
[PLACEHOLDER — Victor rewrites in his own voice. Suggested draft:]

I build software that runs at the edge — firmware for robots, satellite systems, and anything
that talks to hardware directly. Currently studying Computer Engineering at the University of
Waterloo and building Project Talos, a scorpion-style hexapod with a 6-DOF arm.

When I'm not deep in register maps and interrupt handlers, I'm building the simulation tools
to test the firmware I just wrote.
```

**Right — Experience Timeline:**
Vertical SVG line with dot markers. The line `scaleY`-animates from 0 → 1 as it enters viewport
(`transform-origin: top center`). Each entry fades in slightly staggered after the line reaches it.

```
● 2026 (present)  RBC
                  Network Security Automation Analyst
                  Python · Airflow · Docker

● 2025 (present)  UW Orbital
                  Firmware Developer
                  ARM Cortex-R · TI RM46 · CC1120

● 2024            MechEd Robotics
                  Robotics Instructor
```

SVG line is positioned absolutely to the left of the entries. Dots are `#00ff88`.

---

### 4. Projects

**Layout:** Full-height vertical stack. Each project is a `min-height: 100vh` block.
NOT a horizontal scroll carousel — those break on mobile and are overused.

Alternating left/right image placement per card (image left on odd, right on even).
No card borders, no shadows, no rounded corners. Layout uses grid/flex with lots of space.

---

**Project 1: TALOS HEXAPOD** (hero — most visual weight)

Left: large image/render of Talos (use `[TALOS_IMAGE_PATH]`)
Right:
```
TALOS HEXAPOD

Scorpion-style hexapod with 6-DOF arm built on dual ESP32s.
13 SG90 servos, tripod gait algorithm, inverse kinematics solver,
MPU6050 IMU, OV2640 camera for basic color detection.

C  ·  FreeRTOS  ·  ESP-IDF  ·  ESP32  ·  Inverse Kinematics

[Open Simulator →]  [GitHub →]
```

"Open Simulator →" is a button (or styled anchor). On click: mounts `<SimulatorModal>` which
fades in a full-screen black overlay and renders an iframe to `/simulator`.

---

**Project 2: LIGHTSIM — FIRMWARE SIMULATOR**

(This is its own project, not a sub-feature of Talos.)

Right: screenshot or video of the simulator running (`[LIGHTSIM_SCREENSHOT_PATH]`)
Left:
```
LIGHTSIM

Compiles unmodified Talos firmware C code natively on Linux via
HAL stubs. Streams state to a Three.js visualization at 50Hz over
WebSocket. Three modes: JTAG-style debug dashboard, 2D gait view,
3D procedural geometry renderer.

C  ·  Node.js  ·  Three.js  ·  WebSocket  ·  CMake

[GitHub →]
```

---

**Project 3: UW ORBITAL — SATELLITE FIRMWARE**

Left: `[ORBITAL_IMAGE_PATH]`
Right:
```
UW ORBITAL

Bare-metal firmware for a student CubeSat. Built CC1120 radio
driver from scratch, interfacing directly with TI Hercules RM46
registers. Replaced HALCoGen-generated code with direct register
access for deterministic timing.

C  ·  ARM Cortex-R  ·  TI RM46  ·  CC1120  ·  HALCoGen
```

---

**Project 4: PULSE — NETWORK AUTOMATION**

Right: `[PULSE_IMAGE_PATH]`
Left:
```
PULSE

Internal network security automation tooling built at RBC.
Pipeline orchestration, automated analysis workflows.

Python  ·  Apache Airflow  ·  Docker
```

---

**Scroll animations for projects:**
- Each project enters on scroll: image slides from its side (left image → `translateX(-40px → 0`),
  text fades up (`translateY: 30 → 0`). GSAP ScrollTrigger, `scrub: false`,
  `toggleActions: "play none none reverse"`.

---

### 5. Contact

Centered, large top/bottom padding, very minimal.

```
Let's talk.

[victoryu038@gmail.com]
[GitHub]  ·  [LinkedIn]
```

No form. No subject lines. Just links.
On hover: `#00ff88` color transition (`color: #e8e8e8 → #00ff88`).
Entrance: heading fades in, links stagger up below it.

---

## Simulator Integration

**What Lightsim is:** Located at `/home/admin/Projects/lightsim`. It compiles actual Talos
firmware C code on Linux via HAL stubs, runs it as a native process, and streams state at 50Hz
over WebSocket to a Node.js bridge server. A vanilla JS + Three.js frontend visualizes the robot.

**Why it can't be static:** The C compilation and native process execution require a Linux server.
Cannot run on GitHub Pages (static), and cannot run as Vercel serverless functions.

**Deployment plan:**
1. Deploy the Lightsim server somewhere with a persistent Linux environment:
   - Railway (free tier has Linux containers) — recommended
   - Render (free tier, spins down when idle — acceptable for a portfolio)
   - Any cheap VPS ($5/mo Hetzner, DigitalOcean, etc.)
2. Set `SIMULATOR_URL` in Vercel env vars to the deployed Lightsim URL
3. `/simulator` route in the portfolio: full-viewport iframe to `process.env.SIMULATOR_URL`
4. If simulator is offline: show a `<video autoPlay muted loop>` fallback with a pre-recorded
   MP4/WebM of the simulator running, plus a small `"Live simulator offline"` notice

**SimulatorModal (`components/SimulatorModal.tsx`):**
```
- Full-screen fixed overlay (z-index: 100, background: #080808)
- Animated entry: overlay fades in (opacity 0→1, 300ms), then iframe slides up (translateY: 20px→0)
- Close: X button top-right, or ESC key via useEffect keydown listener
- The iframe src points to Next.js /simulator route (not directly to Lightsim — keeps one level
  of indirection so the external URL can change without touching the modal)
```

**`app/simulator/page.tsx`:**
```tsx
// 'use client' — needed for env var access at runtime if using NEXT_PUBLIC_
export default function SimulatorPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#080808', overflow: 'hidden' }}>
      <iframe
        src={process.env.NEXT_PUBLIC_SIMULATOR_URL ?? ''}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="fullscreen"
        title="Talos Simulator"
      />
    </div>
  )
}
```

---

## 3D Model Prep (Victor must do this before the hero can be finished)

Victor has CAD files of Talos (STL or STEP format). Steps to get `talos.glb`:

1. Open Blender (free, blender.org)
2. `File > Import > STL` (or STEP via add-on)
3. In Edit Mode: `Mesh > Clean Up > Merge by Distance` — fix duplicate vertices
4. Check triangle count: target **under 150k triangles** for smooth web performance.
   If over: `Object > Add Modifier > Decimate`, ratio ~0.3
5. Optional but recommended: Apply a single dark metallic material
   (`Base Color: #1a1a1a, Metallic: 0.8, Roughness: 0.3`) so the solid phase looks intentional
6. `File > Export > glTF 2.0 (.glb)` — Binary, embed textures, apply modifiers
7. Place at `portfolio/public/models/talos.glb`

**Fallback if no time to prepare GLTF:**
The Lightsim `frontend/viewer3d.js` already has procedural Three.js geometry for Talos
(boxes and cylinders representing body, legs, arm). This geometry can be ported directly into
a React Three Fiber component (`TalosProceduralModel.tsx`) and used as the hero model. Less
realistic but architecturally clean and immediately available.

---

## GSAP + R3F Integration Notes

**The conflict:** GSAP tweens run outside React's reconciler. R3F has its own render loop.
Direct GSAP tweens on Three.js objects work, but mutating R3F-managed state from GSAP is messy.

**Pattern to use throughout:**
```ts
// In Hero.tsx
const scrollProgress = useRef(0)  // 0 to 1

// GSAP ScrollTrigger writes to the ref
ScrollTrigger.create({
  trigger: heroRef.current,
  start: 'top top',
  end: 'bottom top',
  scrub: 1.5,
  onUpdate: (self) => { scrollProgress.current = self.progress }
})

// R3F useFrame reads from the ref
useFrame(() => {
  if (!meshRef.current) return
  const p = scrollProgress.current
  // lerp material opacity, position, etc.
  meshRef.current.position.x = THREE.MathUtils.lerp(0, -3, p)
  // etc.
})
```

**lib/gsap.ts (import once in layout.tsx):**
```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}
export { gsap, ScrollTrigger }
```

---

## Global Animation Rules

- Section reveal: `translateY: 30 → 0, opacity: 0 → 1, duration: 0.8, ease: "power2.out"`
- Stagger between siblings: `stagger: 0.12`
- Scrub animations (model): `scrub: 1.5` for smooth lag
- Triggered animations (section reveals): `scrub: false, toggleActions: "play none none reverse"`
- No spring/bounce easing anywhere — `power2.out` or `expo.out` only
- No looping animations except hero model idle rotation (~0.001 rad/frame)
- No CSS `transition` or `animation` for anything visible — GSAP only

---

## Tailwind v4 Notes

This project uses Tailwind v4 (postcss plugin — NOT the old CLI/config approach).
- Arbitrary values work: `bg-[#080808]`, `text-[#e8e8e8]`, `border-[#1e1e1e]`
- No `tailwind.config.ts` needed — extend via CSS variables in `globals.css` if needed
- `@import "tailwindcss"` in the CSS entry point (already in the starter)

---

## Deployment

**Vercel (strongly preferred over GitHub Pages):**
1. Push to GitHub (the whole repo or just `portfolio/`)
2. Vercel: import repo, set **Root Directory** to `portfolio`
3. Add env var: `NEXT_PUBLIC_SIMULATOR_URL=<deployed lightsim URL>`
4. After first deploy: add custom domain `vy038.github.io` in Vercel project settings
5. Update GitHub Pages CNAME → `cname.vercel-dns.com`
6. Delete the old `index.html` placeholder once Vercel is live

**GitHub Pages only (fallback, not recommended):**
- Add `output: 'export'` to `next.config.ts`
- Static export loses server-side features — the simulator route becomes a client-side iframe only
- `NEXT_PUBLIC_SIMULATOR_URL` must be set at build time

---

## Build Order for the AI

Build in this order to stay unblocked:

1. `app/layout.tsx` — fonts (Geist via `next/font`), metadata, dark global CSS, GSAP init
2. `components/Hero.tsx` — 3D model loading + text layout, NO scroll animation yet
3. Wire GSAP ScrollTrigger into Hero for the wireframe transition
4. `components/SkillsStrip.tsx`
5. `components/About.tsx` — bio + SVG timeline animation
6. `components/Projects.tsx` — all 4 cards, static layout, then entrance animations
7. `components/SimulatorModal.tsx` + `app/simulator/page.tsx`
8. `components/Contact.tsx`
9. `app/page.tsx` — assemble everything
10. Mobile responsive pass (hide canvas <768px, stack columns, test touch scroll)
11. Performance: `next/image` for all images, lazy iframe, proper suspense boundaries

---

## Content Placeholders (Victor fills these in)

| Placeholder | What goes here |
|---|---|
| `[TALOS_IMAGE_PATH]` | Photo or render of the physical Talos robot |
| `[LIGHTSIM_SCREENSHOT_PATH]` | Screenshot of simulator running (viewer3d mode) |
| `[ORBITAL_IMAGE_PATH]` | Any image for UW Orbital (circuit board, team, render) |
| `[PULSE_IMAGE_PATH]` | Any image for the RBC automation project |
| `[SIMULATOR_URL]` | `https://your-lightsim-deploy.railway.app` or similar |
| `talos.glb` | Exported GLTF from CAD files (see 3D Model Prep section) |
| Bio text | Victor rewrites in his own voice |
| GitHub URL | https://github.com/vy038 |
| LinkedIn URL | https://linkedin.com/in/victoryu038 |
| Email | victoryu038@gmail.com |

---

## Key Gotchas

**Two WebGL contexts:** The hero R3F canvas and the simulator iframe each have their own WebGL
context. Keep them completely isolated — never share state or canvas refs between them.

**Scroll-jacking on mobile:** Apple-style `pin`-based scroll-jacking is very fragile on iOS.
The approach here avoids pinning — the page scrolls normally, the 3D model just *reacts* to
scroll progress. This is intentional and non-negotiable.

**GSAP SSR:** Next.js App Router runs server-side. GSAP needs `window` — guard all GSAP init
with `if (typeof window !== 'undefined')` or wrap in `useEffect`. Mark any component that uses
GSAP or Three.js with `'use client'` at the top.

**Tailwind v4 import syntax:** `@import "tailwindcss"` not `@tailwind base/components/utilities`.

**next/font for Geist:** Do NOT import Geist from Google Fonts — use `next/font/local`:
```ts
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
```
Or: `import localFont from 'next/font/local'` pointing to the Geist variable font files.
