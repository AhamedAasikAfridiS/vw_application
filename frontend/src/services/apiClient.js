import axios from "axios";
import { getAccessToken } from "./tokenStorage";

function createApiClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: 12000,
    headers: {
      "Content-Type": "application/json"
    }
  });

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

export const authApi = createApiClient(import.meta.env.VITE_AUTH_API_URL || "http://localhost:4001/api/auth");
export const vehicleApi = createApiClient(import.meta.env.VITE_VEHICLE_API_URL || "http://localhost:4002/api/vehicles");
export const profileApi = createApiClient(import.meta.env.VITE_PROFILE_API_URL || "http://localhost:4003/api/profile");
