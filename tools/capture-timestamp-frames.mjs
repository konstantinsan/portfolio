import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const inputPath = process.argv[2]

if (!inputPath) {
  console.error('Usage: node tools/capture-timestamp-frames.mjs path/to/video-timestamps.json')
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = JSON.parse(await readFile(resolve(inputPath), 'utf8'))
const outDir = join(root, 'public', 'images', 'timestamps')
const tempDir = await mkdtemp(join(tmpdir(), 'timestamp-capture-'))
const tempVideo = join(tempDir, 'source.%(ext)s')
const downloadedVideo = join(tempDir, 'source.mp4')

try {
  await requireCommand('yt-dlp')
  await requireCommand('ffmpeg')
  await mkdir(outDir, { recursive: true })

  await run('yt-dlp', [
    '-f',
    'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]/best',
    '--merge-output-format',
    'mp4',
    '-o',
    tempVideo,
    input.videoUrl,
  ])

  if (!existsSync(downloadedVideo)) {
    throw new Error(`yt-dlp did not create ${downloadedVideo}`)
  }

  const timestamps = input.timestamps ?? []
  for (let i = 0; i < timestamps.length; i += 1) {
    const marker = timestamps[i]
    const imagePath = join(outDir, `${input.videoKey}-${String(i + 1).padStart(2, '0')}.jpg`)
    await run('ffmpeg', [
      '-y',
      '-ss',
      String(marker.seconds),
      '-i',
      downloadedVideo,
      '-frames:v',
      '1',
      '-q:v',
      '2',
      imagePath,
    ])
    marker.image = `/images/timestamps/${basename(imagePath)}`
  }

  console.log(JSON.stringify(input, null, 2))
  console.log('\nTSX props:')
  if (input.duration) {
    console.log(`timestamps={[${timestamps.map((m) => decimal(m.seconds / input.duration)).join(', ')}]}`)
  } else {
    console.log('timestamps={[/* add percentages here; picker JSON had no duration */]}')
  }
  console.log('thumbnails={[')
  for (const marker of timestamps) {
    console.log(`  '${marker.image}',`)
  }
  console.log(']}')
} finally {
  await rm(tempDir, { recursive: true, force: true })
}

async function requireCommand(command) {
  try {
    await run(command, ['--version'], { quiet: true })
  } catch {
    throw new Error(`${command} not found on PATH. Install ${command}, then rerun this script.`)
  }
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { stdio: options.quiet ? 'ignore' : 'inherit' })
    child.on('error', rejectRun)
    child.on('exit', (code) => {
      if (code === 0) resolveRun()
      else rejectRun(new Error(`${command} exited ${code}`))
    })
  })
}

function decimal(value) {
  return Number(value.toFixed(4)).toString()
}
