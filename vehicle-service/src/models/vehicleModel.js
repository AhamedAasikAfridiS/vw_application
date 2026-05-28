const VEHICLE_CATEGORIES = Object.freeze([
  "Electric",
  "SUV",
  "Sedan",
  "Hatchback",
  "Performance",
  "Concept"
]);

function toVehicle(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    horsepower: row.horsepower,
    rangeKm: row.range_km,
    drivetrain: row.drivetrain,
    acceleration: row.acceleration,
    imageUrl: row.image_url,
    imageUrls: row.image_urls || [],
    specs: row.specs || {},
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toDbPayload(payload) {
  return {
    name: payload.name,
    slug: payload.slug,
    category: payload.category,
    tagline: payload.tagline,
    description: payload.description,
    price: payload.price,
    currency: payload.currency || "USD",
    horsepower: payload.horsepower,
    rangeKm: payload.rangeKm || null,
    drivetrain: payload.drivetrain,
    acceleration: payload.acceleration,
    imageUrl: payload.imageUrl,
    imageUrls: payload.imageUrls || [],
    specs: payload.specs || {},
    isFeatured: Boolean(payload.isFeatured)
  };
}

module.exports = { VEHICLE_CATEGORIES, toVehicle, toDbPayload };
