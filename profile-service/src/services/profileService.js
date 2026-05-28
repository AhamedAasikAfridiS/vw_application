const { ApiError } = require("../utils/apiError");
const profileRepository = require("../repositories/profileRepository");

function defaultProfileFromToken(user) {
  return {
    displayName: user.name || "VW Driver",
    email: user.email,
    phone: null,
    location: null,
    avatarUrl: null
  };
}

async function getProfile(user) {
  let profile = await profileRepository.findProfile(user.sub);
  if (!profile) {
    profile = await profileRepository.upsertProfile(user.sub, defaultProfileFromToken(user));
  }
  return profile;
}

async function updateProfile(user, payload) {
  return profileRepository.upsertProfile(user.sub, {
    displayName: payload.displayName,
    email: payload.email || user.email,
    phone: payload.phone,
    location: payload.location,
    avatarUrl: payload.avatarUrl
  });
}

async function listSavedVehicles(user) {
  return profileRepository.listSavedVehicles(user.sub);
}

async function saveVehicle(user, payload) {
  return profileRepository.saveVehicle(user.sub, payload.vehicleId, payload.notes);
}

async function removeSavedVehicle(user, vehicleId) {
  const removed = await profileRepository.removeSavedVehicle(user.sub, vehicleId);
  if (!removed) {
    throw new ApiError(404, "Saved vehicle not found.");
  }
}

async function getPreferences(user) {
  let preferences = await profileRepository.findPreferences(user.sub);
  if (!preferences) {
    preferences = await profileRepository.upsertPreferences(user.sub, {
      budgetMin: null,
      budgetMax: null,
      favoriteCategory: null,
      preferredDrivetrain: null,
      colorTheme: "black-yellow-red",
      newsletterOptIn: false
    });
  }
  return preferences;
}

async function updatePreferences(user, payload) {
  if (
    payload.budgetMin !== undefined &&
    payload.budgetMax !== undefined &&
    payload.budgetMin !== null &&
    payload.budgetMax !== null &&
    Number(payload.budgetMin) > Number(payload.budgetMax)
  ) {
    throw new ApiError(400, "Minimum budget cannot be greater than maximum budget.");
  }

  return profileRepository.upsertPreferences(user.sub, payload);
}

module.exports = {
  getProfile,
  updateProfile,
  listSavedVehicles,
  saveVehicle,
  removeSavedVehicle,
  getPreferences,
  updatePreferences
};
