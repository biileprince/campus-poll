export default function ResultsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div>
        <div className="skeleton h-7 w-40 mb-2" />
        <div className="skeleton h-4 w-64" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-flat p-4">
            <div className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div>
                <div className="skeleton h-3 w-16 mb-2" />
                <div className="skeleton h-6 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card-flat p-5">
          <div className="skeleton h-4 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="skeleton h-3 w-24 mb-2" />
                <div className="skeleton h-6 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="card-flat p-5">
          <div className="skeleton h-4 w-32 mb-4" />
          <div className="skeleton h-56 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
