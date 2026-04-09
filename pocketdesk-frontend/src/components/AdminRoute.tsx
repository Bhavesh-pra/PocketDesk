import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute() {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!auth?.token || auth?.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
