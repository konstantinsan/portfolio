export interface YTPlayer {
  seekTo(seconds: number, allowSeekAhead: boolean): void
  playVideo(): void
  pauseVideo(): void
  unMute(): void
  mute(): void
  isMuted(): boolean
  getDuration(): number
  destroy(): void
}

export interface YTPlayerEvent {
  target: YTPlayer
  data?: number
}

interface YTConstructor {
  Player: new (
    element: HTMLIFrameElement | HTMLElement | string,
    options: {
      events?: {
        onReady?: (e: YTPlayerEvent) => void
        onStateChange?: (e: YTPlayerEvent) => void
      }
    },
  ) => YTPlayer
  PlayerState: { UNSTARTED: -1; ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 }
}

declare global {
  interface Window {
    YT?: YTConstructor
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTConstructor> | null = null

export function loadYouTubeApi(): Promise<YTConstructor> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') return
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      if (window.YT) resolve(window.YT)
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-youtube-iframe-api]')
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      s.dataset.youtubeIframeApi = '1'
      document.head.appendChild(s)
    }
  })
  return apiPromise
}

export function extractVideoId(embedUrl: string): string {
  const match = embedUrl.match(/\/embed\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : embedUrl
}
