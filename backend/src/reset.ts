import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  console.log('Dropping all tables...');
  await pool.query(
    'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;',
  );
  await pool.query('DROP SCHEMA IF EXISTS drizzle CASCADE;');
  console.log('All tables dropped.');
  await pool.end();
}

main().catch((e) => {
  console.error('Reset failed:', (e as Error).message);
  process.exit(1);
});
