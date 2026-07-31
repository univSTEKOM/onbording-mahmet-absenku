/** Determine attendance type category from record (mainCategory or legacy status) */
export function catType(record: {
  mainCategory?: string | null;
  status?: string | null;
}): string {
  const m = record.mainCategory || '';
  if (m === 'physical_present') return 'present';
  if (m === 'absent_permit') return 'absent_permit';
  if (m === 'absent_unpermit') return 'absent_unpermit';
  const s = record.status || '';
  if (['hadir', 'terlambat', 'pulang_cepat'].includes(s)) return 'present';
  if (['izin', 'sakit', 'cuti'].includes(s)) return 'absent_permit';
  return 'absent_unpermit';
}
