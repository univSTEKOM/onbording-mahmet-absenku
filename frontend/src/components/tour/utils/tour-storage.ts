const STORAGE_KEY = 'absenku-tour'
const VERIFICATION_STORAGE_KEY = 'absenku-verification-tour'

export interface TourStorage {
  completed: boolean
  skippedAt?: number
  completedAt?: number
}

function defaultStorage(): TourStorage {
  return { completed: false }
}

function getKey(userId?: string): string {
  return userId ? `${STORAGE_KEY}-${userId}` : STORAGE_KEY
}

function verificationKey(userId?: string): string {
  return userId ? `${VERIFICATION_STORAGE_KEY}-${userId}` : VERIFICATION_STORAGE_KEY
}

export function getTourStorage(userId?: string): TourStorage {
  try {
    const raw = localStorage.getItem(getKey(userId))
    if (!raw) return defaultStorage()
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.completed === 'boolean') return parsed
    return defaultStorage()
  } catch {
    return defaultStorage()
  }
}

export function setTourStorage(data: Partial<TourStorage>, userId?: string): void {
  try {
    const existing = getTourStorage(userId)
    localStorage.setItem(getKey(userId), JSON.stringify({ ...existing, ...data }))
  } catch {
    /* localStorage penuh atau diblokir — silent fail */
  }
}

export function clearTourStorage(userId?: string): void {
  try {
    localStorage.removeItem(getKey(userId))
  } catch {
    /* silent fail */
  }
}

export function isTourCompleted(userId?: string): boolean {
  return getTourStorage(userId).completed
}

export function markTourCompleted(userId?: string): void {
  setTourStorage({ completed: true, completedAt: Date.now() }, userId)
}

export function markTourSkipped(userId?: string): void {
  setTourStorage({ completed: true, skippedAt: Date.now() }, userId)
}

export function isVerificationTourCompleted(userId?: string): boolean {
  try {
    const raw = localStorage.getItem(verificationKey(userId))
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.completed === true
  } catch {
    return false
  }
}

export function markVerificationTourCompleted(userId?: string): void {
  try {
    localStorage.setItem(verificationKey(userId), JSON.stringify({ completed: true, completedAt: Date.now() }))
  } catch { /* silent fail */ }
}

export function markVerificationTourSkipped(userId?: string): void {
  try {
    localStorage.setItem(verificationKey(userId), JSON.stringify({ completed: true, skippedAt: Date.now() }))
  } catch { /* silent fail */ }
}

export function clearVerificationTourStorage(userId?: string): void {
  try {
    localStorage.removeItem(verificationKey(userId))
  } catch { /* silent fail */ }
}
