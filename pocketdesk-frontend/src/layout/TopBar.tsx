import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function TopBar() {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) return null;

  const { logout } = context;

  return (
    <div className="h-20 bg-neutral-900 border-b border-neutral-700 flex items-center justify-between px-8">

      {/* Search */}
      <input
        type="text"
        placeholder="Search PDFs, images, videos..."
        className="w-96 bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
      />

      {/* Logout */}
      <button
        onClick={async () => {
          await API.post("/auth/logout");
          logout();
          navigate("/");
        }}
        className="text-sm text-neutral-400 hover:text-white"
      >
        Logout
      </button>

    </div>
  );
}

