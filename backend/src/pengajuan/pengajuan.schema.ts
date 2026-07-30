import { z } from 'zod'

export const createPengajuanSchema = z.object({
  userId: z.string().min(1, 'User ID harus diisi'),
  jenis: z.enum(['cuti', 'izin', 'sakit']),
  tanggalMulai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  tanggalSelesai: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
  alasan: z.string().trim().min(10, 'Alasan minimal 10 karakter').max(500, 'Alasan maksimal 500 karakter'),
})

export const updatePengajuanSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']).optional(),
  catatan: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
})

export type CreatePengajuanDto = z.infer<typeof createPengajuanSchema>
export type UpdatePengajuanDto = z.infer<typeof updatePengajuanSchema>
