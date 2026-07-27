import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkIn, checkOut } from '@/api/absensi'

vi.mock('@/api/axios', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    get: vi.fn(),
  },
}))

import api from '@/api/axios'

const mockApi = vi.mocked(api)

describe('checkIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends POST with userId, tanggal, checkIn, photos', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1, status: 'hadir' } })

    const data = {
      userId: 'user-123',
      tanggal: '2026-07-25',
      checkIn: '2026-07-25T07:30:00Z',
    }

    const result = await checkIn(data)
    expect(mockApi.post).toHaveBeenCalledWith('/absensi', expect.objectContaining({
      userId: 'user-123',
      tanggal: '2026-07-25',
      checkIn: '2026-07-25T07:30:00Z',
    }))
    expect(result.status).toBe('hadir')
  })

  it('includes photos array when provided', async () => {
    mockApi.post.mockResolvedValue({ data: { id: 1 } })

    const photoUrl = 'data:image/jpeg;base64,abc123'
    await checkIn({
      userId: 'user-123',
      tanggal: '2026-07-25',
      checkIn: '2026-07-25T07:30:00Z',
      photos: [{ type: 'check_in', url: photoUrl, capturedAt: '2026-07-25T07:30:00Z' }],
    })

    expect(mockApi.post).toHaveBeenCalledWith('/absensi', expect.objectContaining({
      photos: [expect.objectContaining({ type: 'check_in', url: photoUrl })],
    }))
  })
})

describe('checkOut', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches existing then patches checkout', async () => {
    mockApi.get.mockResolvedValue({ data: { photos: [] } })
    mockApi.patch.mockResolvedValue({ data: { id: 1, checkOut: '2026-07-25T16:00:00Z' } })

    const result = await checkOut(1, { checkOut: '2026-07-25T16:00:00Z', photos: [] })

    expect(mockApi.get).toHaveBeenCalledWith('/absensi/1')
    expect(mockApi.patch).toHaveBeenCalledWith('/absensi/1', expect.objectContaining({
      checkOut: '2026-07-25T16:00:00Z',
    }))
    expect(result.checkOut).toBe('2026-07-25T16:00:00Z')
  })

  it('merges existing photos with new checkout photos', async () => {
    const existingPhotos = [{ type: 'check_in', url: 'data:image/old', capturedAt: '2026-07-25T07:30:00Z' }]
    const newPhotos = [{ type: 'check_out', url: 'data:image/new', capturedAt: '2026-07-25T16:00:00Z' }]

    mockApi.get.mockResolvedValue({ data: { photos: existingPhotos } })
    mockApi.patch.mockResolvedValue({ data: { id: 1 } })

    await checkOut(1, { checkOut: '2026-07-25T16:00:00Z', photos: newPhotos })

    expect(mockApi.patch).toHaveBeenCalledWith('/absensi/1', expect.objectContaining({
      photos: [...existingPhotos, ...newPhotos],
    }))
  })
})
