import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444"];

export default function TurnoutChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow">
        <p className="text-sm text-gray-500">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow h-[250px] sm:h-[300px]">
      <h3 className="text-sm sm:text-base font-semibold mb-2">Vote Turnout</h3>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            outerRadius={90}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
