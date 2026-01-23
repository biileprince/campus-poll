import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  X,
  Plus,
  Check,
  Loader2,
  Copy,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { createPoll } from "../services/api";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function CreatePollPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pollQuestion, setPollQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pollLinks, setPollLinks] = useState(null);
  const [userStats, setUserStats] = useState(null);

  const MAX_OPTIONS = 10;

  // Fetch user stats when authenticated
  useEffect(() => {
    const fetchUserStats = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get("/auth/stats");
          setUserStats(response.data.data || response.data);
        } catch (err) {
          console.error("Failed to fetch user stats:", err);
        }
      }
    };
    fetchUserStats();
  }, [isAuthenticated]);

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
    // Reset states
    setError("");
    setSuccess(false);

    // Validation
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

    // Check for duplicate options
    const uniqueOptions = new Set(
      validOptions.map((opt) => opt.trim().toLowerCase()),
    );
    if (uniqueOptions.size !== validOptions.length) {
      setError("Options must be unique (duplicates not allowed)");
      return;
    }

    try {
      setLoading(true);
      const response = await createPoll({
        question: pollQuestion.trim(),
        options: validOptions.map((opt) => opt.trim()),
        expiresAt: expiresAt || null,
        allowMultiple: allowMultiple,
      });

      // Show success and poll links
      setSuccess(true);
      setPollLinks({
        voteUrl: `${window.location.origin}/poll/${response.voteId}`,
        resultsUrl: `${window.location.origin}/results/${response.resultsId}`,
        voteId: response.voteId,
        resultsId: response.resultsId,
      });

      // Auto-navigate to results page after 3 seconds
      setTimeout(() => {
        navigate(`/results/${response.resultsId}`);
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to create poll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (url, type) => {
    const description =
      type === "vote"
        ? `Vote on this poll: "${pollQuestion}"\n${url}`
        : `View results for: "${pollQuestion}"\n${url}`;

    navigator.clipboard.writeText(description);
    alert("Link with description copied to clipboard!");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
          Create Poll
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
          Design engaging polls to gather insights from your audience
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && pollLinks && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-800 px-4 sm:px-6 py-3 sm:py-4 rounded-lg">
            <h3 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
              <Check className="text-green-600" size={18} />
              Poll Created Successfully!
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Voting Link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pollLinks.voteUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded"
                  />
                  <button
                    onClick={() => copyToClipboard(pollLinks.voteUrl, "vote")}
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Copy link with description"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={pollLinks.voteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Open link"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Results Link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pollLinks.resultsUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded"
                  />
                  <button
                    onClick={() =>
                      copyToClipboard(pollLinks.resultsUrl, "results")
                    }
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Copy link with description"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={pollLinks.resultsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Open link"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Redirecting to results page in 3 seconds...
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Side - Poll Form  */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Poll Question Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poll Question
              </label>
              <input
                type="text"
                placeholder="Option 1"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              />
              <p className="text-xs text-gray-500 mt-2">
                Make your question clear and concise
              </p>
            </div>

            {/* Poll Options Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Poll Options
              </label>

              <div className="space-y-3 mb-4">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-gray-500 font-medium w-6">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addOption}
                disabled={options.length >= MAX_OPTIONS}
                className={`flex items-center gap-2 text-sm font-medium ${
                  options.length >= MAX_OPTIONS
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-[#6366F1] hover:text-[#5558E3]"
                }`}
              >
                <Plus size={16} />
                Add another option{" "}
                {options.length >= MAX_OPTIONS && `(Max ${MAX_OPTIONS})`}
              </button>
            </div>

            {/* Poll Settings Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Poll Settings
              </h3>

              <div className="space-y-4">
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

                <hr className="border-gray-200" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Allow multiple answers
                    </p>
                    <p className="text-xs text-gray-500">
                      Users can select more than one option
                    </p>
                  </div>
                  <button
                    onClick={() => setAllowMultiple(!allowMultiple)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      allowMultiple ? "bg-[#6366F1]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        allowMultiple ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className="flex-1 bg-[#6366F1] text-white py-3 rounded-md font-medium hover:bg-[#5558E3] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Create Poll
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Tips and Stats  */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mb-2">
                <Lightbulb size={20} />
              </div>
              <h3 className="font-semibold mb-2">Tips for Better Polls</h3>

              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Keep questions short and focused</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Provide balanced answer options</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Avoid leading or biased questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Test your poll before publishing</span>
                </li>
              </ul>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>

              {userStats ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Polls Created
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {userStats.pollsCreated}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(userStats.pollsCreated * 10, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Total Responses
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {userStats.totalResponses.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(userStats.totalResponses, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Engagement Rate
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {userStats.engagementRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${userStats.engagementRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  {isAuthenticated
                    ? "Loading stats..."
                    : "Sign in to see your stats"}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreatePollPage;
