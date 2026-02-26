import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function testConnection() {
  const result = await pool.query('SELECT NOW()');
  console.log('Database connected at:', result.rows[0].now);
  return result;
}

export { pool };
