# Victor Yu — Portfolio Rebuild Plan
*For the AI that will vibe-code this. Read everything before writing a single line.*

---

## Bug Tracker / Task List (2026-03-18)

### Active Bugs
1. **Landing page scrolls to ArmSection instead of Hero** — likely browser scroll restoration or ArmSection's 250vh pushing layout. Fix: remove ArmSection + ensure scroll starts at 0.
2. **GlbViewer pivot point not centered on model** — OrbitControls orbits around world origin, not model center. Fix: set OrbitControls `target` to model's geometric center after normalization.
3. **Hydration error from Dark Reader** — browser extension injects `data-darkreader-*` attributes before React hydrates. `suppressHydrationWarning` only works 1 level deep. Fix: add `<meta name="darkreader-lock" />` to prevent Dark Reader from processing the page.
4. **ArmSection shows two models (hexapod + arm)** — design issue, section being removed entirely.

### Design Overhaul (2026-03-18)
- **Remove ArmSection entirely** — user doesn't want the 3-axis arm section
- **Hero redesign**: Bigger hexapod with subtle hover animation. On scroll: robot turns left, scales up, passes through camera. Smooth transition into content sections.
- **Section transitions**: Smooth fades between sections. Background model animations (subtle) per section.
- **Vibe**: Instagram car edit style — smooth, cinematic, blending. Not over the top.
- **Content update**: Pull from updated resume (UW Orbital firmware dev, RBC automation analyst, ESP32 Delirium Detection project)

### Resolved Issues
- PBR metalness without env map → StudioEnv.tsx (PMREMGenerator + RoomEnvironment)
- ScrollTrigger onUpdate not firing → replaced with native scroll listener
- JSX rotation prop vs useFrame conflict → removed rotation from JSX
- Dark Reader hydration on html/body → suppressHydrationWarning
- Model centering logic → reset position/scale before measuring bbox

---

## Who This Is For

Victor Yu — Computer Engineering student at the University of Waterloo (Sep 2025 – May 2030, 87.4% / 3.81 GPA).
Firmware and embedded systems focus. Current roles: Firmware Developer at UW Orbital (CubeSat, ARM Cortex-R),
Automation Analyst co-op at RBC (Python, MongoDB, ServiceNow). Past: Backend dev at JTMCode, Technical Lead at MechEd Robotics.

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
- `next/font` JetBrains Mono for code/tech labels and skill strip
- `next/font` Inter for prose and headings
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
Styling:       Inline styles (no Tailwind CSS classes in use currently)
Hosting:       GitHub Pages (static export, output: 'export')
Domain:        victor.uwce.ca via CNAME
```

---

## Key Gotchas

**PBR metalness without environment map:** metalness > 0.3 on MeshStandardMaterial requires
an environment map to be visible. Without one, metallic surfaces reflect black void. Either
keep metalness low (0.1-0.3) or provide an env map via StudioEnv/PMREMGenerator.

**GSAP SSR:** Next.js App Router runs server-side. GSAP needs `window` — guard all GSAP init
with `useEffect`. Mark any component that uses GSAP or Three.js with `'use client'`.

**R3F prop vs useFrame conflict:** Never set rotation/position as JSX props on a group AND
also modify them in useFrame — they fight each other. Set initial values in useFrame only.

**Dark Reader + SSR hydration:** Add `<meta name="darkreader-lock" />` to head to prevent
Dark Reader from modifying the page at all. This is cleaner than suppressHydrationWarning.

**Native scroll > ScrollTrigger for 3D:** For R3F model animations driven by scroll, use
native `window.addEventListener('scroll')` with `getBoundingClientRect()` progress calculation.
GSAP ScrollTrigger's `onUpdate` callback had reliability issues (models disappearing on scroll).
Keep GSAP ScrollTrigger for text/DOM animations only.

**Model centering:** Always reset `position(0,0,0)` and `scale(1,1,1)` before computing bbox.
GLTF scenes can have non-zero initial transforms from export. Call `updateMatrixWorld(true)`
before each bbox computation.
