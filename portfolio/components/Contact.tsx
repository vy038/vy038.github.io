'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

export default function Contact() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current.querySelectorAll('.contact-el'),
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.14,
        ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    letterSpacing: '0.08em',
    color: 'var(--muted)',
    transition: 'color 0.2s',
  }

  return (
    <section
      ref={ref}
      style={{
        padding: 'clamp(100px, 16vh, 160px) clamp(32px, 6vw, 96px)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
      }}
    >
      <p
        className="contact-el"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.16em',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          marginBottom: 20,
          opacity: 0,
        }}
      >
        Contact
      </p>

      <h2
        className="contact-el"
        style={{
          fontSize: 'clamp(40px, 6vw, 80px)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 48,
          opacity: 0,
        }}
      >
        Connect with me.
      </h2>

      <a
        className="contact-el"
        href="mailto:victoryu038@gmail.com"
        style={{
          display: 'inline-block',
          fontSize: 'clamp(15px, 1.8vw, 20px)',
          color: 'var(--text)',
          marginBottom: 40,
          opacity: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
      >
        victoryu038@gmail.com
      </a>

      <div
        className="contact-el"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          opacity: 0,
        }}
      >
        {[
          { label: 'GitHub', href: 'https://github.com/vy038' },
          { label: 'LinkedIn', href: 'https://linkedin.com/in/victoryu038' },
          { label: 'Resume', href: '/VictorYu_Resume.pdf' },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {link.label} ↗
          </a>
        ))}
      </div>

      <p
        className="contact-el"
        style={{
          marginTop: 80,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: '#2a2a2a',
          letterSpacing: '0.08em',
          opacity: 0,
        }}
      >
        Victor Yu · {new Date().getFullYear()}
      </p>
    </section>
  )
}
