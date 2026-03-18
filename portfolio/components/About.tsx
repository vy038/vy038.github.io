'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const TIMELINE = [
  {
    year: '2026',
    company: 'RBC',
    role: 'Network Security Automation Analyst',
    tags: 'Python · Airflow · Docker',
    current: true,
  },
  {
    year: '2025',
    company: 'UW Orbital',
    role: 'Firmware Developer',
    tags: 'ARM Cortex-R · TI RM46 · CC1120',
    current: true,
  },
  {
    year: '2024',
    company: 'MechEd Robotics',
    role: 'Robotics Instructor',
    tags: 'Robotics · Embedded Systems',
    current: false,
  },
]

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGLineElement>(null)
  const itemsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!sectionRef.current) return

    // Fade in bio text
    gsap.fromTo(
      sectionRef.current.querySelector('.bio-text'),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      }
    )

    // Animate timeline line drawing down
    gsap.fromTo(
      '.timeline-line',
      { scaleY: 0 },
      {
        scaleY: 1,
        duration: 1.2,
        ease: 'power2.inOut',
        transformOrigin: 'top center',
        scrollTrigger: { trigger: '.timeline-col', start: 'top 72%' },
      }
    )

    // Stagger timeline items
    gsap.fromTo(
      '.timeline-item',
      { opacity: 0, x: 16 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.18,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.timeline-col', start: 'top 68%' },
      }
    )
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vh, 140px) clamp(32px, 6vw, 96px)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(48px, 8vw, 120px)',
        alignItems: 'start',
      }}
      className="about-section"
    >
      <style>{`
        @media (max-width: 768px) {
          .about-section { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Bio */}
      <div className="bio-text" style={{ opacity: 0 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          About
        </p>
        <p
          style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            fontWeight: 300,
            lineHeight: 1.8,
            color: 'var(--text)',
            marginBottom: 20,
          }}
        >
          I build software that runs at the edge — firmware for robots, satellite systems, and
          anything that talks to hardware directly.
        </p>
        <p
          style={{
            fontSize: 'clamp(14px, 1.4vw, 16px)',
            fontWeight: 300,
            lineHeight: 1.8,
            color: 'var(--muted)',
          }}
        >
          Currently studying Computer Engineering at the University of Waterloo and building
          Project Talos, a scorpion-style hexapod with a 6-DOF arm. When I&apos;m not deep in
          register maps and interrupt handlers, I&apos;m building the simulation tools to test
          the firmware I just wrote.
        </p>
      </div>

      {/* Timeline */}
      <div className="timeline-col" style={{ position: 'relative', paddingLeft: 28 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          Experience
        </p>

        {/* Vertical line */}
        <div
          className="timeline-line"
          style={{
            position: 'absolute',
            left: 6,
            top: 52,
            width: 1,
            height: 'calc(100% - 52px)',
            background: 'var(--border)',
            transformOrigin: 'top center',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {TIMELINE.map((item) => (
            <div
              key={item.company}
              className="timeline-item"
              style={{ position: 'relative', opacity: 0 }}
            >
              {/* Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: -22,
                  top: 6,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: item.current ? 'var(--accent)' : 'var(--border)',
                  boxShadow: item.current ? '0 0 8px rgba(0,255,136,0.4)' : 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 4 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--muted)',
                  }}
                >
                  {item.year}
                </span>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
                  {item.company}
                </span>
                {item.current && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: 'var(--accent)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    NOW
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{item.role}</p>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#444',
                  letterSpacing: '0.04em',
                }}
              >
                {item.tags}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
