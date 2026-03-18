'use client'

import { useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '@/lib/gsap'

// ─── Camera keyframes (position + lookAt target) ─────────────────────────────
// t = scroll progress 0→1 across the 300vh section

const CAM_KEYS = [
  { t: 0.00, p: [0, 1.2, 7.5],   l: [0, 0, 0] },     // full robot
  { t: 0.18, p: [0, 1.2, 7.5],   l: [0, 0, 0] },     // hold
  { t: 0.30, p: [4.5, 3.5, 3.0], l: [1.5, 2.0, -0.5] }, // swing to arm
  { t: 0.46, p: [-3.5, 3.2, 2.5],l: [-0.5, 1.8, 0.0] }, // orbit 180° around arm
  { t: 0.58, p: [4.0, -0.8, 4.0],l: [1.2, -1.2, 0] },   // drop to legs
  { t: 0.74, p: [-4.0, -0.5, 3.5],l: [-1.2, -0.9, 0] },  // sweep across legs
  { t: 0.87, p: [0, 1.2, 8.0],   l: [0, 0.2, 0] },    // pull back
  { t: 1.00, p: [0, 1.2, 8.0],   l: [0, 0.2, 0] },    // hold
]

function smoothstep(t: number) {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

// ─── Camera rig: reads scrollRef, sets camera ────────────────────────────────

function CameraRig({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const { camera } = useThree()
  const lookAtCur = useRef(new THREE.Vector3(0, 0, 0))

  useFrame(() => {
    const p = scrollRef.current ?? 0

    let i = 0
    while (i < CAM_KEYS.length - 2 && CAM_KEYS[i + 1].t <= p) i++
    const k0 = CAM_KEYS[i], k1 = CAM_KEYS[i + 1]
    const raw = k1.t === k0.t ? 0 : (p - k0.t) / (k1.t - k0.t)
    const sm = smoothstep(raw)

    const px = k0.p[0] + (k1.p[0] - k0.p[0]) * sm
    const py = k0.p[1] + (k1.p[1] - k0.p[1]) * sm
    const pz = k0.p[2] + (k1.p[2] - k0.p[2]) * sm
    const tx = k0.l[0] + (k1.l[0] - k0.l[0]) * sm
    const ty = k0.l[1] + (k1.l[1] - k0.l[1]) * sm
    const tz = k0.l[2] + (k1.l[2] - k0.l[2]) * sm

    camera.position.set(px, py, pz)
    lookAtCur.current.lerp(new THREE.Vector3(tx, ty, tz), 0.08)
    camera.lookAt(lookAtCur.current)
  })

  return null
}

// ─── Talos model ─────────────────────────────────────────────────────────────

function TalosScene({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const { scene: raw } = useGLTF('/models/talos.glb')
  const scene = useMemo(() => raw.clone(true), [raw])

  const groupRef = useRef<THREE.Group>(null)
  const solidMats = useRef<THREE.MeshStandardMaterial[]>([])
  const wireMats = useRef<THREE.LineBasicMaterial[]>([])
  const idleRot = useRef(0)

  useEffect(() => {
    // Normalize to ~4 units
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) scene.scale.setScalar(4 / maxDim)
    box.setFromObject(scene)
    scene.position.sub(box.getCenter(new THREE.Vector3()))

    const solids: THREE.MeshStandardMaterial[] = []
    const wires: THREE.LineBasicMaterial[] = []

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = new THREE.MeshStandardMaterial({
          color: 0x1e1e1e, metalness: 0.75, roughness: 0.35,
          transparent: true, opacity: 1,
        })
        child.material = mat
        solids.push(mat)

        const edgeGeo = new THREE.EdgesGeometry(child.geometry, 15)
        const wireMat = new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0 })
        child.add(new THREE.LineSegments(edgeGeo, wireMat))
        wires.push(wireMat)
      }
    })

    solidMats.current = solids
    wireMats.current = wires
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const p = scrollRef.current ?? 0

    // Idle rotation fades out as tour begins
    idleRot.current += Math.max(0, 1 - p * 6) * 0.003
    groupRef.current.rotation.y = idleRot.current

    // Material: solid → wireframe during phase transition (p 0.18→0.32)
    const wt = Math.max(0, Math.min(1, (p - 0.18) * 8))
    solidMats.current.forEach((m) => { m.opacity = Math.max(0, 1 - wt * 1.4) })
    wireMats.current.forEach((m) => { m.opacity = Math.min(0.85, wt * 1.1) })

    void delta
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef(0)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const armLabelRef = useRef<HTMLDivElement>(null)
  const legLabelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    // Single timeline drives everything: camera via scrollRef + DOM elements
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.8,
        onUpdate: (self) => { scrollRef.current = self.progress },
      },
    })

    // DOM: hero text fades out
    tl.to(heroTextRef.current, { opacity: 0, y: -50, duration: 0.1, ease: 'power2.in' }, 0.16)

    // DOM: arm label fades in then out
    tl.to(armLabelRef.current, { opacity: 1, y: 0, duration: 0.08 }, 0.28)
    tl.to(armLabelRef.current, { opacity: 0, duration: 0.06 }, 0.52)

    // DOM: leg label fades in then out
    tl.to(legLabelRef.current, { opacity: 1, y: 0, duration: 0.08 }, 0.58)
    tl.to(legLabelRef.current, { opacity: 0, duration: 0.06 }, 0.82)

    return () => { tl.kill() }
  }, [])

  const labelBase: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1,
    opacity: 0,
    transform: 'translateY(16px)',
  }

  return (
    <section ref={sectionRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Canvas — full background, no pointer events so page scroll works */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Canvas
            camera={{ position: [0, 1.2, 7.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.35} />
            <directionalLight position={[4, 7, 4]} intensity={1.7} />
            <pointLight position={[-4, 2, -3]} intensity={0.5} color="#6688ff" />
            <pointLight position={[3, -2, 2]} intensity={0.3} color="#ff7744" />
            <CameraRig scrollRef={scrollRef} />
            <Suspense fallback={null}>
              <TalosScene scrollRef={scrollRef} />
            </Suspense>
          </Canvas>
        </div>

        {/* Nav links */}
        <nav style={{
          position: 'absolute', top: 32, right: 40, display: 'flex',
          gap: 28, fontSize: 13, letterSpacing: '0.04em', zIndex: 10,
        }}>
          {[
            { label: 'GitHub', href: 'https://github.com/vy038' },
            { label: 'LinkedIn', href: 'https://linkedin.com/in/victoryu038' },
            { label: 'Resume', href: '/VictorYu_Resume.pdf' },
          ].map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--muted)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Phase 0: Name + title */}
        <div ref={heroTextRef} style={{
          position: 'absolute', bottom: '14%',
          left: 'clamp(32px, 6vw, 96px)', zIndex: 1,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 18,
          }}>
            Portfolio
          </p>
          <h1 style={{
            fontSize: 'clamp(64px, 9vw, 120px)', fontWeight: 300,
            lineHeight: 0.93, letterSpacing: '-0.025em', marginBottom: 22,
          }}>
            Victor<br />Yu
          </h1>
          <p style={{
            fontSize: 'clamp(14px, 1.5vw, 18px)', fontWeight: 300,
            color: 'var(--muted)', lineHeight: 1.65, maxWidth: 380,
          }}>
            Firmware & Embedded Systems Engineer
            <br />
            <span style={{ fontSize: '0.85em' }}>
              Computer Engineering @ University of Waterloo
            </span>
          </p>
        </div>

        {/* Phase 1: Arm label */}
        <div ref={armLabelRef} style={{
          ...labelBase, top: '22%', right: 'clamp(32px, 6vw, 96px)', textAlign: 'right',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10,
          }}>
            6-DOF Mechanical Arm
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.7 }}>
            Inverse kinematics · ESP32<br />SG90 servos · I²C bus
          </p>
        </div>

        {/* Phase 2: Leg label */}
        <div ref={legLabelRef} style={{
          ...labelBase, bottom: '22%', left: 'clamp(32px, 6vw, 96px)',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Tripod Gait Locomotion
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.7 }}>
            13 servos · Dual PCA9685<br />50Hz control loop
          </p>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.35,
        }}>
          <div style={{
            width: 1, height: 52, background: 'var(--muted)',
            animation: 'sPulse 2s ease-in-out infinite',
          }} />
          <style>{`@keyframes sPulse{0%,100%{opacity:.2;transform:scaleY(.5);transform-origin:top}50%{opacity:1;transform:scaleY(1)}}`}</style>
        </div>
      </div>
    </section>
  )
}
