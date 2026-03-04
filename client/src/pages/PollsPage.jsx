import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Vote,
  Copy,
  Calendar,
  Users,
  RefreshCw,
} from "lucide-react";
import { useGetAllPolls } from "../hooks/useApi";
import { useEffect } from "react";

export default function PollsPage() {
  const navigate = useNavigate();
  const {
    data: pollsData,
    loading,
    error,
    execute: fetchPolls,
  } = useGetAllPolls();

  useEffect(() => {
    fetchPolls();
  }, []);

  const copyToClipboard = (poll, type) => {
    const url =
      type === "vote"
        ? `${window.location.origin}/poll/${poll.voteId}`
        : `${window.location.origin}/results/${poll.resultsId}`;

    const description =
      type === "vote"
        ? `Vote on this poll: "${poll.question}"\n${url}`
        : `View results for: "${poll.question}"\n${url}`;

    navigator.clipboard.writeText(description);
    alert("Link with description copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              All Polls
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Browse and interact with all created polls
            </p>
          </div>
          <button
            onClick={() => fetchPolls()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading polls...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && pollsData?.polls?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 mb-4">No polls created yet</p>
            <button
              onClick={() => navigate("/create-poll")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Your First Poll
            </button>
          </div>
        )}

        {!loading && !error && pollsData?.polls?.length > 0 && (
          <div className="space-y-4">
            {pollsData.polls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      {poll.question}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        {formatDate(poll.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} className="sm:w-4 sm:h-4" />
                        {poll.totalVotes}{" "}
                        {poll.totalVotes === 1 ? "vote" : "votes"}
                      </span>
                      <span className="text-gray-500">
                        {poll.optionCount} options
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => navigate(`/poll/${poll.voteId}`)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm"
                  >
                    <Vote size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Vote Now</span>
                    <span className="sm:hidden">Vote</span>
                  </button>

                  <button
                    onClick={() => navigate(`/results/${poll.resultsId}`)}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs sm:text-sm"
                  >
                    <BarChart3 size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">View Results</span>
                    <span className="sm:hidden">Results</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(poll, "vote")}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
                    title="Copy voting link with description"
                  >
                    <Copy size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Copy Vote Link</span>
                    <span className="sm:hidden">Vote Link</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(poll, "results")}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
                    title="Copy results link with description"
                  >
                    <Copy size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Copy Results Link</span>
                    <span className="sm:hidden">Results Link</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
