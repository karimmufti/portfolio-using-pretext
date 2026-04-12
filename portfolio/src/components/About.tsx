import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const BG_WORD = 'BUILD '
const CHAR_W = 58
const CHAR_H = 36
const MOUSE_INF_R = 140  // radius within which mouse pushes chars

interface Particle { x: number; y: number; bx: number; by: number; ch: string }

export default function About() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let particles: Particle[] = []

    const buildGrid = () => {
      const cols = Math.ceil(canvas.width / CHAR_W) + 2
      const rows = Math.ceil(canvas.height / CHAR_H) + 2
      particles = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = c * CHAR_W - CHAR_W / 2
          const by = r * CHAR_H - CHAR_H / 2
          const ch = BG_WORD[(c + r * (cols + 1)) % BG_WORD.length]
          particles.push({ x: bx, y: by, bx, by, ch })
        }
      }
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      buildGrid()
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      ctx.font = '11px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (const p of particles) {
        // Mouse is the obstacle — push chars away from cursor
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < MOUSE_INF_R && dist > 0.5) {
          const push = Math.pow((MOUSE_INF_R - dist) / MOUSE_INF_R, 1.5) * 22
          p.x += (dx / dist) * push * 0.3
          p.y += (dy / dist) * push * 0.3
        }

        // Spring back to grid position
        p.x += (p.bx - p.x) * 0.06
        p.y += (p.by - p.y) * 0.06

        // Brighter near mouse
        const nearness = Math.max(0, 1 - dist / MOUSE_INF_R)
        ctx.globalAlpha = 0.14 + nearness * 0.48
        ctx.fillStyle = '#ffffff'
        ctx.fillText(p.ch, p.x, p.y)
      }
      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(draw)
    }
    draw()

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    const section = sectionRef.current
    window.addEventListener('mousemove', onMove)
    section?.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      section?.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg mx-auto px-6 sm:px-8 py-20"
      >
        <div
          className="relative rounded-2xl px-10 py-10"
          style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}
        >
        {/* UIC logo */}
        <div className="mb-8 flex justify-center">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="50" fill="white" />
            <text
              x="50" y="50"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#0a0a0a"
              fontSize="36"
              fontWeight="800"
              fontFamily="Arial, sans-serif"
              letterSpacing="2"
            >UIC</text>
          </svg>
        </div>

        {/* Opener */}
        <h2
          className="text-white mb-8 leading-tight"
          style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 300, letterSpacing: '-0.01em' }}
        >
          Hey, I'm Kareem.
        </h2>

        {/* Letter paragraphs */}
        <div className="flex flex-col gap-5" style={{ color: 'rgba(255,255,255,0.62)', lineHeight: '1.75' }}>
          <p>
            I build things, watch them break, fix them, then repeat.
          </p>
          <p>
            I'm a CS student at UIC graduating May&nbsp;2027, with a habit of
            building things most students haven't heard of yet.
          </p>
          <p>
            I specialize in distributed systems, Full Stack Development, and
            learning new things everyday.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.38)' }}>
            Let's talk.
          </p>
        </div>

        {/* Footer: name + signature */}
        <div className="mt-12 flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-white/80 text-sm" style={{ fontWeight: 300 }}>Kareem Muftee</span>
            <a
              href="https://github.com/karimmufti"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-white/35 hover:text-white/70 transition-colors duration-200"
              style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}
            >
              @karimmufti
            </a>
          </div>

          {/* Signature — aligned with name */}
          <img
            src="/Muftee-signature.svg"
            alt="Kareem Muftee signature"
            style={{ height: '44px', opacity: 0.8 }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </div>

        </div>
      </motion.div>

      {/* Scroll indicator - fixed at bottom, hides on scroll */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 transition-opacity duration-500"
        style={{ opacity: scrolled ? 0 : 0.9, pointerEvents: 'none' }}
      >
        <span className="font-mono text-white/70" style={{ fontSize: '0.75rem', letterSpacing: '0.15em' }}>
          scroll
        </span>
        <svg width="18" height="12" viewBox="0 0 12 8" fill="none" className="animate-bounce">
          <path d="M1 1L6 6L11 1" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}
