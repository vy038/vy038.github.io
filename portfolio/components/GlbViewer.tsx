'use client'

import { useEffect, useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Model({ src, units }: { src: string; units: number }) {
  const { scene: raw } = useGLTF(src)
  const scene = useMemo(() => raw.clone(true), [raw])

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) scene.scale.setScalar(units / maxDim)
    box.setFromObject(scene)
    scene.position.sub(box.getCenter(new THREE.Vector3()))

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x1a1a1a, metalness: 0.8, roughness: 0.28,
        })
      }
    })
  }, [scene, units])

  return <primitive object={scene} />
}

interface GlbViewerProps {
  src: string
  units?: number
  cameraZ?: number
  cameraY?: number
  fov?: number
  autoRotateSpeed?: number
}

export default function GlbViewer({
  src,
  units = 3.5,
  cameraZ = 5,
  cameraY = 1,
  fov = 44,
  autoRotateSpeed = 1.4,
}: GlbViewerProps) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#080808', position: 'relative' }}>
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
        color: '#333', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        Drag to rotate
      </div>
      <Canvas
        camera={{ position: [0, cameraY, cameraZ], fov }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#080808' }}
      >
        {/* Low ambient — keep it dark and contrasty */}
        <ambientLight intensity={0.08} />
        {/* Strong warm key from top-front */}
        <directionalLight position={[3, 6, 5]} intensity={3.2} color="#fff8f0" />
        {/* Cool blue rim from rear-left */}
        <directionalLight position={[-5, 2, -4]} intensity={1.8} color="#3355ff" />
        {/* Subtle orange kicker from bottom-front-right */}
        <pointLight position={[4, -3, 3]} intensity={1.2} color="#ff6622" />
        {/* Soft fill from above-left */}
        <pointLight position={[-2, 5, 2]} intensity={0.5} color="#99bbff" />
        <Suspense fallback={null}>
          <Model src={src} units={units} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={autoRotateSpeed}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
    </div>
  )
}
