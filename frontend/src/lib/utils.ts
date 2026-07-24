import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTanggal(date: string) {
  return formatDate(date)
}

export function formatTime(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function durasiHari(mulai: string, selesai: string) {
  const ms = new Date(selesai).getTime() - new Date(mulai).getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1
}

export function hitungJam(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn) return '-'
  const masuk = new Date(checkIn).getTime()
  const keluar = checkOut ? new Date(checkOut).getTime() : Date.now()
  const ms = keluar - masuk
  const jam = Math.floor(ms / (1000 * 60 * 60))
  const menit = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${jam}j ${menit}m`
}

export const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export type QuickDate = 'hari_ini' | 'kemarin' | '7_hari' | 'bulan_ini' | null

export function getDateRange(preset: QuickDate): { dateFrom: string; dateTo: string } | null {
  if (!preset) return null
  const today = new Date().toISOString().split('T')[0]
  switch (preset) {
    case 'hari_ini':
      return { dateFrom: today, dateTo: today }
    case 'kemarin': {
      const d = new Date(); d.setDate(d.getDate() - 1)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: d.toISOString().split('T')[0] }
    }
    case '7_hari': {
      const d = new Date(); d.setDate(d.getDate() - 7)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today }
    }
    case 'bulan_ini': {
      const d = new Date(); d.setDate(1)
      return { dateFrom: d.toISOString().split('T')[0], dateTo: today }
    }
  }
}

interface ApiErrorResponse {
  response?: { data?: { message?: string } }
}

export function getApiErrorMessage(err: unknown, fallback = 'Terjadi kesalahan'): string {
  return (err as ApiErrorResponse)?.response?.data?.message || fallback
}
