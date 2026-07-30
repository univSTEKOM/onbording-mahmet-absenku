import { z } from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(9090),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:9090'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  MINIO_ENDPOINT: z.string().default('http://localhost:9000'),
  MINIO_PUBLIC_URL: z.string().default('http://localhost:9000'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET_FOTO: z.string().default('absenku-foto'),
  MINIO_BUCKET_ABSENSI: z.string().default('absenku-absensi'),
})

export type Env = z.infer<typeof envSchema>
