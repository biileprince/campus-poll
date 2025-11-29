import {
  ChartBarIcon,
  ChartColumnIncreasingIcon,
  ClockIcon,
  HouseIcon,
  PlusIcon,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
export default function Sidebar() {
    return(
         <aside className="bg-white border-r border-gray-200 p-5 ">
        <div className="flex flex-col gap-6">
          <span className="flex items-center gap-2 text-xl font-bold mb-4">
            <ChartColumnIncreasingIcon size={32} />
            Poll creator
          </span>
          <NavLink   className={({ isActive }) =>
            `flex flex-row items-center gap-2 p-2 rounded-md 
            ${isActive ? "bg-blue-500 text-white font-semibold" : "text-gray-700"}`
          } to="">
            <HouseIcon /> Home
          </NavLink>
          <NavLink className={({ isActive }) =>
            `flex flex-row items-center gap-2 p-2 rounded-md 
            ${isActive ? "bg-blue-500 text-white font-semibold" : "text-gray-700"}`
          } to='/create-poll'>
            <PlusIcon /> Create Poll
          </NavLink>
          <NavLink className="flex flex-row gap-2">
            <ChartBarIcon /> Results
          </NavLink>
          <NavLink className="flex flex-row gap-2">
            <ClockIcon /> History
          </NavLink>
          <NavLink className="flex flex-row gap-2">
            <Settings /> Settings
          </NavLink>
        </div>
      </aside>
    )
}