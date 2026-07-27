import type { XlsxSheet } from './export-xlsx'
import { absensiStatusLabel } from './constants'
import { formatJam, hitungJam } from './utils'

function formatTanggal(tgl: string): string {
  return new Date(tgl + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function namaHari(tgl: string): string {
  return new Date(tgl + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
}

export function buildRiwayatSheets(absensi: { tanggal: string; checkIn: string | null; checkOut: string | null; status: string; subCategory?: string }[]): XlsxSheet[] {
  const total = absensi.length
  const hadir = absensi.filter(function(a) { return a.status === 'hadir' || a.status === 'pulang_cepat' }).length
  const terlambat = absensi.filter(function(a) { return a.status === 'terlambat' }).length
  const izin = absensi.filter(function(a) { return ['izin', 'sakit', 'cuti'].includes(a.status) }).length
  const alfa = total - hadir - terlambat - izin
  const dataSheetName = 'Data Absensi'

  const sheet1: XlsxSheet = {
    name: dataSheetName,
    columns: [
      { header: 'Tanggal', key: 'tanggal', width: 14 },
      { header: 'Hari', key: 'hari', width: 10 },
      { header: 'Masuk', key: 'masuk', width: 10 },
      { header: 'Pulang', key: 'pulang', width: 10 },
      { header: 'Durasi', key: 'durasi', width: 10 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Kategori', key: 'kategori', width: 18 },
    ],
    rows: absensi.map(function(a) {
      return {
        tanggal: formatTanggal(a.tanggal),
        hari: namaHari(a.tanggal),
        masuk: formatJam(a.checkIn),
        pulang: formatJam(a.checkOut),
        durasi: hitungJam(a.checkIn, a.checkOut),
        status: absensiStatusLabel[a.status as keyof typeof absensiStatusLabel] || a.status,
        kategori: '',
      }
    }),
    summaryRows: [
      { label: 'Total Hari', value: total },
      { label: 'Hadir', value: hadir, formula: "=COUNTIF('" + dataSheetName + "'!F2:F" + (total + 1) + ',"Hadir")' },
      { label: 'Terlambat', value: terlambat },
      { label: 'Izin / Sakit', value: izin },
      { label: 'Alfa', value: alfa },
      { label: 'Persentase Hadir', formula: '=B3/B2' },
    ],
    categoryRows: [
      { label: 'Hadir', count: hadir },
      { label: 'Terlambat', count: terlambat },
      { label: 'Izin / Sakit', count: izin },
      { label: 'Alfa', count: alfa },
    ],
  }

  return [sheet1]
}

export function buildAdminRiwayatSheets(absensi: { nama: string; tanggal: string; checkIn: string | null; checkOut: string | null; status: string; subCategory?: string }[]): XlsxSheet[] {
  const total = absensi.length
  const hadir = absensi.filter(function(a) { return a.status === 'hadir' || a.status === 'pulang_cepat' }).length
  const terlambat = absensi.filter(function(a) { return a.status === 'terlambat' }).length
  const izin = absensi.filter(function(a) { return ['izin', 'sakit', 'cuti'].includes(a.status) }).length
  const alfa = total - hadir - terlambat - izin
  const dataSheetName = 'Data Absensi'

  const sheet1: XlsxSheet = {
    name: dataSheetName,
    columns: [
      { header: 'Karyawan', key: 'karyawan', width: 22 },
      { header: 'Tanggal', key: 'tanggal', width: 14 },
      { header: 'Hari', key: 'hari', width: 10 },
      { header: 'Masuk', key: 'masuk', width: 10 },
      { header: 'Pulang', key: 'pulang', width: 10 },
      { header: 'Durasi', key: 'durasi', width: 10 },
      { header: 'Status', key: 'status', width: 14 },
    ],
    rows: absensi.map(function(a) {
      return {
        karyawan: a.nama,
        tanggal: formatTanggal(a.tanggal),
        hari: namaHari(a.tanggal),
        masuk: formatJam(a.checkIn),
        pulang: formatJam(a.checkOut),
        durasi: hitungJam(a.checkIn, a.checkOut),
        status: absensiStatusLabel[a.status as keyof typeof absensiStatusLabel] || a.status,
      }
    }),
    summaryRows: [
      { label: 'Total Data', value: total },
      { label: 'Hadir', value: hadir },
      { label: 'Terlambat', value: terlambat },
      { label: 'Izin / Sakit', value: izin },
      { label: 'Alfa', value: alfa },
      { label: 'Persentase Hadir', formula: '=B3/B2' },
    ],
    categoryRows: [
      { label: 'Hadir', count: hadir },
      { label: 'Terlambat', count: terlambat },
      { label: 'Izin / Sakit', count: izin },
      { label: 'Alfa', count: alfa },
    ],
  }

  return [sheet1]
}
