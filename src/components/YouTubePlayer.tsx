import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { loadYouTubeApi, type YTPlayer } from '@/lib/youtube'
import { useFlow } from '@/state/flow'

export interface YouTubePlayerHandle {
  iframeRef: React.RefObject<HTMLIFrameElement | null>
  ready: boolean
  muted: boolean
  unmute: () => void
  seekToPercent: (percent: number) => void
}

export function useYouTubePlayer(videoId: string): YouTubePlayerHandle {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const durationRef = useRef(0)
  const { soundOn, setSoundOn } = useFlow()
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn
  const [ready, setReady] = useState(false)
  const [muted, setMuted] = useState(!soundOn)

  useEffect(() => {
    let cancelled = false
    let pollId = 0

    loadYouTubeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return
      const player = new YT.Player(iframeRef.current, {
        events: {
          onReady: (e) => {
            if (cancelled) return
            playerRef.current = e.target
            durationRef.current = e.target.getDuration()
            if (soundOnRef.current) {
              try { e.target.unMute() } catch { /* noop */ }
            }
            setReady(true)
            setMuted(e.target.isMuted())
            pollId = window.setInterval(() => {
              const p = playerRef.current
              if (!p) return
              const m = p.isMuted()
              setMuted((prev) => (prev === m ? prev : m))
              if (!durationRef.current) durationRef.current = p.getDuration() || 0
            }, 500)
          },
        },
      })
      playerRef.current = player
    })

    return () => {
      cancelled = true
      if (pollId) window.clearInterval(pollId)
      try {
        playerRef.current?.destroy()
      } catch {
        /* noop */
      }
      playerRef.current = null
    }
  }, [videoId])

  const seekToPercent = useCallback((percent: number) => {
    const player = playerRef.current
    if (!player) return
    const duration = durationRef.current || player.getDuration()
    if (!duration) return
    player.seekTo(duration * percent, true)
    player.playVideo()
  }, [])

  const unmute = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    player.unMute()
    setMuted(false)
    setSoundOn(true)
  }, [setSoundOn])

  return { iframeRef, ready, muted, unmute, seekToPercent }
}

export function YouTubeEmbed({
  videoId,
  title,
  handle,
  suppressed,
}: {
  videoId: string
  title: string
  handle: YouTubePlayerHandle
  suppressed?: boolean
}) {
  const { soundOn } = useFlow()
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${soundOn ? 0 : 1}&enablejsapi=1&controls=1&playsinline=1&rel=0&modestbranding=1`
  return (
    <>
      <iframe
        ref={handle.iframeRef}
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
      />
      <AnimatePresence>
        {handle.muted && !suppressed && (
          <>
            <motion.div
              key="unmute-dim"
              className="video-dim-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              aria-hidden="true"
            />
            <motion.button
              key="unmute-cta"
              className="unmute-cta font-display"
              style={{ x: '-50%', y: '-50%' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={handle.unmute}
              aria-label="Tap to unmute video"
            >
              <span className="unmute-cta-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              </span>
              Tap to Unmute
            </motion.button>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function TimestampRow({
  timestamps,
  thumbnails,
  handle,
}: {
  timestamps: number[]
  thumbnails?: (string | undefined)[]
  handle: YouTubePlayerHandle
}) {
  return (
    <div className="timestamp-row">
      {timestamps.map((percent, i) => {
        const img = thumbnails?.[i]
        return (
          <button
            key={i}
            type="button"
            className="timestamp-btn"
            onClick={() => handle.seekToPercent(percent)}
            disabled={!handle.ready}
            aria-label={`Jump to ${Math.round(percent * 100)}%`}
          >
            {img ? (
              <img src={img} alt="" />
            ) : (
              <span className="timestamp-btn-placeholder font-display">
                {String(i + 1).padStart(2, '0')}
              </span>
            )}
            <span className="timestamp-btn-badge font-display">{Math.round(percent * 100)}%</span>
          </button>
        )
      })}
    </div>
  )
}
