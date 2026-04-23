import { createContext, useContext } from 'react'
import type { OscController } from '@/hooks/useOscilloscope'

export type FlowKey = 'landing' | 'demo' | 'integration' | 'video-1' | 'video-2' | 'video-3' | 'post-production'
export type OverlayKey = 'about' | 'contact' | null

export const FLOW: { key: FlowKey; label: string }[] = [
  { key: 'landing',         label: 'Intro' },
  { key: 'demo',            label: 'Demo Reel' },
  { key: 'integration',     label: 'Integration' },
  { key: 'video-1',         label: 'Studio Cinematic' },
  { key: 'video-2',         label: 'Operation Override' },
  { key: 'video-3',         label: 'Araxys Skinline' },
  { key: 'post-production', label: 'Post Production' },
]

export type ScrollDir = 'up' | 'down' | null

export interface FlowCtx {
  index: number
  direction: 1 | -1
  overlay: OverlayKey
  isTransitioning: boolean
  scrollDir: ScrollDir
  soundOn: boolean
  setSoundOn: (v: boolean) => void
  goTo: (targetIndex: number) => void
  next: () => void
  prev: () => void
  openOverlay: (k: Exclude<OverlayKey, null>) => void
  closeOverlay: () => void
  setSlotRect: (rect: { x: number; y: number; w: number; h: number } | null) => void
  oscController: OscController
}

export const FlowContext = createContext<FlowCtx | null>(null)

export function useFlow(): FlowCtx {
  const ctx = useContext(FlowContext)
  if (!ctx) throw new Error('useFlow outside provider')
  return ctx
}
