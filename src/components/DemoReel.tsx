import VideoSection from './VideoSection'

export default function DemoReel() {
  return (
    <VideoSection
      title="Demo Reel"
      videoUrl="https://www.youtube.com/embed/JRXI7nRzEVM"
      timestamps={[
        { seconds: 19, thumbnail: '/images/timestamps/demo-01.png' },
        { seconds: 29, thumbnail: '/images/timestamps/demo-02.png' },
        { seconds: 38, thumbnail: '/images/timestamps/demo-03.png' },
        { seconds: 49, thumbnail: '/images/timestamps/demo-04.png' },
      ]}
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
