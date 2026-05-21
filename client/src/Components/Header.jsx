import { useState, useRef, useEffect } from "react";
import { User, Menu, LogIn, LogOut, FolderOpen, ChevronDown, Plus } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PAGE_TITLES = { "/": "Dashboard", "/polls": "Browse Polls", "/create-poll": "Create Poll", "/my-polls": "My Polls" };

export default function Header({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    if (location.pathname.startsWith("/poll/")) return "Vote";
    if (location.pathname.startsWith("/results/")) return "Results";
    if (location.pathname.startsWith("/edit-poll/")) return "Edit Poll";
    return PAGE_TITLES[location.pathname] || "Campus Poll";
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] bg-white border-b border-gray-200 z-20" style={{ height: "var(--header-height)" }}>
      <div className="flex items-center px-4 lg:px-6 h-full justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0">
            <Menu size={20} />
          </button>
          <h1 className="text-base font-semibold text-gray-900 truncate">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/create-poll")} className="hidden sm:flex btn-primary text-xs py-2 px-3">
            <Plus size={16} /> New Poll
          </button>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              {isAuthenticated ? (
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><User size={16} className="text-gray-500" /></div>
              )}
              <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50 animate-scale-in">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/my-polls" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><FolderOpen size={16} /> My Polls</Link>
                      <Link to="/create-poll" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Plus size={16} /> Create Poll</Link>
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button onClick={() => { logout(); setDropdownOpen(false); navigate("/"); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <Link to="/login" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><LogIn size={16} /> Sign In</Link>
                    <Link to="/register" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50"><User size={16} /> Create Account</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
