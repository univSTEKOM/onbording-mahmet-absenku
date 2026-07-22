import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './db-schema.js'

const sqliteDb = new Database('./auth.db')

export const auth = betterAuth({
  baseURL: 'http://localhost:3001',
  database: sqliteDb,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'karyawan',
      },
      status: {
        type: 'string',
        required: true,
        defaultValue: 'approved',
      },
      jabatan: {
        type: 'string',
      },
      phone: {
        type: 'string',
      },
      alamat: {
        type: 'string',
      },
    },
  },
  trustedOrigins: ['http://localhost:5173'],
})

export const db = drizzle(sqliteDb, { schema })
