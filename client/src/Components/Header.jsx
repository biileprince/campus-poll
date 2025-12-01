import { Search, Bell, Info, CircleUserRound } from "lucide-react";

export default function Header() {
  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="flex flex-row items-center px-4 py-2 justify-between max-w-full">
        {/* Search Section */}
        <div className="flex items-center gap-2 flex-1 max-w-md border border-gray-300 rounded-md px-3 py-1.5">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search polls..."
            className="border-none outline-none bg-transparent text-sm flex-1 text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Right Icons Section */}
        <div className="flex items-center gap-4">
          <button className="hover:opacity-70 transition-opacity">
            <Bell size={18} className="text-gray-700" />
          </button>
          <button className="hover:opacity-70 transition-opacity">
            <Info size={18} className="text-gray-700" />
          </button>
          <button className="hover:opacity-70 transition-opacity">
            <CircleUserRound size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}
