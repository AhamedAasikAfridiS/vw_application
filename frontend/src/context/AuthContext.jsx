import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { clearStoredAuth, getStoredAuth, setStoredAuth } from "../services/tokenStorage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistAuth = useCallback((payload) => {
    setStoredAuth(payload);
    setAuth(payload);
  }, []);

  const signIn = useCallback(
    async (credentials) => {
      const result = await authService.login(credentials);
      persistAuth(result);
      return result;
    },
    [persistAuth]
  );

  const signUp = useCallback(
    async (payload) => {
      const result = await authService.register(payload);
      persistAuth(result);
      return result;
    },
    [persistAuth]
  );

  const signOut = useCallback(async () => {
    const refreshToken = getStoredAuth()?.refreshToken;
    clearStoredAuth();
    setAuth(null);
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch (_error) {
        clearStoredAuth();
      }
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = getStoredAuth();
    if (!stored?.refreshToken) {
      return null;
    }

    const result = await authService.refresh(stored.refreshToken);
    const nextAuth = { ...stored, ...result };
    persistAuth(nextAuth);
    return nextAuth;
  }, [persistAuth]);

  useEffect(() => {
    async function bootstrap() {
      const stored = getStoredAuth();
      if (!stored?.accessToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        persistAuth({ ...stored, user });
      } catch (_error) {
        try {
          await refreshSession();
        } catch (_refreshError) {
          clearStoredAuth();
          setAuth(null);
        }
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  }, [persistAuth, refreshSession]);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      accessToken: auth?.accessToken || null,
      refreshToken: auth?.refreshToken || null,
      isAuthenticated: Boolean(auth?.accessToken),
      isBootstrapping,
      signIn,
      signUp,
      signOut,
      refreshSession
    }),
    [auth, isBootstrapping, signIn, signOut, signUp, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
