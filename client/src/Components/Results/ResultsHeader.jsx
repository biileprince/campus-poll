export default function ResultsHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Poll Results</h1>
        <p className="text-sm text-gray-500">
          Real-time analytics for “Satisfaction Survey”
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-3 py-1.5 text-sm border rounded-lg text-gray-600">
          Auto-refresh: ON
        </button>

        <button className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg">
          Refresh Results
        </button>
      </div>
    </div>
  );
}
