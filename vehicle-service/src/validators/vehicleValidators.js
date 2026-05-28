const { body, param, query } = require("express-validator");
const { VEHICLE_CATEGORIES } = require("../models/vehicleModel");

const listVehicleValidator = [
  query("search").optional().trim().isLength({ min: 1, max: 80 }),
  query("category").optional().isLength({ min: 2, max: 80 }),
  query("drivetrain").optional().isLength({ min: 2, max: 80 }),
  query("minPrice").optional().isFloat({ min: 0 }),
  query("maxPrice").optional().isFloat({ min: 0 }),
  query("featured").optional().isBoolean(),
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 50 }),
  query("sortBy").optional().isIn(["price", "name", "createdAt", "horsepower"]),
  query("sortDirection").optional().isIn(["asc", "desc"])
];

const idValidator = [
  param("id").isUUID().withMessage("Vehicle id must be a valid UUID.")
];

const vehiclePayloadValidator = [
  body("name").trim().isLength({ min: 2, max: 160 }),
  body("slug").optional().trim().isLength({ min: 2, max: 180 }),
  body("category").isIn(VEHICLE_CATEGORIES).withMessage("Unsupported vehicle category."),
  body("tagline").trim().isLength({ min: 5, max: 220 }),
  body("description").trim().isLength({ min: 20, max: 4000 }),
  body("price").isFloat({ min: 0 }),
  body("currency").optional().isLength({ min: 3, max: 8 }),
  body("horsepower").isInt({ min: 1 }),
  body("rangeKm").optional({ nullable: true }).isInt({ min: 1 }),
  body("drivetrain").trim().isLength({ min: 2, max: 80 }),
  body("acceleration").trim().isLength({ min: 2, max: 60 }),
  body("imageUrl").isURL({ require_protocol: true }),
  body("imageUrls").optional().isArray(),
  body("imageUrls.*").optional().isURL({ require_protocol: true }),
  body("specs").optional().isObject(),
  body("isFeatured").optional().isBoolean()
];

module.exports = { listVehicleValidator, idValidator, vehiclePayloadValidator };
