import { describe, it, expect } from 'vitest'
import { isMatch, descriptorToArray, arrayToDescriptor, isFaceDescriptor } from '@/lib/faceDetection'

function makeDescriptor(values: number[]): Float32Array {
  const arr = new Float32Array(128)
  values.forEach((v, i) => { if (i < 128) arr[i] = v })
  return arr
}

describe('isMatch', () => {
  it('returns true for identical descriptors', () => {
    const d1 = makeDescriptor(Array(128).fill(0.5))
    const d2 = makeDescriptor(Array(128).fill(0.5))
    expect(isMatch(d1, d2)).toBe(true)
  })

  it('returns true for similar descriptors (within threshold)', () => {
    const d1 = makeDescriptor(Array(128).fill(0.5))
    const d2 = makeDescriptor(Array(128).fill(0.51))
    expect(isMatch(d1, d2)).toBe(true)
  })

  it('returns false for very different descriptors', () => {
    const d1 = makeDescriptor(Array(128).fill(0))
    const d2 = makeDescriptor(Array(128).fill(1))
    expect(isMatch(d1, d2)).toBe(false)
  })

  it('uses provided threshold', () => {
    /* Euclidean distance = sqrt(128 * 0.3^2) = sqrt(11.52) ≈ 3.39 */
    const d1 = makeDescriptor(Array(128).fill(0.5))
    const d2 = makeDescriptor(Array(128).fill(0.2))
    expect(isMatch(d1, d2, 2.0)).toBe(false)
    expect(isMatch(d1, d2, 4.0)).toBe(true)
  })
})

describe('descriptorToArray / arrayToDescriptor', () => {
  it('round-trips correctly', () => {
    const original = new Float32Array(128)
    for (let i = 0; i < 128; i++) original[i] = Math.random()
    const arr = descriptorToArray(original)
    expect(arr).toHaveLength(128)
    const restored = arrayToDescriptor(arr)
    expect(restored).toBeInstanceOf(Float32Array)
    expect(restored.length).toBe(128)
    for (let i = 0; i < 128; i++) {
      expect(restored[i]).toBe(original[i])
    }
  })
})

describe('isFaceDescriptor', () => {
  it('returns true for valid 128-element array', () => {
    const data = Array.from({ length: 128 }, () => 0.5)
    expect(isFaceDescriptor(data)).toBe(true)
  })

  it('returns false for array with wrong length', () => {
    expect(isFaceDescriptor([1, 2, 3])).toBe(false)
  })

  it('returns false for array with NaN values', () => {
    const data = Array.from({ length: 128 }, () => NaN)
    expect(isFaceDescriptor(data)).toBe(false)
  })

  it('returns false for non-array input', () => {
    expect(isFaceDescriptor('string')).toBe(false)
    expect(isFaceDescriptor(null)).toBe(false)
    expect(isFaceDescriptor({})).toBe(false)
  })
})
