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

export function getTourStorage(): TourStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultStorage()
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.completed === 'boolean') return parsed
    return defaultStorage()
  } catch {
    return defaultStorage()
  }
}

export function setTourStorage(data: Partial<TourStorage>): void {
  try {
    const existing = getTourStorage()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }))
  } catch {
    /* localStorage penuh atau diblokir — silent fail */
  }
}

export function clearTourStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* silent fail */
  }
}

export function isTourCompleted(): boolean {
  return getTourStorage().completed
}

export function markTourCompleted(): void {
  setTourStorage({ completed: true, completedAt: Date.now() })
}

export function markTourSkipped(): void {
  setTourStorage({ completed: true, skippedAt: Date.now() })
}

function verificationKey(): string {
  return VERIFICATION_STORAGE_KEY
}

export function isVerificationTourCompleted(): boolean {
  try {
    const raw = localStorage.getItem(verificationKey())
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return parsed?.completed === true
  } catch {
    return false
  }
}

export function markVerificationTourCompleted(): void {
  try {
    localStorage.setItem(verificationKey(), JSON.stringify({ completed: true, completedAt: Date.now() }))
  } catch { /* silent fail */ }
}

export function markVerificationTourSkipped(): void {
  try {
    localStorage.setItem(verificationKey(), JSON.stringify({ completed: true, skippedAt: Date.now() }))
  } catch { /* silent fail */ }
}

export function clearVerificationTourStorage(): void {
  try {
    localStorage.removeItem(verificationKey())
  } catch { /* silent fail */ }
}
