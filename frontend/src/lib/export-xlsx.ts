import ExcelJS from 'exceljs'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'AbsenKu'

const HEADER_BG = '1E3A5F'
const HEADER_FONT_COLOR = 'FFFFFF'
const ROW_ALT_COLOR = 'F1F5F9'
const BORDER_COLOR = 'CBD5E1'
const TITLE_BG = '0F172A'

const STATUS_COLORS: Record<string, string> = {
  Hadir: '16A34A',
  Terlambat: 'EA580C',
  'Pulang Cepat': 'D97706',
  Izin: '2563EB',
  Sakit: 'DC2626',
  Cuti: '7C3AED',
  Alfa: '6B7280',
  'Absen Masuk': '2563EB',
}

const borderStyle: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: BORDER_COLOR } },
  bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
  left: { style: 'thin', color: { argb: BORDER_COLOR } },
  right: { style: 'thin', color: { argb: BORDER_COLOR } },
}

/* ── Chart Generation ── */

export async function generatePieChartBlob(data: { label: string; value: number; color: string }[]): Promise<Blob> {
  const size = 400
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const cx = size / 2
  const cy = size / 2 - 20
  const radius = 140
  const total = data.reduce(function(s, d) { return s + d.value }, 0) || 1

  ctx.clearRect(0, 0, size, size)

  let startAngle = -Math.PI / 2
  data.forEach(function(d) {
    const sliceAngle = (d.value / total) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = d.color
    ctx.fill()
    startAngle += sliceAngle
  })

  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()

  ctx.fillStyle = '#1E293B'
  ctx.font = 'bold 28px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(total.toString(), cx, cy - 8)
  ctx.font = '12px sans-serif'
  ctx.fillStyle = '#64748B'
  ctx.fillText('Total', cx, cy + 16)

  let legendY = size - 30 - data.length * 22
  data.forEach(function(d) {
    ctx.fillStyle = d.color
    ctx.fillRect(40, legendY, 14, 14)
    ctx.fillStyle = '#1E293B'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
    ctx.fillText(d.label + ': ' + d.value + ' (' + pct + '%)', 60, legendY + 7)
    legendY += 22
  })

  return new Promise(function(resolve) {
    canvas.toBlob(function(blob) {
      resolve(blob!)
    }, 'image/png')
  })
}

export async function generateBarChartBlob(data: { label: string; value: number; color: string }[]): Promise<Blob> {
  const width = 500
  const height = 300
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const maxVal = Math.max(1, ...data.map(function(d) { return d.value }))
  const barWidth = Math.max(20, Math.min(60, (width - 100) / data.length - 10))
  const chartLeft = 60
  const chartBottom = height - 40
  const chartTop = 30
  const chartRight = width - 20

  ctx.clearRect(0, 0, width, height)

  ctx.strokeStyle = '#E2E8F0'
  ctx.lineWidth = 1
  for (let i = 0; i <= 4; i++) {
    const y = chartBottom - ((chartBottom - chartTop) / 4) * i
    ctx.beginPath()
    ctx.moveTo(chartLeft, y)
    ctx.lineTo(chartRight, y)
    ctx.stroke()
    ctx.fillStyle = '#94A3B8'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(Math.round((maxVal / 4) * i).toString(), chartLeft - 8, y)
  }

  data.forEach(function(d, i) {
    const barH = ((d.value / maxVal) * (chartBottom - chartTop))
    const x = chartLeft + 20 + i * (barWidth + 12)
    const y = chartBottom - barH

    ctx.fillStyle = d.color
    ctx.beginPath()
    ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0])
    ctx.fill()

    ctx.fillStyle = '#1E293B'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(d.value.toString(), x + barWidth / 2, y - 4)

    ctx.fillStyle = '#475569'
    ctx.font = '9px sans-serif'
    ctx.textBaseline = 'top'
    const lines = d.label.split(' ')
    lines.forEach(function(line, li) {
      ctx.fillText(line, x + barWidth / 2, chartBottom + 6 + li * 12)
    })
  })

  return new Promise(function(resolve) {
    canvas.toBlob(function(blob) {
      resolve(blob!)
    }, 'image/png')
  })
}

/* ── Excel Styling Helpers ── */

export function addTitleRow(ws: ExcelJS.Worksheet, colCount: number, title: string, subtitle?: string) {
  const r = ws.addRow([title])
  ws.mergeCells(1, 1, 1, colCount)
  r.height = 36
  r.getCell(1).font = { bold: true, color: { argb: 'FFFFFF' }, size: 14, name: 'Segoe UI' }
  r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TITLE_BG } }
  r.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }

  if (subtitle) {
    const r2 = ws.addRow([subtitle])
    ws.mergeCells(2, 1, 2, colCount)
    r2.height = 24
    r2.getCell(1).font = { color: { argb: '94A3B8' }, size: 10, name: 'Segoe UI' }
    r2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E293B' } }
    r2.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }
    return 2
  }
  return 1
}

export function addSpacerRow(ws: ExcelJS.Worksheet, height?: number) {
  const r = ws.addRow([''])
  r.height = height || 8
}

export function addHeaderRow(ws: ExcelJS.Worksheet, columns: { header: string; width?: number }[], startRow?: number) {
  const rowNum = startRow || ws.rowCount + 1
  const row = ws.getRow(rowNum)
  columns.forEach(function(c, i) {
    row.getCell(i + 1).value = c.header
  })
  row.height = 30
  columns.forEach(function(c, i) {
    const cell = row.getCell(i + 1)
    cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR }, size: 10, name: 'Segoe UI' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = borderStyle as ExcelJS.Borders
    if (c.width) ws.getColumn(i + 1).width = c.width
  })
  return rowNum
}

export function addDataRow(
  ws: ExcelJS.Worksheet,
  rowIndex: number,
  values: unknown[],
  options?: { statusKey?: string; numberFormat?: string; colorKey?: string }
) {
  const row = ws.addRow(values)
  row.height = 22
  row.eachCell(function(cell, col) {
    cell.font = { size: 10, name: 'Segoe UI' }
    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center' }
    cell.border = borderStyle as ExcelJS.Borders
    if (rowIndex % 2 === 0) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT_COLOR } }
    }
  })

  if (options?.statusKey && typeof values[options.statusKey as unknown as number] === 'string') {
    const statusVal = values[options.statusKey as unknown as number] as string
    const color = STATUS_COLORS[statusVal]
    if (color) {
      const cell = row.getCell((options.statusKey as unknown as number) + 1)
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color + '30' } }
      cell.font = { ...cell.font as ExcelJS.Font, bold: true, color: { argb: color } }
    }
  }

  if (options?.numberFormat) {
    row.eachCell(function(cell, _col) {
      if (typeof cell.value === 'number') {
        cell.numFmt = options.numberFormat!
      }
    })
  }

  return row
}

export function applyAutoFilter(ws: ExcelJS.Worksheet, colCount: number, headerRow: number, dataRowCount: number) {
  const lastRow = headerRow + dataRowCount
  if (lastRow > headerRow) {
    ws.autoFilter = {
      from: { row: headerRow, column: 1 },
      to: { row: lastRow, column: colCount },
    }
  }
}

export function freezeHeaderRow(ws: ExcelJS.Worksheet, freezeRow: number) {
  ws.views = [
    { state: 'frozen', ySplit: freezeRow, activeCell: 'A' + (freezeRow + 1) },
  ]
}

export function addSectionTitle(ws: ExcelJS.Worksheet, colCount: number, title: string) {
  const r = ws.addRow([title])
  ws.mergeCells(r.number, 1, r.number, colCount)
  r.height = 26
  r.getCell(1).font = { bold: true, size: 11, name: 'Segoe UI', color: { argb: '1E293B' } }
  r.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' }
}

export function addSummaryRow(ws: ExcelJS.Worksheet, label: string, value: string | number, isFormula?: boolean) {
  const row = ws.addRow([label, isFormula ? ({ formula: value as string } as unknown as number) : value])
  row.height = 22
  row.getCell(1).font = { bold: true, size: 10, name: 'Segoe UI', color: { argb: '475569' } }
  row.getCell(2).font = { bold: true, size: 10, name: 'Segoe UI' }
  row.getCell(2).numFmt = '#,##0'
  row.getCell(1).border = borderStyle as ExcelJS.Borders
  row.getCell(2).border = borderStyle as ExcelJS.Borders
}

/* ── Image Embedding ── */

export async function embedChartImage(
  wb: ExcelJS.Workbook,
  ws: ExcelJS.Worksheet,
  blob: Blob,
  colStart: number,
  rowStart: number,
  colEnd?: number,
  rowEnd?: number
) {
  const imageId = wb.addImage({
    buffer: await blob.arrayBuffer(),
    extension: 'png',
  })
  ws.addImage(imageId, {
    tl: { col: colStart - 1, row: rowStart - 1 },
    ext: { width: colEnd ? (colEnd - colStart + 1) * 100 : 400, height: rowEnd ? (rowEnd - rowStart + 1) * 100 : 320 },
  })
}

/* ── Sheet & Workbook Builder ── */

export interface XlsxColumn {
  header: string
  key: string
  width?: number
}

export interface XlsxSheet {
  name: string
  columns: XlsxColumn[]
  rows: Record<string, unknown>[]
  summaryRows?: { label: string; value: string | number; formula?: string }[]
  categoryRows?: { label: string; count: number; color: string }[]
}

async function tryAddChartToSheet(
  wb: ExcelJS.Workbook,
  ws: ExcelJS.Worksheet,
  barData: { label: string; value: number; color: string }[]
): Promise<void> {
  if (barData.length === 0) return
  addSpacerRow(ws, 4)
  const barBlob = await generateBarChartBlob(barData)
  await embedChartImage(wb, ws, barBlob, 1, ws.rowCount + 1, 5, ws.rowCount + 12)
}

export async function buildWorkbook(sheets: XlsxSheet[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  wb.creator = APP_NAME
  wb.created = new Date()

  await sheets.reduce(async (prevPromise, sheet) => {
    await prevPromise

    const ws = wb.addWorksheet(sheet.name, { properties: { tabColor: { argb: HEADER_BG } } })
    const colCount = sheet.columns.length

    addHeaderRow(ws, sheet.columns, 1)

    sheet.rows.forEach(function(row, i) {
      const values = sheet.columns.map(function(col) {
        return row[col.key] ?? '-'
      })
      addDataRow(ws, i + 2, values, {
        statusKey: sheet.columns.findIndex(function(c) { return c.key === 'status' }) >= 0
          ? String(sheet.columns.findIndex(function(c) { return c.key === 'status' }))
          : undefined,
      })
    })

    if (sheet.rows.length > 0) {
      applyAutoFilter(ws, colCount, 1, sheet.rows.length)
    }
    freezeHeaderRow(ws, 1)

    if (sheet.summaryRows && sheet.summaryRows.length > 0) {
      addSpacerRow(ws)
      addSectionTitle(ws, colCount > 2 ? colCount : 2, 'Ringkasan')
      sheet.summaryRows.forEach(function(sr) {
        addSummaryRow(ws, sr.label, sr.formula || sr.value, !!sr.formula)
      })
    }

    if (sheet.categoryRows && sheet.categoryRows.length > 0) {
      addSpacerRow(ws)
      addSpacerRow(ws)
      addSectionTitle(ws, 3, 'Statistik per Kategori')

      const catHeaderRow = ws.rowCount + 1
      ws.getRow(catHeaderRow).getCell(1).value = 'Kategori'
      ws.getRow(catHeaderRow).getCell(2).value = 'Jumlah'
      ws.getRow(catHeaderRow).getCell(3).value = 'Persentase'
      ws.getRow(catHeaderRow).eachCell(function(cell) {
        cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR }, size: 10, name: 'Segoe UI' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = borderStyle as ExcelJS.Borders
      })
      ws.getColumn(3).width = 14

      const totalCat = sheet.categoryRows.reduce(function(s, c) { return s + c.count }, 0)
      sheet.categoryRows.forEach(function(cr, i) {
        const pct = totalCat > 0 ? cr.count / totalCat : 0
        const row = ws.addRow([cr.label, cr.count, pct])
    row.eachCell(function(cell, _col) {
          cell.font = { size: 10, name: 'Segoe UI' }
          cell.border = borderStyle as ExcelJS.Borders
          if (_col === 3) cell.numFmt = '0.0%'
          if (i % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT_COLOR } }
        })
        row.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: cr.color.replace('var(--color-status-', '').replace(')', '') === 'hadir' ? '16A34A30'
            : cr.color.replace('var(--color-status-', '').replace(')', '') === 'terlambat' ? 'EA580C30'
            : cr.color.replace('var(--color-status-', '').replace(')', '') === 'izin' ? '2563EB30'
            : cr.color.replace('var(--color-status-', '').replace(')', '') === 'sakit' ? 'DC262630'
            : cr.color.replace('var(--color-status-', '').replace(')', '') === 'cuti' ? '7C3AED30'
            : cr.color.replace('var(--color-status-', '').replace(')', '') === 'tidakHadir' ? '6B728030'
            : 'E2E8F0' },
        }
      })

      try {
        const barData = sheet.categoryRows.filter(function(c) { return c.count > 0 }).map(function(c) {
          let hex = '64748B'
          if (c.color.includes('hadir')) hex = '#16A34A'
          else if (c.color.includes('terlambat')) hex = '#EA580C'
          else if (c.color.includes('izin')) hex = '#2563EB'
          else if (c.color.includes('sakit')) hex = '#DC2626'
          else if (c.color.includes('cuti')) hex = '#7C3AED'
          else if (c.color.includes('tidakHadir')) hex = '#6B7280'
          return { label: c.label, value: c.count, color: hex }
        })
        if (barData.length > 0) {
          await tryAddChartToSheet(wb, ws, barData)
        }
      } catch {
        /* chart rendering non-critical */
      }
    }
  }, Promise.resolve())

  return wb
}

export async function exportWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename + '.xlsx'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
