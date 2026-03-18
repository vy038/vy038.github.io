'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface Props {
  onClose: () => void
}

export default function SimulatorModal({ onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.fromTo(contentRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power2.out' })

    // ESC to close
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [])

  function close() {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: onClose,
    })
  }

  const simulatorUrl = process.env.NEXT_PUBLIC_SIMULATOR_URL

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(8,8,8,0.96)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close() }}
    >
      {/* Header bar */}
      <div
        style={{
          height: 52,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: simulatorUrl ? 'var(--accent)' : '#444',
              boxShadow: simulatorUrl ? '0 0 8px rgba(0,255,136,0.5)' : 'none',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.1em',
              color: 'var(--muted)',
            }}
          >
            TALOS SIMULATOR
          </span>
        </div>
        <button
          onClick={close}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
            fontSize: 20,
            lineHeight: 1,
            padding: '4px 8px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflow: 'hidden' }}>
        {simulatorUrl ? (
          <iframe
            src={simulatorUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="fullscreen"
            title="Talos Simulator"
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              color: 'var(--muted)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em' }}>
              SIMULATOR OFFLINE
            </p>
            <p style={{ fontSize: 13, maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
              The live simulator requires a backend server. Set{' '}
              <code
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent)',
                  fontSize: 11,
                }}
              >
                NEXT_PUBLIC_SIMULATOR_URL
              </code>{' '}
              to enable it.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
