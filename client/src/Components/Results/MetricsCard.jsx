export default function MetricsCard({ title, value, subtitle }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-green-500 mt-1">{subtitle}</p>}
    </div>
  );
}
