import VideoSection from './VideoSection'

export default function Video3() {
  return (
    <VideoSection
      title="FUEL// Araxys Skinline Trailer - VALORANT"
      videoUrl="https://www.youtube.com/embed/hSeivzG1344"
      timestamps={[
        { seconds: 0, thumbnail: '/images/timestamps/araxys-01.png' },
        { seconds: 4, thumbnail: '/images/timestamps/araxys-02.png' },
        { seconds: 7, thumbnail: '/images/timestamps/araxys-03.png' },
        { seconds: 12, thumbnail: '/images/timestamps/araxys-04.png' },
      ]}
      detail={{
        heading: 'FUEL// Araxys Skinline Trailer - VALORANT',
        paragraphs: [
          'A sound redesign of a short section from the original video. Demonstrating a mixture of diegetic and synthetic sounds that make up the sound of the alien. The design blended organic textures with processed electronic elements to create an otherworldly sonic identity that serves the visual storytelling.',
        ],
      }}
    />
  )
}
