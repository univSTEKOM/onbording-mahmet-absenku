const MODEL_URL = '/models'
const INPUT_SIZE = 320

let faceapiRef: typeof import('face-api.js') | null = null
let modelsLoaded = false
let modelsLoadPromise: Promise<void> | null = null

async function getFaceapi(): Promise<typeof import('face-api.js')> {
  if (!faceapiRef) {
    faceapiRef = await import('face-api.js')
  }
  return faceapiRef
}

export async function loadModels() {
  if (modelsLoaded) return
  if (modelsLoadPromise) return modelsLoadPromise
  modelsLoadPromise = (async () => {
    const faceapi = await getFaceapi()
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ])
    modelsLoaded = true
  })().catch((e) => {
    /* Reset promise supaya bisa retry kalau gagal */
    modelsLoadPromise = null
    throw e
  })
  return modelsLoadPromise
}

export function areModelsLoaded(): boolean {
  return modelsLoaded
}

type DetectedFace = import('face-api.js').WithFaceDescriptor<
  import('face-api.js').WithFaceLandmarks<{ detection: import('face-api.js').FaceDetection }>
>

/**
 * Preprocessing: naikkan kontras/brightness/saturasi sebelum deteksi.
 * Bantu deteksi di pencahayaan redup dan skin tone gelap.
 * Foto yang disimpan tetap original — enhancement hanya untuk deteksi.
 */
function enhanceCanvas(input: HTMLVideoElement | HTMLCanvasElement): HTMLCanvasElement {
  const w = 'videoWidth' in input ? input.videoWidth : input.width
  const h = 'videoHeight' in input ? input.videoHeight : input.height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.filter = 'contrast(1.15) brightness(1.05) saturate(1.15)'
  ctx.drawImage(input, 0, 0, w, h)
  return canvas
}

/**
 * Deteksi semua wajah, return wajah DOMINAN (area terbesar / paling dekat kamera)
 * + jumlah wajah terdeteksi. Orang di background tidak menghalangi verifikasi.
 */
export async function detectDominantFace(
  input: HTMLVideoElement | HTMLCanvasElement,
  timeoutMs = 10000
): Promise<{ result: DetectedFace | null; faceCount: number }> {
  const faceapi = await getFaceapi()
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true }, timeoutMs)

  try {
    if (timedOut) return { result: null, faceCount: 0 }
    const enhanced = enhanceCanvas(input)
    const results = await faceapi
      .detectAllFaces(enhanced, new faceapi.TinyFaceDetectorOptions({ inputSize: INPUT_SIZE }))
      .withFaceLandmarks()
      .withFaceDescriptors()

    if (results.length === 0) return { result: null, faceCount: 0 }

    const dominant = results.reduce((a, b) =>
      a.detection.box.width * a.detection.box.height > b.detection.box.width * b.detection.box.height ? a : b,
    )
    return { result: dominant, faceCount: results.length }
  } catch {
    return { result: null, faceCount: 0 }
  } finally {
    clearTimeout(timer)
  }
}

export function drawFaceOverlay(
  canvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number,
  faces: { x: number; y: number; width: number; height: number }[] | null,
  faceStable: boolean
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = videoWidth
  canvas.height = videoHeight

  if (faces && faces.length > 0) {
    const hasMultiple = faces.length > 1
    faces.forEach((box) => {
      const color = faceStable && !hasMultiple ? 'rgba(34, 197, 94, 0.8)' : hasMultiple ? 'rgba(239, 68, 68, 0.8)' : 'rgba(234, 179, 8, 0.8)'
      ctx.beginPath()
      ctx.roundRect(box.x, box.y, box.width, box.height, 16)
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.save()
      ctx.shadowColor = color.replace('0.8', '0.3')
      ctx.shadowBlur = 20
      ctx.stroke()
      ctx.restore()
    })
  }
}

function computeDistance(descriptor1: Float32Array, descriptor2: Float32Array): number {
  let sum = 0
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}

export function isMatch(descriptor1: Float32Array, descriptor2: Float32Array, threshold = 0.5): boolean {
  return computeDistance(descriptor1, descriptor2) < threshold
}

export function descriptorToArray(descriptor: Float32Array): number[] {
  return Array.from(descriptor)
}

export function arrayToDescriptor(arr: number[]): Float32Array {
  return new Float32Array(arr)
}

export function isFaceDescriptor(data: unknown): data is number[] {
  return (
    Array.isArray(data) &&
    data.length === 128 &&
    data.every((v) => typeof v === 'number' && !isNaN(v))
  )
}
