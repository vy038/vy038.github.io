'use client'

import { useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '@/lib/gsap'

function applyDarkMetal(scene: THREE.Object3D) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0x1c1c1c,
        metalness: 0.85,
        roughness: 0.22,
      })
    }
  })
}

function normalizeScene(scene: THREE.Object3D, units: number) {
  const box = new THREE.Box3().setFromObject(scene)
  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  if (maxDim > 0) scene.scale.setScalar(units / maxDim)
  box.setFromObject(scene)
  scene.position.sub(box.getCenter(new THREE.Vector3()))
}

// arm.glb — slides in from right, then rotates, then descends
function ArmModel({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const { scene: raw } = useGLTF('/models/arm.glb')
  const scene = useMemo(() => raw.clone(true), [raw])
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    normalizeScene(scene, 5)
    applyDarkMetal(scene)
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const p = scrollRef.current ?? 0

    // 0–0.4: slide in from right
    const slideP = Math.min(p / 0.4, 1)
    const x = THREE.MathUtils.lerp(9, 0, easeOut(slideP))

    // 0.4–0.7: fast rotation in center
    const rotP = Math.max(0, Math.min((p - 0.4) / 0.3, 1))
    const rotY = rotP * Math.PI * 1.5

    // 0.7–1.0: drift down and fade out left
    const exitP = Math.max(0, Math.min((p - 0.7) / 0.3, 1))
    const y = THREE.MathUtils.lerp(0, -4.5, easeIn(exitP))
    const exitX = THREE.MathUtils.lerp(0, -3, easeIn(exitP))

    groupRef.current.position.set(x + exitX, y, 0)
    groupRef.current.rotation.y = rotY

    // fade out during exit
    const opacity = 1 - easeIn(exitP)
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.transparent = true
        child.material.opacity = opacity
      }
    })
  })

  return (
    <group ref={groupRef} position={[9, 0, 0]} rotation={[0.15, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// talos.glb positioned to show legs — slides up from below
function LegsModel({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const { scene: raw } = useGLTF('/models/talos.glb')
  const scene = useMemo(() => raw.clone(true), [raw])
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    normalizeScene(scene, 7)
    applyDarkMetal(scene)
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const p = scrollRef.current ?? 0

    // visible only from 0.65 onward
    const fadeInP = Math.max(0, Math.min((p - 0.65) / 0.15, 1))
    // 0.65–1.0: slide up from below and shift right slightly
    const slideP = Math.max(0, Math.min((p - 0.65) / 0.35, 1))
    const y = THREE.MathUtils.lerp(-3.5, -1.2, easeOut(slideP))
    // tilt to expose legs — pitch model back so legs face camera
    const tiltX = THREE.MathUtils.lerp(0.3, -0.1, easeOut(slideP))

    groupRef.current.position.set(1.5, y, 0)
    groupRef.current.rotation.x = tiltX

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.transparent = true
        child.material.opacity = fadeInP
      }
    })
  })

  return (
    <group ref={groupRef} position={[1.5, -3.5, 0]} rotation={[0.3, 0.4, 0]}>
      <primitive object={scene} />
    </group>
  )
}

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeIn(t: number) { return t * t * t }

export default function ArmSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef(0)
  const labelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.4,
      onUpdate: (self) => { scrollRef.current = self.progress },
    })

    // Label: "Arm" fades in, then out
    gsap.fromTo(labelRef.current,
      { opacity: 0, y: 12 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      }
    )
    gsap.to(labelRef.current, {
      opacity: 0, y: -12,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: '55% top',
        end: '70% top',
        scrub: true,
      },
    })
  }, [])

  return (
    <section ref={sectionRef} style={{ height: '250vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Top gradient — blends from previous section */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '20%',
          background: 'linear-gradient(to top, transparent, #080808)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Canvas */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Canvas
            camera={{ position: [0, 1.5, 8], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.2} />
            <directionalLight position={[6, 8, 4]} intensity={2.2} />
            <directionalLight position={[-4, 2, -5]} intensity={0.5} color="#4466ff" />
            <pointLight position={[2, -3, 3]} intensity={0.6} color="#ff6633" />
            <Suspense fallback={null}>
              <ArmModel scrollRef={scrollRef} />
              <LegsModel scrollRef={scrollRef} />
            </Suspense>
          </Canvas>
        </div>

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to bottom, transparent, #080808)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Section label */}
        <div ref={labelRef} style={{
          position: 'absolute', top: '50%', left: 'clamp(32px, 6vw, 96px)',
          transform: 'translateY(-50%)', zIndex: 3, opacity: 0,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10,
          }}>
            Design
          </p>
          <p style={{
            fontSize: 'clamp(13px, 1.3vw, 16px)', fontWeight: 300,
            color: 'var(--muted)', lineHeight: 1.7, maxWidth: 260,
          }}>
            6-DOF arm<br />
            <span style={{ fontSize: '0.88em' }}>18 degrees of freedom total</span>
          </p>
        </div>
      </div>
    </section>
  )
}
