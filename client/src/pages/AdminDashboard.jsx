import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/adminApi";
import { Users, BarChart3, Vote, Activity, TrendingUp, Loader2, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  const cards = [
    { title: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-500", sub: `${stats?.recentUsers ?? 0} new this week` },
    { title: "Total Polls", value: stats?.totalPolls ?? 0, icon: BarChart3, color: "bg-green-500", sub: `${stats?.recentPolls ?? 0} new this week` },
    { title: "Total Votes", value: stats?.totalVotes ?? 0, icon: Vote, color: "bg-purple-500", sub: "Across all polls" },
    { title: "Active Polls", value: stats?.activePolls ?? 0, icon: Activity, color: "bg-orange-500", sub: `${stats?.expiredPolls ?? 0} expired` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{c.title}</p>
                <div className={`${c.color} rounded-lg p-2 text-white`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{c.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={18} />
          <h3 className="text-base font-semibold">Platform Overview</h3>
        </div>
        <p className="text-sm opacity-90">
          {stats?.totalUsers ?? 0} registered user{(stats?.totalUsers ?? 0) === 1 ? "" : "s"} ·{" "}
          {stats?.totalPolls ?? 0} poll{(stats?.totalPolls ?? 0) === 1 ? "" : "s"} created ·{" "}
          {stats?.totalVotes ?? 0} vote{(stats?.totalVotes ?? 0) === 1 ? "" : "s"} recorded.
        </p>
      </div>
    </div>
  );
}
