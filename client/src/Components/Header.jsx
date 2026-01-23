import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Info,
  User,
  Menu,
  LogIn,
  LogOut,
  FolderOpen,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header({ onMenuClick }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <div className="fixed top-0 right-0 lg:left-64 left-0 w-auto border-b border-gray-200 bg-white z-10">
      <div className="flex flex-row items-center px-4 py-2 justify-between max-w-full">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-700 hover:text-gray-900 mr-2"
        >
          <Menu size={24} />
        </button>

        {/* Search Section */}
        <div className="flex items-center gap-2 flex-1 max-w-md border border-gray-300 rounded-md px-3 py-1.5">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search polls..."
            className="border-none outline-none bg-transparent text-sm flex-1 text-gray-700 placeholder-gray-400 hidden sm:block"
          />
          <input
            type="text"
            placeholder="Search..."
            className="border-none outline-none bg-transparent text-sm flex-1 text-gray-700 placeholder-gray-400 sm:hidden"
          />
        </div>

        {/* Right Icons Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="hover:opacity-70 transition-opacity hidden sm:block">
            <Bell size={18} className="text-gray-700" />
          </button>
          <button className="hover:opacity-70 transition-opacity hidden sm:block">
            <Info size={18} className="text-gray-700" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              {isAuthenticated ? (
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() ||
                      user?.email?.charAt(0)?.toUpperCase() ||
                      "U"}
                  </span>
                </div>
              ) : (
                <User size={20} className="text-gray-700" />
              )}
              <ChevronDown
                size={14}
                className="text-gray-500 hidden sm:block"
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {isAuthenticated ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/my-polls"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FolderOpen size={16} />
                      My Polls
                    </Link>
                    <Link
                      to="/create-poll"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings size={16} />
                      Create Poll
                    </Link>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogIn size={16} />
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                    >
                      <User size={16} />
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
