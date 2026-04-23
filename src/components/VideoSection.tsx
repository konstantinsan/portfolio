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

function buildAutoplaySrc(url: string): string {
  const idMatch = url.match(/\/embed\/([^/?]+)/)
  const id = idMatch ? idMatch[1] : ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    controls: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
    rel: '0',
    iv_load_policy: '3',
    ...(origin ? { origin } : {}),
  })
  return `${url.split('?')[0]}?${params.toString()}`
}

export default function VideoSection({ title, detail, videoUrl }: VideoSectionProps) {
  const flow = useFlow()
  const frameRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [muted, setMuted] = useState(true)
  const embedSrc = buildAutoplaySrc(videoUrl)

  const toggleSound = () => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    const func = muted ? 'unMute' : 'mute'
    win.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
    if (muted) {
      win.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*')
    }
    setMuted(!muted)
  }

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
            ref={iframeRef}
            src={embedSrc}
            title={title}
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => {
              const win = iframeRef.current?.contentWindow
              if (!win) return
              win.postMessage(JSON.stringify({ event: 'listening' }), '*')
              win.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*')
              win.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*')
            }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
          <button
            type="button"
            onClick={toggleSound}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            className="video-sound-btn"
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
            )}
          </button>
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
