import { buildWorkbook, exportWorkbook, type XlsxSheet } from './export-xlsx'

export async function exportToXlsx(filename: string, sheets: XlsxSheet[]) {
  const wb = await buildWorkbook(sheets)
  await exportWorkbook(wb, filename)
}
