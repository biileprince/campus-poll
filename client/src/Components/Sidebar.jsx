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
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen bg-white border-r border-gray-300 p-5 overflow-y-auto w-64 z-30">
        <div className="flex flex-col gap-6">
          <span className="flex items-center gap-2 text-xl font-bold mb-4 pb-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            Poll creator
          </span>
          <NavLink
            className={({ isActive }) =>
              `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
            to=""
          >
            <Home /> Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
            to="polls"
          >
            <ListChecks /> Polls
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
            to="/create-poll"
          >
            <Plus /> Create Poll
          </NavLink>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen bg-white border-r border-gray-300 overflow-y-auto w-64 z-30 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 p-5">
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
          <NavLink
            className={({ isActive }) =>
              `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
            to=""
            onClick={onClose}
          >
            <Home /> Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
            to="polls"
            onClick={onClose}
          >
            <ListChecks /> Polls
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`
            }
            to="/create-poll"
            onClick={onClose}
          >
            <Plus /> Create Poll
          </NavLink>
        </div>
      </aside>
    </>
  );
}
