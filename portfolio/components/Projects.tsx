'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import dynamic from 'next/dynamic'

const GlbViewer = dynamic(() => import('./GlbViewer'), { ssr: false })

const PROJECTS = [
  {
    id: 'talos',
    label: 'TALOS HEXAPOD',
    description:
      'Scorpion-style hexapod running FreeRTOS tasks on dual ESP32s — tripod gait, 3-DOF arm IK, ESP32-CAM vision, VL53L0X ToF ranging, MPU6050 balance, current sensing watchdog, and state machine. 16 servos via dual PCA9685 (I2C) with IMU tilt compensation. (Work in progress, see repo)',
    tags: ['C', 'FreeRTOS', 'ESP32', 'I2C', 'IK Solver', 'VL53L0X', 'MPU6050'],
    links: [{ label: 'GitHub', href: 'https://github.com/vy038/Project_Talos' }],
    media: 'glb' as const,
    glbSrc: '/models/talos.glb',
    glbUnits: 3.8,
    glbCameraZ: 5.0,
  },
  {
    id: 'delirium',
    label: 'PATIENT MONITORING SYSTEM',
    description:
      'ESP32-based IoT health monitor with custom bit-banged SPI in C — GPIO polling, MSB-first reads, clock edge sampling, and timeout handling. GPIO/ADC peripheral libraries with 12-bit analog conversion. Inter-ESP32 SPI communication debugged via oscilloscope waveform analysis to resolve clock timing violations. Real-time delirium risk metrics streamed to IoT dashboard.',
    tags: ['C', 'ESP32', 'Custom SPI', 'MPU6050', 'FreeRTOS', 'IoT'],
    links: [],
    media: 'image' as const,
    imagePrompt: 'PATIENT_MONITORING_IMAGE',
  },
  {
    id: 'pongbot',
    label: 'PONG BOT',
    description:
      '4-motor omni-directional platform with IR edge detection and HC-SR04 ultrasonic obstacle avoidance using interrupt-driven sensing. ESP-NOW for autonomous/manual mode switching. Dual-rail power system (5V/12V) with Li-ion batteries. Zero table falls across 50+ test runs.',
    tags: ['C++', 'ESP32', 'PWM', 'ESP-NOW', 'IR', 'Ultrasonic'],
    links: [{ label: 'GitHub', href: 'https://github.com/vy038/pong_bot' }],
    media: 'glb' as const,
    glbSrc: '/models/pong-bot.glb',
    glbUnits: 3.5,
    glbCameraZ: 5.5,
  },
  {
    id: 'console',
    label: 'CUSTOM GAME CONSOLE',
    description:
      'Handheld retro-style gaming console running custom games including Pong and Galaga. Built on ESP32 with optimized graphics and input handling for low-resource hardware. Full CAD enclosure design.',
    tags: ['C++', 'ESP32', 'CAD', 'Embedded Systems', 'Display Drivers'],
    links: [{ label: 'GitHub', href: 'https://github.com/vy038/esp_games' }],
    media: 'glb' as const,
    glbSrc: '/models/game-console.glb',
    glbUnits: 3.5,
    glbCameraZ: 5.5,
  },
]

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isEven = index % 2 === 0

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current.querySelector('.proj-img'), { opacity: 0, x: isEven ? -44 : 44 }, {
      opacity: 1, x: 0, duration: 0.9, ease: 'power2.out',
      scrollTrigger: { trigger: cardRef.current, start: 'top 80%' },
    })
    gsap.fromTo(cardRef.current.querySelector('.proj-txt'), { opacity: 0, y: 28 }, {
      opacity: 1, y: 0, duration: 0.8, delay: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: cardRef.current, start: 'top 80%' },
    })
  }, [isEven])

  return (
    <div ref={cardRef} className="proj-card" style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(40px, 6vw, 80px)',
      padding: 'clamp(60px, 10vh, 96px) clamp(32px, 6vw, 96px)',
      borderBottom: '1px solid var(--border)',
      direction: isEven ? 'ltr' : 'rtl', alignItems: 'center',
    }}>
      <style>{`.proj-card{} @media(max-width:768px){.proj-card{grid-template-columns:1fr!important;direction:ltr!important}}`}</style>

      {/* Media */}
      <div className="proj-img" style={{
        direction: 'ltr', aspectRatio: '16/10',
        background: 'var(--surface)', border: '1px solid var(--border)',
        overflow: 'hidden', position: 'relative',
      }}>
        {project.media === 'glb' ? (
          <GlbViewer
            src={(project as { glbSrc: string }).glbSrc}
            units={(project as { glbUnits?: number }).glbUnits}
            cameraZ={(project as { glbCameraZ?: number }).glbCameraZ}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#222', letterSpacing: '0.1em' }}>
              [{(project as { imagePrompt?: string }).imagePrompt}]
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="proj-txt" style={{ direction: 'ltr' }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
          color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12,
        }}>
          0{index + 1}
        </p>
        <h2 style={{
          fontSize: 'clamp(22px, 2.8vw, 36px)', fontWeight: 300,
          letterSpacing: '-0.01em', marginBottom: 16, color: 'var(--text)',
        }}>
          {project.label}
        </h2>

        <p style={{
          fontSize: 'clamp(13px, 1.3vw, 15px)', lineHeight: 1.85,
          color: 'var(--muted)', marginBottom: 22, fontWeight: 300,
        }}>
          {project.description}
        </p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px 0', marginBottom: 24,
          fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3a3a3a', letterSpacing: '0.05em',
        }}>
          {project.tags.map((tag, i) => (
            <span key={tag}>
              {tag}
              {i < project.tags.length - 1 && <span style={{ margin: '0 10px', color: 'var(--border)' }}>·</span>}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {project.links.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
                color: 'var(--muted)', padding: '8px 0', borderBottom: '1px solid var(--border)',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--muted)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
              {link.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return
    gsap.fromTo(headerRef.current, { opacity: 0, y: 20 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
    })
  }, [])

  return (
    <section style={{ borderTop: '1px solid var(--border)' }}>
      <div ref={headerRef} style={{
        padding: 'clamp(60px, 8vh, 80px) clamp(32px, 6vw, 96px) 0', opacity: 0,
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
          color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12,
        }}>
          Work
        </p>
        <h2 style={{
          fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300,
          letterSpacing: '-0.02em', color: 'var(--text)',
        }}>
          Notable Projects
        </h2>
      </div>

      {PROJECTS.map((project, i) => (
        <ProjectCard key={project.id} project={project} index={i} />
      ))}
    </section>
  )
}
