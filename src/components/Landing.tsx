import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlow } from '@/state/flow'
import { REVEAL_DURATION } from '@/hooks/useOscilloscope'
import RevealBlock from '@/components/RevealBlock'
import { expandRect } from '@/lib/reveal'

export default function Landing() {
  const flow = useFlow()
  const introRef = useRef<HTMLDivElement>(null)
  const [showStart, setShowStart] = useState(false)

  // Measure the full landing intro block so the oscilloscope frames the content block.
  useEffect(() => {
    const node = introRef.current
    if (!node) return
    const measure = () => {
      const r = node.getBoundingClientRect()
      flow.setSlotRect(expandRect(
        { x: r.left, y: r.top, w: r.width, h: r.height },
        { left: 28, right: 28, top: 18, bottom: 18 },
      ))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(node)
    const onScrollOrResize = () => measure()
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)
    // Re-measure after webfonts settle (pixel font load shifts metrics)
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
    if (fonts?.ready) fonts.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
    }
  }, [flow])

  useEffect(() => {
    const t = setTimeout(() => setShowStart(true), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="section-shell" style={{ gap: 0, position: 'relative' }}>
      <RevealBlock>
        <motion.div
          ref={introRef}
          className="landing-intro-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: REVEAL_DURATION, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center' }}
        >
          <p style={{ fontSize: 'clamp(1rem, 1.6vw, 1.25rem)', color: '#d4d4d4', textAlign: 'left', marginBottom: '16px' }}>
            My name is
          </p>
          <h1 className="font-display" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', color: '#fafafa', lineHeight: 1, display: 'inline-block' }}>
            KONSTANTIN
          </h1>
          <p style={{ marginTop: '16px', fontSize: 'clamp(1rem, 2vw, 1.4rem)', color: '#d4d4d4', textAlign: 'right' }}>
            a freelance <span className="text-gradient" style={{ fontWeight: 600 }}>Sound Designer</span>
          </p>
        </motion.div>
      </RevealBlock>
      {/* Start sits below title absolutely so title stays vertically centered on screen */}
      <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translate(-50%, 2.5rem)', display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence>
          {showStart && (
               <motion.button
                 key="start"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 whileHover={{ scale: 1.05, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } }}
                 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className={`btn-outline font-display${flow.scrollDir === 'down' ? ' active' : ''}`}
                 onClick={flow.next}
               >
              START
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
