'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const SKILLS = [
  'C / C++',
  'Python',
  'ARM Cortex',
  'FreeRTOS',
  'ESP-IDF',
  'Three.js',
  'Linux',
  'Git',
  'Docker',
]

export default function SkillsStrip() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current.querySelectorAll('span'),
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 88%',
        },
      }
    )
  }, [])

  return (
    <div
      ref={ref}
      style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        padding: '20px clamp(32px, 6vw, 96px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0 0',
        alignItems: 'center',
      }}
    >
      {SKILLS.map((skill, i) => (
        <span
          key={skill}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.06em',
            color: 'var(--muted)',
            opacity: 0,
          }}
        >
          {skill}
          {i < SKILLS.length - 1 && (
            <span style={{ margin: '0 18px', color: 'var(--border)', opacity: 1 }}>·</span>
          )}
        </span>
      ))}
    </div>
  )
}
