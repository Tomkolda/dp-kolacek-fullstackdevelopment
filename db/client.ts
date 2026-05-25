import {drizzle} from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Vercel/Supabase Marketplace injects POSTGRES_URL (transaction pooler, port 6543).
// Local dev sets DATABASE_URL via .env.local (direct local Supabase Postgres).
const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    'Missing database configuration: set POSTGRES_URL or DATABASE_URL.',
  );
}

const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
// Only the transaction pooler (port 6543) lacks prepared-statement support;
// direct connections and the session pooler (port 5432) are fine.
const isTransactionPooler = new URL(url).port === '6543';

const client = postgres(url, {
  ssl: isLocal ? false : 'require',
  prepare: !isTransactionPooler,
  max: 1,
});

export const db = drizzle(client);
