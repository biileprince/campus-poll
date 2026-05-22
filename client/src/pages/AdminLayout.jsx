import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, Users, BarChart3, Home, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/polls", label: "Polls", icon: BarChart3 },
  ];

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="flex h-screen bg-gray-50 items-stretch">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-900 text-white transition-all duration-300 flex flex-col h-full flex-shrink-0`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-brand-400" />
              <h1 className="text-base font-bold">Admin</h1>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hover:bg-gray-800 p-2 rounded">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive(item) ? "bg-brand-600 text-white" : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <Icon size={18} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-800 text-sm text-gray-300">
            <Home size={18} />
            {sidebarOpen && <span>Back to App</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-600 text-sm text-gray-300 hover:text-white transition"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            {navItems.find((item) => isActive(item))?.label || "Admin"}
          </h2>
          <div className="text-sm text-gray-500 hidden sm:block">
            Signed in as <span className="font-medium text-gray-700">{user?.name || user?.email}</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6 sm:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
