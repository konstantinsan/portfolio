import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FLOW, FlowContext, type OverlayKey } from '@/state/flow'
import { createOscController, REVEAL_DURATION } from '@/hooks/useOscilloscope'
import Oscilloscope from '@/components/Oscilloscope'
import Nav from '@/components/Nav'
import FlowArrows from '@/components/FlowArrows'
import StickyContactBar from '@/components/StickyContactBar'
import Landing from '@/components/Landing'
import DemoReel from '@/components/DemoReel'
import Integration from '@/components/Integration'
import About from '@/components/About'
import Contact from '@/components/Contact'

const linear = (x: number) => x

const TRANSITION_MS = REVEAL_DURATION * 1000
const POST_TRANSITION_MS = 396
const VIDEO_SQUEEZE_MS = 300
const VIDEO_SQUEEZE_FLOOR = 0.8
const LANDING_VISITED_KEY = 'kaudio-landing-visited'

function hasVisitedLanding() {
  try { return sessionStorage.getItem(LANDING_VISITED_KEY) === 'true' } catch { return false }
}

function isLandingKey(i: number) {
  return FLOW[i]?.key === 'landing'
}

function App() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [overlay, setOverlay] = useState<OverlayKey>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollDir, setScrollDir] = useState<'up' | 'down' | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  const transitionStartRef = useRef(0)
  const rafRef = useRef(0)
  const slotVersionRef = useRef(0)
  const [returningSession] = useState(hasVisitedLanding)
  const landingVisitedRef = useRef(returningSession)

  const controller = useMemo(() => createOscController(), [])

  const startRevealIn = useCallback((waitForNewSlotVersion?: number | null, inDurMs: number = TRANSITION_MS / 2, ease: (x: number) => number = linear) => {
    const p = controller.paramsRef.current
    let cancelled = false
    let start = 0

    const tick = () => {
      if (cancelled) return
      const raw = inDurMs === 0 ? 1 : Math.min(1, (performance.now() - start) / inDurMs)
      const prog = ease(raw)
      p.progress = prog
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        p.mode = 'idle'
        p.progress = 1
        setIsTransitioning(false)
      }
    }

    const waitForSlot = () => {
      if (cancelled) return
      const hasMeasuredSlot = Boolean(p.slotRect && p.slotRect.w > 0)
      const slotIsFresh = waitForNewSlotVersion == null || slotVersionRef.current > waitForNewSlotVersion

      if (hasMeasuredSlot && slotIsFresh) {
        p.mode = 'reveal-in'
        p.progress = 0
        start = performance.now()
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = requestAnimationFrame(waitForSlot)
      }
    }

    rafRef.current = requestAnimationFrame(waitForSlot)
    return () => { cancelled = true }
  }, [controller])

  // Initial landing reveal waits for the slot measurement so the wave hugs content.
  useEffect(() => {
    if (returningSession) return
    const p = controller.paramsRef.current
    p.mode = 'paused'
    p.direction = 'right'
    p.progress = 0

    const stopWaiting = startRevealIn(0)
    return () => {
      stopWaiting()
      cancelAnimationFrame(rafRef.current)
    }
  }, [controller, startRevealIn, returningSession])

  useEffect(() => {
    try { sessionStorage.setItem(LANDING_VISITED_KEY, 'true') } catch { /* Keep in-memory history when storage is unavailable. */ }
  }, [])

  useEffect(() => {
    const p = controller.paramsRef.current
    if (!isTransitioning) {
      p.mode = 'idle'
      p.progress = 1
    }
  }, [isTransitioning, controller])

  const setSlotRect = useCallback((rect: { x: number; y: number; w: number; h: number } | null) => {
    controller.paramsRef.current.slotRect = rect
    slotVersionRef.current += 1
  }, [controller])

  const goTo = useCallback((target: number) => {
    if (target === index || target < 0 || target >= FLOW.length) return
    if (isTransitioning || overlay) return

    if (isLandingKey(index)) landingVisitedRef.current = true

    const dir: 1 | -1 = target > index ? 1 : -1
    setDirection(dir)
    setIsTransitioning(true)
    transitionStartRef.current = performance.now()

    const p = controller.paramsRef.current
    const videoTransition = !isLandingKey(index) && !isLandingKey(target)

    if (videoTransition) {
      // Shallow centered squeeze; swap slide immediately so AnimatePresence
      // fades old → new in parallel with the border motion.
      const halfDur = VIDEO_SQUEEZE_MS / 2
      p.squeezeFloor = VIDEO_SQUEEZE_FLOOR
      p.direction = dir === 1 ? 'left' : 'right'
      p.centered = true
      p.mode = 'reveal-out'
      p.progress = 0
      const outStart = performance.now()

      const tickIn = () => {
        const rawIn = Math.min(1, (performance.now() - outStart - halfDur) / halfDur)
        p.progress = rawIn
        if (rawIn < 1) {
          rafRef.current = requestAnimationFrame(tickIn)
          return
        }
        p.mode = 'idle'
        p.progress = 1
        p.squeezeFloor = 0
        setIsTransitioning(false)
      }

      const tickOut = () => {
        const raw = Math.min(1, (performance.now() - outStart) / halfDur)
        p.progress = raw
        if (raw < 1) {
          rafRef.current = requestAnimationFrame(tickOut)
          return
        }
        p.mode = 'reveal-in'
        p.progress = 0
        p.direction = dir === 1 ? 'right' : 'left'
        rafRef.current = requestAnimationFrame(tickIn)
      }

      setIndex(target)
      rafRef.current = requestAnimationFrame(tickOut)
      return
    }

    p.squeezeFloor = 0
    p.direction = dir === 1 ? 'left' : 'right'
    p.mode = 'reveal-out'
    p.progress = 0
    p.centered = true
    const outDur = POST_TRANSITION_MS / 2

    const tickOut = () => {
      const raw = Math.min(1, (performance.now() - transitionStartRef.current) / outDur)
      p.progress = raw
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tickOut)
        return
      }

      const slotVersionBeforeSwitch = slotVersionRef.current
      setIndex(target)
      p.direction = dir === 1 ? 'right' : 'left'
      p.centered = true
      startRevealIn(slotVersionBeforeSwitch, isLandingKey(target) ? 0 : POST_TRANSITION_MS / 2)
    }

    rafRef.current = requestAnimationFrame(tickOut)
  }, [index, isTransitioning, overlay, controller, startRevealIn])

  const next = useCallback(() => goTo(index + 1), [index, goTo])
  const prev = useCallback(() => goTo(index - 1), [index, goTo])

  const openOverlay = useCallback((k: Exclude<OverlayKey, null>) => {
    if (isTransitioning || overlay === k) return

    const p = controller.paramsRef.current
    setDirection(1)
    setIsTransitioning(true)
    transitionStartRef.current = performance.now()
    p.direction = 'left'
    p.mode = 'reveal-out'
    p.progress = 0
    p.centered = true
    const outDur = POST_TRANSITION_MS / 2

    const tickOut = () => {
      const raw = Math.min(1, (performance.now() - transitionStartRef.current) / outDur)
      p.progress = raw
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tickOut)
        return
      }

      const slotVersionBeforeSwitch = slotVersionRef.current
      setOverlay(k)
      p.direction = 'right'
      p.centered = true
      startRevealIn(slotVersionBeforeSwitch, POST_TRANSITION_MS / 2)
    }

    rafRef.current = requestAnimationFrame(tickOut)
  }, [controller, isTransitioning, overlay, startRevealIn])

  const closeOverlay = useCallback(() => {
    if (isTransitioning || !overlay) return

    const p = controller.paramsRef.current
    setDirection(-1)
    setIsTransitioning(true)
    transitionStartRef.current = performance.now()
    p.direction = 'right'
    p.mode = 'reveal-out'
    p.progress = 0
    p.centered = true
    const outDur = POST_TRANSITION_MS / 2

    const tickOut = () => {
      const raw = Math.min(1, (performance.now() - transitionStartRef.current) / outDur)
      p.progress = raw
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tickOut)
        return
      }

       setOverlay(null)
       p.direction = 'left'
       p.centered = true

       requestAnimationFrame(() => {
         const versionBefore = slotVersionRef.current
         window.dispatchEvent(new Event('resize'))
         startRevealIn(versionBefore, POST_TRANSITION_MS / 2)
       })
    }

    rafRef.current = requestAnimationFrame(tickOut)
  }, [controller, isTransitioning, overlay, startRevealIn])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (overlay) {
        if (e.key === 'Escape') closeOverlay()
        return
      }
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [overlay, next, prev, closeOverlay])

  // Touch → horizontal swipe = prev/next
  useEffect(() => {
    let startX = 0, startY = 0, startT = 0, tracking = false
    let clearTimer = 0
    const THRESHOLD = 50
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { tracking = false; return }
      const t = e.touches[0]
      startX = t.clientX; startY = t.clientY; startT = performance.now()
      tracking = true
    }
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const t = e.changedTouches[0]
      const dx = t.clientX - startX
      const dy = t.clientY - startY
      const dt = performance.now() - startT
      if (Math.abs(dx) < THRESHOLD) return
      if (Math.abs(dy) > Math.abs(dx)) return
      if (dt > 800) return
      if (overlay) return
      setScrollDir(dx < 0 ? 'down' : 'up')
      window.clearTimeout(clearTimer)
      clearTimer = window.setTimeout(() => setScrollDir(null), 420)
      if (dx < 0) next()
      else prev()
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
      window.clearTimeout(clearTimer)
    }
  }, [next, prev, overlay])

  // Wheel → oscilloscope scroll target + transient arrow highlight
  useEffect(() => {
    let clearTimer = 0
    const onWheel = (e: WheelEvent) => {
      const s = controller.scrollRef.current
      s.target += e.deltaY * 0.0006
      s.target = Math.max(0, Math.min(s.target, 1))
      setScrollDir(e.deltaY > 0 ? 'down' : 'up')
      window.clearTimeout(clearTimer)
      clearTimer = window.setTimeout(() => setScrollDir(null), 260)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.clearTimeout(clearTimer)
    }
  }, [controller])

  const ctx = useMemo(() => ({
    index, direction, overlay, isTransitioning, scrollDir, soundOn, setSoundOn,
    goTo, next, prev, openOverlay, closeOverlay, setSlotRect, oscController: controller,
  }), [index, direction, overlay, isTransitioning, scrollDir, soundOn, goTo, next, prev, openOverlay, closeOverlay, setSlotRect, controller])

  const current = FLOW[index].key
  const skipLandingIntro = current === 'landing' && (index === 0 && landingVisitedRef.current)

  useEffect(() => {
    controller.waveTargetRef.current = current === 'landing' ? 1 : 0
  }, [current, controller])

  return (
    <FlowContext.Provider value={ctx}>
      <div className="bg-radial-warm" style={{ position: 'fixed', inset: 0, zIndex: 0 }} />
      <Oscilloscope controller={controller} />
      <Nav />
      <div className="flow-section">
        <AnimatePresence>
          <motion.div
            key={current}
            className="flow-section-content"
            variants={{
              enter: { opacity: 0 },
              center: { opacity: 1 },
              exit: { opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } },
            }}
            initial={skipLandingIntro ? false : 'enter'}
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
          >
            {current === 'landing' && <Landing skipIntro={skipLandingIntro} />}
            {current === 'demo' && <DemoReel />}
            {current === 'integration' && <Integration />}
          </motion.div>
        </AnimatePresence>
      </div>
      <FlowArrows />
      <StickyContactBar />
      <AnimatePresence>
        {overlay === 'about' && <About key="about" />}
        {overlay === 'contact' && <Contact key="contact" />}
      </AnimatePresence>
    </FlowContext.Provider>
  )
}

export default App
