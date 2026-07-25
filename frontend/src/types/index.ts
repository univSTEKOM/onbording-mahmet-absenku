export type AttendanceType = 'present' | 'absent_permit' | 'absent_unpermit'

export interface AttendanceCategory {
  id: string
  parentId: string | null
  label: string
  type: AttendanceType
  color: string
  requiresApproval: boolean
}

export type Role = 'admin' | 'karyawan'

export type UserStatus = 'pending' | 'approved' | 'rejected'

export type AbsensiStatus = 'hadir' | 'terlambat' | 'pulang_cepat' | 'izin' | 'sakit' | 'cuti'

export type PengajuanJenis = 'cuti' | 'izin' | 'sakit'

export type PengajuanStatus = 'pending' | 'approved' | 'rejected'

export interface Photo {
  type: string
  url: string
  capturedAt: string
}

export interface RejectionNote {
  note: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  password: string
  nama: string
  jabatan: string
  role: Role
  status: UserStatus
  rejectionNotes: RejectionNote[]
  foto: string
  faceDescriptor?: string
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
  mainCategory: string
  subCategory: string
  status: AbsensiStatus
  faceVerified: boolean
  photos?: Photo[]
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
  faceDescriptor?: string
}

export interface AbsensiFilters {
  userId?: string
  tanggal?: string
  tanggal_gte?: string
  tanggal_lte?: string
  mainCategory?: string | string[]
  subCategory?: string | string[]
  status?: string | string[]
  _sort?: string
  _order?: string
  _page?: number
  _limit?: number
}

export interface UserFilters {
  q?: string
  role?: string
}

export interface PengajuanFilters {
  userId?: string
  jenis?: string
  status?: string
}

export type { LoginRequest, RegisterRequest, PaginatedResult, ApiResponse, ApiError, CheckInData, CheckOutData, PengajuanFormData } from './api'
