'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

const SKILLS = [
  'Bare-metal C', 'C++', 'ARM Cortex-R', 'ESP32', 'FreeRTOS',
  'I2C', 'SPI', 'UART', 'PWM',
  'Python', 'Java', 'Docker', 'Git', 'Linux',
]

export default function SkillsStrip() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.skill-item'), { opacity: 0, y: 10 }, {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: ref.current, start: 'top 90%' },
    })
  }, [])

  return (
    <div ref={ref} style={{
      borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '18px clamp(32px, 6vw, 96px)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0',
    }}>
      {SKILLS.map((skill, i) => (
        <span key={skill} className="skill-item" style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em',
          color: 'var(--muted)', opacity: 0,
        }}>
          {skill}
          {i < SKILLS.length - 1 && (
            <span style={{ margin: '0 16px', color: 'var(--border)' }}>·</span>
          )}
        </span>
      ))}
    </div>
  )
}
