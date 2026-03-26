import { createContext, useState } from "react";
import type { ReactNode } from "react";


import { useEffect } from "react";
import API from "../services/api";

  import { setAccessToken } from "../services/api";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
const login = (jwt: string) => {
  setToken(jwt);
  setAccessToken(jwt);
};

  const logout = () => {
    setToken(null);
    setAccessToken("");
  };


useEffect(() => {
  const refreshUser = async () => {
    try {
      const res = await API.post("/auth/refresh");
      console.log("REFRESH TOKEN:", res.data.accessToken);
      setToken(res.data.accessToken);
      setAccessToken(res.data.accessToken);

    } catch {
      setToken(null);
      setAccessToken("");
    } finally {
      setLoading(false);
    }
  };

  refreshUser();
}, []);

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}