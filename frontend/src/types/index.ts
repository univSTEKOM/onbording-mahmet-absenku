export type Role = 'admin' | 'karyawan'

export type AbsensiStatus = 'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti'

export type PengajuanJenis = 'cuti' | 'izin' | 'sakit'

export type PengajuanStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  email: string
  password: string
  nama: string
  jabatan: string
  role: Role
  foto: string
  phone: string
  alamat: string
  createdAt: string
}

export interface Absensi {
  id: number
  userId: string
  tanggal: string
  checkIn: string | null
  checkOut: string | null
  status: AbsensiStatus
  faceVerified: boolean
  foto: string | null
  keterangan: string
  createdAt: string
}

export interface Pengajuan {
  id: number
  userId: string
  jenis: PengajuanJenis
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
  status: PengajuanStatus
  catatan: string
  createdAt: string
}

export interface UpdateUserData {
  nama?: string
  email?: string
  jabatan?: string
  phone?: string
  alamat?: string
  foto?: string
  role?: Role
}

export interface AbsensiFilters {
  userId?: string
  tanggal?: string
  tanggal_gte?: string
  tanggal_lte?: string
  status?: string
  _sort?: string
  _order?: string
  _page?: number
  _limit?: number
}

export interface PengajuanFilters {
  userId?: string
  status?: string
}

export type { LoginRequest, RegisterRequest, PaginatedResult, ApiResponse, ApiError, CheckInData, CheckOutData, PengajuanFormData } from './api'
