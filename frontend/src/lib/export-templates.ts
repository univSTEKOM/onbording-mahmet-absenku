import ExcelJS from 'exceljs'
import { APP_NAME, addTitleRow, addSpacerRow, addHeaderRow, addDataRow, addSectionTitle, applyAutoFilter, freezeHeaderRow, generatePieChartBlob, generateBarChartBlob, embedChartImage } from './export-xlsx'
import { absensiStatusLabel } from './constants'
import { CATEGORY_LABEL, CATEGORY_COLORS_MAP } from './constants'
import { formatJam, hitungJam } from './utils'

function formatTanggal(tgl: string): string {
  const d = new Date(tgl + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function namaHari(tgl: string): string {
  return new Date(tgl + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long' })
}

function catLabel(id: string | undefined): string {
  if (!id) return '-'
  return CATEGORY_LABEL[id] || id
}

export interface ExportRecord {
  tanggal: string
  checkIn: string | null
  checkOut: string | null
  status: string
  mainCategory?: string
  subCategory?: string
  nama?: string
}

export async function buildExportWorkbook(
  records: ExportRecord[],
  dateFrom: string,
  dateTo: string,
  isAdmin?: boolean
): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  wb.creator = APP_NAME
  wb.created = new Date()

  const total = records.length
  if (total === 0) return wb

  const hadir = records.filter(function(r) { return r.status === 'hadir' || r.status === 'pulang_cepat' }).length
  const terlambat = records.filter(function(r) { return r.status === 'terlambat' }).length
  const izin = records.filter(function(r) { return ['izin', 'sakit', 'cuti'].includes(r.status) }).length
  const alfa = total - hadir - terlambat - izin
  const hadirPct = total > 0 ? hadir / total : 0

  const periodLabel = dateFrom && dateTo
    ? formatTanggal(dateFrom) + ' — ' + formatTanggal(dateTo)
    : dateFrom
      ? 'Mulai ' + formatTanggal(dateFrom)
      : 'Semua data'

  /* ── Sheet 1: Data Absensi ── */

  const dataCols = isAdmin
    ? [
        { header: 'Karyawan', key: 'karyawan', width: 24 },
        { header: 'Tanggal', key: 'tanggal', width: 16 },
        { header: 'Hari', key: 'hari', width: 12 },
        { header: 'Masuk', key: 'masuk', width: 10 },
        { header: 'Pulang', key: 'pulang', width: 10 },
        { header: 'Durasi', key: 'durasi', width: 10 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Kategori', key: 'kategori', width: 20 },
      ]
    : [
        { header: 'Tanggal', key: 'tanggal', width: 16 },
        { header: 'Hari', key: 'hari', width: 12 },
        { header: 'Masuk', key: 'masuk', width: 10 },
        { header: 'Pulang', key: 'pulang', width: 10 },
        { header: 'Durasi', key: 'durasi', width: 10 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Kategori', key: 'kategori', width: 20 },
      ]

  const dataRows = records.map(function(r) {
    const base: Record<string, unknown> = {
      tanggal: formatTanggal(r.tanggal),
      hari: namaHari(r.tanggal),
      masuk: formatJam(r.checkIn),
      pulang: formatJam(r.checkOut),
      durasi: hitungJam(r.checkIn, r.checkOut),
      status: absensiStatusLabel[r.status as keyof typeof absensiStatusLabel] || r.status,
      kategori: catLabel(r.subCategory),
    }
    if (isAdmin) {
      base.karyawan = r.name || '-'
    }
    return base
  })

  const wsData = wb.addWorksheet('Data Absensi', { properties: { tabColor: { argb: '1E3A5F' } } })
  addTitleRow(wsData, dataCols.length, APP_NAME + ' — Data Absensi', 'Periode: ' + periodLabel)
  const dataHeaderRow = wsData.rowCount + 1
  addHeaderRow(wsData, dataCols, dataHeaderRow)

  dataRows.forEach(function(row, i) {
    const values = dataCols.map(function(col) { return row[col.key] ?? '-' })
    const statusIdx = dataCols.findIndex(function(c) { return c.key === 'status' })
    addDataRow(wsData, dataHeaderRow + i + 1, values, {
      statusKey: statusIdx >= 0 ? String(statusIdx) : undefined,
    })
  })

  if (dataRows.length > 0) {
    applyAutoFilter(wsData, dataCols.length, dataHeaderRow, dataRows.length)
  }
  freezeHeaderRow(wsData, dataHeaderRow)

  /* ── Sheet 2: Ringkasan ── */

  const wsRingkasan = wb.addWorksheet('Ringkasan', { properties: { tabColor: { argb: '16A34A' } } })
  addTitleRow(wsRingkasan, 4, APP_NAME + ' — Ringkasan Absensi', 'Periode: ' + periodLabel)

  const catAgg: Record<string, number> = {}
  records.forEach(function(r) {
    const key = r.subCategory || r.status
    catAgg[key] = (catAgg[key] || 0) + 1
  })

  const catData = Object.entries(catAgg).map(function(e) {
    const id = e[0]; const count = e[1]
    let label = catLabel(id)
    if (label === id) label = absensiStatusLabel[id as keyof typeof absensiStatusLabel] || id
    const colorVar = CATEGORY_COLORS_MAP[id] || ''
    return { label: label, count: count, color: colorVar }
  })

  addSpacerRow(wsRingkasan)
  addSectionTitle(wsRingkasan, 4, 'Statistik Kehadiran')

  const sRow = wsRingkasan.rowCount + 1
  const statCols = [
    { header: 'Metrik', width: 20 },
    { header: 'Nilai', width: 12 },
    { header: '', width: 4 },
    { header: 'Keterangan', width: 30 },
  ]
  addHeaderRow(wsRingkasan, statCols, sRow)

  const statRows: { label: string; value: string | number; note?: string }[] = [
    { label: 'Total Hari', value: total, note: 'Seluruh data yang tercatat' },
    { label: 'Hadir', value: hadir, note: total > 0 ? Math.round(hadirPct * 100) + '% kehadiran' : '' },
    { label: 'Terlambat', value: terlambat, note: '' },
    { label: 'Izin / Sakit / Cuti', value: izin, note: '' },
    { label: 'Alfa', value: alfa, note: '' },
    { label: 'Persentase Kehadiran', value: hadirPct, note: 'Hadir / Total Hari' },
  ]

  statRows.forEach(function(sr) {
    const vals: unknown[] = [sr.label, sr.value, '', sr.note || '']
    const r = wsRingkasan.addRow(vals)
    r.height = 22
    r.eachCell(function(cell, col) {
      cell.font = { size: 10, name: 'Segoe UI' }
      if (col === 1) cell.font = { ...cell.font as ExcelJS.Font, bold: true }
      if (sr.label === 'Persentase Kehadiran' && col === 2) {
        cell.numFmt = '0.0%'
        cell.font = { ...cell.font as ExcelJS.Font, bold: true, size: 12, color: { argb: '16A34A' } }
      }
    })
  })

  try {
    const pieSource = [
      { label: 'Hadir', value: hadir, color: '#16A34A' },
      { label: 'Terlambat', value: terlambat, color: '#EA580C' },
      { label: 'Izin / Sakit', value: izin, color: '#2563EB' },
      { label: 'Alfa', value: alfa, color: '#6B7280' },
    ].filter(function(d) { return d.value > 0 })

    if (pieSource.length > 0) {
      addSpacerRow(wsRingkasan, 10)
      const pieBlob = await generatePieChartBlob(pieSource)
      await embedChartImage(wb, wsRingkasan, pieBlob, 1, wsRingkasan.rowCount + 1, 5, wsRingkasan.rowCount + 16)
    }
  } catch {
    /* non-critical */
  }

  try {
    const barSource = catData.filter(function(c) { return c.count > 0 }).map(function(c) {
      let hex = '64748B'
      if (c.color.includes('hadir')) hex = '#16A34A'
      else if (c.color.includes('terlambat')) hex = '#EA580C'
      else if (c.color.includes('izin')) hex = '#2563EB'
      else if (c.color.includes('sakit')) hex = '#DC2626'
      else if (c.color.includes('cuti')) hex = '#7C3AED'
      else if (c.color.includes('tidakHadir')) hex = '#6B7280'
      return { label: c.label, value: c.count, color: hex }
    })
    if (barSource.length > 0) {
      addSpacerRow(wsRingkasan, 6)
      const barBlob = await generateBarChartBlob(barSource)
      await embedChartImage(wb, wsRingkasan, barBlob, 1, wsRingkasan.rowCount + 1, 6, wsRingkasan.rowCount + 14)
    }
  } catch {
    /* non-critical */
  }

  /* ── Sheet 3: Statistik per Kategori ── */

  const wsCat = wb.addWorksheet('Statistik per Kategori', { properties: { tabColor: { argb: '7C3AED' } } })
  addTitleRow(wsCat, 3, APP_NAME + ' — Statistik per Kategori', 'Periode: ' + periodLabel)

  const catHeaderR = wsCat.rowCount + 1
  const catCols = [
    { header: 'Kategori', key: 'kategori', width: 26 },
    { header: 'Jumlah', key: 'jumlah', width: 12 },
    { header: 'Persentase', key: 'persentase', width: 14 },
  ]
  addHeaderRow(wsCat, catCols, catHeaderR)

  const catTotal = catData.reduce(function(s, c) { return s + c.count }, 0) || 1
  catData.forEach(function(cd, i) {
    const pct = cd.count / catTotal
    const row = wsCat.addRow([cd.label, cd.count, pct])
    row.height = 22
    row.eachCell(function(cell, col) {
      cell.font = { size: 10, name: 'Segoe UI' }
      cell.border = {
        top: { style: 'thin', color: { argb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
        left: { style: 'thin', color: { argb: 'CBD5E1' } },
        right: { style: 'thin', color: { argb: 'CBD5E1' } },
      } as ExcelJS.Borders
      if (col === 3) cell.numFmt = '0.0%'
      if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } }
      if (col === 2) {
        cell.font = { ...cell.font as ExcelJS.Font, bold: true }
      }
    })
  })

  const catBarSource = catData.filter(function(c) { return c.count > 0 }).map(function(c) {
    let hex = '64748B'
    if (c.color.includes('hadir')) hex = '#16A34A'
    else if (c.color.includes('terlambat')) hex = '#EA580C'
    else if (c.color.includes('izin')) hex = '#2563EB'
    else if (c.color.includes('sakit')) hex = '#DC2626'
    else if (c.color.includes('cuti')) hex = '#7C3AED'
    else if (c.color.includes('tidakHadir')) hex = '#6B7280'
    return { label: c.label, value: c.count, color: hex }
  })

  if (catBarSource.length > 0) {
    try {
      addSpacerRow(wsCat, 10)
      const catBarBlob = await generateBarChartBlob(catBarSource)
      await embedChartImage(wb, wsCat, catBarBlob, 1, wsCat.rowCount + 1, 6, wsCat.rowCount + 14)
    } catch {
      /* non-critical */
    }
  }

  return wb
}

/* ── Simple export (no charts, single sheet) ── */

export async function buildSimpleSheet(
  records: ExportRecord[],
  dateFrom: string,
  dateTo: string,
  isAdmin?: boolean
): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  wb.creator = APP_NAME
  wb.created = new Date()

  const periodLabel = dateFrom && dateTo
    ? formatTanggal(dateFrom) + ' — ' + formatTanggal(dateTo)
    : dateFrom ? 'Mulai ' + formatTanggal(dateFrom) : 'Semua data'

  const dataCols = isAdmin
    ? [
        { header: 'Karyawan', key: 'karyawan', width: 24 },
        { header: 'Tanggal', key: 'tanggal', width: 16 },
        { header: 'Hari', key: 'hari', width: 12 },
        { header: 'Masuk', key: 'masuk', width: 10 },
        { header: 'Pulang', key: 'pulang', width: 10 },
        { header: 'Durasi', key: 'durasi', width: 10 },
        { header: 'Status', key: 'status', width: 16 },
      ]
    : [
        { header: 'Tanggal', key: 'tanggal', width: 16 },
        { header: 'Hari', key: 'hari', width: 12 },
        { header: 'Masuk', key: 'masuk', width: 10 },
        { header: 'Pulang', key: 'pulang', width: 10 },
        { header: 'Durasi', key: 'durasi', width: 10 },
        { header: 'Status', key: 'status', width: 16 },
      ]

  const ws = wb.addWorksheet('Data Absensi', { properties: { tabColor: { argb: '1E3A5F' } } })
  addTitleRow(ws, dataCols.length, APP_NAME + ' — Data Absensi', 'Periode: ' + periodLabel)
  const headerRow = ws.rowCount + 1
  addHeaderRow(ws, dataCols, headerRow)

  records.forEach(function(r, i) {
    const base: Record<string, unknown> = {
      tanggal: formatTanggal(r.tanggal),
      hari: namaHari(r.tanggal),
      masuk: formatJam(r.checkIn),
      pulang: formatJam(r.checkOut),
      durasi: hitungJam(r.checkIn, r.checkOut),
      status: absensiStatusLabel[r.status as keyof typeof absensiStatusLabel] || r.status,
    }
    if (isAdmin) base.karyawan = r.name || '-'
    const values = dataCols.map(function(col) { return base[col.key] ?? '-' })
    const statusIdx = dataCols.findIndex(function(c) { return c.key === 'status' })
    addDataRow(ws, headerRow + i + 1, values, {
      statusKey: statusIdx >= 0 ? String(statusIdx) : undefined,
    })
  })

  if (records.length > 0) {
    applyAutoFilter(ws, dataCols.length, headerRow, records.length)
  }
  freezeHeaderRow(ws, headerRow)

  return wb
}
