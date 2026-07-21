export function exportToCsv(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        const escaped = cell.replace(/"/g, '""')
        return cell.includes(',') || cell.includes('"') || cell.includes('\n')
          ? `"${escaped}"`
          : cell
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatCsvDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID')
}

export function formatCsvTime(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
