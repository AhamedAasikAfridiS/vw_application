const { ApiError } = require("../utils/apiError");
const { slugify } = require("../utils/slugify");
const vehicleRepository = require("../repositories/vehicleRepository");
const { toDbPayload } = require("../models/vehicleModel");

function normalizeListQuery(query) {
  return {
    search: query.search,
    category: query.category,
    drivetrain: query.drivetrain,
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    featured: query.featured === undefined ? undefined : query.featured === "true",
    page: Math.max(Number(query.page || 1), 1),
    limit: Math.min(Math.max(Number(query.limit || 9), 1), 50),
    sortBy: query.sortBy || "createdAt",
    sortDirection: query.sortDirection || "desc"
  };
}

async function list(query) {
  const filters = normalizeListQuery(query);
  const result = await vehicleRepository.listVehicles(filters);
  return {
    data: result.vehicles,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: result.total,
      pages: Math.ceil(result.total / filters.limit)
    }
  };
}

async function categories() {
  return vehicleRepository.getCategories();
}

async function getById(id) {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found.");
  }
  return vehicle;
}

async function create(payload) {
  const dbPayload = toDbPayload({
    ...payload,
    slug: payload.slug || slugify(payload.name)
  });

  const existing = await vehicleRepository.findBySlug(dbPayload.slug);
  if (existing) {
    throw new ApiError(409, "A vehicle with this slug already exists.");
  }

  return vehicleRepository.createVehicle(dbPayload);
}

async function update(id, payload) {
  const existingVehicle = await vehicleRepository.findById(id);
  if (!existingVehicle) {
    throw new ApiError(404, "Vehicle not found.");
  }

  const dbPayload = toDbPayload({
    ...payload,
    slug: payload.slug || slugify(payload.name)
  });

  const existingSlug = await vehicleRepository.findBySlug(dbPayload.slug);
  if (existingSlug && existingSlug.id !== id) {
    throw new ApiError(409, "A vehicle with this slug already exists.");
  }

  return vehicleRepository.updateVehicle(id, dbPayload);
}

async function remove(id) {
  const deleted = await vehicleRepository.deleteVehicle(id);
  if (!deleted) {
    throw new ApiError(404, "Vehicle not found.");
  }
}

module.exports = { list, categories, getById, create, update, remove };
