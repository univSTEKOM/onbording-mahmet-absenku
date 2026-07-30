import { z } from 'zod'

export const checkInSchema = z.object({
  userId: z.string().min(1, 'User ID harus diisi'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  checkIn: z.string().optional(),
  photos: z.array(z.object({
    type: z.string(),
    url: z.string(),
    capturedAt: z.string(),
  })).optional(),
  faceVerified: z.boolean().optional(),
  keterangan: z.string().optional(),
})

export const checkOutSchema = z.object({
  checkOut: z.string().min(1, 'Waktu check-out harus diisi'),
  photos: z.array(z.object({
    type: z.string(),
    url: z.string(),
    capturedAt: z.string(),
  })).optional(),
})

export type CheckInDto = z.infer<typeof checkInSchema>
export type CheckOutDto = z.infer<typeof checkOutSchema>
