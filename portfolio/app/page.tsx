'use client'

import dynamic from 'next/dynamic'
import SkillsStrip from '@/components/SkillsStrip'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'
import { MeshModeProvider, useMeshMode } from '@/components/MeshModeContext'

// Three.js components — must be client-only, skip SSR
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })
const ArmSection = dynamic(() => import('@/components/ArmSection'), { ssr: false })

function MeshToggle() {
  const { meshMode, toggle } = useMeshMode()
  return (
    <button
      onClick={toggle}
      style={{
        position: 'fixed', bottom: 32, right: 40, zIndex: 200,
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: meshMode ? '#4488ff' : 'var(--muted)',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '6px 0',
        borderBottom: `1px solid ${meshMode ? '#4488ff' : 'var(--border)'}`,
        transition: 'color 0.25s, border-color 0.25s',
      }}
      onMouseEnter={(e) => {
        if (!meshMode) {
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.borderColor = 'var(--muted)'
        }
      }}
      onMouseLeave={(e) => {
        if (!meshMode) {
          e.currentTarget.style.color = 'var(--muted)'
          e.currentTarget.style.borderColor = 'var(--border)'
        }
      }}
    >
      {meshMode ? '[ solid ]' : '[ mesh ]'}
    </button>
  )
}

export default function Home() {
  return (
    <MeshModeProvider>
      <main>
        <Hero />
        <ArmSection />
        <SkillsStrip />
        <About />
        <Projects />
        <Contact />
      </main>
      <MeshToggle />
    </MeshModeProvider>
  )
}
