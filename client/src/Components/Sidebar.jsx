import { NavLink } from "react-router-dom";
import { Plus, List, BarChart2 } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between min-h-screen">
      {/* LOGO */}
      <div>
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-500 flex items-center justify-center text-white font-semibold">
            PC
          </div>
          <span className="font-semibold text-gray-900">PollCreator</span>
        </div>

        {/* MENU */}
        <nav className="px-4 py-4 space-y-1">
          {/* Create Poll */}
          <NavLink
            to="/create-poll"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"}`
            }
          >
            <Plus size={18} />
            Create Poll
          </NavLink>

          {/* My Polls */}
          <NavLink
            to="/polls"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? "bg-gray-100" : "text-gray-700 hover:bg-gray-50"}`
            }
          >
            <List size={18} />
            My Polls
          </NavLink>

          {/* Results */}
          <NavLink
            to="/results"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
              ${isActive ? "bg-gray-100" : "text-gray-700 hover:bg-gray-50"}`
            }
          >
            <BarChart2 size={18} />
            Results
          </NavLink>
        </nav>
      </div>

      {/* USER INFO */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/40"
            className="w-10 h-10 rounded-full"
          />

          <div>
            <p className="text-sm font-medium text-gray-800">Ebenezer</p>
            <p className="text-xs text-gray-500">ebenezergmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
