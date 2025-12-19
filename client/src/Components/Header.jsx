import { Search, Bell, Settings, Menu } from "lucide-react";
import { useState } from "react";

export default function Header({ title = "Share voting link", onMenuClick }) {
  return (
    <header className="w-full bg-white border-b border-gray-100 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>

          <h2 className="text-[15px] md:text-base font-semibold text-gray-800">
            {title}
          </h2>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Input (hidden on small screens) */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search polls..."
              className="w-64 h-9 rounded-lg border border-gray-200 pl-9 pr-3 text-sm 
              focus:outline-none focus:border-blue-500"
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Icons */}
          <button className="hover:text-gray-700">
            <Bell size={18} className="text-gray-500" />
          </button>

          <button className="hover:text-gray-700">
            <Settings size={18} className="text-gray-500" />
          </button>

          {/* Avatar */}
          <img
            src="https://i.pravatar.cc/40"
            className="w-9 h-9 rounded-full border"
          />
        </div>
      </div>
    </header>
  );
}
