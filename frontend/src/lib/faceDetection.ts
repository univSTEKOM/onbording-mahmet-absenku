import * as faceapi from 'face-api.js'

const MODEL_URL = '/models'

export async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
}

export async function detectFace(
  input: HTMLVideoElement | HTMLCanvasElement,
  timeoutMs = 10000
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null> {
  const timer = setTimeout(() => {
    throw new Error('Timeout: wajah tidak terdeteksi dalam batas waktu')
  }, timeoutMs)

  try {
    const result = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
      .withFaceLandmarks()
      .withFaceDescriptor()

    return result || null
  } finally {
    clearTimeout(timer)
  }
}

export function drawFaceOverlay(
  canvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number,
  faceBox: { x: number; y: number; width: number; height: number } | null,
  isCentered: boolean
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = videoWidth
  canvas.height = videoHeight

  const cx = videoWidth / 2
  const cy = videoHeight / 2
  const radius = Math.min(videoWidth, videoHeight) * 0.3

  /* Dark overlay with circle cutout */
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.fillRect(0, 0, videoWidth, videoHeight)

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.clip()
  ctx.clearRect(0, 0, videoWidth, videoHeight)
  ctx.restore()

  /* Guide circle border */
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = faceBox && isCentered ? 'rgba(34, 197, 94, 0.7)' : faceBox ? 'rgba(234, 179, 8, 0.7)' : 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 2.5
  ctx.stroke()

  /* Face box */
  if (faceBox) {
    ctx.strokeStyle = isCentered ? 'rgba(34, 197, 94, 0.8)' : 'rgba(234, 179, 8, 0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(faceBox.x, faceBox.y, faceBox.width, faceBox.height)
  }
}

function computeDistance(
  descriptor1: Float32Array,
  descriptor2: Float32Array
): number {
  return faceapi.euclideanDistance(descriptor1, descriptor2)
}

export function isMatch(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold = 0.5
): boolean {
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
