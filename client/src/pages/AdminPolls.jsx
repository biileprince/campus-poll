import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminPolls, deletePollAdmin } from "../services/adminApi";
import {
  Loader2, Search, Trash2, ExternalLink, AlertCircle, ChevronLeft, ChevronRight,
  BarChart3, MessageSquare,
} from "lucide-react";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
];

export default function AdminPolls() {
  const [polls, setPolls] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPolls = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const data = await getAdminPolls(page, 12, debouncedSearch, statusFilter);
      setPolls(data.polls || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load polls");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => { fetchPolls(1); }, [fetchPolls]);

  const handleDelete = async (poll) => {
    if (!confirm(`Delete poll "${poll.question}"?\n\nAll votes and responses will be lost. This cannot be undone.`)) return;
    try {
      setBusyId(poll.id);
      await deletePollAdmin(poll.id);
      setPolls((prev) => prev.filter((p) => p.id !== poll.id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete poll");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination.total} {pagination.total === 1 ? "poll" : "polls"} on the platform
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status pills */}
        <div className="inline-flex bg-gray-100 p-1 rounded-lg">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                statusFilter === s.value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Table */}
      <div className="card-flat overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Poll</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Votes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Creator</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Created</th>
                <th className="text-right py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <Loader2 size={20} className="animate-spin inline text-brand-500" />
                  </td>
                </tr>
              ) : polls.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <BarChart3 size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-400">No polls found</p>
                    {(debouncedSearch || statusFilter !== "all") && (
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                    )}
                  </td>
                </tr>
              ) : (
                polls.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-5 max-w-md">
                      <p className="font-medium text-gray-900 truncate">{p.question}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <MessageSquare size={10} /> {p.optionCount} option{p.optionCount === 1 ? "" : "s"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`badge ${p.status === "Active" ? "badge-success" : "badge-neutral"} text-[10px]`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 tabular-nums">{p.totalVotes}</td>
                    <td className="py-3.5 px-4">
                      {p.creator ? (
                        <>
                          <div className="text-gray-900 text-sm">{p.creator.name || "—"}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[180px]">{p.creator.email}</div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Anonymous</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-0.5">
                        <Link
                          to={`/results/${p.resultsId}`}
                          target="_blank"
                          title="View results"
                          className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition inline-flex"
                        >
                          <BarChart3 size={15} />
                        </Link>
                        <Link
                          to={`/poll/${p.voteId}`}
                          target="_blank"
                          title="Open voting page"
                          className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition inline-flex"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p)}
                          disabled={busyId === p.id}
                          title="Delete poll"
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm px-1">
          <p className="text-gray-500">
            Page <span className="font-semibold text-gray-700">{pagination.page}</span> of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPolls(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => fetchPolls(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="btn-secondary px-3 py-1.5 text-xs"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
