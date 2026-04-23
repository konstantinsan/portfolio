import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FLOW, useFlow } from '@/state/flow'
import RevealBlock from '@/components/RevealBlock'
import { expandRect } from '@/lib/reveal'

export interface VideoSectionDetail {
  heading: string
  paragraphs: string[]
}

export interface VideoSectionProps {
  title: string
  detail: VideoSectionDetail
  videoUrl: string
}

export default function VideoSection({ title, detail, videoUrl }: VideoSectionProps) {
  const flow = useFlow()
  const frameRef = useRef<HTMLDivElement>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    const measure = () => {
      if (!frameRef.current) return
      const r = frameRef.current.getBoundingClientRect()
      flow.setSlotRect(expandRect(
        { x: r.left, y: r.top + 8, w: r.width, h: r.height - 16 },
        { left: 28, right: 28 },
      ))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [flow])

  useEffect(() => { setPanelOpen(false) }, [flow.index])

  return (
    <div className="section-shell">
      <h2 className="font-heading section-title">{title}</h2>
      <RevealBlock className="video-frame-reveal" scaleOnReveal>
        <div ref={frameRef} className="video-frame" style={{ position: 'relative' }}>
          <div className="video-glow" />
          <iframe
            src={videoUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
          <AnimatePresence>
            {panelOpen && (
              <motion.div
                key="panel"
                className="detail-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <button className="detail-panel-close" onClick={() => setPanelOpen(false)}>Close x</button>
                <h3 className="font-heading text-base sm:text-lg md:text-xl lg:text-2xl" style={{ marginBottom: '1rem', color: '#fafafa' }}>{detail.heading}</h3>
                {detail.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm sm:text-base" style={{ color: '#a0a0a0', marginBottom: '0.85rem', lineHeight: 1.7 }}>{p}</p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </RevealBlock>
      <div className="video-actions">
        {flow.index > 0 && (
          <motion.button
            key="prev-inline"
            className={`flow-arrow prev${flow.scrollDir === 'up' ? ' active' : ''}`}
            whileHover={{ x: -4 }}
            onClick={flow.prev}
            aria-label={`Previous: ${FLOW[flow.index - 1].label}`}
          >
            <span aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,2 3,7 9,12" /></svg>
            </span>
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05, transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } }}
          className="btn-outline font-display see-more-btn"
          onClick={() => setPanelOpen(v => !v)}
        >
          {panelOpen ? 'Close' : 'See More'}
        </motion.button>
        {flow.index < FLOW.length - 1 && (
          <motion.button
            key="next-inline"
            className={`flow-arrow next${flow.scrollDir === 'down' ? ' active' : ''}`}
            whileHover={{ x: 4 }}
            onClick={flow.next}
            aria-label={`Next: ${FLOW[flow.index + 1].label}`}
          >
            <span aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="5,2 11,7 5,12" /></svg>
            </span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
