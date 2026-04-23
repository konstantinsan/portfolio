import { useRef } from 'react'
import { useOscilloscope, type OscController } from '@/hooks/useOscilloscope'

export default function Oscilloscope({ controller }: { controller: OscController }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useOscilloscope(canvasRef, controller)
  return <canvas ref={canvasRef} className="osc-canvas" aria-hidden="true" />
}
