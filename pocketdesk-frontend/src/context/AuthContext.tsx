import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import API from "../services/api";
import { setAccessToken } from "../services/api";

interface AuthContextType {
  token: string | null;
  email: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (jwt: string, userEmail: string) => {
    setToken(jwt);
    setEmail(userEmail);
    setAccessToken(jwt);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    setAccessToken("");
  };

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await API.post("/auth/refresh");
        setToken(res.data.accessToken);
        setEmail(res.data.email || null);
        setAccessToken(res.data.accessToken);
      } catch {
        setToken(null);
        setEmail(null);
        setAccessToken("");
      } finally {
        setLoading(false);
      }
    };

    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ token, email, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}