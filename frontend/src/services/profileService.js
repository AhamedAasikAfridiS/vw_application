import { profileApi } from "./apiClient";

export async function getProfile() {
  const { data } = await profileApi.get("/me");
  return data.data;
}

export async function updateProfile(payload) {
  const { data } = await profileApi.put("/me", payload);
  return data.data;
}

export async function getSavedVehicles() {
  const { data } = await profileApi.get("/saved-vehicles");
  return data.data;
}

export async function saveVehicle(payload) {
  const { data } = await profileApi.post("/saved-vehicles", payload);
  return data.data;
}

export async function removeSavedVehicle(vehicleId) {
  await profileApi.delete(`/saved-vehicles/${vehicleId}`);
}

export async function getPreferences() {
  const { data } = await profileApi.get("/preferences");
  return data.data;
}

export async function updatePreferences(payload) {
  const { data } = await profileApi.put("/preferences", payload);
  return data.data;
}
