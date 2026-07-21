export interface ApiResponse<T> {
  data: T
  message?: string
  token?: string
}

export interface ApiError {
  message: string
  status?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
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
  user: import('./index').User
  token: string
}

export interface CheckInData {
  userId: number
  tanggal: string
  checkIn: string
}

export interface CheckOutData {
  checkOut: string
}

export interface PengajuanFormData {
  userId: number
  jenis: string
  tanggalMulai: string
  tanggalSelesai: string
  alasan: string
}
