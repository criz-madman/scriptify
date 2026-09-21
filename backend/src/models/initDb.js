const fs = require('fs');
const path = require('path');
const { pool, query, testConnection } = require('../config/db');

async function initializeDatabase() {
  console.log('----------------------------------------------------');
  console.log('Scriptify - Initializing PostgreSQL 3NF Schema...');
  console.log('----------------------------------------------------');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('[Error] Could not connect to PostgreSQL. Please check your .env settings.');
    process.exit(1);
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('[PostgreSQL] Executing schema DDL definitions...');
    await pool.query(sql);

    // Verify each table exists
    const tables = ['Users', 'CreditWallet', 'HistoryLog', 'Transactions', 'AuthOtpTokens', 'MarketplaceProducts', 'MarketplacePurchases'];
    console.log('[PostgreSQL] Verifying table creation:');

    for (const table of tables) {
      const res = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );`,
        [table]
      );
      const exists = res.rows[0].exists;
      console.log(`  - Table "${table}": ${exists ? '✓ Active (Verified)' : '✗ Not Found'}`);
    }

    console.log('----------------------------------------------------');
    console.log('Database initialization completed successfully!');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[PostgreSQL Error] Initialization failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
