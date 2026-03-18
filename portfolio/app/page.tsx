import Hero from '@/components/Hero'
import SkillsStrip from '@/components/SkillsStrip'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Contact from '@/components/Contact'

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
