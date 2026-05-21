import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Edit2,
  Trash2,
  ExternalLink,
  Copy,
  Clock,
  CheckCircle2,
  Loader2,
  Plus,
  Vote,
  Calendar,
  Users,
  AlertCircle,
  Check,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function MyPollsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, poll: null });
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/my-polls" } } });
      return;
    }
    fetchMyPolls();
  }, [isAuthenticated, navigate]);

  const fetchMyPolls = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/my-polls");
      setPolls(response.data.polls);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load your polls");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.poll) return;

    try {
      setDeleting(true);
      await api.delete(`/polls/${deleteModal.poll.resultsId}`);
      setPolls(polls.filter((p) => p.id !== deleteModal.poll.id));
      setDeleteModal({ show: false, poll: null });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete poll");
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = async (text, pollId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(pollId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* silent */
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2
            size={32}
            className="animate-spin mx-auto mb-3"
            style={{ color: "var(--brand-500)" }}
          />
          <p className="text-sm text-gray-500">Loading your polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            My Polls
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.name || "User"}! You have {polls.length} poll
            {polls.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Link to="/create-poll" className="btn-primary">
          <Plus size={16} />
          Create Poll
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-5 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-scale-in"
          style={{
            backgroundColor: "var(--error-50)",
            color: "var(--error-700)",
            border: "1px solid var(--error-100)",
          }}
        >
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {polls.length === 0 && !error && (
        <div className="card-flat p-10 sm:p-14 text-center animate-fade-in-up">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--gray-100)" }}
          >
            <FolderOpen size={28} style={{ color: "var(--gray-400)" }} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            No polls yet
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first poll to start gathering insights from your
            audience.
          </p>
          <Link to="/create-poll" className="btn-primary">
            <Plus size={16} />
            Create Your First Poll
          </Link>
        </div>
      )}

      {/* Polls Grid */}
      {polls.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll, index) => (
            <div
              key={poll.id}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* Poll Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 leading-snug">
                  {poll.question}
                </h3>
                <span
                  className={`badge text-[10px] flex-shrink-0 ${
                    poll.status === "Active"
                      ? "badge-success"
                      : "badge-neutral"
                  }`}
                >
                  {poll.status === "Active" && <CheckCircle2 size={10} />}
                  {poll.status === "Expired" && <Clock size={10} />}
                  {poll.status}
                </span>
              </div>

              {/* Poll Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {poll.totalVotes} votes
                </span>
                <span className="flex items-center gap-1">
                  <Vote size={12} />
                  {poll.optionCount} options
                </span>
              </div>

              {/* Dates */}
              <div className="text-xs text-gray-400 mb-4 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar size={11} />
                  Created {formatDate(poll.createdAt)}
                </div>
                {poll.expiresAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} />
                    Expires {formatDate(poll.expiresAt)}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
                <Link
                  to={`/results/${poll.resultsId}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: "var(--brand-50)",
                    color: "var(--brand-700)",
                  }}
                >
                  <BarChart3 size={13} />
                  Results
                </Link>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `${window.location.origin}/poll/${poll.voteId}`,
                      poll.id
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                  title="Copy voting link"
                >
                  {copiedId === poll.id ? (
                    <Check size={13} style={{ color: "var(--success-600)" }} />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>

                <Link
                  to={`/poll/${poll.voteId}`}
                  className="flex items-center justify-center py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg transition-colors"
                  title="Open voting page"
                >
                  <ExternalLink size={13} />
                </Link>

                {poll.canEdit && (
                  <Link
                    to={`/edit-poll/${poll.resultsId}`}
                    className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--warning-50)",
                      color: "var(--warning-600)",
                    }}
                    title="Edit poll"
                  >
                    <Edit2 size={13} />
                  </Link>
                )}

                <button
                  onClick={() => setDeleteModal({ show: true, poll })}
                  className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: "var(--error-50)",
                    color: "var(--error-600)",
                  }}
                  title="Delete poll"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "var(--error-50)" }}
              >
                <Trash2 size={20} style={{ color: "var(--error-600)" }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete Poll?
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{deleteModal.poll?.question}"?
              This action cannot be undone and all votes will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, poll: null })}
                disabled={deleting}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-white transition-colors"
                style={{
                  backgroundColor: deleting
                    ? "var(--error-400)"
                    : "var(--error-600)",
                }}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPollsPage;
