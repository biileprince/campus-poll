import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#4f6ef5",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-flat px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-900">{payload[0].name || payload[0].payload?.label}</p>
        <p className="text-gray-500">{payload[0].value} votes</p>
      </div>
    );
  }
  return null;
};

export default function TurnoutChart({ data, chartType = "pie" }) {
  if (!data || data.length === 0) {
    return (
      <div className="card-flat p-5">
        <p className="text-sm text-gray-400 text-center py-8">No chart data available</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#f1f3f5"
              />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis
                type="category"
                dataKey="label"
                width={80}
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "donut":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius="45%"
                outerRadius="75%"
                paddingAngle={3}
                label={({ label, percent }) =>
                  `${label} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "pie":
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                outerRadius="75%"
                label={({ label, percent }) =>
                  `${label} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="card-flat p-5 animate-fade-in-up delay-3">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Chart View
      </h3>
      <div className="h-[240px] sm:h-[280px]">
        {renderChart()}
      </div>
    </div>
  );
}
