import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function TopBar({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!context) return null;

  const { logout, email } = context;

  // First letter of email for avatar, uppercase
  const avatarLetter = email ? email[0].toUpperCase() : "?";
  // Full email display — truncate only if very long
  const displayEmail = email ?? "User";

  const handleLogout = async () => {
    await API.post("/auth/logout");
    logout();
    navigate("/");
  };

  return (
    <div className="h-14 bg-neutral-900 border-b border-neutral-700/60 flex items-center justify-between px-6 shrink-0">

      {/* Left — Logo + Hamburger */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button 
          className="md:hidden p-1.5 -ml-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          onClick={onToggleMobile}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Icon mark */}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.55"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.55"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
          </svg>
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">
          Pocket<span className="text-blue-400">Desk</span>
        </span>
      </div>

      {/* Right — User info */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition group"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow shadow-blue-900/40 shrink-0">
            {avatarLetter}
          </div>

          {/* Email */}
          <span className="text-sm text-neutral-300 group-hover:text-white transition max-w-[180px] truncate hidden sm:block">
            {displayEmail}
          </span>

          {/* Chevron */}
          <svg
            className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl shadow-black/40 py-1 z-50">
            {/* Email row */}
            <div className="px-4 py-2.5 border-b border-neutral-700">
              <p className="text-xs text-neutral-400 mb-0.5">Signed in as</p>
              <p className="text-sm text-neutral-200 font-medium truncate">{displayEmail}</p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-700/60 hover:text-red-300 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </div>
  );
}
