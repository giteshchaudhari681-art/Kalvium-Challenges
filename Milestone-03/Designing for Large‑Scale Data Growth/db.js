const { Pool } = require('pg');
require('dotenv').config();

/**
 * Primary handles all writes. Replica handles read-only traffic.
 * Local development can point both URLs to the same database.
 */
const primaryUrl = process.env.PRIMARY_DB_URL || process.env.DATABASE_URL;
const replicaUrl = process.env.REPLICA_DB_URL || primaryUrl;

if (!primaryUrl) {
  throw new Error('PRIMARY_DB_URL or DATABASE_URL must be set');
}

const primaryPool = new Pool({
  connectionString: primaryUrl,
});

const replicaPool = new Pool({
  connectionString: replicaUrl,
});

module.exports = {
  readQuery: (text, params) => replicaPool.query(text, params),
  writeQuery: (text, params) => primaryPool.query(text, params),
  primaryPool,
  replicaPool
};
