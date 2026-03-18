'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

const TIMELINE = [
  {
    year: 'May – Aug 2025',
    company: 'JTMCode',
    role: 'Backend Software Developer',
    tags: 'Java · SQL · Docker · Redis',
    current: false,
  },
  {
    year: 'Apr 2024 – Jul 2025',
    company: 'MechEd Robotics',
    role: 'Lead Engineering Instructor',
    tags: 'Robotics · Embedded Systems',
    current: false,
  },
  {
    year: 'Sep 2023 – Jan 2024',
    company: 'New Tech Navi Wireless',
    role: 'Computer Service Technician',
    tags: 'Hardware · Customer Service',
    current: false,
  },
]

const AWARDS = [
  { name: 'FraserHacks', detail: 'Most Technical Hack', year: '2024' },
  { name: 'CETA Team Robotics', detail: 'Second Place', year: '2024' },
  { name: 'Peel Skills Electronics', detail: 'Third Place', year: '2024' },
  { name: 'Sir Isaac Newton Physics', detail: 'Top 500 in Canada', year: '2025' },
  { name: 'Avogadro Chemistry', detail: 'Top 250 in Canada', year: '2024' },
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
    gsap.fromTo('.award-item', { opacity: 0, y: 12 }, {
      opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.awards-col', start: 'top 80%' },
    })
  }, [])

  return (
    <section ref={sectionRef} style={{
      padding: 'clamp(80px, 12vh, 130px) clamp(32px, 6vw, 96px)',
      borderTop: '1px solid var(--border)',
    }}>
      <style>{`
        .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(48px, 8vw, 120px); align-items: start; margin-bottom: clamp(60px, 8vh, 100px); }
        .awards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1px; background: var(--border); }
        @media(max-width:768px){ .about-grid{ grid-template-columns:1fr!important; } }
      `}</style>

      <div className="about-grid">
        {/* Experience timeline */}
        <div className="timeline-col about-left" style={{ opacity: 0 }}>
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
                <div key={item.company} className="timeline-item" style={{ position: 'relative', opacity: 0 }}>
                  <div style={{
                    position: 'absolute', left: -18, top: 7,
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--border)',
                  }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
                    {item.year}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>
                    {item.company}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{item.role}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3a3a3a' }}>{item.tags}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About placeholder */}
        <div className="about-left" style={{ opacity: 0 }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
            color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 28,
          }}>
            About
          </p>
          <p style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)', fontWeight: 300,
            lineHeight: 1.85, color: 'var(--muted)',
            fontStyle: 'italic',
          }}>
            [Bio coming soon]
          </p>
        </div>
      </div>

      {/* Awards */}
      <div className="awards-col">
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
          color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 20,
        }}>
          Awards
        </p>
        <div className="awards-grid" style={{ border: '1px solid var(--border)' }}>
          {AWARDS.map((a) => (
            <div key={a.name} className="award-item" style={{
              background: 'var(--surface)', padding: '20px 24px', opacity: 0,
            }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{a.name}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>{a.detail}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#333' }}>{a.year}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
