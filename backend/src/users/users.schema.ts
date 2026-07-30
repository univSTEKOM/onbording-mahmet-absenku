import { z } from 'zod';

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && phone.startsWith('+');
}

export const updateUserSchema = z.object({
  nama: z
    .string()
    .trim()
    .min(1, 'Nama tidak boleh kosong')
    .max(100, 'Nama maksimal 100 karakter')
    .optional(),
  email: z
    .string()
    .trim()
    .max(100, 'Email maksimal 100 karakter')
    .email('Format email tidak valid')
    .optional(),
  jabatan: z
    .string()
    .trim()
    .max(100, 'Jabatan maksimal 100 karakter')
    .optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || isValidPhone(v),
      'Nomor telepon tidak valid. Minimal 10 digit dan diawali +',
    ),
  alamat: z.string().trim().max(500, 'Alamat maksimal 500 karakter').optional(),
  foto: z.string().optional(),
  faceDescriptor: z.string().optional(),
});

export const adminUpdateUserSchema = updateUserSchema.extend({
  role: z.enum(['admin', 'karyawan']).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  note: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
});

export const addNoteSchema = z.object({
  note: z
    .string()
    .min(1, 'Catatan harus diisi')
    .max(500, 'Catatan maksimal 500 karakter'),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type AdminUpdateUserDto = z.infer<typeof adminUpdateUserSchema>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;
export type AddNoteDto = z.infer<typeof addNoteSchema>;
