import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Vote, ArrowRight, Clock, Users, Loader2, Search, X,
  AlertCircle, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Plus, BarChart3,
} from "lucide-react";
import { getAllPolls } from "../services/api";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Closed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most_votes", label: "Most votes" },
  { value: "least_votes", label: "Fewest votes" },
];

export default function PollsPage() {
  const navigate = useNavigate();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 12 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      if (sortBy) params.sort = sortBy;
      const data = await getAllPolls(params);
      setPolls(data.polls || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message || "Failed to load polls");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearchQuery(searchInput.trim()); };
  const clearSearch = () => { setSearchInput(""); setSearchQuery(""); setPage(1); };

  const handleStatusChange = (value) => { setStatusFilter(value); setPage(1); };
  const handleSortChange = (value) => { setSortBy(value); setPage(1); };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (sortBy !== "newest" ? 1 : 0);

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl text-gray-900">Browse Polls</h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontWeight: 400 }}>
            {pagination ? `${pagination.total} poll${pagination.total !== 1 ? "s" : ""} available` : "Loading..."}
          </p>
        </div>
        <button onClick={() => navigate("/create-poll")} className="btn-primary sm:hidden">
          <Plus size={16} /> Create Poll
        </button>
      </div>

      {/* Controls Bar */}
      <div className="card-flat p-3 mb-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by question..."
              className="input pl-9 pr-9 text-sm"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </form>

          {/* Filter Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary text-sm py-2 px-3 ${showFilters ? "!bg-brand-50 !border-brand-200 !text-brand-700" : ""}`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 550 }}>Status</p>
                <div className="pill-tabs">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => handleStatusChange(f.value)}
                      className={`pill-tab ${statusFilter === f.value ? "active" : ""}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="sm:w-48">
                <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 550 }}>Sort by</p>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="input text-sm py-2"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setStatusFilter("all"); setSortBy("newest"); }}
                className="text-xs text-brand-600 mt-3 hover:underline"
                style={{ fontWeight: 550 }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search info */}
      {searchQuery && !loading && (
        <div className="flex items-center gap-2 mb-4 animate-fade-in">
          <p className="text-xs text-gray-400">
            Found {pagination?.total || 0} result{pagination?.total !== 1 ? "s" : ""} for "{searchQuery}"
          </p>
          <button onClick={clearSearch} className="text-xs text-brand-600 hover:underline" style={{ fontWeight: 550 }}>Clear</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center animate-fade-in">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: "var(--brand-500)" }} />
            <p className="text-sm text-gray-500">Loading polls...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="card-flat p-8 max-w-md text-center animate-scale-in">
            <AlertCircle size={32} className="mx-auto mb-3" style={{ color: "var(--error-500)" }} />
            <h2 className="text-lg text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500">{error}</p>
            <button onClick={fetchPolls} className="btn-primary mt-4">Try Again</button>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && polls.length === 0 && (
        <div className="card-flat p-12 text-center animate-fade-in">
          <Vote size={40} className="mx-auto mb-3" style={{ color: "var(--gray-300)" }} />
          <h3 className="text-base text-gray-700 mb-1">{searchQuery ? "No polls match your search" : "No polls yet"}</h3>
          <p className="text-sm text-gray-400" style={{ fontWeight: 400 }}>{searchQuery ? "Try a different search term or change your filters" : "Be the first to create a poll!"}</p>
          {!searchQuery && (
            <button onClick={() => navigate("/create-poll")} className="btn-primary mt-5"><Plus size={16} /> Create a Poll</button>
          )}
        </div>
      )}

      {/* Polls Grid */}
      {!loading && !error && polls.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {polls.map((poll, index) => (
              <div key={poll.id} className="card p-4 text-left group animate-fade-in-up flex flex-col" style={{ animationDelay: `${index * 40}ms` }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`badge text-[10px] ${poll.status === "Active" ? "badge-success" : "badge-neutral"}`}>{poll.status}</span>
                </div>
                <h3
                  onClick={() => navigate(`/poll/${poll.voteId}`)}
                  className="text-sm font-semibold text-gray-900 mb-3 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors cursor-pointer"
                >{poll.question}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Users size={12} /> {poll.totalVotes} votes</span>
                  <span className="flex items-center gap-1"><Vote size={12} /> {poll.optionCount} choices</span>
                  <span className="flex items-center gap-1 sm:ml-auto"><Clock size={12} /> {formatDate(poll.createdAt)}</span>
                </div>
                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                  <button onClick={() => navigate(`/poll/${poll.voteId}`)} className="btn-primary flex-1 py-2 text-xs">
                    <Vote size={13} /> Vote
                  </button>
                  <button onClick={() => navigate(`/results/${poll.resultsId}`)} className="btn-secondary flex-1 py-2 text-xs">
                    <BarChart3 size={13} /> Results
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev} className="btn-secondary px-3 py-2 text-sm disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pn;
                  if (pagination.totalPages <= 5) pn = i + 1;
                  else if (page <= 3) pn = i + 1;
                  else if (page >= pagination.totalPages - 2) pn = pagination.totalPages - 4 + i;
                  else pn = page - 2 + i;
                  return (
                    <button key={pn} onClick={() => setPage(pn)} className={`w-9 h-9 rounded-lg text-sm transition-colors ${pn === page ? "bg-brand-600 text-white font-semibold" : "text-gray-600 hover:bg-gray-100"}`} style={{ fontWeight: pn === page ? 600 : 500 }}>
                      {pn}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext} className="btn-secondary px-3 py-2 text-sm disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
