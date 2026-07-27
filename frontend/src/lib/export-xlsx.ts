import ExcelJS from 'exceljs'

const HEADER_COLOR = '2563EB'
const HEADER_FONT_COLOR = 'FFFFFF'
const ROW_ALT_COLOR = 'F8FAFC'
const BORDER_COLOR = 'E2E8F0'

const borderStyle: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: BORDER_COLOR } },
  bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
  left: { style: 'thin', color: { argb: BORDER_COLOR } },
  right: { style: 'thin', color: { argb: BORDER_COLOR } },
}

function addHeaderRow(ws: ExcelJS.Worksheet, columns: { header: string; width?: number }[]) {
  const row = ws.addRow(columns.map(function(c) { return c.header }))
  row.height = 28
  row.eachCell(function(cell) {
    cell.font = { bold: true, color: { argb: HEADER_FONT_COLOR }, size: 10, name: 'Segoe UI' }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = borderStyle as ExcelJS.Borders
  })
  columns.forEach(function(c, i) {
    if (c.width) ws.getColumn(i + 1).width = c.width
  })
}

function addDataRow(ws: ExcelJS.Worksheet, rowIndex: number, values: unknown[], styles?: { color?: string }[]) {
  const row = ws.addRow(values)
  row.height = 22
  row.eachCell(function(cell, col) {
    cell.font = { size: 10, name: 'Segoe UI' }
    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center' }
    cell.border = borderStyle as ExcelJS.Borders
    if (rowIndex % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT_COLOR } }
    if (styles && styles[col - 1]?.color) {
      cell.font = { ...cell.font as ExcelJS.Font, color: { argb: styles[col - 1].color } }
    }
  })
}

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
  categoryRows?: { label: string; count: number }[]
}

export async function buildWorkbook(sheets: XlsxSheet[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'AbsenKu'
  wb.created = new Date()

  sheets.forEach(function(sheet) {
    const ws = wb.addWorksheet(sheet.name, { properties: { tabColor: { argb: HEADER_COLOR } } })

    addHeaderRow(ws, sheet.columns)

    sheet.rows.forEach(function(row, i) {
      const values = sheet.columns.map(function(col) {
        return row[col.key] ?? '-'
      })
      addDataRow(ws, i + 1, values)
    })

    /* Sheet 2: Summary with formulas */
    if (sheet.summaryRows && sheet.summaryRows.length > 0) {
      ws.addRow([])

      sheet.summaryRows.forEach(function(sr) {
        const row: (string | number)[] = [sr.label, '']
        if (sr.formula) {
          row[1] = { formula: sr.formula } as unknown as number
        } else {
          row[1] = sr.value || 0
        }
        const r = ws.addRow(row)
        r.getCell(1).font = { bold: true, size: 10, name: 'Segoe UI' }
        r.getCell(2).font = { size: 10, name: 'Segoe UI', bold: true }
        r.getCell(2).numFmt = sr.label.includes('%') ? '0.0%' : '#,##0'
      })
    }

    /* Sheet 3: Category breakdown */
    if (sheet.categoryRows && sheet.categoryRows.length > 0) {
      ws.addRow([])
      const totalCat = sheet.categoryRows.reduce(function(s, c) { return s + c.count }, 0)
      sheet.categoryRows.forEach(function(cr) {
        const pct = totalCat > 0 ? cr.count / totalCat : 0
        ws.addRow([cr.label, cr.count, pct]).eachCell(function(cell, col) {
          cell.font = { size: 10, name: 'Segoe UI' }
          if (col === 3) cell.numFmt = '0.0%'
          cell.border = borderStyle as ExcelJS.Borders
        })
      })
    }
  })

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
