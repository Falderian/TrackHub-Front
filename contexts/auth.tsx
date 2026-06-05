import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { router } from "expo-router";
import { api, setTokens, clearTokens as clearApiTokens } from "../services/api";

type User = {
  id: number;
  email: string;
  username: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setTokens(data.accessToken, data.refreshToken);
    const me = await api.getMe();
    setUser(me);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const data = await api.register({ email, username, password });
    setTokens(data.accessToken, data.refreshToken);
    const me = await api.getMe();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearApiTokens();
    setUser(null);
    router.replace("/(auth)/login");
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
