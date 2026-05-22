export default function ResultsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow h-24 animate-pulse" />
        <div className="bg-white rounded-xl p-4 shadow h-24 animate-pulse" />
        <div className="bg-white rounded-xl p-4 shadow h-24 animate-pulse" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow h-80 animate-pulse" />
        <div className="bg-white rounded-xl p-4 shadow h-80 animate-pulse" />
      </div>
    </div>
  );
}
