'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Generates a studio-like environment map at runtime using Three.js PMREMGenerator.
 * No async file loading, no Suspense — available on the very first render frame.
 * Makes metallic materials (metalness > 0.5) actually reflect something instead of
 * rendering as black void.
 */
export default function StudioEnv({ intensity = 0.7 }: { intensity?: number }) {
  const { gl, scene } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const envScene = new RoomEnvironment()
    const envMap = pmrem.fromScene(envScene, 0.04).texture
    envMap.colorSpace = THREE.SRGBColorSpace

    scene.environment = envMap
    scene.environmentIntensity = intensity

    return () => {
      envMap.dispose()
      pmrem.dispose()
      scene.environment = null
    }
  }, [gl, scene, intensity])

  return null
}
