import { useEffect } from 'react'
import { getRevealWindow } from '@/lib/reveal'

export type OscMode = 'reveal-in' | 'reveal-out' | 'idle' | 'paused'

export interface OscParams {
  mode: OscMode
  direction: 'left' | 'right'
  progress: number
  slotRect: { x: number; y: number; w: number; h: number } | null
  colorTrace: string
  colorGlow: string
  centered?: boolean
}

export interface OscController {
  paramsRef: { current: OscParams }
  scrollRef: { current: { current: number; target: number } }
  mouseRef: { current: { x: number; y: number } }
  waveTargetRef: { current: number }
  waveAlphaRef: { current: number }
}

const REVEAL_DURATION = 2.4

function scanValue(x: number, t: number, scroll: number) {
  const speed = 1 + scroll * 0.8
  const burst = Math.sin((x * 9.8) + (t * 7.2 * speed))
  const carrier = Math.sin((x * 3.6) - (t * 1.4 * speed))
  const ripple = Math.sin((x * 23.0) + (t * 4.2 * speed)) * 0.08
  const envelope = 0.45 + (Math.sin((x * 2.5) - (t * 0.45 * speed)) * 0.25)
  return (burst * 0.42 + carrier * 0.28 + ripple) * envelope
}

function sampleWaveY(
  nx: number,
  t: number,
  mouseX: number,
  centerY: number,
  amp: number,
  depth: number,
  widthPhase: number,
  scroll: number,
) {
  return centerY
    + scanValue(nx + mouseX, t, scroll) * amp
    + Math.sin(widthPhase * depth + t * (4.2 + scroll * 3.25)) * (amp * 0.14)
}

export function useOscilloscope(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  ctrl: OscController,
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onPointerMove = (e: PointerEvent) => {
      ctrl.mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      ctrl.mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove)
    resize()

    const frame = (now: number) => {
      const t = now * 0.001
      const scroll = ctrl.scrollRef.current
      scroll.current += (scroll.target - scroll.current) * 0.045
      const mouse = ctrl.mouseRef.current
      const p = ctrl.paramsRef.current
      const waveTarget = ctrl.waveTargetRef.current
      ctrl.waveAlphaRef.current += (waveTarget - ctrl.waveAlphaRef.current) * 0.04
      const waveAlpha = ctrl.waveAlphaRef.current

      ctx.clearRect(0, 0, width, height)

      if (p.mode === 'paused') {
        rafId = requestAnimationFrame(frame)
        return
      }

      const centerY = height * 0.5
      const slot = p.slotRect
      const slotHasContent = Boolean(slot && slot.w > 0 && slot.h > 0)
      const reveal = getRevealWindow(p, width)

      let slotLeft = slot ? slot.x : width * 0.5
      let slotRight = slot ? slot.x + slot.w : width * 0.5
      const slotTop = slot ? slot.y : centerY - 40
      const slotBottom = slot ? slot.y + slot.h : centerY + 40

      if (reveal) {
        slotLeft = reveal.revealTail
        slotRight = reveal.revealHead
      }

      const scrollBoost = 1 + scroll.current * 0.95
      const amplitude = Math.min(height * 0.14, 96) * scrollBoost
      const depth = 18 + mouse.y * 6 + scroll.current * 5

      ctx.save()
      ctx.globalAlpha = waveAlpha
      ctx.lineWidth = 2.2
      ctx.strokeStyle = p.colorTrace
      ctx.shadowColor = p.colorGlow
      ctx.shadowBlur = 18

      let drawing = false
      let brightestX = 0
      let brightestY = centerY
      let brightest = -Infinity

      for (let x = 0; x <= width; x += 6) {
        const widthPhase = x / width
        const nx = widthPhase * 9.6 - 4.8
        const y = sampleWaveY(nx, t, mouse.x * 0.3, centerY, amplitude * 0.34, depth, widthPhase, scroll.current)
        const insideSlotX = x >= slotLeft && x <= slotRight
        const insideSlotY = slotHasContent ? (y >= slotTop && y <= slotBottom) : true
        const insideSlot = insideSlotX && insideSlotY

        if (insideSlot) {
          if (drawing) ctx.stroke()
          drawing = false
        } else if (!drawing) {
          ctx.beginPath()
          ctx.moveTo(x, y)
          drawing = true
        } else {
          ctx.lineTo(x, y)
        }

        if (!insideSlotX) {
          const intensity = Math.exp(-Math.abs(y - centerY) / 40)
          if (intensity > brightest) {
            brightest = intensity
            brightestX = x
            brightestY = y
          }
        }
      }

      if (drawing) ctx.stroke()
      ctx.restore()

       if (p.mode !== 'idle' || slotHasContent) {
        const borderHalfH = slotHasContent
          ? (slotBottom - slotTop) * 0.5 * (reveal?.borderScale ?? 1)
          : 22 * (reveal?.borderScale ?? 1)
        const lx = Math.min(width, Math.max(0, slotLeft))
        const rx = Math.min(width, Math.max(0, slotRight))
        const ly = slotHasContent ? (slotTop + slotBottom) * 0.5 : centerY
        ctx.save()
        ctx.strokeStyle = p.colorTrace
        ctx.lineWidth = 2.2
        ctx.shadowColor = p.colorGlow
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.moveTo(lx, ly - borderHalfH)
        ctx.lineTo(lx, ly + borderHalfH)
        ctx.moveTo(rx, ly - borderHalfH)
        ctx.lineTo(rx, ly + borderHalfH)
        ctx.stroke()
        ctx.restore()
      }

      ctx.save()
      ctx.globalAlpha = waveAlpha
      ctx.fillStyle = p.colorTrace
      ctx.shadowColor = p.colorGlow
      ctx.shadowBlur = 24
      ctx.beginPath()
      ctx.arc(brightestX, brightestY, 4.5 + Math.sin(t * 8) * 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [canvasRef, ctrl])
}

export function createOscController(): OscController {
  return {
    paramsRef: { current: {
      mode: 'idle',
      direction: 'right',
      progress: 1,
      slotRect: null,
      colorTrace: 'rgba(255,0,56,0.95)',
      colorGlow: 'rgba(255,107,53,0.9)',
    } },
    scrollRef: { current: { current: 0, target: 0 } },
    mouseRef: { current: { x: 0, y: 0 } },
    waveTargetRef: { current: 1 },
    waveAlphaRef: { current: 1 },
  }
}

export { REVEAL_DURATION }
