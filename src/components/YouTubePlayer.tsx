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
  seekToSeconds: (seconds: number) => void
}

export interface TimestampMarker {
  seconds: number
  thumbnail?: string
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

  const seekToSeconds = useCallback((seconds: number) => {
    const player = playerRef.current
    if (!player) return
    player.seekTo(seconds, true)
    player.playVideo()
  }, [])

  const unmute = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    player.unMute()
    setMuted(false)
    setSoundOn(true)
  }, [setSoundOn])

  return { iframeRef, ready, muted, unmute, seekToPercent, seekToSeconds }
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
  const initialMuteRef = useRef(soundOn ? 0 : 1)
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${initialMuteRef.current}&enablejsapi=1&controls=1&playsinline=1&rel=0&modestbranding=1`
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
  videoId,
}: {
  timestamps: TimestampMarker[]
  thumbnails?: (string | undefined)[]
  handle: YouTubePlayerHandle
  videoId: string
}) {
  return (
    <div className="timestamp-row">
      {timestamps.map((marker, i) => {
        const img = marker.thumbnail ?? thumbnails?.[i]
        return (
          <TimestampButton
            key={i}
            marker={marker}
            image={img}
            index={i}
            handle={handle}
            videoId={videoId}
          />
        )
      })}
    </div>
  )
}

function TimestampButton({
  marker,
  image,
  index,
  handle,
  videoId,
}: {
  marker: TimestampMarker
  image?: string
  index: number
  handle: YouTubePlayerHandle
  videoId: string
}) {
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)

  const playPreview = () => {
    if (previewReady) setPreviewPlaying(true)
  }

  const stopPreview = () => {
    setPreviewPlaying(false)
  }

  return (
    <button
      type="button"
      className={`timestamp-btn${previewReady ? ' timestamp-btn-ready' : ''}`}
      onMouseEnter={playPreview}
      onMouseLeave={stopPreview}
      onFocus={playPreview}
      onBlur={stopPreview}
      onClick={() => {
        stopPreview()
        handle.seekToSeconds(marker.seconds)
      }}
      disabled={!handle.ready}
      aria-label={`Jump to ${formatTimestamp(marker.seconds)}`}
    >
      {image ? (
        <img className="timestamp-fallback" src={image} alt="" />
      ) : null}
      <TimestampPreview
        videoId={videoId}
        seconds={marker.seconds}
        title={`Preview ${index + 1}`}
        playing={previewPlaying}
        onReadyChange={setPreviewReady}
        hidden={!previewPlaying}
      />
      {!image && !previewReady ? (
        <span className="timestamp-btn-placeholder font-display">
          {String(index + 1).padStart(2, '0')}
        </span>
      ) : null}
    </button>
  )
}

function TimestampPreview({
  videoId,
  seconds,
  title,
  playing,
  onReadyChange,
  hidden,
}: {
  videoId: string
  seconds: number
  title: string
  playing: boolean
  onReadyChange: (ready: boolean) => void
  hidden: boolean
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const start = Math.max(0, Math.floor(seconds))
  const src = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&enablejsapi=1&controls=0&playsinline=1&rel=0&modestbranding=1&start=${start}`

  useEffect(() => {
    let cancelled = false
    onReadyChange(false)

    loadYouTubeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return
      const player = new YT.Player(iframeRef.current, {
        events: {
          onReady: (e) => {
            if (cancelled) return
            playerRef.current = e.target
            try {
              e.target.mute()
              e.target.seekTo(start, true)
              e.target.pauseVideo()
              onReadyChange(true)
            } catch {
              /* noop */
            }
          },
        },
      })
      playerRef.current = player
    })

    return () => {
      cancelled = true
      onReadyChange(false)
      try {
        playerRef.current?.destroy()
      } catch {
        /* noop */
      }
      playerRef.current = null
    }
  }, [onReadyChange, start])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return

    try {
      if (playing) {
        player.seekTo(start, true)
        player.playVideo()
      } else {
        player.pauseVideo()
        player.seekTo(start, true)
      }
    } catch {
      /* noop */
    }
  }, [playing, start])

  return (
    <iframe
      ref={iframeRef}
      className={`timestamp-preview${hidden ? ' timestamp-preview-hidden' : ''}`}
      src={src}
      title={title}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture"
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}

function formatTimestamp(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
