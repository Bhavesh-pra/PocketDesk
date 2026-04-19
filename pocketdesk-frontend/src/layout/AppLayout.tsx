import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import TopBar from "./TopBar";

// We'll refactor TopBar and Sidebar slightly to accept a toggle function.
// For now, let's keep it simple with classes.

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex bg-neutral-900 text-neutral-200 overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div 
        className={`fixed md:relative z-50 h-full transform transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleMobile={() => setMobileMenuOpen(prev => !prev)} />

        <div className="flex-1 overflow-y-auto bg-neutral-950">
          <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </div>
      </div>

    </div>
  );
}