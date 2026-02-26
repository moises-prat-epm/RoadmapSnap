import pg from 'pg';

const { Pool } = pg;

let poolInstance = null;

function getPool() {
  if (!poolInstance) {
    const url = process.env.DATABASE_URL;
    if (!url || typeof url !== 'string') {
      throw new Error('DATABASE_URL must be a non-empty string. Ensure .env is loaded before using the DB.');
    }
    poolInstance = new Pool({ connectionString: url });
  }
  return poolInstance;
}

export async function query(text, params) {
  return getPool().query(text, params);
}

export async function testConnection() {
  const result = await getPool().query('SELECT NOW()');
  console.log('Database connected at:', result.rows[0].now);
  return result;
}

export const pool = {
  get instance() {
    return getPool();
  },
  connect() {
    return getPool().connect();
  },
};
