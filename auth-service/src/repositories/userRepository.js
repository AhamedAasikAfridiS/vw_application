const crypto = require("crypto");
const { pool } = require("../config/db");

async function createUser({ name, email, passwordHash, role }) {
  const id = crypto.randomUUID();
  const result = await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, name, email.toLowerCase(), passwordHash, role]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

module.exports = { createUser, findByEmail, findById };
