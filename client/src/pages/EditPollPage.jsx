import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Plus, Check, Loader2, Calendar, ArrowLeft } from "lucide-react";
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
          poll.expiresAt
            ? new Date(poll.expiresAt).toISOString().slice(0, 16)
            : "",
        );

        // Check if poll has votes - can't edit content if votes exist
        const totalVotes = poll.totalVotes || 0;
        setCanEditContent(totalVotes === 0);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load poll");
      } finally {
        setFetchLoading(false);
      }
    };

    if (resultsId) {
      fetchPoll();
    }
  }, [resultsId]);

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) {
      setError(`Maximum ${MAX_OPTIONS} options allowed`);
      setTimeout(() => setError(""), 6000);
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!pollQuestion.trim()) {
      setError("Please enter a poll question");
      return;
    }

    if (pollQuestion.trim().length < 5) {
      setError("Question must be at least 5 characters long");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim().length > 0);
    if (validOptions.length < 2) {
      setError("Please provide at least 2 non-empty options");
      return;
    }

    const uniqueOptions = new Set(
      validOptions.map((opt) => opt.trim().toLowerCase()),
    );
    if (uniqueOptions.size !== validOptions.length) {
      setError("Options must be unique (duplicates not allowed)");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/polls/${resultsId}`, {
        question: pollQuestion.trim(),
        options: validOptions.map((opt) => opt.trim()),
        expiresAt: expiresAt || null,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/my-polls");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update poll");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to edit your polls.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#6366F1] text-white px-6 py-2 rounded-md font-medium hover:bg-[#5558E3]"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#6366F1]" />
          <span className="text-gray-600">Loading poll...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate("/my-polls")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to My Polls</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-6">
            Edit Poll
          </h1>

          {!canEditContent && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md mb-6">
              <p className="text-sm font-medium">
                This poll has received votes. You can only edit the expiration
                date.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              Poll updated successfully! Redirecting...
            </div>
          )}

          <div className="space-y-6">
            {/* Question */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Poll Question
              </label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                disabled={!canEditContent}
                placeholder="What would you like to ask?"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Answer Options
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-[#EEF2FF] text-[#6366F1] rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      disabled={!canEditContent}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {options.length > 2 && canEditContent && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {canEditContent && options.length < MAX_OPTIONS && (
                <button
                  onClick={addOption}
                  className="flex items-center gap-2 text-[#6366F1] text-sm font-medium hover:underline mt-2"
                >
                  <Plus size={16} />
                  Add Option
                </button>
              )}
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar size={16} />
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
              <p className="text-xs text-gray-500">
                Leave empty for no expiration
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className="flex-1 bg-[#6366F1] text-white py-3 rounded-md font-medium hover:bg-[#5558E3] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Update Poll
                  </>
                )}
              </button>
              <button
                onClick={() => navigate("/my-polls")}
                disabled={loading || success}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditPollPage;
