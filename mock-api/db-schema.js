import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('user', {
  id: text('id').primaryKey(),
  email: text('email'),
  name: text('name'),
  role: text('role'),
  status: text('status'),
  emailVerified: text('email_verified'),
  image: text('image'),
  jabatan: text('jabatan'),
  phone: text('phone'),
  alamat: text('alamat'),
  faceDescriptor: text('face_descriptor'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
})

export const sessions = sqliteTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId'),
  token: text('token'),
  expiresAt: text('expires_at'),
})

export const accounts = sqliteTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId'),
  providerId: text('provider_id'),
  accountId: text('account_id'),
  password: text('password'),
})
