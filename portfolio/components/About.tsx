'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

const TIMELINE = [
  {
    year: 'Aug 2025 – Present',
    company: 'UW Orbital',
    role: 'Firmware Developer',
    desc: 'CubeSat firmware in C for ARM Cortex-R (TI RM46) within FreeRTOS. I2C/SPI sensor integration, priority-based scheduling.',
    tags: 'C · ARM Cortex-R · FreeRTOS · I2C · SPI',
  },
  {
    year: 'Jan 2026 – Apr 2026',
    company: 'RBC',
    role: 'Automation Analyst — Network Global Security SRE',
    desc: 'Automating device configuration and monitoring with Python scripts and Airflow DAGs. Developed data pipeline for device onboarding, increasing data reliability by 90–95%.',
    tags: 'Python · MongoDB · PostgreSQL · Airflow',
  },
  {
    year: 'May – Aug 2025',
    company: 'JTMCode',
    role: 'Backend Software Developer',
    desc: 'Enterprise platform (Java/MySQL/Redis) serving 150+ users. Optimized SQL queries by 40%, Redis caching for 2000+ PDFs.',
    tags: 'Java · SQL · Docker · Redis · GCP',
  },
  {
    year: 'Apr 2024 – Jul 2025',
    company: 'MechEd Robotics',
    role: 'Technical Lead',
    desc: 'Engineered Arduino-based robots with QTI sensors and H-bridge motor drivers. Created 20+ embedded exercises, directed team of 8.',
    tags: 'Arduino · Embedded · Robotics',
  },
]

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    gsap.fromTo('.about-left', { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
    })
    gsap.fromTo('.timeline-line', { scaleY: 0 }, {
      scaleY: 1, duration: 1.2, ease: 'power2.inOut', transformOrigin: 'top center',
      scrollTrigger: { trigger: '.timeline-col', start: 'top 72%' },
    })
    gsap.fromTo('.timeline-item', { opacity: 0, x: 16 }, {
      opacity: 1, x: 0, duration: 0.6, stagger: 0.16, ease: 'power2.out',
      scrollTrigger: { trigger: '.timeline-col', start: 'top 68%' },
    })
  }, [])

  return (
    <section ref={sectionRef} style={{
      padding: 'clamp(80px, 12vh, 130px) clamp(32px, 6vw, 96px)',
      borderTop: '1px solid var(--border)',
    }}>
      <style>{`
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(48px, 8vw, 120px); align-items: start; margin-bottom: clamp(60px, 8vh, 100px); }
        @media(max-width:768px){ .about-grid{ grid-template-columns:1fr!important; } }
        .about-left { opacity: 0; }
        .timeline-item { opacity: 0; }
      `}</style>

      <div className="about-grid">
        {/* Experience timeline */}
        <div className="timeline-col about-left">
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 28,
          }}>
            Experience
          </p>

          <div style={{ position: 'relative', paddingLeft: 22 }}>
            <div className="timeline-line" style={{
              position: 'absolute', left: 4, top: 8,
              width: 1, height: 'calc(100% - 16px)',
              background: 'var(--border)', transformOrigin: 'top center',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {TIMELINE.map((item) => (
                <div key={item.company} className="timeline-item" style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -18, top: 7,
                    width: 6, height: 6, borderRadius: '50%',
                    background: item.year.includes('Present') ? 'var(--accent)' : 'var(--border)',
                  }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
                    {item.year}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                    {item.company}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{item.role}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 6 }}>{item.desc}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555' }}>{item.tags}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Education + Focus */}
        <div className="about-left">
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 28,
          }}>
            Education
          </p>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
            University of Waterloo
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
            BASc in Computer Engineering
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#555', marginBottom: 6 }}>
            Sep 2025 – May 2030 · 87.4% (3.81/4.0)
          </p>

          <div style={{ marginTop: 40 }}>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
              color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 16,
            }}>
              Focus
            </p>
            <p style={{
              fontSize: 'clamp(14px, 1.4vw, 16px)', fontWeight: 300,
              lineHeight: 1.85, color: 'var(--muted)',
            }}>
              Bare-metal firmware, embedded systems, and robotics.
              From satellite flight computers to hexapod locomotion —
              register-level drivers, real-time scheduling, and
              hardware-software co-design.
            </p>
          </div>
        </div>
      </div>

    </section>
  )
}
