import { pgTable, serial, text, date, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core'
import { user } from './auth.schema'

export const absensi = pgTable('absensi', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tanggal: date('tanggal').notNull(),
  checkIn: timestamp('check_in', { withTimezone: true }),
  checkOut: timestamp('check_out', { withTimezone: true }),
  status: text('status').notNull(),
  mainCategory: text('main_category'),
  subCategory: text('sub_category'),
  faceVerified: boolean('face_verified').default(false),
  photos: jsonb('photos').default('[]'),
  keterangan: text('keterangan').default(''),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('absensi_user_id_tanggal_idx').on(table.userId, table.tanggal),
  index('absensi_tanggal_status_idx').on(table.tanggal, table.status),
])
