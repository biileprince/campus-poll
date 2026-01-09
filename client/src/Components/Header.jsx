import { Search, Bell, Info, User, Menu } from "lucide-react";

export default function Header({ onMenuClick }) {
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
          <button className="hover:opacity-70 transition-opacity">
            <User size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
