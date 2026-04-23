import type { OscParams } from '@/hooks/useOscilloscope'

export function clamp01(value: number) {
  return Math.max(0, Math.min(value, 1))
}

export function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3)
}

export function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

export function easeOutQuart(value: number) {
  return 1 - Math.pow(1 - value, 4)
}

export function easeInOutQuart(value: number) {
  return value < 0.5
    ? 8 * value * value * value * value
    : 1 - Math.pow(-2 * value + 2, 4) / 2
}

export interface RevealWindow {
  finalLeft: number
  finalRight: number
  revealTail: number
  revealHead: number
  borderScale: number
  revealRatio: number
  contentAlpha: number
}

export interface RectBox {
  x: number
  y: number
  w: number
  h: number
}

export function expandRect(
  rect: RectBox,
  padding: { x?: number; y?: number; top?: number; right?: number; bottom?: number; left?: number },
): RectBox {
  const left = padding.left ?? padding.x ?? 0
  const right = padding.right ?? padding.x ?? 0
  const top = padding.top ?? padding.y ?? 0
  const bottom = padding.bottom ?? padding.y ?? 0

  return {
    x: rect.x - left,
    y: rect.y - top,
    w: rect.w + left + right,
    h: rect.h + top + bottom,
  }
}

export function getRevealWindow(params: OscParams, viewportWidth: number): RevealWindow | null {
  const slot = params.slotRect
  if (!slot || slot.w <= 0) return null

  const finalLeft = slot.x
  const finalRight = slot.x + slot.w
  const slotWidth = slot.w
  const slotHalfW = slotWidth * 0.5
  const centerX = finalLeft + slotHalfW
  const fromRight = params.direction === 'right'
  const spawnX = fromRight ? viewportWidth + 2 : -2
  const exitX = fromRight ? viewportWidth + 2 : -2

  let travelCenterX = centerX
  let halfWidth = slotHalfW
  let borderScale = 1

  const floor = clamp01(params.squeezeFloor ?? 0)

   if (params.mode === 'reveal-in') {
     if (params.centered) {
       const split = easeInOutCubic(clamp01(params.progress))
       travelCenterX = centerX
       halfWidth = slotHalfW * (floor + (1 - floor) * split)
       borderScale = 1
     } else {
      const travel = easeOutQuart(clamp01(params.progress / 0.80))
      const split = easeInOutQuart(clamp01((params.progress - 0.05) / 0.6))
      travelCenterX = spawnX + (centerX - spawnX) * travel
      halfWidth = slotHalfW * split
      borderScale = easeOutQuart(clamp01(params.progress / 0.28))
    }
   } else if (params.mode === 'reveal-out') {
     if (params.centered) {
       const split = 1 - easeInOutCubic(clamp01(params.progress))
       travelCenterX = centerX
       halfWidth = slotHalfW * (floor + (1 - floor) * split)
       borderScale = 1
     } else {
      const travel = easeInOutQuart(clamp01(params.progress / 0.85))
      const split = 1 - easeOutQuart(clamp01(params.progress / 0.65))
      travelCenterX = centerX + (exitX - centerX) * travel
      halfWidth = slotHalfW * split
      borderScale = 1 - easeOutQuart(clamp01(params.progress / 0.28))
    }
  }

  const revealTail = travelCenterX - halfWidth
  const revealHead = travelCenterX + halfWidth
  const overlapLeft = Math.max(finalLeft, revealTail)
  const overlapRight = Math.min(finalRight, revealHead)
  const overlapWidth = Math.max(0, overlapRight - overlapLeft)
  const revealRatio = slotWidth > 0 ? overlapWidth / slotWidth : 0
  const contentAlpha = easeInOutCubic(clamp01((revealRatio - 0.12) / 0.88))

  return {
    finalLeft,
    finalRight,
    revealTail,
    revealHead,
    borderScale: Math.max(0.08, borderScale),
    revealRatio,
    contentAlpha,
  }
}

/**
 * Computes the approximate rendered height of the Landing page intro block
 * at the current viewport width, replicating its CSS clamp font formula.
 * Use this to force consistent oscilloscope border tick height on video pages.
 */
export function landingBlockH(): number {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const vw = window.innerWidth
  // h1 uses clamp(3rem, 10vw, 8rem)
  const h1Font = Math.max(3 * rem, Math.min(vw * 0.10, 8 * rem))
  // subtitle (1.25rem) + 16px gap + h1 + 16px gap + tagline (1.4rem)
  return (rem * 1.25) + 16 + h1Font + 16 + (rem * 1.4)
}
