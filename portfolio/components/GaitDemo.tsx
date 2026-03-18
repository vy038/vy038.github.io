'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Tripod gait: legs 0,2,4 and legs 1,3,5 alternate
// Each leg: coxa (side rotation) + femur (up/down) + tibia (up/down)

const LEG_COUNT = 6
const LEG_ANGLES = Array.from({ length: LEG_COUNT }, (_, i) => (i * Math.PI * 2) / LEG_COUNT)
const COXA_LEN = 0.28
const FEMUR_LEN = 0.42
const TIBIA_LEN = 0.48

function Leg({
  angle,
  phase,
  time,
}: {
  angle: number
  phase: number
  time: React.RefObject<number>
}) {
  const coxaRef = useRef<THREE.Group>(null)
  const femurRef = useRef<THREE.Group>(null)
  const tibiaRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!coxaRef.current || !femurRef.current || !tibiaRef.current) return
    const t = (time.current ?? 0) + phase

    // Tripod gait: swing phase when sin > 0, stance phase when sin < 0
    const swing = Math.sin(t)
    const lift = Math.max(0, Math.sin(t)) // only lifts during swing

    // Coxa: forward/back sweep
    coxaRef.current.rotation.y = swing * 0.22

    // Femur: lifts during swing
    femurRef.current.rotation.x = -0.3 - lift * 0.35

    // Tibia: extends during swing, retracts during stance
    tibiaRef.current.rotation.x = 0.5 + lift * 0.3
  })

  // Leg origin position on body perimeter
  const ox = Math.cos(angle) * 0.55
  const oz = Math.sin(angle) * 0.28

  return (
    <group position={[ox, 0, oz]} rotation={[0, -angle + Math.PI / 2, 0]}>
      {/* Coxa */}
      <group ref={coxaRef}>
        <mesh position={[COXA_LEN / 2, 0, 0]}>
          <boxGeometry args={[COXA_LEN, 0.04, 0.04]} />
          <meshBasicMaterial color="#00ff88" wireframe />
        </mesh>
        {/* Femur */}
        <group ref={femurRef} position={[COXA_LEN, 0, 0]}>
          <mesh position={[0, -FEMUR_LEN / 2, 0]}>
            <boxGeometry args={[0.04, FEMUR_LEN, 0.04]} />
            <meshBasicMaterial color="#00ff88" wireframe />
          </mesh>
          {/* Tibia */}
          <group ref={tibiaRef} position={[0, -FEMUR_LEN, 0]}>
            <mesh position={[0, -TIBIA_LEN / 2, 0]}>
              <boxGeometry args={[0.035, TIBIA_LEN, 0.035]} />
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

    // Subtle body bob — moves slightly up/down with gait cycle
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(timeRef.current * 2) * 0.02 - 0.05
    }
  })

  return (
    <group rotation={[0, Math.PI * 0.18, 0]}>
      {/* Body */}
      <mesh ref={bodyRef}>
        <boxGeometry args={[1.1, 0.15, 0.58]} />
        <meshBasicMaterial color="#00ff88" wireframe />
      </mesh>

      {/* Legs */}
      {LEG_ANGLES.map((angle, i) => (
        <Leg
          key={i}
          angle={angle}
          phase={i % 2 === 0 ? 0 : Math.PI}
          time={timeRef}
        />
      ))}

      {/* Ground plane — faint grid reference */}
      <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4, 8, 8]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>
    </group>
  )
}

export default function GaitDemo() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0a', position: 'relative' }}>
      {/* Label */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 14,
          zIndex: 1,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: '#00ff88',
          opacity: 0.6,
        }}
      >
        TRIPOD GAIT · LIVE
      </div>

      {/* Dot indicator */}
      <div
        style={{
          position: 'absolute',
          top: 13,
          right: 14,
          zIndex: 1,
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#00ff88',
          animation: 'gaitPulse 1.4s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes gaitPulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>

      <Canvas
        camera={{ position: [2.2, 1.4, 2.8], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a0a' }}
      >
        <Robot />
      </Canvas>
    </div>
  )
}
