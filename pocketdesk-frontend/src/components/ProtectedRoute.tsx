import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute() {
  const context = useContext(AuthContext);

  if (!context || !context.token) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}