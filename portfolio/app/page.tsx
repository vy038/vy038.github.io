'use client'

import dynamic from 'next/dynamic'
import SkillsStrip from '@/components/SkillsStrip'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'

// Three.js components — must be client-only, skip SSR
// Loading placeholder holds the space so below-fold sections don't flash to top
const Hero = dynamic(() => import('@/components/Hero'), {
  ssr: false,
  loading: () => <div style={{ height: '700vh', background: '#080808' }} />,
})

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
