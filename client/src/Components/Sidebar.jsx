import {
  BarChart,
  TrendingUp,
  Clock,
  Home,
  Plus,
  Vote,
  Settings,
  ListChecks,
  X,
  User,
  LogIn,
  LogOut,
  FolderOpen,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/');
  };

  const NavItem = ({ to, icon: Icon, children, onClick }) => (
    <NavLink
      className={({ isActive }) =>
        `flex flex-row items-center gap-2 p-2 rounded-md 
        ${
          isActive
            ? "bg-[#6366F1] text-white font-semibold"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
      to={to}
      onClick={onClick}
    >
      <Icon size={20} /> {children}
    </NavLink>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen bg-white border-r border-gray-300 p-5 overflow-y-auto w-64 z-30">
        <div className="flex flex-col h-full">
          <span className="flex items-center gap-2 text-xl font-bold mb-4 pb-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            Poll creator
          </span>
          
          <div className="flex flex-col gap-2 flex-1">
            <NavItem to="" icon={Home}>Home</NavItem>
            <NavItem to="polls" icon={ListChecks}>Polls</NavItem>
            <NavItem to="/create-poll" icon={Plus}>Create Poll</NavItem>
            
            {isAuthenticated && (
              <NavItem to="/my-polls" icon={FolderOpen}>My Polls</NavItem>
            )}
          </div>

          {/* Auth Section */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-indigo-600" />
                  </div>
                  <span className="truncate font-medium">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <NavItem to="/login" icon={LogIn}>Sign In</NavItem>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen bg-white border-r border-gray-300 overflow-y-auto w-64 z-30 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <span className="flex items-center gap-2 text-xl font-bold">
              <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              Poll creator
            </span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            <NavItem to="" icon={Home} onClick={onClose}>Home</NavItem>
            <NavItem to="polls" icon={ListChecks} onClick={onClose}>Polls</NavItem>
            <NavItem to="/create-poll" icon={Plus} onClick={onClose}>Create Poll</NavItem>
            
            {isAuthenticated && (
              <NavItem to="/my-polls" icon={FolderOpen} onClick={onClose}>My Polls</NavItem>
            )}
          </div>

          {/* Auth Section - Mobile */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-indigo-600" />
                  </div>
                  <span className="truncate font-medium">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <LogOut size={20} /> Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <NavItem to="/login" icon={LogIn} onClick={onClose}>Sign In</NavItem>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
