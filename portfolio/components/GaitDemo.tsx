'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const LEG_COUNT = 6
const LEG_ANGLES = Array.from({ length: LEG_COUNT }, (_, i) => (i * Math.PI * 2) / LEG_COUNT)
const COXA_LEN = 0.50
const FEMUR_LEN = 0.72
const TIBIA_LEN = 0.80

function Leg({ angle, phase, time }: { angle: number; phase: number; time: React.RefObject<number> }) {
  const coxaRef = useRef<THREE.Group>(null)
  const femurRef = useRef<THREE.Group>(null)
  const tibiaRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!coxaRef.current || !femurRef.current || !tibiaRef.current) return
    const t = (time.current ?? 0) + phase
    const swing = Math.sin(t)
    const lift = Math.max(0, Math.sin(t))

    coxaRef.current.rotation.y = swing * 0.28
    femurRef.current.rotation.x = -0.35 - lift * 0.45
    tibiaRef.current.rotation.x = 0.55 + lift * 0.35
  })

  const ox = Math.cos(angle) * 0.92
  const oz = Math.sin(angle) * 0.48

  return (
    <group position={[ox, 0, oz]} rotation={[0, -angle + Math.PI / 2, 0]}>
      <group ref={coxaRef}>
        <mesh position={[COXA_LEN / 2, 0, 0]}>
          <boxGeometry args={[COXA_LEN, 0.065, 0.065]} />
          <meshBasicMaterial color="#00ff88" wireframe />
        </mesh>
        <group ref={femurRef} position={[COXA_LEN, 0, 0]}>
          <mesh position={[0, -FEMUR_LEN / 2, 0]}>
            <boxGeometry args={[0.065, FEMUR_LEN, 0.065]} />
            <meshBasicMaterial color="#00ff88" wireframe />
          </mesh>
          <group ref={tibiaRef} position={[0, -FEMUR_LEN, 0]}>
            <mesh position={[0, -TIBIA_LEN / 2, 0]}>
              <boxGeometry args={[0.055, TIBIA_LEN, 0.055]} />
              <meshBasicMaterial color="#00cc66" wireframe />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

function Robot() {
  const timeRef = useRef(0)
  const bodyRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    timeRef.current += delta * 2.2
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(timeRef.current * 2) * 0.03 - 0.06
    }
  })

  return (
    <group rotation={[0, Math.PI * 0.15, 0]}>
      <mesh ref={bodyRef}>
        <boxGeometry args={[1.85, 0.24, 0.96]} />
        <meshBasicMaterial color="#00ff88" wireframe />
      </mesh>
      {LEG_ANGLES.map((angle, i) => (
        <Leg key={i} angle={angle} phase={i % 2 === 0 ? 0 : Math.PI} time={timeRef} />
      ))}
      <mesh position={[0, -1.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 6, 10, 10]} />
        <meshBasicMaterial color="#161616" wireframe />
      </mesh>
    </group>
  )
}

export default function GaitDemo() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#080808', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 10, left: 14, zIndex: 1,
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
        color: '#00ff88', opacity: 0.6,
      }}>
        TRIPOD GAIT · LIVE
      </div>
      <div style={{
        position: 'absolute', top: 13, right: 14, zIndex: 1,
        width: 5, height: 5, borderRadius: '50%', background: '#00ff88',
        animation: 'gp 1.4s ease-in-out infinite',
      }} />
      <style>{`@keyframes gp{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
      <Canvas
        camera={{ position: [1.8, 1.1, 2.4], fov: 52 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#080808' }}
      >
        <Robot />
      </Canvas>
    </div>
  )
}
