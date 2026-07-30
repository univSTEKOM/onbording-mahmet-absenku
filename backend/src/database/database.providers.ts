import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

export const PG_POOL = 'PG_POOL'
export const DRIZZLE_DB = 'DRIZZLE_DB'

export const poolProvider = {
  provide: PG_POOL,
  useFactory: () => new Pool({ connectionString: process.env.DATABASE_URL }),
}

export const drizzleProvider = {
  provide: DRIZZLE_DB,
  inject: [PG_POOL],
  useFactory: (pool: Pool) => drizzle(pool, { schema }),
}
