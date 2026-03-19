'use client'

import dynamic from 'next/dynamic'
import SkillsStrip from '@/components/SkillsStrip'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'

// Three.js components — must be client-only, skip SSR
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false })

export default function Home() {
  return (
    <main>
      <Hero />
      <SkillsStrip />
      <About />
      <Projects />
      <Contact />
    </main>
  )
}
