export type Role = "admin" | "karyawan"

export type AbsensiStatus = "hadir" | "terlambat" | "izin" | "sakit" | "cuti"

export type PengajuanJenis = "cuti" | "izin" | "sakit"

export type PengajuanStatus = "pending" | "approved" | "rejected"

export interface User {
  id: number
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
  userId: number
  tanggal: string
  checkIn: string | null
  checkOut: string | null
  status: AbsensiStatus
  faceVerified: boolean
  keterangan: string
  createdAt: string
}

export interface Pengajuan {
  id: number
  userId: number
  jenis: PengajuanJenis
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
  status: PengajuanStatus
  catatan: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nama: string
  jabatan: string
  phone?: string
}

export interface LoginResponse {
  user: User
  token: string
}
