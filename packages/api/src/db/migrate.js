/**
 * RoadmapSnap API — migration runner (ES module)
 * Reads .sql files from src/db/migrations/, runs unapplied ones in order, records in schema_migrations.
 * Loads .env from package root (no dotenv dependency).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load .env manually (no dotenv dependency) ---
function loadEnv() {
  const root = join(__dirname, '..', '..');
  const envPath = join(root, '.env');
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    // .env optional
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('migrate: DATABASE_URL is not set. Create a .env file or set the variable.');
  process.exit(1);
}

const MIGRATIONS_DIR = join(__dirname, 'migrations');

const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function run() {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();

    // Ensure schema_migrations exists
    await client.query(CREATE_MIGRATIONS_TABLE);

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('migrate: No .sql files found in src/db/migrations/');
      return;
    }

    for (const file of files) {
      const version = file.replace(/\.sql$/i, '');
      const res = await client.query(
        'SELECT 1 FROM schema_migrations WHERE version = $1',
        [version]
      );
      if (res.rowCount > 0) {
        console.log(`migrate: Skip (already applied) ${version}`);
        continue;
      }

      const sqlPath = join(MIGRATIONS_DIR, file);
      const sql = readFileSync(sqlPath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        );
        await client.query('COMMIT');
        console.log(`migrate: Applied ${version}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`migrate: Failed ${version}`);
        console.error(err.message);
        throw err;
      }
    }

    console.log('migrate: All migrations completed.');
  } finally {
    await client.end();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('migrate: Fatal error:', err.message);
    process.exit(1);
  });
