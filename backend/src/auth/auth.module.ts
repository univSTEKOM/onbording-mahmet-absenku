import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { PG_POOL } from '../database/database.providers'
import { createAuth } from './auth.instance'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import type { Pool } from 'pg'

export const AUTH_INSTANCE = 'AUTH_INSTANCE'

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_INSTANCE,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => createAuth(pool),
    },
    AuthService,
  ],
  exports: [AUTH_INSTANCE, AuthService],
})
export class AuthModule {}
