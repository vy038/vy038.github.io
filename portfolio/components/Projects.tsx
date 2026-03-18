'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import SimulatorModal from './SimulatorModal'

const PROJECTS = [
  {
    id: 'talos',
    label: 'TALOS HEXAPOD',
    description:
      'Scorpion-style hexapod with 6-DOF arm built on dual ESP32s. 13 SG90 servos, tripod gait algorithm, inverse kinematics solver, MPU6050 IMU, and OV2640 camera for color detection. Full firmware written in C on FreeRTOS.',
    tags: ['C', 'FreeRTOS', 'ESP-IDF', 'ESP32', 'Inverse Kinematics'],
    links: [
      { label: 'GitHub', href: 'https://github.com/vy038/Project_Talos' },
    ],
    hasSimulator: true,
    imagePrompt: 'TALOS_IMAGE',
  },
  {
    id: 'lightsim',
    label: 'LIGHTSIM',
    description:
      'Compiles unmodified Talos firmware C code natively on Linux via HAL stubs. Streams servo and IMU state to a Three.js visualization at 50Hz over WebSocket. Three modes: JTAG-style debug dashboard, 2D gait view, and 3D procedural renderer.',
    tags: ['C', 'Node.js', 'Three.js', 'WebSocket', 'CMake'],
    links: [
      { label: 'GitHub', href: 'https://github.com/vy038/Project_Talos' },
    ],
    hasSimulator: false,
    imagePrompt: 'LIGHTSIM_IMAGE',
  },
  {
    id: 'orbital',
    label: 'UW ORBITAL',
    description:
      'Bare-metal firmware for a student CubeSat. Built CC1120 radio driver from scratch, interfacing directly with TI Hercules RM46 registers. Replaced HALCoGen-generated code with direct register access for deterministic timing.',
    tags: ['C', 'ARM Cortex-R', 'TI RM46', 'CC1120', 'HALCoGen'],
    links: [],
    hasSimulator: false,
    imagePrompt: 'ORBITAL_IMAGE',
  },
  {
    id: 'pulse',
    label: 'PULSE',
    description:
      'Internal network security automation tooling built at RBC. Pipeline orchestration and automated analysis workflows for network security operations.',
    tags: ['Python', 'Apache Airflow', 'Docker'],
    links: [],
    hasSimulator: false,
    imagePrompt: 'PULSE_IMAGE',
  },
]

function ProjectCard({
  project,
  index,
  onOpenSimulator,
}: {
  project: (typeof PROJECTS)[0]
  index: number
  onOpenSimulator: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isEven = index % 2 === 0

  useEffect(() => {
    if (!cardRef.current) return

    const imageEl = cardRef.current.querySelector('.proj-image')
    const textEl = cardRef.current.querySelector('.proj-text')

    gsap.fromTo(
      imageEl,
      { opacity: 0, x: isEven ? -40 : 40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 78%' },
      }
    )
    gsap.fromTo(
      textEl,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: cardRef.current, start: 'top 78%' },
      }
    )
  }, [isEven])

  return (
    <div
      ref={cardRef}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(40px, 6vw, 80px)',
        padding: 'clamp(60px, 10vh, 100px) clamp(32px, 6vw, 96px)',
        borderBottom: '1px solid var(--border)',
        direction: isEven ? 'ltr' : 'rtl',
        alignItems: 'center',
      }}
      className="proj-card"
    >
      <style>{`
        @media (max-width: 768px) {
          .proj-card { grid-template-columns: 1fr !important; direction: ltr !important; }
        }
      `}</style>

      {/* Image placeholder */}
      <div
        className="proj-image"
        style={{
          direction: 'ltr',
          aspectRatio: '16/10',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#333',
            letterSpacing: '0.1em',
          }}
        >
          [{project.imagePrompt}]
        </span>
      </div>

      {/* Text */}
      <div className="proj-text" style={{ direction: 'ltr' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.16em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          0{index + 1}
        </p>
        <h2
          style={{
            fontSize: 'clamp(22px, 2.8vw, 36px)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            marginBottom: 20,
            color: 'var(--text)',
          }}
        >
          {project.label}
        </h2>
        <p
          style={{
            fontSize: 'clamp(13px, 1.3vw, 15px)',
            lineHeight: 1.8,
            color: 'var(--muted)',
            marginBottom: 24,
            fontWeight: 300,
          }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 0',
            marginBottom: 28,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#444',
            letterSpacing: '0.06em',
          }}
        >
          {project.tags.map((tag, i) => (
            <span key={tag}>
              {tag}
              {i < project.tags.length - 1 && (
                <span style={{ margin: '0 10px', color: 'var(--border)' }}>·</span>
              )}
            </span>
          ))}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {project.hasSimulator && (
            <button
              onClick={onOpenSimulator}
              style={{
                background: 'none',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                padding: '9px 20px',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent)'
                e.currentTarget.style.color = '#000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = 'var(--accent)'
              }}
            >
              OPEN SIMULATOR →
            </button>
          )}
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--muted)',
                padding: '9px 0',
                borderBottom: '1px solid var(--border)',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text)'
                e.currentTarget.style.borderColor = 'var(--muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const [simOpen, setSimOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
      }
    )
  }, [])

  return (
    <>
      <section style={{ borderTop: '1px solid var(--border)' }}>
        {/* Section header */}
        <div
          ref={headerRef}
          style={{
            padding: 'clamp(60px, 8vh, 80px) clamp(32px, 6vw, 96px) 0',
            opacity: 0,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.16em',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Work
          </p>
          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 300,
              letterSpacing: '-0.02em',
              color: 'var(--text)',
            }}
          >
            Projects
          </h2>
        </div>

        {PROJECTS.map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onOpenSimulator={() => setSimOpen(true)}
          />
        ))}
      </section>

      {simOpen && <SimulatorModal onClose={() => setSimOpen(false)} />}
    </>
  )
}
