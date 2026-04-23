import VideoSection from './VideoSection'

export default function Integration() {
  return (
    <VideoSection
      title="Integration"
      videoUrl="https://www.youtube.com/embed/L0E4eqil1Nw"
      detail={{
        heading: 'Warhammer 40,000: Boltgun - Weapon system Redesign',
        paragraphs: [
          'An interactive redesign of the weapon system in Boltgun, made in Reaper and Wwise by using the reascript Wwhisper, by Thomas Fritz.',
          'This project demonstrates a full Wwise integration pipeline, including real-time RTPC-driven sound design for weapon impacts, a state-based system with multiple interactive layers, and optimized voice management for combat scenarios.',
        ],
      }}
    />
  )
}
