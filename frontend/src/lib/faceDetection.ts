const MODEL_URL = '/models'

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
  })()
  return modelsLoadPromise
}

export function areModelsLoaded(): boolean {
  return modelsLoaded
}

export async function detectFace(
  input: HTMLVideoElement | HTMLCanvasElement,
  timeoutMs = 10000
): Promise<import('face-api.js').WithFaceDescriptor<import('face-api.js').WithFaceLandmarks<{ detection: import('face-api.js').FaceDetection }>> | null> {
  const faceapi = await getFaceapi()
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true }, timeoutMs)

  try {
    if (timedOut) return null
    const result = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
      .withFaceLandmarks()
      .withFaceDescriptor()

    return result || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function countFaces(input: HTMLVideoElement | HTMLCanvasElement): Promise<number> {
  try {
    const faceapi = await getFaceapi()
    const results = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
    return results.length
  } catch {
    return 0
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
