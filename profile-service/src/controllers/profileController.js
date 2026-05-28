const { asyncHandler } = require("../utils/asyncHandler");
const profileService = require("../services/profileService");

const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user);
  res.json({ data: profile });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user, req.body);
  res.json({ data: profile });
});

const listSavedVehicles = asyncHandler(async (req, res) => {
  const savedVehicles = await profileService.listSavedVehicles(req.user);
  res.json({ data: savedVehicles });
});

const saveVehicle = asyncHandler(async (req, res) => {
  const savedVehicle = await profileService.saveVehicle(req.user, req.body);
  res.status(201).json({ data: savedVehicle });
});

const removeSavedVehicle = asyncHandler(async (req, res) => {
  await profileService.removeSavedVehicle(req.user, req.params.vehicleId);
  res.status(204).send();
});

const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await profileService.getPreferences(req.user);
  res.json({ data: preferences });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await profileService.updatePreferences(req.user, req.body);
  res.json({ data: preferences });
});

module.exports = {
  getProfile,
  updateProfile,
  listSavedVehicles,
  saveVehicle,
  removeSavedVehicle,
  getPreferences,
  updatePreferences
};
