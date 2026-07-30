import { Global, Module } from '@nestjs/common';
import {
  poolProvider,
  drizzleProvider,
  PG_POOL,
  DRIZZLE_DB,
} from './database.providers';

@Global()
@Module({
  providers: [poolProvider, drizzleProvider],
  exports: [PG_POOL, DRIZZLE_DB],
})
export class DatabaseModule {}
