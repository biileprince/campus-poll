import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { adminLogout } from '../services/authService';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/polls', label: 'Polls', icon: '📋' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 items-stretch">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col h-full`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-gray-800 p-2 rounded"
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition ${
                location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path))
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 text-sm"
          >
            <span>🏠</span>
            {sidebarOpen && <span>Back to App</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-red-600 text-sm transition"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-800">
            {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
          </h2>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
