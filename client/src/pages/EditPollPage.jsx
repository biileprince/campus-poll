import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Plus, Check, Loader2, Calendar, ArrowLeft, GripVertical } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function EditPollPage() {
  const navigate = useNavigate();
  const { resultsId } = useParams();
  const { isAuthenticated } = useAuth();
  const [pollQuestion, setPollQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [canEditContent, setCanEditContent] = useState(true);

  const MAX_OPTIONS = 10;

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setFetchLoading(true);
        const response = await api.get(`/results/${resultsId}`);
        const poll = response.data;

        setPollQuestion(poll.question || "");
        setOptions(poll.options?.map((opt) => opt.text) || ["", ""]);
        setExpiresAt(
          poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : ""
        );

        const totalVotes = poll.totalVotes || 0;
        setCanEditContent(totalVotes === 0);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load poll");
      } finally {
        setFetchLoading(false);
      }
    };

    if (resultsId) fetchPoll();
  }, [resultsId]);

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) {
      setError(`You can add up to ${MAX_OPTIONS} choices`);
      setTimeout(() => setError(""), 4000);
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));
  const updateOption = (index, value) => { const n = [...options]; n[index] = value; setOptions(n); };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);
    if (!pollQuestion.trim()) { setError("Please type a question"); return; }
    if (pollQuestion.trim().length < 5) { setError("Your question is too short — use at least 5 characters"); return; }
    const valid = options.filter((o) => o.trim().length > 0);
    if (valid.length < 2) { setError("Add at least 2 choices"); return; }
    const unique = new Set(valid.map((o) => o.trim().toLowerCase()));
    if (unique.size !== valid.length) { setError("Each choice must be different"); return; }

    try {
      setLoading(true);
      await api.put(`/polls/${resultsId}`, {
        question: pollQuestion.trim(),
        options: valid.map((o) => o.trim()),
        expiresAt: expiresAt || null,
      });
      setSuccess(true);
      setTimeout(() => navigate("/my-polls"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update poll");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card-flat p-8 max-w-md text-center animate-scale-in">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-sm text-gray-500 mb-5">You need to sign in to edit your polls.</p>
          <button onClick={() => navigate("/login")} className="btn-primary">Sign In</button>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-brand-500" />
          <p className="text-sm text-gray-500">Loading poll...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button onClick={() => navigate("/my-polls")} className="btn-ghost text-sm mb-5 text-brand-600">
          <ArrowLeft size={16} /> Back to My Polls
        </button>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Edit Poll</h1>
          <p className="text-gray-500 text-sm">Update your question, choices, or close date.</p>
        </div>

        {!canEditContent && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--warning-50)", color: "var(--warning-600)", border: "1px solid var(--warning-50)" }}>
            This poll already has votes. You can only change the close date.
          </div>
        )}

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium animate-scale-in" style={{ backgroundColor: "var(--error-50)", color: "var(--error-700)", border: "1px solid var(--error-100)" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium animate-scale-in" style={{ backgroundColor: "var(--success-50)", color: "var(--success-700)" }}>
            Poll updated! Taking you back...
          </div>
        )}

        <div className="space-y-4">
          {/* Question */}
          <div className="card-flat p-5">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Your Question</label>
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              disabled={!canEditContent}
              placeholder="What do you want to ask?"
              className="input disabled:bg-gray-50 disabled:cursor-not-allowed"
              maxLength={200}
            />
          </div>

          {/* Options */}
          <div className="card-flat p-5">
            <label className="text-sm font-semibold text-gray-800 mb-4 block">Answer Choices</label>
            <div className="space-y-2.5 mb-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <GripVertical size={14} className="text-gray-300" />
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: option.trim() ? `hsl(${(index * 60) % 360}, 55%, 50%)` : "var(--gray-300)" }} />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    disabled={!canEditContent}
                    placeholder={`Choice ${index + 1}`}
                    className="input flex-1 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    maxLength={100}
                  />
                  {options.length > 2 && canEditContent && (
                    <button onClick={() => removeOption(index)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {canEditContent && options.length < MAX_OPTIONS && (
              <button onClick={addOption} className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
                <Plus size={16} /> Add a choice
              </button>
            )}
          </div>

          {/* Close Date */}
          <div className="card-flat p-5">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <Calendar size={14} className="text-gray-400" /> Close Date
              <span className="badge badge-neutral text-[10px]">Optional</span>
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1">Leave empty if you don't want the poll to close automatically.</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading || success} className="btn-primary flex-1 py-3">
              {loading ? (<><Loader2 size={18} className="animate-spin" /> Updating...</>) : (<><Check size={18} /> Update Poll</>)}
            </button>
            <button onClick={() => navigate("/my-polls")} disabled={loading || success} className="btn-secondary px-6 py-3">
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditPollPage;
