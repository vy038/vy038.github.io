'use client'

import { useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function Model() {
  const { scene: raw } = useGLTF('/models/talos.glb')
  const scene = useMemo(() => raw.clone(true), [raw])

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) scene.scale.setScalar(3.5 / maxDim)
    box.setFromObject(scene)
    scene.position.sub(box.getCenter(new THREE.Vector3()))

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x1a1a1a, metalness: 0.8, roughness: 0.28,
        })
      }
    })
  }, [scene])

  return <primitive object={scene} />
}

export default function ModelViewer() {
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
        camera={{ position: [0, 1.2, 5], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#080808' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 7, 4]} intensity={1.8} />
        <pointLight position={[-3, 2, -3]} intensity={0.5} color="#6688ff" />
        <pointLight position={[2, -2, 2]} intensity={0.3} color="#ff8844" />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.2}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.72}
        />
      </Canvas>
    </div>
  )
}
