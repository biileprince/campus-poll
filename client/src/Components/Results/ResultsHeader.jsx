export default function ResultsHeader({ title }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
      <div className="flex-1">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-1">
          Poll Results
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 font-medium">
          {title || "Loading..."}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <button className="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm border rounded-lg text-gray-600 hover:bg-gray-50">
          Auto-refresh: ON
        </button>

        <button className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 bg-purple-600 text-white text-xs sm:text-sm rounded-lg hover:bg-purple-700">
          Refresh
        </button>
      </div>
    </div>
  );
}
