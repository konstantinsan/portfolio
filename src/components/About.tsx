import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useFlow } from '@/state/flow'
import { expandRect } from '@/lib/reveal'

export default function About() {
  const flow = useFlow()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (flow.overlay !== 'about') return
    const node = contentRef.current
    if (!node) return

    const measure = () => {
      if (flow.overlay !== 'about') return
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
    window.addEventListener('scroll', measure, true)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
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
        overflowY: 'auto',
      }}
    >
      <div ref={contentRef} style={{ maxWidth: '72rem', margin: '0 auto' }}>
        <button
          className="btn-outline"
          onClick={flow.closeOverlay}
          style={{ marginBottom: '2rem' }}
        >
          Back
        </button>
        <h2 className="font-heading" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '2rem' }}>About</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 24rem) 1fr', gap: '3rem', alignItems: 'start' }}>
          <div style={{
            aspectRatio: '3/4',
            background: 'url(/images/377153174_345722428002783_2844600095436017975_n.jpg) center/cover no-repeat',
            border: '1px solid rgba(255,255,255,0.08)',
          }} />
          <div style={{ color: '#a0a0a0', fontSize: '1.1rem', lineHeight: 1.75, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p>I'm a game audio designer with a lifelong passion for both gaming and music. Growing up immersed in titles like Prince of Persia: Warrior Within, World of Warcraft, Mirror's Edge, and Portal, I developed a deep appreciation for the transformative power of sound in interactive experiences.</p>
            <p>At 15, picking up the guitar and discovering sound recording sparked an obsession I turned into a career — graduating with a Music Production and Sound Engineering degree in the UK in 2019, before making a deliberate move to specialise in game audio.</p>
            <p>I've trained under two highly respected industry professionals, Braden Parkes and Paul Stoughton, gaining direct exposure to industry best practices, advanced techniques, and the collaborative workflows that define professional sound design teams.</p>
            <p>I implement confidently in Wwise, with hands-on experience integrating audio in Unreal Engine 5. My main DAW of choice is Reaper however I've used just about everything under the sun. I'm actively expanding my toolkit and knowledge every day.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
