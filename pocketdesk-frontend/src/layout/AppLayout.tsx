import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
  return (
    <div className="h-screen flex bg-neutral-900 text-neutral-200">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        <TopBar />

        <div className="flex-1 overflow-y-auto bg-neutral-950">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}