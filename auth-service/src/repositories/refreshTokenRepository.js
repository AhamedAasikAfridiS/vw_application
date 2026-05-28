const crypto = require("crypto");
const { pool } = require("../config/db");

async function createRefreshToken({ userId, tokenHash, expiresAt }) {
  const id = crypto.randomUUID();
  const result = await pool.query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

async function findActiveByHash(tokenHash) {
  const result = await pool.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function revokeByHash(tokenHash) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
}

async function revokeAllForUser(userId) {
  await pool.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = { createRefreshToken, findActiveByHash, revokeByHash, revokeAllForUser };
