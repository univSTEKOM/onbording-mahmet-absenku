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

export function computeDistance(
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
