import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ marginLeft: "0" }}
      >
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            paddingTop: "var(--header-height)",
            backgroundColor: "var(--surface-bg)",
          }}
        >
          <div className="lg:ml-[var(--sidebar-width)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

