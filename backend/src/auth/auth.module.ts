import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PG_POOL } from '../database/database.providers'
import { createAuth } from './auth.instance'
import type { Pool } from 'pg'

export const AUTH_INSTANCE = 'AUTH_INSTANCE'

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: AUTH_INSTANCE,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => createAuth(pool),
    },
  ],
  exports: [AUTH_INSTANCE],
})
export class AuthModule {}
