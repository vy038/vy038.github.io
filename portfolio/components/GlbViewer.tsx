'use client'

import { useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function applyMeshMaterial(scene: THREE.Object3D, meshMode: boolean) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const mat = child.material instanceof THREE.MeshStandardMaterial
        ? child.material
        : (() => { const m = new THREE.MeshStandardMaterial(); child.material = m; return m })()
      if (meshMode) {
        mat.wireframe = true; mat.color.set(0xffffff)
        mat.emissive.set(0x000000); mat.emissiveIntensity = 0
        mat.metalness = 0; mat.roughness = 1
      } else {
        mat.wireframe = false; mat.color.set(0xc0c0c0)
        mat.emissive.set(0x000000); mat.emissiveIntensity = 0
        mat.metalness = 0.15; mat.roughness = 0.8
      }
      mat.needsUpdate = true
    }
  })
}

function Model({ src, units, meshMode }: { src: string; units: number; meshMode: boolean }) {
  const { scene: raw } = useGLTF(src)

  const { scene, offset } = useMemo(() => {
    const scene = raw.clone(true)
    scene.position.set(0, 0, 0)
    scene.scale.set(1, 1, 1)
    scene.updateMatrixWorld(true)
    const box1 = new THREE.Box3().setFromObject(scene)
    const size = box1.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0) scene.scale.setScalar(units / maxDim)
    scene.updateMatrixWorld(true)
    const box2 = new THREE.Box3().setFromObject(scene)
    const center = box2.getCenter(new THREE.Vector3())
    // Replace ALL materials immediately so first render has no GLB color flash
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, metalness: 0, roughness: 1 })
      }
    })
    return { scene, offset: new THREE.Vector3(-center.x, -center.y, -center.z) }
  }, [raw, units])

  // Reactively apply mesh/solid mode without re-cloning
  useEffect(() => { applyMeshMaterial(scene, meshMode) }, [scene, meshMode])

  return (
    <group position={offset}>
      <primitive object={scene} />
    </group>
  )
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
  units = 4.5,
  cameraZ = 3.8,
  cameraY = 0.5,
  fov = 52,
  autoRotateSpeed = 1.4,
}: GlbViewerProps) {
  const [meshMode, setMeshMode] = useState(true)  // default: wireframe

  return (
    <div style={{ width: '100%', height: '100%', background: '#080808', position: 'relative' }}>

      {/* Toggle button — top right of viewer */}
      <button
        onClick={() => setMeshMode(m => !m)}
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
          textTransform: 'uppercase', background: 'none', border: 'none',
          cursor: 'pointer', padding: '10px 12px',
          color: meshMode ? '#aaaaaa' : '#444',
          borderBottom: `1px solid ${meshMode ? '#444' : '#222'}`,
          transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff'
          e.currentTarget.style.borderBottomColor = '#888'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = meshMode ? '#aaaaaa' : '#444'
          e.currentTarget.style.borderBottomColor = meshMode ? '#444' : '#222'
        }}
      >
        {meshMode ? '[ solid ]' : '[ mesh ]'}
      </button>

      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
        color: '#333', textTransform: 'uppercase', whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        Drag to rotate
      </div>

      <Canvas
        camera={{ position: [0, cameraY, cameraZ], fov }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#080808' }}
      >
        {meshMode ? (
          <>
            <ambientLight intensity={1.0} />
          </>
        ) : (
          <>
            <ambientLight intensity={1.2} />
            <directionalLight position={[3, 5, 4]} intensity={1.8} />
            <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#5577ff" />
            <directionalLight position={[0, -3, 4]} intensity={0.8} color="#ffddaa" />
          </>
        )}
        <Suspense fallback={null}>
          <Model src={src} units={units} meshMode={meshMode} />
        </Suspense>
        <OrbitControls
          target={[0, 0, 0]}
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={autoRotateSpeed}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
    </div>
  )
}
