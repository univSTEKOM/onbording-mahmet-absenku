import { pgTable, serial, text, date, timestamp, index } from 'drizzle-orm/pg-core'
import { user } from './auth.schema'

export const pengajuan = pgTable('pengajuan', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  jenis: text('jenis').notNull(),
  tanggalMulai: date('tanggal_mulai').notNull(),
  tanggalSelesai: date('tanggal_selesai').notNull(),
  alasan: text('alasan').notNull(),
  status: text('status').default('pending'),
  catatan: text('catatan').default(''),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('pengajuan_user_id_idx').on(table.userId),
])
