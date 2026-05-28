const { Pool } = require("pg");
const { env } = require("./env");

const pool = new Pool({
  connectionString: env.databaseUrl
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id VARCHAR(36) PRIMARY KEY,
      display_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(40),
      location VARCHAR(120),
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_vehicles (
      user_id VARCHAR(36) NOT NULL,
      vehicle_id VARCHAR(36) NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, vehicle_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS preferences (
      user_id VARCHAR(36) PRIMARY KEY,
      budget_min NUMERIC(12, 2),
      budget_max NUMERIC(12, 2),
      favorite_category VARCHAR(80),
      preferred_drivetrain VARCHAR(80),
      color_theme VARCHAR(40) NOT NULL DEFAULT 'black-yellow-red',
      newsletter_opt_in BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initializeDatabase };
