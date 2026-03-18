'use client'

import { useEffect, useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '@/lib/gsap'

// ─── 3D Model ────────────────────────────────────────────────────────────────

function TalosModel({ progressRef }: { progressRef: React.RefObject<number> }) {
  const { scene } = useGLTF('/models/talos.glb')
  const groupRef = useRef<THREE.Group>(null)
  const idleRotRef = useRef(0)

  // Store refs to solid and wireframe materials for blending
  const solidMats = useRef<THREE.Material[]>([])
  const wireMats = useRef<THREE.LineBasicMaterial[]>([])

  useEffect(() => {
    const solids: THREE.Material[] = []
    const wires: THREE.LineBasicMaterial[] = []

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Replace with clean metallic material
        const mat = new THREE.MeshStandardMaterial({
          color: 0x1e1e1e,
          metalness: 0.75,
          roughness: 0.35,
          transparent: true,
          opacity: 1,
        })
        child.material = mat
        solids.push(mat)

        // Wireframe overlay as child LineSegments
        const edgeGeo = new THREE.EdgesGeometry(child.geometry, 15)
        const wireMat = new THREE.LineBasicMaterial({
          color: 0x00ff88,
          transparent: true,
          opacity: 0,
        })
        const lines = new THREE.LineSegments(edgeGeo, wireMat)
        child.add(lines)
        wires.push(wireMat)
      }
    })

    solidMats.current = solids
    wireMats.current = wires
  }, [scene])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const p = progressRef.current ?? 0

    // Idle Y rotation — fades out as scroll starts
    const idleSpeed = Math.max(0, 1 - p * 8) * 0.004
    idleRotRef.current += idleSpeed
    groupRef.current.rotation.y = idleRotRef.current + p * 0.25

    // Scroll-driven: slide left, shrink
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      p * -2.2,
      delta * 4
    )
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.82, p))

    // Material blend: solid → wireframe
    const solidOpacity = Math.max(0, 1 - p * 2)
    const wireOpacity = Math.min(0.75, Math.max(0, (p - 0.15) * 1.8))

    solidMats.current.forEach((mat) => {
      ;(mat as THREE.MeshStandardMaterial).opacity = solidOpacity
    })
    wireMats.current.forEach((mat) => {
      mat.opacity = wireOpacity
    })
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

function Loader() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#00ff88',
          animation: 'pulse 1.2s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }`}</style>
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const progressRef = useRef(0)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
      onUpdate: (self) => {
        progressRef.current = self.progress
      },
    })

    // Text fades out and slides up as user scrolls away
    if (textRef.current) {
      gsap.to(textRef.current, {
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '40% top',
          scrub: true,
        },
      })
    }

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* 3D Canvas — full background, pointer-events off */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        <Canvas
          camera={{ position: [0, 1.5, 6], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[4, 6, 4]} intensity={1.6} color="#ffffff" />
          <pointLight position={[-4, 2, -3]} intensity={0.5} color="#8888ff" />
          <pointLight position={[3, -2, 2]} intensity={0.3} color="#ff8844" />
          <Suspense fallback={null}>
            <TalosModel progressRef={progressRef} />
          </Suspense>
        </Canvas>
      </div>

      {/* Mobile fallback image */}
      <div
        className="md:hidden"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/talos-preview.jpg)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center right',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      {/* Top-right nav links */}
      <nav
        style={{
          position: 'absolute',
          top: 32,
          right: 40,
          display: 'flex',
          gap: 28,
          fontSize: 13,
          letterSpacing: '0.04em',
          zIndex: 10,
        }}
      >
        {[
          { label: 'GitHub', href: 'https://github.com/vy038' },
          { label: 'LinkedIn', href: 'https://linkedin.com/in/victoryu038' },
          { label: 'Resume', href: '/VictorYu_Resume.pdf' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--muted)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Hero text — left side */}
      <div
        ref={textRef}
        style={{
          position: 'relative',
          zIndex: 1,
          paddingLeft: 'clamp(32px, 6vw, 96px)',
          maxWidth: '52%',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.18em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Portfolio
        </p>

        <h1
          style={{
            fontSize: 'clamp(48px, 7vw, 96px)',
            fontWeight: 300,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            marginBottom: 24,
            color: 'var(--text)',
          }}
        >
          Victor
          <br />
          Yu
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 1.8vw, 20px)',
            fontWeight: 400,
            color: 'var(--muted)',
            lineHeight: 1.6,
            maxWidth: 380,
          }}
        >
          Firmware & Embedded Systems Engineer
          <br />
          <span style={{ fontSize: '0.88em' }}>
            Computer Engineering @ University of Waterloo
          </span>
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: 1,
            height: 48,
            background: 'var(--muted)',
            animation: 'scrollPulse 2s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes scrollPulse {
            0%,100% { opacity: 0.3; transform: scaleY(0.6); transform-origin: top; }
            50% { opacity: 1; transform: scaleY(1); }
          }
        `}</style>
      </div>
    </section>
  )
}
