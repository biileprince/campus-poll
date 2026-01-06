export default function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow animate-pulse h-20" />
        <div className="bg-white rounded-xl p-4 shadow animate-pulse h-20" />
        <div className="bg-white rounded-xl p-4 shadow animate-pulse h-20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 shadow h-72 animate-pulse" />
        <div className="bg-white rounded-xl p-4 shadow h-72 animate-pulse" />
      </div>
    </div>
  );
}
import Skeleton from "../Common/Skeleton";

export default function ResultsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Skeleton className="h-6 w-1/2" />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
