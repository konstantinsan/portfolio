import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useFlow } from '@/state/flow'
import { expandRect } from '@/lib/reveal'

export default function Contact() {
  const flow = useFlow()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (flow.overlay !== 'contact') return
    const node = contentRef.current
    if (!node) return

    const measure = () => {
      if (flow.overlay !== 'contact') return
      const r = node.getBoundingClientRect()
      flow.setSlotRect(expandRect(
        { x: r.left, y: r.top, w: r.width, h: r.height },
        { left: 28, right: 28, top: 18, bottom: 18 },
      ))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    window.addEventListener('resize', measure)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [flow])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 70,
        background: '#0a0a0a',
        padding: '6rem 3rem 4rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <button
        className="btn-outline"
        onClick={flow.closeOverlay}
        style={{ position: 'absolute', top: '5rem', left: '3rem' }}
      >
        Back
      </button>
      <div ref={contentRef}>
        <h2 className="font-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1.5rem' }}>Let's work together</h2>
        <p style={{ color: '#a0a0a0', fontSize: '1.15rem', marginBottom: '2.5rem', maxWidth: '36rem' }}>
          Available for freelance sound design and audio implementation projects.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a className="btn-gradient" href="mailto:kaudiodesign@gmail.com">Email</a>
          <a className="btn-gradient" href="https://www.linkedin.com/in/thekonstantin/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="btn-gradient" href="https://www.upwork.com/freelancers/~01d1d8e98bf3db3731?mp_source=share" target="_blank" rel="noreferrer">Upwork</a>
        </div>
      </div>
    </motion.div>
  )
}
