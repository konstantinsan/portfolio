import VideoSection from './VideoSection'

export default function Video1() {
  return (
    <VideoSection
      title="Keinon"
      videoUrl="https://www.youtube.com/embed/s9kieH0nmbg"
      timestamps={[
        { seconds: 2, thumbnail: '/images/timestamps/keinon-01.png' },
        { seconds: 11, thumbnail: '/images/timestamps/keinon-02.png' },
        { seconds: 19, thumbnail: '/images/timestamps/keinon-03.png' },
        { seconds: 24, thumbnail: '/images/timestamps/keinon-04.png' },
      ]}
      detail={{
        heading: 'KEINON - a Tendril Studio Cinematic',
        paragraphs: [
          'A sound redesign that was loads of fun to make. I loved the original and wanted to improve on the sound by selling the dynamics and dangerousness of the fight. The project involved layering impactful hits, designing tense atmospheric textures, and crafting a sense of weight and momentum throughout the cinematic sequence.',
        ],
      }}
    />
  )
}
