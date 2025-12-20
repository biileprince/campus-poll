import {
  BarChart,
  TrendingUp,
  Clock,
  Home,
  Plus,
  Vote,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="bg-white border-r border border-gray-300 p-5 ">
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
                : "text-gray-700"
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
                : "text-gray-700"
            }`
          }
          to="/create-poll"
        >
          <Plus /> Create Poll
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700"
            }`
          }
          to="/results"
        >
          <BarChart /> Results
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700"
            }`
          }
          to="/vote"
        >
          <Vote /> Vote
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700"
            }`
          }
          to="/history"
        >
          <Clock /> History
        </NavLink>
        <NavLink
          className={({ isActive }) =>
            `flex flex-row items-center gap-2 p-2 rounded-md 
            ${
              isActive
                ? "bg-[#6366F1] text-white font-semibold"
                : "text-gray-700"
            }`
          }
          to="/settings"
        >
          <Settings /> Settings
        </NavLink>
      </div>
    </aside>
  );
}
