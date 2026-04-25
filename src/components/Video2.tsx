import VideoSection from './VideoSection'

export default function Video2() {
  return (
    <VideoSection
      title="Teamfight Tactics: Operation Override - Riot Games"
      videoUrl="https://www.youtube.com/embed/itnmbGMCOkc"
      timestamps={[
        { seconds: 4, thumbnail: '/images/timestamps/operation-override-01.png' },
        { seconds: 14, thumbnail: '/images/timestamps/operation-override-02.png' },
        { seconds: 26, thumbnail: '/images/timestamps/operation-override-03.png' },
        { seconds: 37, thumbnail: '/images/timestamps/operation-override-04.png' },
      ]}
      detail={{
        heading: 'Teamfight Tactics: Operation Override - Riot Games',
        paragraphs: [
          'A sound redesign of a short section from the original video. The challenge was to have the sound reflect the rising tension throughout the entire video all the way until the end. This required careful layering of dynamic elements, building intensity through frequency stacking and rhythmic design to match the visual escalation.',
        ],
      }}
    />
  )
}
