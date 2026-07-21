import * as faceapi from 'face-api.js'

const MODEL_URL = '/models'
let loaded = false

export async function loadModels() {
  if (loaded) return
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
  loaded = true
}

export async function detectFace(
  input: HTMLVideoElement | HTMLCanvasElement
): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>> | null> {
  const result = await faceapi
    .detectSingleFace(input)
    .withFaceLandmarks()
    .withFaceDescriptor()

  return result || null
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
  threshold = 0.6
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
