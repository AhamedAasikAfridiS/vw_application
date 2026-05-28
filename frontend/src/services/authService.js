import { authApi } from "./apiClient";

export async function register(payload) {
  const { data } = await authApi.post("/register", payload);
  return data;
}

export async function login(payload) {
  const { data } = await authApi.post("/login", payload);
  return data;
}

export async function refresh(refreshToken) {
  const { data } = await authApi.post("/refresh", { refreshToken });
  return data;
}

export async function logout(refreshToken) {
  await authApi.post("/logout", { refreshToken });
}

export async function getCurrentUser() {
  const { data } = await authApi.get("/me");
  return data.user;
}
