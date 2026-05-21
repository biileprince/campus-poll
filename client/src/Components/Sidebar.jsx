import { Home, Plus, ListChecks, X, User, LogIn, LogOut, FolderOpen, Vote } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate("/");
  };

  const navItems = [
    { to: "/", icon: Home, label: "Home", end: true },
    { to: "/polls", icon: ListChecks, label: "Browse Polls" },
    { to: "/create-poll", icon: Plus, label: "Create Poll" },
  ];

  const NavItem = ({ to, icon: Icon, children, onClick, end }) => (
    <NavLink
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
        ${isActive ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`
      }
      to={to}
      end={end}
      onClick={onClick}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span>{children}</span>
    </NavLink>
  );

  const SidebarContent = ({ showClose = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        <NavLink to="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Vote size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 tracking-tight">Campus Poll</span>
            <p className="text-[10px] text-gray-400 font-medium -mt-0.5 uppercase tracking-wide">Quick Polls</p>
          </div>
        </NavLink>
        {showClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-4 mb-2"><div className="h-px bg-gray-200" /></div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 pt-2 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Main</p>
        {navItems.map((item) => (
          <NavItem key={item.to} to={item.to} icon={item.icon} end={item.end} onClick={onClose}>{item.label}</NavItem>
        ))}
        {isAuthenticated && (
          <>
            <p className="px-3 pt-5 pb-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Your Polls</p>
            <NavItem to="/my-polls" icon={FolderOpen} onClick={onClose}>My Polls</NavItem>
          </>
        )}
      </nav>

      {/* Auth */}
      <div className="px-3 pb-4 mt-auto">
        <div className="h-px bg-gray-200 mb-3" />
        {isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "User"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <NavItem to="/login" icon={LogIn} onClick={onClose}>Sign In</NavItem>
            <NavLink to="/register" onClick={onClose} className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors">
              <User size={16} /> Create Account
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block fixed top-0 left-0 h-screen bg-white border-r border-gray-200 overflow-y-auto z-30" style={{ width: "var(--sidebar-width)" }}>
        <SidebarContent />
      </aside>
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/30 z-30 animate-fade-in" onClick={onClose} />}
      <aside className={`lg:hidden fixed top-0 left-0 h-screen bg-white border-r border-gray-200 overflow-y-auto z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ width: "var(--sidebar-width)" }}>
        <SidebarContent showClose />
      </aside>
    </>
  );
}
