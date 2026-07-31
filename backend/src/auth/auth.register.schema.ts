import { z } from 'zod';

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 && phone.startsWith('+');
}

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email harus diisi')
    .max(100, 'Email maksimal 100 karakter')
    .email('Format email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
  nama: z
    .string()
    .trim()
    .min(1, 'Nama harus diisi')
    .max(100, 'Nama maksimal 100 karakter'),
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
  role: z.enum(['admin', 'karyawan']).optional(),
});

export type RegisterDto = z.infer<typeof registerSchema>;
