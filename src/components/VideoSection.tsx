import { useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFlow } from '@/state/flow'
import RevealBlock from '@/components/RevealBlock'
import { expandRect } from '@/lib/reveal'
import { extractVideoId } from '@/lib/youtube'
import { TimestampRow, YouTubeEmbed, type TimestampMarker, useYouTubePlayer } from '@/components/YouTubePlayer'

export interface VideoSectionDetail {
  heading: string
  paragraphs: string[]
  tabs?: { label: string; heading: string; paragraphs: string[] }[]
}

export interface VideoSectionProps {
  title: string
  detail: VideoSectionDetail
  videoUrl: string
  timestamps?: TimestampMarker[]
  thumbnails?: (string | undefined)[]
  thumbnailUrl?: string
}

const DEFAULT_TIMESTAMPS: TimestampMarker[] = [
  { seconds: 15 },
  { seconds: 30 },
  { seconds: 45 },
  { seconds: 60 },
]

const ENTER_STAGGER = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { delay: 0.1, duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

export default function VideoSection({ title, detail, videoUrl, timestamps = DEFAULT_TIMESTAMPS, thumbnails, thumbnailUrl }: VideoSectionProps) {
  const flow = useFlow()
  const tabId = useId()
  const frameRef = useRef<HTMLDivElement>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const currentDetail = detail.tabs?.[activeTab] ?? detail
  const videoId = extractVideoId(videoUrl)
  const player = useYouTubePlayer(videoId, panelOpen)
  const heroThumb = thumbnailUrl ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

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

  useEffect(() => { setPanelOpen(false); setActiveTab(0) }, [flow.index])

  return (
    <div className="section-shell video-section-shell">
      <div ref={frameRef} className="video-slot">
        <RevealBlock className="video-frame-reveal" scaleOnReveal>
          <div className="video-reveal-stack">
            <div className="video-frame" style={{ position: 'relative' }}>
              <div className="video-glow" />
              <img
                src={heroThumb}
                alt=""
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
              />
              <YouTubeEmbed videoId={videoId} title={title} handle={player} suppressed={panelOpen} />
            </div>
            <motion.div style={{ width: '100%', display: 'flex', justifyContent: 'center' }} {...ENTER_STAGGER}>
              <TimestampRow timestamps={timestamps} thumbnails={thumbnails} handle={player} videoId={videoId} />
            </motion.div>
          </div>
        </RevealBlock>
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
              {detail.tabs && (
                <div className="detail-tabs" role="tablist" aria-label={`${title} details`}>
                  {detail.tabs.map((tab, index) => (
                    <button
                      key={tab.label}
                      id={`${tabId}-tab-${index}`}
                      className="detail-tab"
                      role="tab"
                      aria-selected={activeTab === index}
                      aria-controls={`${tabId}-panel`}
                      tabIndex={activeTab === index ? 0 : -1}
                      onClick={() => setActiveTab(index)}
                      onKeyDown={(event) => {
                        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                        event.preventDefault()
                        const next = event.key === 'Home' ? 0 : event.key === 'End' ? detail.tabs!.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + detail.tabs!.length) % detail.tabs!.length
                        setActiveTab(next)
                        document.getElementById(`${tabId}-tab-${next}`)?.focus()
                      }}
                    >{tab.label}</button>
                  ))}
                </div>
              )}
              {!detail.tabs && (
                <div className="detail-tabs">
                  <h3 className="detail-tab detail-title">{currentDetail.heading}</h3>
                </div>
              )}
              <div role={detail.tabs ? 'tabpanel' : undefined} id={detail.tabs ? `${tabId}-panel` : undefined} aria-labelledby={detail.tabs ? `${tabId}-tab-${activeTab}` : undefined} tabIndex={detail.tabs ? 0 : undefined}>
              {currentDetail.paragraphs.map((p, i) => (
                <p key={i} className="text-sm sm:text-base" style={{ color: '#a0a0a0', marginBottom: '0.85rem', lineHeight: 1.7 }}>{p}</p>
              ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div className="video-actions" {...ENTER_STAGGER}>
        <motion.button
          whileHover={{ scale: 1.02, transition: { duration: 0.0975, ease: [0.16, 1, 0.3, 1] } }}
          className="btn-outline font-display see-more-btn"
          onClick={() => setPanelOpen(v => !v)}
        >
          {panelOpen ? 'Close' : 'See More..'}
        </motion.button>
      </motion.div>
    </div>
  )
}
