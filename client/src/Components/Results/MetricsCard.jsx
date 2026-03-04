export default function MetricsCard({ title, value, subtitle }) {
  return (
    <div className="bg-white border rounded-lg sm:rounded-xl p-3 sm:p-4">
      <p className="text-xs sm:text-sm text-gray-500">{title}</p>
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1">
        {value}
      </h3>
      {subtitle && <p className="text-xs text-green-500 mt-1">{subtitle}</p>}
    </div>
  );
}
