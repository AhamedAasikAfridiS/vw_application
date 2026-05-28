const { asyncHandler } = require("../utils/asyncHandler");
const vehicleService = require("../services/vehicleService");

const listVehicles = asyncHandler(async (req, res) => {
  const result = await vehicleService.list(req.query);
  res.json(result);
});

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await vehicleService.categories();
  res.json({ data: categories });
});

const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getById(req.params.id);
  res.json({ data: vehicle });
});

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.create(req.body);
  res.status(201).json({ data: vehicle });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.update(req.params.id, req.body);
  res.json({ data: vehicle });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.remove(req.params.id);
  res.status(204).send();
});

module.exports = {
  listVehicles,
  getCategories,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
};
