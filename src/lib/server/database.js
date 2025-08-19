import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a connection pool for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/dispomed',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute a database query with connection pooling
 * @param {string} query - SQL query string
 * @param {...any} params - Query parameters
 * @returns {Promise<pg.QueryResult>} Query result
 */
export async function dbQuery(query, ...params) {
  const client = await pool.connect();
  try {
    return await client.query(query, params);
  } finally {
    client.release();
  }
}

/**
 * Load and return SQL file content
 * @param {string} filePath - Path to SQL file relative to project root
 * @returns {string} SQL file content
 */
export function loadSqlFile(filePath) {
  const projectRoot = path.resolve(__dirname, '../../..');
  const fullPath = path.join(projectRoot, filePath);
  return fs.readFileSync(fullPath, 'utf8');
}

/**
 * Close the database pool (for cleanup)
 */
export async function closePool() {
  await pool.end();
}

// Export pool for advanced usage if needed
export { pool };