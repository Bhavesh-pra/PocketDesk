import React, { useContext, useState, useRef, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

interface SearchResult {
  type: "pdf" | "image" | "album" | "video" | "todo" | "chat";
  id: string;
  title: string;
  subtitle: string;
  path: string;
  date: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  pdf: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  image: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  album: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  video: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  todo: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chat: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
};

const typeColors: Record<string, string> = {
  pdf: "text-blue-400",
  image: "text-purple-400",
  album: "text-purple-400",
  video: "text-red-400",
  todo: "text-emerald-400",
  chat: "text-sky-400",
};

const typeBadgeColors: Record<string, string> = {
  pdf: "bg-blue-500/15 text-blue-400",
  image: "bg-purple-500/15 text-purple-400",
  album: "bg-purple-500/15 text-purple-400",
  video: "bg-red-500/15 text-red-400",
  todo: "bg-emerald-500/15 text-emerald-400",
  chat: "bg-sky-500/15 text-sky-400",
};

export default function TopBar({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await API.get("/search", { params: { q: q.trim() } });
      setSearchResults(res.data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setSearchOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleResultClick = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    navigate(result.path);
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

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
        <span className="text-sm font-semibold text-white tracking-tight hidden sm:inline">
          Pocket<span className="text-blue-400">Desk</span>
        </span>
      </div>

      {/* Center — Search bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
        <div className={`flex items-center gap-2 bg-neutral-800/80 border rounded-lg px-3 py-1.5 transition-all duration-200 ${
          searchOpen && searchQuery
            ? "border-blue-500/60 shadow-lg shadow-blue-900/20"
            : "border-neutral-700/60 hover:border-neutral-600"
        }`}>
          {/* Search icon */}
          <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>

          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            placeholder="Search everything…"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => { if (searchQuery) setSearchOpen(true); }}
            className="bg-transparent text-sm text-neutral-200 placeholder-neutral-500 outline-none w-full"
          />

          {/* Loading spinner */}
          {searching && (
            <div className="w-4 h-4 border-2 border-neutral-600 border-t-blue-400 rounded-full animate-spin shrink-0" />
          )}

          {/* Clear button */}
          {searchQuery && !searching && (
            <button
              onClick={() => { setSearchQuery(""); setSearchResults([]); setSearchOpen(false); }}
              className="text-neutral-500 hover:text-neutral-300 transition shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Shortcut hint */}
          {!searchQuery && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-neutral-500 bg-neutral-700/60 border border-neutral-600/50 rounded font-mono shrink-0">
              Ctrl K
            </kbd>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700/80 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {searching && searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <div className="w-5 h-5 border-2 border-neutral-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-neutral-500">Searching…</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-sm text-neutral-400">No results found</p>
                <p className="text-xs text-neutral-600 mt-0.5">Try a different search term</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <div className="px-3 py-2 border-b border-neutral-700/60">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.type}-${result.id}-${i}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-700/50 transition-colors text-left group"
                  >
                    {/* Type icon */}
                    <div className={`shrink-0 ${typeColors[result.type] || "text-neutral-400"}`}>
                      {typeIcons[result.type] || null}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 truncate group-hover:text-white transition-colors">
                        {result.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>

                    {/* Type badge */}
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${typeBadgeColors[result.type] || "bg-neutral-700 text-neutral-400"}`}>
                      {result.type}
                    </span>

                    {/* Arrow */}
                    <svg className="w-3.5 h-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
