'use client'

import { useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { useMeshMode } from './MeshModeContext'

const WIRE_COLOR = new THREE.Color(0x1155ff)
const WIRE_EMISSIVE = new THREE.Color(0x001133)
const SOLID_COLOR = new THREE.Color(0x1c1c1c)
const SOLID_EMISSIVE = new THREE.Color(0x000000)

function TalosModel({
  scrollRef,
  meshMode,
}: {
  scrollRef: React.RefObject<number>
  meshMode: boolean
}) {
  const { scene: raw } = useGLTF('/models/talos.glb')
  const scene = useMemo(() => raw.clone(true), [raw])
  const groupRef = useRef<THREE.Group>(null)

  // Initial setup
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) scene.scale.setScalar(6 / maxDim)
    box.setFromObject(scene)
    scene.position.sub(box.getCenter(new THREE.Vector3()))

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: SOLID_COLOR.clone(),
          metalness: 0.85,
          roughness: 0.22,
          emissive: SOLID_EMISSIVE.clone(),
          emissiveIntensity: 0,
        })
      }
    })
  }, [scene])

  // Toggle solid / wireframe
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        if (meshMode) {
          child.material.wireframe = true
          child.material.color.copy(WIRE_COLOR)
          child.material.emissive.copy(WIRE_EMISSIVE)
          child.material.emissiveIntensity = 1.4
          child.material.metalness = 0
          child.material.roughness = 1
        } else {
          child.material.wireframe = false
          child.material.color.copy(SOLID_COLOR)
          child.material.emissive.copy(SOLID_EMISSIVE)
          child.material.emissiveIntensity = 0
          child.material.metalness = 0.85
          child.material.roughness = 0.22
        }
      }
    })
  }, [scene, meshMode])

  useFrame(() => {
    if (!groupRef.current) return
    const p = scrollRef.current ?? 0
    groupRef.current.position.x = THREE.MathUtils.lerp(-1.2, -7, p)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(-0.55, -Math.PI * 0.55, p)
  })

  return (
    <group ref={groupRef} rotation={[0.08, -0.55, 0]}>
      <primitive object={scene} />
    </group>
  )
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef(0)
  const textRef = useRef<HTMLDivElement>(null)
  const { meshMode } = useMeshMode()

  useEffect(() => {
    if (!sectionRef.current) return

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
      onUpdate: (self) => { scrollRef.current = self.progress },
    })

    gsap.to(textRef.current, {
      opacity: 0, y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '35% top',
        scrub: true,
      },
    })
  }, [])

  return (
    <section ref={sectionRef} style={{ height: '200vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Full-screen canvas */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <Canvas
            camera={{ position: [3.5, 1.8, 6.5], fov: 48 }}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            {meshMode ? (
              <>
                <ambientLight intensity={0.04} color="#0022aa" />
                <directionalLight position={[5, 8, 4]} intensity={0.3} color="#2244ff" />
                <pointLight position={[-3, 1, -4]} intensity={1.2} color="#0055ff" />
                <pointLight position={[4, -2, 3]} intensity={0.6} color="#3366ff" />
              </>
            ) : (
              <>
                <ambientLight intensity={0.18} />
                <directionalLight position={[5, 8, 4]} intensity={2.4} />
                <directionalLight position={[-4, 1, -5]} intensity={1.1} color="#3355ff" />
                <pointLight position={[3, -3, 2]} intensity={0.9} color="#ff5522" />
                <pointLight position={[-2, 4, 2]} intensity={0.4} color="#aaccff" />
              </>
            )}
            <Suspense fallback={null}>
              <TalosModel scrollRef={scrollRef} meshMode={meshMode} />
            </Suspense>
          </Canvas>
        </div>

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          background: 'linear-gradient(to bottom, transparent, #080808)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Nav */}
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

        {/* Name + title */}
        <div ref={textRef} style={{
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
            Firmware & Embedded Systems Engineer<br />
            <span style={{ fontSize: '0.86em' }}>Computer Engineering @ University of Waterloo</span>
          </p>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%',
          transform: 'translateX(-50%)', opacity: 0.3, zIndex: 3,
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
