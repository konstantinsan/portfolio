import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useFlow } from '@/state/flow'
import { getRevealWindow } from '@/lib/reveal'

interface RevealBlockProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  scaleOnReveal?: boolean
}

export default function RevealBlock({ children, className, style, scaleOnReveal = false }: RevealBlockProps) {
  const flow = useFlow()
  const [maskStyle, setMaskStyle] = useState<CSSProperties>({ opacity: 1 })
  const blockRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId = 0

    const update = () => {
      const params = flow.oscController.paramsRef.current
      const reveal = getRevealWindow(params, window.innerWidth)
      const rect = blockRef.current?.getBoundingClientRect()

      if (!reveal || !rect || params.mode === 'idle') {
        setMaskStyle({ opacity: 1, clipPath: 'inset(0 0 0 0)' })
        rafId = requestAnimationFrame(update)
        return
      }

      const blockLeft = rect.left
      const blockRight = rect.right
      const maskLeft = Math.max(blockLeft, reveal.revealTail)
      const maskRight = Math.min(blockRight, reveal.revealHead)
      const visibleLeft = Math.max(0, maskLeft - blockLeft)
      const visibleRight = Math.max(0, blockRight - maskRight)

      const scale = scaleOnReveal ? reveal.revealRatio : 1

      setMaskStyle({
        opacity: reveal.contentAlpha,
        clipPath: `inset(0 ${visibleRight}px 0 ${visibleLeft}px)`,
        transform: `scale(${scale})`,
      })

      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [flow, scaleOnReveal])

  return (
    <div ref={blockRef} className={className} style={{ ...style, ...maskStyle }}>
      {children}
    </div>
  )
}
