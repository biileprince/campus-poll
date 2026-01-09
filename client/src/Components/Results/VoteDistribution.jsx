export default function VoteDistribution({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border rounded-lg sm:rounded-xl p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-medium mb-3">
          Vote Distribution
        </h3>
        <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">
          No votes yet
        </p>
      </div>
    );
  }

  const totalVotes = data.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
  const maxVotes = Math.max(...data.map((opt) => opt.voteCount || 0));

  return (
    <div className="bg-white border rounded-lg sm:rounded-xl p-3 sm:p-4 shadow">
      <div className="flex justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base font-semibold">
          Vote Distribution
        </h3>
        <span className="text-xs sm:text-sm text-gray-500">
          {totalVotes} total votes
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {data.map((option, index) => {
          const percentage =
            totalVotes > 0
              ? Math.round((option.voteCount / totalVotes) * 100)
              : 0;
          const barHeight =
            maxVotes > 0 ? (option.voteCount / maxVotes) * 100 : 0;

          return (
            <div key={option.id || index}>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span className="font-medium text-gray-700">{option.text}</span>
                <span className="text-gray-600">
                  {option.voteCount} votes ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 sm:h-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 flex items-center justify-end px-2 sm:px-3"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 5 && (
                    <span className="text-white text-xs font-semibold">
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
