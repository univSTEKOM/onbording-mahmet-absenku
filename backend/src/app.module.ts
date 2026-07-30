import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { AbsensiModule } from './absensi/absensi.module'
import { PengajuanModule } from './pengajuan/pengajuan.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AbsensiModule,
    PengajuanModule,
  ],
})
export class AppModule {}
