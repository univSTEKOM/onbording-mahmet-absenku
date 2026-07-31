import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

export function createAuth(pool: Pool) {
  const db = drizzle(pool, { schema });

  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:9090',
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        nama: { type: 'string' },
        role: { type: 'string', required: true, defaultValue: 'karyawan' },
        status: { type: 'string', required: true, defaultValue: 'pending' },
        jabatan: { type: 'string' },
        phone: { type: 'string' },
        alamat: { type: 'string' },
        faceDescriptor: { type: 'string' },
        rejectionNotes: { type: 'string' },
      },
    },
    trustedOrigins: ['*'],
  });
}

export type Auth = ReturnType<typeof createAuth>;
