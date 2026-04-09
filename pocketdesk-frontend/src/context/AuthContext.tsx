import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import API from "../services/api";
import { setAccessToken } from "../services/api";

interface AuthContextType {
  token: string | null;
  email: string | null;
  role: string | null;
  login: (token: string, email: string, role: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (jwt: string, userEmail: string, userRole: string) => {
    setToken(jwt);
    setEmail(userEmail);
    setRole(userRole);
    setAccessToken(jwt);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Ignore error
    }
    setToken(null);
    setEmail(null);
    setRole(null);
    setAccessToken("");
  };

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await API.post("/auth/refresh");
        setToken(res.data.accessToken);
        setEmail(res.data.email || null);
        setRole(res.data.role || null);
        setAccessToken(res.data.accessToken);
      } catch {
        setToken(null);
        setEmail(null);
        setRole(null);
        setAccessToken("");
      } finally {
        setLoading(false);
      }
    };

    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ token, email, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}