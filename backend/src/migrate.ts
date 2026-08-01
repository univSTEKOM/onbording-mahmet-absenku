import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  /* Drizzle butuh schema "drizzle" untuk tracking migrasi.
     Buat dulu kalau belum ada — kalau permission deny, kasih pesan jelas */
  try {
    await pool.query('CREATE SCHEMA IF NOT EXISTS "drizzle"');
  } catch (e: unknown) {
    const msg = (e as Error).message || '';
    if (msg.includes('permission denied') || msg.includes('must be owner')) {
      console.error('');
      console.error('╔══════════════════════════════════════════════════╗');
      console.error('║  MIGRATION GAGAL — Permission Denied             ║');
      console.error('║                                                  ║');
      console.error('║  PostgreSQL user tidak punya hak CREATE SCHEMA.  ║');
      console.error('║                                                  ║');
      console.error('║  Jalankan ini di PostgreSQL console/Dokploy:     ║');
      console.error('║                                                  ║');
      console.error('║  GRANT CREATE ON DATABASE absenku TO siapa-absen;║');
      console.error('║  atau                                              ║');
      console.error('║  GRANT ALL ON DATABASE absenku TO siapa-absen;   ║');
      console.error('║                                                  ║');
      console.error('║  Setelah itu, redeploy lagi.                     ║');
      console.error('╚══════════════════════════════════════════════════╝');
      console.error('');
      await pool.end();
      process.exit(1);
    }
    /* Permission bukan masalah — lanjutkan migrasi */
  }

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations complete.');
  await pool.end();
}

main().catch((e) => {
  console.error('Migration failed:', (e as Error).message);
  process.exit(1);
});
