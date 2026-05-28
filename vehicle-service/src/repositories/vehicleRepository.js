const crypto = require("crypto");
const { pool } = require("../config/db");
const { toVehicle } = require("../models/vehicleModel");

const SORT_COLUMNS = Object.freeze({
  price: "price",
  name: "name",
  createdAt: "created_at",
  horsepower: "horsepower"
});

async function listVehicles(filters) {
  const values = [];
  const where = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    where.push(`(name ILIKE $${values.length} OR tagline ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  if (filters.category) {
    values.push(filters.category);
    where.push(`category = $${values.length}`);
  }

  if (filters.drivetrain) {
    values.push(filters.drivetrain);
    where.push(`drivetrain ILIKE $${values.length}`);
  }

  if (filters.minPrice) {
    values.push(filters.minPrice);
    where.push(`price >= $${values.length}`);
  }

  if (filters.maxPrice) {
    values.push(filters.maxPrice);
    where.push(`price <= $${values.length}`);
  }

  if (filters.featured !== undefined) {
    values.push(filters.featured);
    where.push(`is_featured = $${values.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sortColumn = SORT_COLUMNS[filters.sortBy] || "created_at";
  const sortDirection = filters.sortDirection === "asc" ? "ASC" : "DESC";
  const limit = filters.limit;
  const offset = (filters.page - 1) * filters.limit;

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM vehicles ${whereSql}`, values);

  values.push(limit, offset);
  const result = await pool.query(
    `SELECT * FROM vehicles
     ${whereSql}
     ORDER BY ${sortColumn} ${sortDirection}
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return {
    vehicles: result.rows.map(toVehicle),
    total: countResult.rows[0].total
  };
}

async function getCategories() {
  const result = await pool.query("SELECT DISTINCT category FROM vehicles ORDER BY category ASC");
  return result.rows.map((row) => row.category);
}

async function findById(id) {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1", [id]);
  return toVehicle(result.rows[0]);
}

async function findBySlug(slug) {
  const result = await pool.query("SELECT * FROM vehicles WHERE slug = $1", [slug]);
  return toVehicle(result.rows[0]);
}

async function createVehicle(payload) {
  const id = crypto.randomUUID();
  const result = await pool.query(
    `INSERT INTO vehicles (
      id, name, slug, category, tagline, description, price, currency, horsepower,
      range_km, drivetrain, acceleration, image_url, image_urls, specs, is_featured
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      id,
      payload.name,
      payload.slug,
      payload.category,
      payload.tagline,
      payload.description,
      payload.price,
      payload.currency,
      payload.horsepower,
      payload.rangeKm,
      payload.drivetrain,
      payload.acceleration,
      payload.imageUrl,
      JSON.stringify(payload.imageUrls),
      JSON.stringify(payload.specs),
      payload.isFeatured
    ]
  );
  return toVehicle(result.rows[0]);
}

async function updateVehicle(id, payload) {
  const result = await pool.query(
    `UPDATE vehicles
     SET name = $2,
         slug = $3,
         category = $4,
         tagline = $5,
         description = $6,
         price = $7,
         currency = $8,
         horsepower = $9,
         range_km = $10,
         drivetrain = $11,
         acceleration = $12,
         image_url = $13,
         image_urls = $14,
         specs = $15,
         is_featured = $16,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      payload.name,
      payload.slug,
      payload.category,
      payload.tagline,
      payload.description,
      payload.price,
      payload.currency,
      payload.horsepower,
      payload.rangeKm,
      payload.drivetrain,
      payload.acceleration,
      payload.imageUrl,
      JSON.stringify(payload.imageUrls),
      JSON.stringify(payload.specs),
      payload.isFeatured
    ]
  );
  return toVehicle(result.rows[0]);
}

async function deleteVehicle(id) {
  const result = await pool.query("DELETE FROM vehicles WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}

async function countVehicles() {
  const result = await pool.query("SELECT COUNT(*)::int AS total FROM vehicles");
  return result.rows[0].total;
}

module.exports = {
  listVehicles,
  getCategories,
  findById,
  findBySlug,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  countVehicles
};
