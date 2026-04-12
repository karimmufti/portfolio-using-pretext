import { useRef, useEffect, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const SPHERE_SKILLS = [
  'React', 'TypeScript', 'Go', 'Python', 'Kafka',
  'CUDA', 'Redis', 'C++', 'PostgreSQL', 'Docker',
  'Node.js', 'Supabase', 'WebSockets', 'Linux', 'SQL',
  'Three.js', 'Vite', 'Tailwind', 'GLSL', 'AWS',
]
const DEFAULT_PTS = 150

type Vec3 = [number, number, number]

function fibSphere(n: number): Vec3[] {
  const pts: Vec3[] = []
  const phi = (1 + Math.sqrt(5)) / 2
  for (let i = 0; i < n; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / n)
    const lam = (2 * Math.PI * i) / phi
    pts.push([
      Math.sin(theta) * Math.cos(lam),
      Math.sin(theta) * Math.sin(lam),
      Math.cos(theta),
    ])
  }
  return pts
}

// Standard right-hand Y rotation: dragging right increases rY, front face moves right
function rotY([x, y, z]: Vec3, a: number): Vec3 {
  return [x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a)]
}

function rotX([x, y, z]: Vec3, a: number): Vec3 {
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
}

interface ExplodeParticle { x: number; y: number; vx: number; vy: number; ch: string; depth: number }

interface SphereState {
  rX: number; rY: number; vX: number; vY: number
  dragging: boolean; lastX: number; lastY: number; raf: number
  exploding: boolean; explodeT: number; explodePts: ExplodeParticle[]
}

const FONT_CACHE = Array.from({ length: 8 }, (_, i) => `${7 + i}px 'JetBrains Mono', monospace`)
const FONT_CACHE_MOBILE = Array.from({ length: 3 }, (_, i) => `${5 + i}px 'JetBrains Mono', monospace`)

const SPHERE_TOP_PCT = 57

interface Props { onEnter: () => void }

export default function Hero({ onEnter }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(wrapRef, { once: true })
  const [numPts, setNumPts] = useState(DEFAULT_PTS)
  const [btnVisible, setBtnVisible] = useState(true)
  const pts = useRef<Vec3[]>(fibSphere(DEFAULT_PTS))
  const edges = useRef<[number, number][]>([])
  const state = useRef<SphereState>({
    rX: 0.3, rY: 0, vX: 0, vY: 0.004,
    dragging: false, lastX: 0, lastY: 0, raf: 0,
    exploding: false, explodeT: 0, explodePts: [],
  })

  const buildEdges = (p: Vec3[], K = 6) => {
    const result: [number, number][] = []
    const seen = new Set<string>()
    for (let i = 0; i < p.length; i++) {
      const dists: { j: number; d: number }[] = []
      for (let j = 0; j < p.length; j++) {
        if (j === i) continue
        const dx = p[i][0]-p[j][0], dy = p[i][1]-p[j][1], dz = p[i][2]-p[j][2]
        dists.push({ j, d: dx*dx + dy*dy + dz*dz })
      }
      dists.sort((a, b) => a.d - b.d)
      for (let k = 0; k < K; k++) {
        const j = dists[k].j
        const key = i < j ? `${i},${j}` : `${j},${i}`
        if (!seen.has(key)) { seen.add(key); result.push([i, j]) }
      }
    }
    return result
  }

  useEffect(() => {
    pts.current = fibSphere(numPts)
    edges.current = buildEdges(pts.current)
  }, [numPts])

  useEffect(() => { edges.current = buildEdges(pts.current) }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    const MAX_N = 300
    const rotBuf: [number, number, number][] = Array.from({ length: MAX_N }, (): [number, number, number] => [0, 0, 0])
    const sortArr: number[] = []

    const draw = () => {
      const s = state.current
      const w = canvas.width
      const h = canvas.height
      const r = Math.min(w, h) * 0.28
      const ptCount = pts.current.length

      ctx.clearRect(0, 0, w, h)

      // ── Explosion phase ──
      if (s.exploding) {
        s.explodeT += 1
        const fade = Math.max(0, 1 - s.explodeT / 42)
        ctx.font = `14px 'JetBrains Mono', monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        for (const ep of s.explodePts) {
          ep.x += ep.vx
          ep.y += ep.vy
          ep.vx *= 0.96
          ep.vy *= 0.96
          ctx.globalAlpha = fade * (0.3 + ep.depth * 0.7)
          const ev = Math.round(30 + ep.depth * 225)
          ctx.fillStyle = `rgb(${ev},${ev},${ev})`
          ctx.fillText(ep.ch, ep.x, ep.y)
        }
        ctx.globalAlpha = 1
        s.raf = requestAnimationFrame(draw)
        return
      }

      if (!s.dragging) {
        s.rY += s.vY
        s.vX *= 0.97
        s.rX += s.vX
        s.vY += (0.003 - s.vY) * 0.002
      }

      const n = ptCount // mobile: 60 pts, desktop: 150
      const cosY = Math.cos(s.rY), sinY = Math.sin(s.rY)
      const cosX = Math.cos(s.rX), sinX = Math.sin(s.rX)
      for (let i = 0; i < n; i++) {
        const p = pts.current[i]
        const tx = p[0] * cosY - p[2] * sinY
        const tz = p[0] * sinY + p[2] * cosY
        rotBuf[i][0] = tx
        rotBuf[i][1] = p[1] * cosX - tz * sinX
        rotBuf[i][2] = p[1] * sinX + tz * cosX
      }
      sortArr.length = n
      for (let i = 0; i < n; i++) sortArr[i] = i
      sortArr.sort((a, b) => rotBuf[a][2] - rotBuf[b][2] || a - b)

      const cx = w / 2
      const cy = h * (SPHERE_TOP_PCT / 100)

      // Draw network edges
      for (const [ei, ej] of edges.current) {
        const [ax, ay, az] = rotBuf[ei]
        const [bx, by, bz] = rotBuf[ej]
        const avgDepth = ((az + 1) / 2 + (bz + 1) / 2) / 2
        ctx.globalAlpha = 0.07 + avgDepth * 0.34
        const ev = Math.round(70 + avgDepth * 156)
        ctx.strokeStyle = `rgb(${ev},${ev},${ev})`
        ctx.lineWidth = 0.78
        ctx.beginPath()
        ctx.moveTo(cx + ax * r, cy + ay * r)
        ctx.lineTo(cx + bx * r, cy + by * r)
        ctx.stroke()
      }

      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let si = 0; si < n; si++) {
        const i = sortArr[si]
        const [px, py, pz] = rotBuf[i]
        const depth = (pz + 1) / 2
        ctx.globalAlpha = 0.08 + depth * 0.92
        ctx.font = FONT_CACHE[Math.round(depth * 7)]
        const v = Math.round(30 + depth * 225)
        ctx.fillStyle = `rgb(${v},${v},${v})`
        ctx.fillText(SPHERE_SKILLS[i % SPHERE_SKILLS.length], cx + px * r, cy + py * r)
      }
      ctx.globalAlpha = 1

      s.raf = requestAnimationFrame(draw)
    }
    draw()

    const onDown = (e: MouseEvent) => {
      if (e.target !== canvas) return
      const s = state.current
      s.dragging = true
      s.lastX = e.clientX; s.lastY = e.clientY
      s.vX = 0; s.vY = 0
    }
    const onMove = (e: MouseEvent) => {
      const s = state.current
      if (!s.dragging) return
      const dx = e.clientX - s.lastX
      const dy = e.clientY - s.lastY
      // drag right → rY decreases → -sin(rY) positive → front moves right ✓
      s.rY -= dx * 0.004
      s.rX -= dy * 0.004
      s.vY = -dx * 0.004
      s.vX = -dy * 0.004
      s.lastX = e.clientX; s.lastY = e.clientY
    }
    const onUp = () => { state.current.dragging = false }

    canvas.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    return () => {
      cancelAnimationFrame(state.current.raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const handleLaunch = () => {
    setBtnVisible(false)
    const s = state.current
    const canvas = canvasRef.current
    if (canvas) {
      const w = canvas.width
      const h = canvas.height
      const r = Math.min(w, h) * 0.28
      const cx = w / 2
      const cy = h * (SPHERE_TOP_PCT / 100)
      const rotated = pts.current.map(p => rotX(rotY(p, s.rY), s.rX))
      s.explodePts = rotated.map(([px, py, pz], i) => {
        const sx = cx + px * r
        const sy = cy + py * r
        const dirX = sx - cx
        const dirY = sy - cy
        const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1
        const speed = 5 + Math.random() * 9
        return {
          x: sx, y: sy,
          vx: (dirX / len) * speed + (Math.random() - 0.5) * 2,
          vy: (dirY / len) * speed + (Math.random() - 0.5) * 2,
          ch: SPHERE_SKILLS[i % SPHERE_SKILLS.length],
          depth: (pz + 1) / 2,
        }
      })
      s.exploding = true
      s.explodeT = 0
    }
    onEnter()
  }

  return (
    <div ref={wrapRef} className="relative w-full h-screen bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #000 100%)' }}
      />

      {/* Name — top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        className="absolute left-0 right-0 flex flex-col items-center pointer-events-none"
        style={{ top: '10%' }}
      >
        <h1 className="text-white uppercase tracking-[0.5em]"
          style={{ fontSize: 'clamp(1.6rem, 5vw, 4rem)', fontWeight: 100 }}>
          Kareem Muftee
        </h1>
        <p className="font-mono text-white/40 mt-3 tracking-[0.2em]"
          style={{ fontSize: 'clamp(0.6rem, 1.4vw, 0.72rem)' }}>
          Software Engineer &amp; Systems Builder
        </p>
        <p className="font-mono text-white/25 mt-1 tracking-[0.15em]"
          style={{ fontSize: 'clamp(0.55rem, 1.1vw, 0.62rem)' }}>
          BS in CS @ UIC · Building things
        </p>
      </motion.div>

      {/* ── Enter button — centered ON the sphere ── */}
      <AnimatePresence>
        {btnVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.9, delay: 1.3, ease: 'easeOut' }}
            className="absolute z-10"
            style={{ top: `${SPHERE_TOP_PCT}%`, left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <button
              onClick={handleLaunch}
              className="relative font-mono uppercase text-white/60 hover:text-white transition-colors duration-300"
              style={{ fontSize: '0.65rem', letterSpacing: '0.3em', background: '#000', border: 'none', cursor: 'pointer', padding: '14px 32px', borderRadius: '999px' }}
            >
              {/* Static ring */}
              <span className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px' }} />
              {/* Pulsing outer ring */}
              <motion.span
                className="absolute rounded-full pointer-events-none"
                animate={{ scale: [1, 1.22, 1], opacity: [0.18, 0, 0.18] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ border: '1px solid rgba(255,255,255,0.4)', borderRadius: '999px', inset: 0 }}
              />
              explore
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
