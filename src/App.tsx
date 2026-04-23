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
import Video1 from '@/components/Video1'
import Video2 from '@/components/Video2'
import Video3 from '@/components/Video3'
import PostProduction from '@/components/PostProduction'
import About from '@/components/About'
import Contact from '@/components/Contact'

const linear = (x: number) => x

const TRANSITION_MS = REVEAL_DURATION * 1000
const POST_TRANSITION_MS = 396
const VIDEO_SQUEEZE_MS = 700

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

  const controller = useMemo(() => createOscController(), [])

  const startRevealIn = useCallback((waitForNewSlotVersion?: number | null, inDurMs: number = TRANSITION_MS / 2, ease: (x: number) => number = linear) => {
    const p = controller.paramsRef.current
    let cancelled = false
    let start = 0

    const tick = () => {
      if (cancelled) return
      const raw = Math.min(1, (performance.now() - start) / inDurMs)
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
    const p = controller.paramsRef.current
    p.mode = 'paused'
    p.direction = 'right'
    p.progress = 0

    const stopWaiting = startRevealIn(0)
    return () => {
      stopWaiting()
      cancelAnimationFrame(rafRef.current)
    }
  }, [controller, startRevealIn])

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

    const dir: 1 | -1 = target > index ? 1 : -1
    setDirection(dir)
    setIsTransitioning(true)
    transitionStartRef.current = performance.now()

    const p = controller.paramsRef.current
    const videoTransition = !isLandingKey(index) && !isLandingKey(target)
    const halfDur = videoTransition ? VIDEO_SQUEEZE_MS / 2 : POST_TRANSITION_MS / 2

    p.direction = dir === 1 ? 'left' : 'right'
    p.mode = 'reveal-out'
    p.progress = 0
    p.centered = true

    const tickOut = () => {
      const raw = Math.min(1, (performance.now() - transitionStartRef.current) / halfDur)
      p.progress = raw
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tickOut)
        return
      }

      const slotVersionBeforeSwitch = slotVersionRef.current
      setIndex(target)
      p.direction = dir === 1 ? 'right' : 'left'
      p.centered = true
      startRevealIn(slotVersionBeforeSwitch, halfDur)
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
            variants={{
              enter: { opacity: 0 },
              center: { opacity: 1 },
              exit: { opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 3rem 8rem' }}
          >
            {current === 'landing' && <Landing />}
            {current === 'demo' && <DemoReel />}
            {current === 'integration' && <Integration />}
            {current === 'video-1' && <Video1 />}
            {current === 'video-2' && <Video2 />}
            {current === 'video-3' && <Video3 />}
            {current === 'post-production' && <PostProduction />}
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
