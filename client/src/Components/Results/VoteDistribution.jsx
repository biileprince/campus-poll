import { Trophy } from "lucide-react";

const BAR_COLORS = [
  { bar: "var(--brand-500)", bg: "var(--brand-50)" },
  { bar: "var(--success-500)", bg: "var(--success-50)" },
  { bar: "var(--warning-500)", bg: "var(--warning-50)" },
  { bar: "#8b5cf6", bg: "#f5f3ff" },
  { bar: "#ec4899", bg: "#fdf2f8" },
  { bar: "#14b8a6", bg: "#f0fdfa" },
  { bar: "#f97316", bg: "#fff7ed" },
  { bar: "#06b6d4", bg: "#ecfeff" },
];

export default function VoteDistribution({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card-flat p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Vote Distribution
        </h3>
        <p className="text-gray-400 text-center py-8 text-sm">
          No votes yet
        </p>
      </div>
    );
  }

  const totalVotes = data.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);
  const maxVotes = Math.max(...data.map((opt) => opt.voteCount || 0));

  return (
    <div className="card-flat p-5 animate-fade-in-up delay-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Vote Distribution
        </h3>
        <span className="text-xs text-gray-400 font-medium">
          {totalVotes} total
        </span>
      </div>

      <div className="space-y-3">
        {data.map((option, index) => {
          const percentage =
            totalVotes > 0
              ? Math.round((option.voteCount / totalVotes) * 100)
              : 0;
          const isLeading = option.voteCount === maxVotes && maxVotes > 0;
          const colorPair = BAR_COLORS[index % BAR_COLORS.length];

          return (
            <div key={option.id || index} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colorPair.bar }}
                  />
                  <span className="font-medium text-gray-800 text-xs">
                    {option.text}
                  </span>
                  {isLeading && (
                    <Trophy size={12} style={{ color: "var(--warning-500)" }} />
                  )}
                </div>
                <span className="text-xs text-gray-500 font-medium tabular-nums">
                  {option.voteCount} ({percentage}%)
                </span>
              </div>
              <div
                className="w-full rounded-full h-2.5 overflow-hidden"
                style={{ backgroundColor: colorPair.bg }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colorPair.bar,
                    minWidth: percentage > 0 ? "4px" : "0",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
