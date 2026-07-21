import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'

export const auth = betterAuth({
  database: new Database('./auth.db'),
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
