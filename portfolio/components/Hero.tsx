'use client'

import { useEffect, useRef, useCallback, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import StudioEnv from './StudioEnv'

// ─── helpers ────────────────────────────────────────────────────────────────
function ss(t: number) { const c = Math.max(0, Math.min(1, t)); return c * c * (3 - 2 * c) }
function inv(a: number, b: number, v: number) { return Math.max(0, Math.min(1, (v - a) / (b - a))) }
function lp(a: number, b: number, t: number) { return a + (b - a) * t }

// Piecewise scroll remap — creates real "hold" zones where camera stays
// fixed while user scrolls, so text labels are visible long enough.
// Format: [rawStart, rawEnd, camStart, camEnd]
// Flat segments (camStart === camEnd) are the hold zones.
const REMAP_SEGS: [number, number, number, number][] = [
  [0.00, 0.08, 0.00, 0.05],  // static opening
  [0.08, 0.16, 0.05, 0.23],  // zoom in approach
  [0.16, 0.30, 0.23, 0.23],  // ── HOLD: vision text (camera close front)
  [0.30, 0.37, 0.23, 0.27],  // complete zoom-in
  [0.37, 0.52, 0.27, 0.58],  // orbit front → back-left
  [0.52, 0.63, 0.58, 0.58],  // ── HOLD: legs text (camera behind-left)
  [0.63, 0.74, 0.58, 0.87],  // continue orbit + rise to arm height
  [0.74, 0.84, 0.87, 0.87],  // ── HOLD: arm text (camera at arm level)
  [0.84, 1.00, 0.87, 1.00],  // arm trace + exit
]

function remapProgress(raw: number): number {
  for (const [r0, r1, c0, c1] of REMAP_SEGS) {
    if (raw <= r1) {
      const t = r1 > r0 ? (raw - r0) / (r1 - r0) : 0
      return c0 + (c1 - c0) * Math.max(0, Math.min(1, t))
    }
  }
  return 1.0
}

function normalizeAndCenter(scene: THREE.Object3D, units: number) {
  scene.position.set(0, 0, 0)
  scene.scale.set(1, 1, 1)
  scene.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) scene.scale.setScalar(units / maxDim)
  scene.updateMatrixWorld(true)
  const box2 = new THREE.Box3().setFromObject(scene)
  const center = box2.getCenter(new THREE.Vector3())
  scene.position.set(-center.x, -center.y, -center.z)
}

// ─── 3D model ───────────────────────────────────────────────────────────────
function TalosModel({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const { scene: raw } = useGLTF('/models/talos.glb')
  const scene = useMemo(() => raw.clone(true), [raw])
  const groupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  useEffect(() => {
    normalizeAndCenter(scene, 9)
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x222222,
          metalness: 0.92,
          roughness: 0.12,
        })
      }
    })
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    timeRef.current += delta
    // Subtle hover bob — camera does all the dramatic movement
    groupRef.current.position.y = Math.sin(timeRef.current * 1.1) * 0.06
    groupRef.current.rotation.y = Math.sin(timeRef.current * 0.2) * 0.03

    // Fade in on load (first 1.4s), fade out at scroll end
    const loadOpacity = Math.min(1, timeRef.current / 1.4)
    const p = scrollRef.current ?? 0
    const scrollOpacity = p > 0.97 ? Math.max(0, 1 - ss(inv(0.97, 1.0, p))) : 1
    const opacity = loadOpacity * scrollOpacity
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.transparent = opacity < 1
        child.material.opacity = opacity
      }
    })
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// ─── cinematic camera ────────────────────────────────────────────────────────
// Camera orbits the model — model stays still, camera does all the drama.
//
//  0.00–0.05   static — robot on right, opening shot
//  0.05–0.27   zoom in close + low → front of legs / camera sensor
//  0.27–0.68   orbit XZ (front → side → back-left), focused on legs
//  0.68–0.82   hold at back-left, camera rises, look sweeps up (legs→body)  ← legs text
//  0.82–0.90   camera arrives at arm height, HOLDS                          ← 3-axis arm text
//  0.90–0.95   trace arm from the SIDE (theta continues, height holds)
//  0.95–1.00   zoom OUT from behind — full model reveal, backwards

function CameraRig({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const { camera } = useThree()
  const smoothP = useRef(0)

  useFrame((_, delta) => {
    const raw = scrollRef.current ?? 0
    // remapProgress() creates hold zones — just lerp smoothly to the remapped target
    smoothP.current += (raw - smoothP.current) * Math.min(delta * 3.5, 1)
    const p = smoothP.current

    let px: number, py: number, pz: number
    let tx: number, ty: number, tz = 0
    let fov: number

    if (p < 0.05) {
      // ── static opening — robot upper-right, slight CC rotation view ────────
      // Camera right of center → sees model's left side (counter-clockwise from top)
      // tx negative → camera looks left → model pushed to the right of frame
      // ty lower → camera looks down → model pushed up in frame
      px = 2.8; py = 2.2; pz = 7.2
      tx = -1.8; ty = -0.5
      fov = 48

    } else if (p < 0.27) {
      // ── zoom in low — toward front legs / camera sensor ───────────────────
      // Start values match static phase exactly to avoid jump at p=0.05
      const t = ss(inv(0.05, 0.27, p))
      px = lp(2.8, 0.5, t); py = lp(2.2, -1.2, t); pz = lp(7.2, 3.5, t)
      tx = lp(-1.8, 0, t); ty = lp(-0.5, -2.8, t)
      fov = lp(48, 62, t)

    } else if (p < 0.68) {
      // ── orbit XZ — theta: front (0.142) → back-left (2.45) ────────────────
      // Start theta/radius chosen so sin(0.142)*3.536≈0.5, cos(0.142)*3.536≈3.5
      // — matches zoom-in endpoint exactly, eliminating the p=0.27 jump
      const t = ss(inv(0.27, 0.68, p))
      const theta = lp(0.142, 2.45, t)
      const radius = lp(3.536, 5.0, t)
      px = Math.sin(theta) * radius
      py = lp(-1.2, 0.2, t)
      pz = Math.cos(theta) * radius
      tx = 0; ty = lp(-2.8, -2.0, t)
      fov = lp(60, 56, t)

    } else if (p < 0.82) {
      // ── hold at back-left, rise — look stays on lower body (legs) ──────────
      const t = ss(inv(0.68, 0.82, p))
      const theta = 2.45; const radius = 5.0
      px = Math.sin(theta) * radius
      py = lp(0.2, 1.0, t)             // rise only slightly — keep looking low
      pz = Math.cos(theta) * radius
      tx = 0; ty = lp(-2.0, -0.8, t)  // look stays on lower body, not body center
      fov = lp(56, 52, t)

    } else if (p < 0.87) {
      // ── camera moves to arm level from the SIDE, HOLDS ────────────────────
      // Stay at arm height — not high above it looking down
      const t = ss(inv(0.82, 0.87, p))
      const theta = 2.45; const radius = lp(5.0, 4.0, t)
      px = Math.sin(theta) * radius
      py = lp(1.0, 2.8, t)            // rise to arm height, not above it
      pz = Math.cos(theta) * radius
      tx = 0; ty = lp(-0.8, 2.0, t)  // look sweeps up to arm level
      fov = lp(52, 46, t)

    } else {
      // ── trace arm SIDE + punch in — camera at arm level, sweeps laterally ──
      // py stays roughly at arm height so camera looks ACROSS the arm, not down
      const t = ss(inv(0.87, 1.0, p))
      const theta = lp(2.45, 3.3, t)  // ~49° lateral sweep
      const radius = lp(4.0, 0.25, t) // collapses in — punches through geometry
      px = Math.sin(theta) * radius
      py = lp(2.8, 2.5, t)            // barely changes — camera stays at arm height
      pz = Math.cos(theta) * radius
      tx = 0; ty = lp(2.0, 2.2, t)   // look target stays at arm level (side view)
      fov = lp(46, 36, t)
    }

    camera.position.set(px, py, pz)
    camera.lookAt(tx, ty, tz)
    ;(camera as THREE.PerspectiveCamera).fov = fov
    ;(camera as THREE.PerspectiveCamera).updateProjectionMatrix()
  })

  return null
}

// ─── page component ──────────────────────────────────────────────────────────
export default function Hero() {
  const sectionRef    = useRef<HTMLElement>(null)
  const scrollRef     = useRef(0)
  const heroTextRef   = useRef<HTMLDivElement>(null)   // name + title (left)
  const heroTagRef    = useRef<HTMLDivElement>(null)   // "Talos Hexapod" (right, hero screen)
  const camTextRef    = useRef<HTMLDivElement>(null)   // ESP32-CAM text (during zoom-in)
  const legsTextRef   = useRef<HTMLDivElement>(null)   // legs info (during orbit pause)
  const armTextRef    = useRef<HTMLDivElement>(null)   // 3-axis arm text (arm pause)
  const overlayRef    = useRef<HTMLDivElement>(null)   // black exit overlay
  const fadeInRef     = useRef<HTMLDivElement>(null)   // mount fade-in (black→clear)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const scrollable = sectionRef.current.offsetHeight - window.innerHeight
    if (scrollable <= 0) return
    // rawP drives all DOM text — camP (remapped) drives the 3D camera via scrollRef
    const rawP = Math.max(0, Math.min(1, -rect.top / scrollable))
    scrollRef.current = remapProgress(rawP)

    // Hero name (left): visible → fade by raw 0.10
    if (heroTextRef.current) {
      const a = Math.max(0, 1 - rawP / 0.10)
      heroTextRef.current.style.opacity = a.toString()
      heroTextRef.current.style.transform = `translateY(${(1 - a) * -24}px)`
    }

    // "Talos Hexapod" tag (right, hero): fade by raw 0.08
    if (heroTagRef.current) {
      heroTagRef.current.style.opacity = Math.max(0, 1 - rawP / 0.08).toString()
    }

    // Scroll indicator: fade by raw 0.06
    if (scrollIndicatorRef.current) {
      scrollIndicatorRef.current.style.opacity = (Math.max(0, 1 - rawP / 0.06) * 0.3).toString()
    }

    // Vision text: centered on HOLD zone raw 0.16–0.30 → fade in 0.14–0.20, out 0.27–0.32
    if (camTextRef.current) {
      const fadeIn  = Math.min(1, inv(0.14, 0.20, rawP))
      const fadeOut = rawP > 0.27 ? Math.max(0, 1 - inv(0.27, 0.32, rawP)) : 1
      camTextRef.current.style.opacity = (fadeIn * fadeOut).toString()
    }

    // Legs text: centered on HOLD zone raw 0.52–0.63 → fade in 0.50–0.56, out 0.60–0.65
    if (legsTextRef.current) {
      const fadeIn  = Math.min(1, inv(0.50, 0.56, rawP))
      const fadeOut = rawP > 0.60 ? Math.max(0, 1 - inv(0.60, 0.65, rawP)) : 1
      legsTextRef.current.style.opacity = (fadeIn * fadeOut).toString()
    }

    // Arm text: centered on HOLD zone raw 0.74–0.84 → fade in 0.72–0.77, out 0.81–0.86
    if (armTextRef.current) {
      const fadeIn  = rawP >= 0.72 ? Math.min(1, inv(0.72, 0.77, rawP)) : 0
      const fadeOut = rawP > 0.81 ? Math.max(0, 1 - inv(0.81, 0.86, rawP)) : 1
      armTextRef.current.style.opacity = (fadeIn * fadeOut).toString()
    }

    // Black exit overlay: raw 0.94–1.0
    if (overlayRef.current) {
      overlayRef.current.style.opacity = Math.max(0, inv(0.94, 1.0, rawP)).toString()
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <section ref={sectionRef} style={{ height: '480vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* ── 3D canvas ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <Canvas
            camera={{ position: [0, 1.2, 8.5], fov: 50 }}
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <StudioEnv intensity={0.65} />
            <CameraRig scrollRef={scrollRef} />

            <ambientLight intensity={0.18} />
            <directionalLight position={[4, 6, 5]} intensity={1.6} />
            <directionalLight position={[-5, 2, -5]} intensity={1.2} color="#4466ff" />
            <directionalLight position={[0, -3, 4]} intensity={0.7} color="#ffddaa" />

            <Suspense fallback={null}>
              <TalosModel scrollRef={scrollRef} />
            </Suspense>
          </Canvas>
        </div>

        {/* ── mount fade-in — black layer fades to transparent on load ── */}
        <div ref={fadeInRef} style={{
          position: 'absolute', inset: 0, background: '#080808',
          animation: 'heroFadeIn 1.4s ease-out forwards',
          pointerEvents: 'none', zIndex: 8,
        }} />
        <style>{`@keyframes heroFadeIn { 0% { opacity: 1 } 100% { opacity: 0 } }`}</style>

        {/* ── black exit overlay — covers everything as hero section ends ── */}
        <div ref={overlayRef} style={{
          position: 'absolute', inset: 0, background: '#080808',
          opacity: 0, pointerEvents: 'none', zIndex: 5,
        }} />

        {/* ── nav ── */}
        <nav style={{
          position: 'absolute', top: 32, right: 40,
          display: 'flex', gap: 28, fontSize: 13,
          letterSpacing: '0.04em', zIndex: 10,
        }}>
          {[
            { label: 'GitHub', href: 'https://github.com/vy038' },
            { label: 'LinkedIn', href: 'https://linkedin.com/in/victoryu038' },
            { label: 'Resume', href: '/VictorYu_Resume.pdf' },
          ].map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--muted)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* ── hero name/title — bottom-left, fades out on first scroll ── */}
        <div ref={heroTextRef} style={{
          position: 'absolute', bottom: '18%',
          left: 'clamp(32px, 6vw, 96px)', zIndex: 3,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16,
          }}>
            Portfolio
          </p>
          <h1 style={{
            fontSize: 'clamp(64px, 9vw, 120px)', fontWeight: 300,
            lineHeight: 0.92, letterSpacing: '-0.025em', marginBottom: 20,
          }}>
            Victor<br />Yu
          </h1>
          <p style={{
            fontSize: 'clamp(13px, 1.4vw, 17px)', fontWeight: 300,
            color: 'var(--muted)', lineHeight: 1.7,
          }}>
            Firmware &amp; Embedded Systems<br />
            <span style={{ fontSize: '0.86em' }}>Computer Engineering @ University of Waterloo</span>
          </p>
        </div>

        {/* ── "Talos Hexapod" — hero screen right side, fades at first scroll ── */}
        <div ref={heroTagRef} style={{
          position: 'absolute', bottom: '18%', right: 'clamp(32px, 6vw, 96px)',
          zIndex: 3, textAlign: 'right', pointerEvents: 'none',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.20em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Talos Hexapod
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--muted)', lineHeight: 2.2, letterSpacing: '0.06em',
          }}>
            scorpion-class autonomous platform<br />
            bare-metal C · FreeRTOS · ESP32
          </p>
        </div>

        {/* ── ESP32-CAM text — appears during zoom-in to front ── */}
        <div ref={camTextRef} style={{
          position: 'absolute', bottom: '18%', right: 'clamp(32px, 6vw, 96px)',
          zIndex: 3, opacity: 0, textAlign: 'right', pointerEvents: 'none',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.20em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 14,
          }}>
            Vision System
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--muted)', lineHeight: 2.5, letterSpacing: '0.06em',
          }}>
            ESP32-CAM color detection<br />
            object sizing, classification, &amp; distance approximation<br />
            autonomous approach decisions
          </p>
        </div>

        {/* ── Legs text — appears during orbit phase ── */}
        <div ref={legsTextRef} style={{
          position: 'absolute', bottom: '18%', right: 'clamp(32px, 6vw, 96px)',
          zIndex: 3, opacity: 0, textAlign: 'right', pointerEvents: 'none',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.20em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 14,
          }}>
            Locomotion
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--muted)', lineHeight: 2.5, letterSpacing: '0.06em',
          }}>
            multiple gaits · 6 legs<br />
            0 tip-overs in 50+ cycles<br />
            configurable walking patterns
          </p>
        </div>

        {/* ── 3-axis arm text — appears at arm-level pause ── */}
        <div ref={armTextRef} style={{
          position: 'absolute', top: '50%', right: 'clamp(32px, 6vw, 96px)',
          transform: 'translateY(-50%)', zIndex: 3, opacity: 0, textAlign: 'right',
          pointerEvents: 'none',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.20em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 14,
          }}>
            3-axis arm
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--muted)', lineHeight: 2.5, letterSpacing: '0.06em',
          }}>
            inverse kinematics solver<br />
            VL53L0X closed-loop ranging<br />
            detect → approach → grab
          </p>
        </div>

        {/* ── scroll indicator ── */}
        <div ref={scrollIndicatorRef} style={{
          position: 'absolute', bottom: 40, left: '50%',
          transform: 'translateX(-50%)', opacity: 0.3, zIndex: 3,
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 1, height: 50, background: 'var(--muted)', margin: '0 auto',
            animation: 'sp 2s ease-in-out infinite',
          }} />
          <style>{`@keyframes sp{0%,100%{opacity:.2;transform:scaleY(.5);transform-origin:top}50%{opacity:1;transform:scaleY(1)}}`}</style>
        </div>

      </div>
    </section>
  )
}
