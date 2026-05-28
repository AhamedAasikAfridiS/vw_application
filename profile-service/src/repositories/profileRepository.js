const { pool } = require("../config/db");
const { toProfile, toSavedVehicle, toPreferences } = require("../models/profileModel");

async function upsertProfile(userId, payload) {
  const result = await pool.query(
    `INSERT INTO profiles (user_id, display_name, email, phone, location, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id)
     DO UPDATE SET
       display_name = EXCLUDED.display_name,
       email = EXCLUDED.email,
       phone = EXCLUDED.phone,
       location = EXCLUDED.location,
       avatar_url = EXCLUDED.avatar_url,
       updated_at = NOW()
     RETURNING *`,
    [userId, payload.displayName, payload.email, payload.phone || null, payload.location || null, payload.avatarUrl || null]
  );
  return toProfile(result.rows[0]);
}

async function findProfile(userId) {
  const result = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userId]);
  return toProfile(result.rows[0]);
}

async function listSavedVehicles(userId) {
  const result = await pool.query(
    "SELECT * FROM saved_vehicles WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows.map(toSavedVehicle);
}

async function saveVehicle(userId, vehicleId, notes) {
  const result = await pool.query(
    `INSERT INTO saved_vehicles (user_id, vehicle_id, notes)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, vehicle_id)
     DO UPDATE SET notes = EXCLUDED.notes
     RETURNING *`,
    [userId, vehicleId, notes || null]
  );
  return toSavedVehicle(result.rows[0]);
}

async function removeSavedVehicle(userId, vehicleId) {
  const result = await pool.query(
    "DELETE FROM saved_vehicles WHERE user_id = $1 AND vehicle_id = $2",
    [userId, vehicleId]
  );
  return result.rowCount > 0;
}

async function upsertPreferences(userId, payload) {
  const result = await pool.query(
    `INSERT INTO preferences (
      user_id, budget_min, budget_max, favorite_category, preferred_drivetrain, color_theme, newsletter_opt_in
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id)
    DO UPDATE SET
      budget_min = EXCLUDED.budget_min,
      budget_max = EXCLUDED.budget_max,
      favorite_category = EXCLUDED.favorite_category,
      preferred_drivetrain = EXCLUDED.preferred_drivetrain,
      color_theme = EXCLUDED.color_theme,
      newsletter_opt_in = EXCLUDED.newsletter_opt_in,
      updated_at = NOW()
    RETURNING *`,
    [
      userId,
      payload.budgetMin ?? null,
      payload.budgetMax ?? null,
      payload.favoriteCategory || null,
      payload.preferredDrivetrain || null,
      payload.colorTheme || "black-yellow-red",
      Boolean(payload.newsletterOptIn)
    ]
  );
  return toPreferences(result.rows[0]);
}

async function findPreferences(userId) {
  const result = await pool.query("SELECT * FROM preferences WHERE user_id = $1", [userId]);
  return toPreferences(result.rows[0]);
}

module.exports = {
  upsertProfile,
  findProfile,
  listSavedVehicles,
  saveVehicle,
  removeSavedVehicle,
  upsertPreferences,
  findPreferences
};
