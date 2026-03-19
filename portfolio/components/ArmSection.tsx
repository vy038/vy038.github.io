'use client'

import { useEffect, useRef, useCallback, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import { useMeshMode } from './MeshModeContext'
import StudioEnv from './StudioEnv'

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

function setChromeMaterial(scene: THREE.Object3D) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.92,
        roughness: 0.12,
      })
    }
  })
}

function applyMeshMode(scene: THREE.Object3D, meshMode: boolean) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      if (meshMode) {
        child.material.wireframe = true
        child.material.color.set(0x1155ff)
        child.material.emissive.set(0x001133)
        child.material.emissiveIntensity = 1.4
        child.material.metalness = 0
        child.material.roughness = 1
        child.material.envMapIntensity = 0
      } else {
        child.material.wireframe = false
        child.material.color.set(0x222222)
        child.material.emissive.set(0x000000)
        child.material.emissiveIntensity = 0
        child.material.metalness = 0.92
        child.material.roughness = 0.12
        child.material.envMapIntensity = 1
      }
    }
  })
}

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeIn(t: number) { return t * t * t }

function ArmModel({ scrollRef, meshMode }: { scrollRef: React.RefObject<number>; meshMode: boolean }) {
  const { scene: raw } = useGLTF('/models/arm.glb')
  const scene = useMemo(() => raw.clone(true), [raw])
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    normalizeAndCenter(scene, 6)
    setChromeMaterial(scene)
  }, [scene])

  useEffect(() => { applyMeshMode(scene, meshMode) }, [scene, meshMode])

  useFrame(() => {
    if (!groupRef.current) return
    const p = scrollRef.current ?? 0

    // Sweep right → center → left (stays within canvas bounds more)
    const x = THREE.MathUtils.lerp(5, -5, easeOut(p))
    const rotY = p * Math.PI * 1.2
    const fade = p < 0.8 ? 1 : 1 - easeIn((p - 0.8) / 0.2)

    groupRef.current.position.x = x
    groupRef.current.position.y = 0
    groupRef.current.rotation.x = 0.1
    groupRef.current.rotation.y = rotY
    groupRef.current.rotation.z = 0

    if (!meshMode) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.transparent = fade < 1
          child.material.opacity = fade
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

function LegsModel({ scrollRef, meshMode }: { scrollRef: React.RefObject<number>; meshMode: boolean }) {
  const { scene: raw } = useGLTF('/models/talos.glb')
  const scene = useMemo(() => raw.clone(true), [raw])
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    normalizeAndCenter(scene, 7)
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x222222, metalness: 0.92, roughness: 0.12,
          transparent: true, opacity: 0,
        })
      }
    })
  }, [scene])

  useEffect(() => { applyMeshMode(scene, meshMode) }, [scene, meshMode])

  useFrame(() => {
    if (!groupRef.current) return
    const p = scrollRef.current ?? 0

    const enterP = Math.max(0, Math.min((p - 0.6) / 0.4, 1))
    const x = THREE.MathUtils.lerp(5, -1, easeOut(enterP))
    const fade = easeOut(Math.max(0, Math.min((p - 0.6) / 0.15, 1)))
    const tilt = THREE.MathUtils.lerp(0.4, 0.1, easeOut(enterP))

    groupRef.current.position.x = x
    groupRef.current.position.y = -0.5
    groupRef.current.rotation.x = tilt
    groupRef.current.rotation.y = THREE.MathUtils.lerp(0.3, -0.2, easeOut(enterP))
    groupRef.current.rotation.z = 0

    if (!meshMode) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.transparent = fade < 1
          child.material.opacity = fade
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

export default function ArmSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const scrollRef = useRef(0)
  const labelRef = useRef<HTMLDivElement>(null)
  const { meshMode } = useMeshMode()

  // Native scroll listener — bypasses GSAP ScrollTrigger for 3D progress
  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return
    const rect = sectionRef.current.getBoundingClientRect()
    const sectionHeight = sectionRef.current.offsetHeight
    const viewportH = window.innerHeight
    const scrollable = sectionHeight - viewportH
    if (scrollable <= 0) return
    const scrolled = -rect.top
    scrollRef.current = Math.max(0, Math.min(1, scrolled / scrollable))
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Label animations — still use GSAP for text
  useEffect(() => {
    if (!labelRef.current || !sectionRef.current) return

    const labelIn = gsap.fromTo(labelRef.current,
      { opacity: 0, y: 12 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
      }
    )
    const labelOut = gsap.to(labelRef.current, {
      opacity: 0, y: -12,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: '55% top',
        end: '70% top',
        scrub: true,
      },
    })

    return () => {
      labelIn.scrollTrigger?.kill()
      labelIn.kill()
      labelOut.scrollTrigger?.kill()
      labelOut.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} style={{ height: '250vh', position: 'relative' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '20%',
          background: 'linear-gradient(to top, transparent, #080808)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <Canvas
            camera={{ position: [0, 0.5, 9], fov: 55 }}
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <StudioEnv intensity={0.6} />

            {meshMode ? (
              <>
                <ambientLight intensity={0.06} color="#0022aa" />
                <pointLight position={[-4, 1, -4]} intensity={1.4} color="#0055ff" />
                <pointLight position={[4, -2, 3]} intensity={0.7} color="#3366ff" />
              </>
            ) : (
              <>
                <ambientLight intensity={0.15} />
                <directionalLight position={[4, 6, 5]} intensity={1.5} />
                <directionalLight position={[-5, 2, -5]} intensity={1.2} color="#4466ff" />
              </>
            )}

            <Suspense fallback={null}>
              <ArmModel scrollRef={scrollRef} meshMode={meshMode} />
              <LegsModel scrollRef={scrollRef} meshMode={meshMode} />
            </Suspense>
          </Canvas>
        </div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: 'linear-gradient(to bottom, transparent, #080808)',
          pointerEvents: 'none', zIndex: 2,
        }} />

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
            3-axis arm<br />
            <span style={{ fontSize: '0.88em' }}>13 servos · scorpion configuration</span>
          </p>
        </div>
      </div>
    </section>
  )
}
