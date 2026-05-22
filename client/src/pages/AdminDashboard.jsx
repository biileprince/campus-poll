import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getAdminPolls, getUsers } from "../services/adminApi";
import {
  Users, BarChart3, Vote, Activity, ArrowUpRight, Loader2, AlertCircle,
  TrendingUp, Calendar, Mail,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPolls, setRecentPolls] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, p, u] = await Promise.all([
          getDashboardStats(),
          getAdminPolls(1, 5, "", "all").catch(() => ({ polls: [] })),
          getUsers(1, 5, "").catch(() => ({ users: [] })),
        ]);
        setStats(s);
        setRecentPolls(p.polls || []);
        setRecentUsers(u.users || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total users",
      value: stats?.totalUsers ?? 0,
      delta: stats?.recentUsers ?? 0,
      deltaLabel: "this week",
      icon: Users,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total polls",
      value: stats?.totalPolls ?? 0,
      delta: stats?.recentPolls ?? 0,
      deltaLabel: "this week",
      icon: BarChart3,
      tint: "bg-green-50 text-green-600",
    },
    {
      label: "Total votes",
      value: stats?.totalVotes ?? 0,
      icon: Vote,
      tint: "bg-purple-50 text-purple-600",
    },
    {
      label: "Active polls",
      value: stats?.activePolls ?? 0,
      sub: `${stats?.expiredPolls ?? 0} expired`,
      icon: Activity,
      tint: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">A snapshot of platform activity.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card-flat p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{c.label}</p>
                <div className={`${c.tint} rounded-lg p-2`}>
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 tabular-nums">{c.value.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {c.delta !== undefined ? (
                  <>
                    <TrendingUp size={12} className="text-green-600" />
                    <span className="font-semibold text-green-600">+{c.delta}</span>
                    <span className="text-gray-400">{c.deltaLabel}</span>
                  </>
                ) : (
                  <span className="text-gray-400">{c.sub}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent polls */}
        <div className="lg:col-span-2 card-flat overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Recent polls</h3>
              <p className="text-xs text-gray-400">Latest 5 polls created</p>
            </div>
            <Link to="/admin/polls" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {recentPolls.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No polls yet</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPolls.map((p) => (
                <li key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.question}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>{p.totalVotes} votes</span>
                      <span>·</span>
                      <span>{p.creator?.name || p.creator?.email || "Anonymous"}</span>
                    </div>
                  </div>
                  <span className={`badge ${p.status === "Active" ? "badge-success" : "badge-neutral"} text-[10px]`}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent users */}
        <div className="card-flat overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">New users</h3>
              <p className="text-xs text-gray-400">Latest signups</p>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No users yet</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentUsers.map((u) => (
                <li key={u.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/60 transition">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(u.name || u.email)?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name || u.email}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Mail size={10} /> {u.email}
                    </p>
                  </div>
                  {u.role === "ADMIN" && (
                    <span className="badge badge-brand text-[10px]">ADMIN</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
        <Calendar size={12} />
        Live data · refresh to update
      </div>
    </div>
  );
}
