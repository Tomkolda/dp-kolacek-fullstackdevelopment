import 'dotenv/config';

import {defineConfig} from 'drizzle-kit';

// You can have a .env.local file for dev; in CI we use DRIZZLE_DATABASE_URL.
// On Vercel/Supabase Marketplace the direct connection lives in POSTGRES_URL_NON_POOLING.
const url =
  process.env.DRIZZLE_DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    'Missing migration database URL: set DRIZZLE_DATABASE_URL, POSTGRES_URL_NON_POOLING, or DATABASE_URL.',
  );
}

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {url},
  verbose: true,
  strict: true,
  migrations: {table: '__drizzle_migrations'},
});
