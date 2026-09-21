const { Pool } = require('pg');
const env = require('./env');

let poolConfig;

if (env.databaseUrl) {
  poolConfig = {
    connectionString: env.databaseUrl,
    ssl: env.pgSsl ? { rejectUnauthorized: false } : false
  };
} else {
  poolConfig = {
    host: env.pgHost,
    port: env.pgPort,
    user: env.pgUser,
    password: env.pgPassword,
    database: env.pgDatabase,
    ssl: env.pgSsl ? { rejectUnauthorized: false } : false
  };
}

// Set optimal pool options
poolConfig.max = 20;
poolConfig.idleTimeoutMillis = 30000;
poolConfig.connectionTimeoutMillis = 5000;

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected pool client error:', err.message);
});

/**
 * Execute a parameterized query using the pool
 * @param {string} text SQL statement
 * @param {Array} params Parameter bindings
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === 'true') {
      console.log(`[SQL] (${duration}ms):`, text, params);
    }
    return res;
  } catch (err) {
    console.error(`[SQL Error]: ${err.message}\nQuery: ${text}\nParams:`, params);
    throw err;
  }
};

/**
 * Acquire a dedicated client from the pool for atomic multi-statement transactions
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

/**
 * Test PostgreSQL connectivity
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as now, version() as version;');
    console.log(`[PostgreSQL] Connected successfully to database. DB Time: ${res.rows[0].now}`);
    return true;
  } catch (err) {
    console.warn(`[PostgreSQL] Connection warning: ${err.message}`);
    console.warn(`[PostgreSQL] Note: Ensure PostgreSQL/Supabase credentials in backend/.env are configured.`);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};
