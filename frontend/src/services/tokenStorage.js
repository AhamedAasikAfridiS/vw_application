const STORAGE_KEY = "vw_motion_auth";

export function getStoredAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setStoredAuth(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken() {
  return getStoredAuth()?.accessToken || null;
}
