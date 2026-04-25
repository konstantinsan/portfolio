import VideoSection from './VideoSection'

export default function PostProduction() {
  return (
    <VideoSection
      title="Post Production"
      videoUrl="https://www.youtube.com/embed/dEMiW-qUpB0"
      timestamps={[
        { seconds: 15, thumbnail: '/images/timestamps/post-production-01.png' },
        { seconds: 29, thumbnail: '/images/timestamps/post-production-02.png' },
        { seconds: 37, thumbnail: '/images/timestamps/post-production-03.png' },
        { seconds: 51, thumbnail: '/images/timestamps/post-production-04.png' },
      ]}
      detail={{
        heading: 'Most Computers Realme 9 Pro 5G',
        paragraphs: [
          'I was entirely responsible for the sound design and music for the new Realme 9 PRO 5G advertisement, in collaboration with the team at Image Factory who shot and edited the footage. The project required creating a complete sonic identity for the product, from impactful transitions and UI sounds to an original music bed that drives the energy of the commercial.',
        ],
      }}
    />
  )
}
