import VideoSection from './VideoSection'

export default function DemoReel() {
  return (
    <VideoSection
      title="Demo Reel"
      videoUrl="https://www.youtube.com/embed/JRXI7nRzEVM"
      detail={{
        heading: 'Demo Reel',
        paragraphs: [
          "A rolling montage of recent sound design work across games, film, and interactive media.",
          "5+ years of freelance audio — from concept through integration — distilled into 90 seconds.",
        ],
      }}
    />
  )
}
