'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MeshModeCtx { meshMode: boolean; toggle: () => void }
const MeshModeContext = createContext<MeshModeCtx>({ meshMode: false, toggle: () => {} })

export function MeshModeProvider({ children }: { children: ReactNode }) {
  const [meshMode, setMeshMode] = useState(false)
  return (
    <MeshModeContext.Provider value={{ meshMode, toggle: () => setMeshMode(m => !m) }}>
      {children}
    </MeshModeContext.Provider>
  )
}

export function useMeshMode() { return useContext(MeshModeContext) }
