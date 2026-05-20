import { Vote, BarChart3, Activity } from "lucide-react";

const ICONS = {
  "Total Votes": Vote,
  Options: BarChart3,
  Status: Activity,
};

const STATUS_STYLES = {
  Active: "badge-success",
  Expired: "badge-neutral",
  "No votes yet": "badge-warning",
};

export default function MetricsCard({ title, value }) {
  const Icon = ICONS[title] || Vote;
  const isStatus = title === "Status";

  return (
    <div className="card-flat p-4 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor:
              title === "Total Votes"
                ? "var(--brand-50)"
                : title === "Options"
                  ? "var(--warning-50)"
                  : "var(--success-50)",
          }}
        >
          <Icon
            size={18}
            style={{
              color:
                title === "Total Votes"
                  ? "var(--brand-600)"
                  : title === "Options"
                    ? "var(--warning-600)"
                    : "var(--success-600)",
            }}
          />
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium">{title}</p>
          {isStatus ? (
            <span className={`badge ${STATUS_STYLES[value] || "badge-neutral"} mt-1`}>
              {value}
            </span>
          ) : (
            <p className="text-xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}
