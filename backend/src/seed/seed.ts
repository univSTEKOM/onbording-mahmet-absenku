import { NestFactory } from '@nestjs/core'
import { SeedModule } from './seed.module'
import { SeedService } from './seed.service'

async function main() {
  const app = await NestFactory.createApplicationContext(SeedModule)
  const seedService = app.get(SeedService)
  const password = process.env.DEMO_PASSWORD || 'password'
  await seedService.seed(password)
  await app.close()
}

main().catch((e) => {
  console.error('Seed gagal:', e.message)
  process.exit(1)
})
