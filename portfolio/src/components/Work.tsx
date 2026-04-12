import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

const PROJECTS = [
  {
    num: '01',
    title: 'Live News Aggregation Feed',
    year: '2025',
    desc: 'Pulls live articles from across the web, routes them through Kafka message queues, caches hot stories in Redis for near-instant retrieval, and streams updates to clients over persistent WebSocket connections. Elasticsearch powers full-text search across millions of indexed articles with sub-100ms query times. Built to handle traffic spikes without dropping a single headline.',
    reveal: 'KAFKA DOESN\'T MISS A HEADLINE.',
    tags: ['React', 'Kafka', 'Redis', 'WebSockets', 'Elasticsearch'],
    url: 'https://github.com/karimmufti/news-rss-terminal',
    image: '/projects/rss-term-screenshot.png',
    accent: 'hsl(196,90%,60%)',
  },
  {
    num: '02',
    title: 'Meteor Impact Simulator',
    year: '2025',
    desc: 'GPU-accelerated asteroid impact physics simulator built for NASA Space Apps 2025. CUDA kernels via CuPy parallelize orbital mechanics calculations across thousands of threads, hitting 2–5× speedup over CPU baselines. Real asteroid data from NASA NEO API, terrain from USGS, ocean bathymetry from GEBCO, all rendered live in Three.js. Drop a rock anywhere on Earth and watch the numbers.',
    reveal: 'WHAT IF EXTINCTION WAS INTERACTIVE.',
    tags: ['CUDA', 'Python', 'FastAPI', 'Three.js', 'CuPy'],
    url: 'https://github.com/karimmufti/meteor-simulator-cuda',
    image: '/projects/meteor-madness.png',
    accent: 'hsl(220,70%,65%)',
  },
  {
    num: '03',
    title: 'Async Script Collaboration',
    year: '2026',
    desc: 'A platform for remote film and theatre table reads, no scheduling required. Actors record lines asynchronously, the system stitches sessions together, and everything is served through a React Three Fiber typewriter UI that puts you on a stage. Token-based architecture via Supabase keeps sessions isolated. Built for real collaborators who can\'t be in the same room.',
    reveal: 'TABLE READS. NO TABLE.',
    tags: ['React', 'TypeScript', 'Three.js', 'Supabase', 'R3F'],
    url: 'https://github.com/karimmufti/Scripta',
    image: '/projects/scriptascreenshot.png',
    accent: 'hsl(36,80%,58%)',
  },
]

type Project = typeof PROJECTS[0]

function TingleDescription({
  words, accent, revealed, onReveal, onHeightMeasured,
}: {
  words: string[]; accent: string; revealed: boolean; onReveal: () => void
  onHeightMeasured?: (h: number) => void
}) {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const explodingRef = useRef(false)
  const rafRef = useRef(0)
  const selfRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tick = () => {
      if (!explodingRef.current) {
        const mx = mouseRef.current.x
        const my = mouseRef.current.y
        wordRefs.current.forEach(el => {
          if (!el) return
          const r = el.getBoundingClientRect()
          const cx = r.left + r.width / 2
          const cy = r.top + r.height / 2
          const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)
          const nearness = Math.max(0, 1 - dist / 150)
          el.style.transform = `translateY(${-nearness * 6}px)`
          el.style.color = `rgba(255,255,255,${0.42 + nearness * 0.18})`
          el.style.textShadow = 'none'
        })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [accent])

  useEffect(() => {
    if (selfRef.current && onHeightMeasured) {
      onHeightMeasured(selfRef.current.offsetHeight)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }
  const handleMouseLeave = () => {
    mouseRef.current = { x: -9999, y: -9999 }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (revealed) { onReveal(); return }
    void e
    explodingRef.current = true
    wordRefs.current.forEach(el => {
      if (!el) return
      el.style.transition = 'opacity 0.28s ease'
      el.style.opacity = '0'
    })
    setTimeout(() => {
      onReveal() // React unmounts the words — no manual style reset needed
    }, 300)
  }

  return (
    <div
      ref={selfRef}
      className="cursor-pointer leading-relaxed text-sm"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {words.map((w, i) => (
        <span
          key={i}
          ref={el => { wordRefs.current[i] = el }}
          className="inline-block mr-[0.32em]"
          style={{ color: 'rgba(255,255,255,0.42)', willChange: 'transform' }}
        >
          {w}
        </span>
      ))}
    </div>
  )
}

function ProjectRow({
  project, index, revealed, onToggleReveal, onImageClick,
}: {
  project: Project; index: number
  revealed: boolean; onToggleReveal: () => void
  onImageClick: (src: string) => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(rowRef, { once: true, margin: '-60px' })
  const [descHeight, setDescHeight] = useState<number | null>(null)
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, x: -16 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: 'easeOut' }}
      className="py-14"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start gap-8">
        <span className="font-mono mt-1 shrink-0 transition-colors duration-500"
          style={{ fontSize: '0.58rem', letterSpacing: '0.15em', color: hovered ? project.accent : 'rgba(255,255,255,0.18)' }}>
          {project.num}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h3 className="text-white transition-opacity duration-500"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 300, opacity: hovered ? 1 : 0.45 }}>
              {project.title}
            </h3>
            <span className="font-mono text-white/25 shrink-0"
              style={{ fontSize: '0.58rem', letterSpacing: '0.1em' }}>
              {project.year}
            </span>
          </div>

          {/* Tingle description / reveal — height locked to words height */}
          <div className="mb-6 relative overflow-hidden"
            style={{ height: descHeight ?? 'auto' }}>
            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div key="words"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}>
                  <TingleDescription
                    words={project.desc.split(' ')}
                    accent={project.accent}
                    revealed={revealed}
                    onReveal={onToggleReveal}
                    onHeightMeasured={h => setDescHeight(prev => prev ?? h)}
                  />
                </motion.div>
              ) : (
                <motion.div key="reveal"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  onClick={onToggleReveal}
                  className="cursor-pointer absolute inset-0 flex items-center">
                  <div>
                    <p className="font-mono tracking-[0.18em] leading-tight"
                      style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', fontWeight: 400, fontStyle: 'italic', color: 'rgba(255,255,255,0.42)' }}>
                      {project.reveal}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <span key={tag} className="font-mono px-2 py-0.5 rounded-full transition-all duration-500"
                  style={{
                    fontSize: '0.55rem', letterSpacing: '0.08em',
                    border: `1px solid ${hovered ? project.accent + '55' : 'rgba(255,255,255,0.1)'}`,
                    color: hovered ? project.accent : 'rgba(255,255,255,0.28)',
                  }}>
                  {tag}
                </span>
              ))}
            </div>
            <a href={project.url} target="_blank" rel="noopener noreferrer"
              className="font-mono text-white/30 hover:text-white/75 transition-colors duration-200 flex items-center gap-1.5 shrink-0"
              style={{ fontSize: '0.58rem', letterSpacing: '0.12em' }}>
              GitHub
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M2 8L8 2M8 2H3M8 2v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Per-row image — fades in on hover */}
        <div className="hidden lg:block shrink-0 self-center" style={{ width: '220px' }}>
          <div className="relative overflow-hidden"
            onClick={() => onImageClick(project.image)}
            style={{
              aspectRatio: '4/3',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#080808',
              boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.4)',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.97)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              cursor: 'zoom-in',
            }}>
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.5) 100%)' }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%)' }} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', cursor: 'zoom-out' }}
        onClick={onClose}
      >
        <motion.img
          src={src}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="max-w-[90vw] max-h-[85vh] object-contain"
          style={{ borderRadius: '12px', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
          onClick={e => e.stopPropagation()}
        />
      </motion.div>
    </AnimatePresence>
  )
}

export default function Work() {
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <div ref={sectionRef} className="w-full bg-black px-8 sm:px-12 py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-6xl mx-auto mb-16"
      >
        <p className="font-mono uppercase tracking-[0.3em] mb-3"
          style={{ fontSize: '0.62rem', color: 'hsl(196,90%,60%)' }}>
          Selected Work
        </p>
        <h2 className="text-3xl text-white" style={{ fontWeight: 100, letterSpacing: '0.03em' }}>
          Projects
        </h2>
      </motion.div>

      <div className="max-w-6xl mx-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {PROJECTS.map((proj, i) => (
          <ProjectRow
            key={proj.title}
            project={proj}
            index={i}
            revealed={revealedIdx === i}
            onToggleReveal={() => setRevealedIdx(revealedIdx === i ? null : i)}
            onImageClick={setLightbox}
          />
        ))}
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  )
}
