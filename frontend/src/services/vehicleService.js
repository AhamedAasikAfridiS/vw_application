import { vehicleApi } from "./apiClient";

export async function listVehicles(params = {}) {
  const { data } = await vehicleApi.get("/", { params });
  return data;
}

export async function getVehicle(id) {
  const { data } = await vehicleApi.get(`/${id}`);
  return data.data;
}

export async function getCategories() {
  const { data } = await vehicleApi.get("/categories");
  return data.data;
}

export async function createVehicle(payload) {
  const { data } = await vehicleApi.post("/", payload);
  return data.data;
}

export async function updateVehicle(id, payload) {
  const { data } = await vehicleApi.put(`/${id}`, payload);
  return data.data;
}

export async function deleteVehicle(id) {
  await vehicleApi.delete(`/${id}`);
}
