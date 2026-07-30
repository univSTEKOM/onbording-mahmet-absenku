import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'
import { SeedService } from './seed.service'

@Module({
  imports: [AuthModule, DatabaseModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
