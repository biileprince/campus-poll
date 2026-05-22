import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminPolls, deletePollAdmin } from "../services/adminApi";
import { Loader2, Search, Trash2, ExternalLink, AlertCircle, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";

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
    if (!confirm(`Delete poll "${poll.question}"? All votes and responses will be lost. This cannot be undone.`)) return;
    try {
      setBusyId(poll.id);
      await deletePollAdmin(poll.id);
      setPolls((prev) => prev.filter((p) => p.id !== poll.id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete poll");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Polls</h1>
          <p className="text-sm text-gray-500">{pagination.total} total</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <div className="relative flex-1 sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search polls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Question</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Votes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Creator</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Created</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center"><Loader2 size={20} className="animate-spin inline text-brand-500" /></td></tr>
              ) : polls.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400">No polls found</td></tr>
              ) : polls.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <p className="text-gray-900 font-medium truncate max-w-xs">{p.question}</p>
                    <p className="text-xs text-gray-400">{p.optionCount} options</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{p.totalVotes}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {p.creator ? (
                      <>
                        <div className="text-gray-900">{p.creator.name || "—"}</div>
                        <div className="text-xs text-gray-400">{p.creator.email}</div>
                      </>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Anonymous</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link
                        to={`/results/${p.resultsId}`}
                        target="_blank"
                        title="View results"
                        className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition inline-flex"
                      >
                        <BarChart3 size={14} />
                      </Link>
                      <Link
                        to={`/poll/${p.voteId}`}
                        target="_blank"
                        title="Open voting page"
                        className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition inline-flex"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={busyId === p.id}
                        title="Delete poll"
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => fetchPolls(pagination.page - 1)}
              disabled={!pagination.hasPrev || loading}
              className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} className="inline" /> Prev
            </button>
            <button
              onClick={() => fetchPolls(pagination.page + 1)}
              disabled={!pagination.hasNext || loading}
              className="px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} className="inline" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
