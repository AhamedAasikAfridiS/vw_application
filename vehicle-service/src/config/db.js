const { Pool } = require("pg");
const { env } = require("./env");

const pool = new Pool({
  connectionString: env.databaseUrl
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      slug VARCHAR(180) NOT NULL UNIQUE,
      category VARCHAR(80) NOT NULL,
      tagline VARCHAR(220) NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'USD',
      horsepower INTEGER NOT NULL,
      range_km INTEGER,
      drivetrain VARCHAR(80) NOT NULL,
      acceleration VARCHAR(60) NOT NULL,
      image_url TEXT NOT NULL,
      image_urls JSONB NOT NULL DEFAULT '[]',
      specs JSONB NOT NULL DEFAULT '{}',
      is_featured BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initializeDatabase };
