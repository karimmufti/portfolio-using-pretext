import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const CATEGORIES = [
  { num: '01', label: 'Languages',          skills: ['C', 'C++', 'Go', 'TypeScript', 'JavaScript', 'Python', 'SQL', 'F#', 'Swift'] },
  { num: '02', label: 'Frameworks & Tools', skills: ['React', 'Node.js', 'Express.js', 'FastAPI', 'Vue.js', 'AWS'] },
  { num: '03', label: 'Data & Streaming',   skills: ['Redis', 'Kafka', 'Redpanda', 'PostgreSQL', 'MySQL'] },
  { num: '04', label: 'Systems & Infra',    skills: ['Linux', 'Git', 'Docker', 'Elasticsearch', 'OpenSearch'] },
  { num: '05', label: 'GPU & Scientific',   skills: ['CUDA', 'CuPy', 'NumPy'] },
]

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <div ref={sectionRef} className="w-full bg-black py-14 px-8 sm:px-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="max-w-5xl mx-auto mb-10"
      >
        <p className="font-mono uppercase tracking-[0.3em] mb-3"
          style={{ fontSize: '0.62rem', color: 'hsl(196,90%,60%)' }}>
          What I build with
        </p>
        <h2 className="text-3xl text-white" style={{ fontWeight: 100, letterSpacing: '0.03em' }}>
          Stack
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, x: -12 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
            className="group flex items-start gap-8 sm:gap-16 py-8 cursor-default"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* Index + label */}
            <div className="shrink-0 w-40 sm:w-52 flex items-center gap-4">
              <span className="font-mono text-white/18 select-none"
                style={{ fontSize: '0.6rem', letterSpacing: '0.15em' }}>
                {cat.num}
              </span>
              <span className="font-mono uppercase tracking-[0.18em] text-white/40 group-hover:text-white/70 transition-colors duration-300"
                style={{ fontSize: '0.6rem' }}>
                {cat.label}
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 pt-px">
              {cat.skills.map((skill, si) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 + si * 0.04 }}
                  className="text-white/55 group-hover:text-white/80 transition-colors duration-300"
                  style={{ fontSize: '0.95rem', fontWeight: 300, letterSpacing: '0.01em' }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
