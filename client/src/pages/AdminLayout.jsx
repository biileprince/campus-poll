import { Outlet, useLocation, NavLink, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Users, BarChart3, Home, LogOut, Menu, X, ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/polls", label: "Polls", icon: BarChart3 },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPage = NAV.find((n) =>
    n.end ? location.pathname === n.path : location.pathname.startsWith(n.path)
  );

  const SidebarContent = ({ showClose = false }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight">Admin</span>
            <p className="text-[10px] text-gray-400 font-medium -mt-0.5 uppercase tracking-wide">Campus Poll</p>
          </div>
        </Link>
        {showClose && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-4"><div className="h-px bg-gray-200" /></div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Manage</p>
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 mt-auto">
        <div className="h-px bg-gray-200 mb-3" />
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
        >
          <Home size={18} /> Back to app
        </Link>
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 mt-1 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-30 animate-fade-in" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent showClose />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <Menu size={20} />
              </button>
              <nav className="text-sm flex items-center gap-2">
                <Link to="/admin" className="text-gray-400 hover:text-gray-600">Admin</Link>
                {currentPage && currentPage.path !== "/admin" && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-700 font-medium">{currentPage.label}</span>
                  </>
                )}
                {(!currentPage || currentPage.path === "/admin") && (
                  <>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-700 font-medium">Dashboard</span>
                  </>
                )}
              </nav>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              <span className="badge badge-brand">ADMIN</span>
              <span className="hidden md:inline">{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
