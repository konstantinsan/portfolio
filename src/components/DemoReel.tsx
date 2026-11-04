import VideoSection from './VideoSection'

export default function DemoReel() {
  return (
    <VideoSection
      title="Demo Reel"
      videoUrl="https://www.youtube.com/embed/pn_YgUMv8P4"
      thumbnailUrl="https://img.youtube.com/vi/pn_YgUMv8P4/hqdefault.jpg"
      timestamps={[
        { seconds: 0, thumbnail: '/images/timestamps/demo-reel-new-01.jpg' },
        { seconds: 18, thumbnail: '/images/timestamps/demo-reel-new-02.jpg' },
        { seconds: 37, thumbnail: '/images/timestamps/demo-reel-new-03.jpg' },
      ]}
      detail={{
        heading: 'Demo Reel',
        paragraphs: [],
        tabs: [
          {
            label: 'Solo Leveling',
            heading: 'Solo Leveling',
            paragraphs: [
              "This redesign features a busy combat scene where a spectral knight, summoned by the protagonist, fights a group of orcs. I wanted to lean into the character's ghostly nature, moving beyond conventional Foley to communicate his supernatural qualities and swiftness.",
              "I recorded various props, including a camping mat and its poles, which produced interesting, growling resonances when strummed. These recordings were heavily processed through an extensive effects chain, using RX for cleanup, carefully applied distortion and movement-based effects, including Traveler. This developed into a lengthy, evolving sound that became the character's signature texture, which I integrated into the soundscape through stereo processing.",
              "For the sword combat, I wanted to emphasise the intensity of the action and accurately follow the dynamic camera movements and animation. This involved considerable experimentation with different sword samples, processing and layering them to cover specific frequency ranges, alongside lower-frequency impacts to reinforce their weight.",
              "I also recorded orc vocalisations to make the characters feel more believable.",
            ],
          },
          {
            label: 'Last Sentinel',
            heading: 'Last Sentinel',
            paragraphs: [
              "One of my main goals was to accurately reflect the camera movement and shifting perspectives through volume, panning and EQ. For example, gunshots sound brighter and more detailed when positioned in front of the camera, while shots heard from behind the character have a warmer, less detailed sound with more low-end impact.",
              "Another key focus was establishing the soldiers' unique sonic identity. Their futuristic armour suggested an unusual material somewhere between metal and plastic. To capture this, I recorded plastic-like board game tiles and layered them with keys and cloth textures.",
              "I then created a delay chain where the incoming signal's amplitude modulated the delay time in a controlled way, producing dynamic pitch fluctuations. This was further processed through Traveler Doppler to create the final soldier textures.",
              "My overall goal was to make the scene feel dangerous and exciting, reflecting the tension of the main character arriving to rescue a group of hostages. I wanted to emphasise the character's power while keeping the soundscape dynamic without becoming overly busy.",
            ],
          },
          {
            label: 'Gris',
            heading: 'Gris',
            paragraphs: [
              "The scene features the protagonist encountering a massive bird formed from a flock of smaller birds. I found this transformation visually fascinating and wanted to translate it into sound. I imagined the creature as a mass of liquid, organic matter, with the individual birds merging into one entity.",
              "To capture this, I processed multiple bird recordings through a granulator, using pitch modulation and layering to create the transformation sounds.",
              "For the creature's growls, I wanted something frightening and larger than life. I layered multiple growls processed in different ways, using notch filters, frequency shifters and other movement-based effects. I also incorporated tonal atmospheres and a combination of reverbs to give the creature a sense of width and scale.",
              "Much of the movement came from carefully placed and automated ring shifters, helping bring the creature's shifting, organic nature to life.",
            ],
          },
        ],
      }}
    />
  )
}
