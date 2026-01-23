import { useState, useEffect } from "react";
import {
  Check,
  ChevronRight,
  Calendar,
  Eye,
  Clock,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPoll, useSubmitVote } from "../hooks/useApi";

function VotingPage() {
  const navigate = useNavigate();
  const { voteId } = useParams();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  const { data: poll, loading, error, execute: fetchPoll } = useGetPoll();
  const {
    loading: submitting,
    error: submitError,
    execute: submitVote,
  } = useSubmitVote();

  // Check if user has already voted on this poll
  useEffect(() => {
    if (voteId) {
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
      if (votedPolls[voteId]) {
        setHasVoted(true);
      }
      fetchPoll(voteId);
    }
  }, [voteId]);

  const handleOptionClick = (optionId) => {
    if (hasVoted || poll?.isExpired) return;

    if (poll?.allowMultiple) {
      // Multiple selection mode
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      // Single selection mode
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 || !voteId || hasVoted || poll?.isExpired)
      return;

    try {
      // Submit vote for each selected option
      for (const optionId of selectedOptions) {
        await submitVote(voteId, optionId);
      }

      // Mark poll as voted in localStorage
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
      votedPolls[voteId] = {
        votedAt: new Date().toISOString(),
        options: selectedOptions,
      };
      localStorage.setItem("votedPolls", JSON.stringify(votedPolls));

      // Navigate to results page after successful vote
      navigate(`/results/${poll.resultsId}`);
    } catch (err) {
      console.error("Error submitting vote:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F3F4F6] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="bg-[#F3F4F6] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Poll not found"}</p>
          <button
            onClick={() => navigate("/polls")}
            className="mt-4 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA]"
          >
            Back to Polls
          </button>
        </div>
      </div>
    );
  }

  const isExpired = poll.isExpired;
  const progressPercentage = poll.totalVotes > 0 ? 100 : 0;

  return (
    <div className="bg-[#F3F4F6] min-h-screen">
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/polls")}
          className="flex items-center gap-2 text-[#4F46E5] hover:text-[#4338CA] mb-4 sm:mb-6 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Polls
        </button>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column  */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-8">
              {/* Status Badge */}
              {isExpired ? (
                <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium mb-3 sm:mb-4">
                  <Clock size={12} />
                  Poll Expired
                </div>
              ) : hasVoted ? (
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3 sm:mb-4">
                  <CheckCircle2 size={12} />
                  You've Already Voted
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-[#DCFCE7] text-[#166534] px-3 py-1 rounded-full text-xs font-medium mb-3 sm:mb-4">
                  <div className="w-2 h-2 bg-[#16A34A] rounded-full"></div>
                  Active Poll
                </div>
              )}

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827] mb-3">
                {poll.question}
              </h1>

              <p className="text-sm sm:text-base text-[#6B7280] mb-6 sm:mb-8">
                {isExpired
                  ? "This poll has expired. You can view the results below."
                  : hasVoted
                    ? "You have already cast your vote. View the results to see how others voted."
                    : poll.allowMultiple
                      ? "Select one or more options from the choices below. Your vote will be recorded anonymously."
                      : "Select your preferred option from the choices below. Your vote will be recorded anonymously."}
              </p>

              {/* Already Voted / Expired Message */}
              {(hasVoted || isExpired) && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    isExpired
                      ? "bg-gray-50 border border-gray-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <AlertCircle
                    size={20}
                    className={isExpired ? "text-gray-500" : "text-blue-500"}
                  />
                  <div>
                    <p
                      className={`font-medium ${isExpired ? "text-gray-700" : "text-blue-700"}`}
                    >
                      {isExpired
                        ? "This poll has ended"
                        : "You have already voted"}
                    </p>
                    <p
                      className={`text-sm ${isExpired ? "text-gray-600" : "text-blue-600"}`}
                    >
                      {isExpired
                        ? "The voting period for this poll has closed."
                        : "Each person can only vote once per poll."}
                    </p>
                    <button
                      onClick={() => navigate(`/results/${poll.resultsId}`)}
                      className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View Results →
                    </button>
                  </div>
                </div>
              )}

              {/* Poll Options */}
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {poll.options.map((option) => {
                  const isSelected = selectedOptions.includes(option.id);
                  const isDisabled = hasVoted || isExpired;

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      disabled={isDisabled}
                      className={`w-full flex items-center justify-between p-3 sm:p-4 border-2 rounded-lg transition-all ${
                        isDisabled
                          ? "cursor-not-allowed opacity-60"
                          : "hover:border-[#4F46E5] hover:bg-[#F9FAFB]"
                      } ${
                        isSelected
                          ? "border-[#4F46E5] bg-[#EEF2FF]"
                          : "border-[#E5E7EB] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-5 h-5 ${poll.allowMultiple ? "rounded" : "rounded-full"} border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "border-[#4F46E5] bg-[#4F46E5]"
                              : "border-[#9CA3AF]"
                          }`}
                        >
                          {isSelected &&
                            (poll.allowMultiple ? (
                              <Check size={12} className="text-white" />
                            ) : (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            ))}
                        </div>

                        <div className="text-left">
                          <p className="text-sm font-semibold text-[#111827]">
                            {option.text}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        size={20}
                        className={`flex-shrink-0 ${
                          isSelected ? "text-[#4F46E5]" : "text-[#9CA3AF]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!hasVoted && !isExpired && (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOptions.length === 0 || submitting}
                  className={`w-full py-3 rounded-md font-medium text-sm sm:text-base transition-colors flex items-center justify-center gap-2 ${
                    selectedOptions.length > 0 && !submitting
                      ? "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                      : "bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed"
                  }`}
                >
                  <Check size={18} />
                  {submitting
                    ? "Submitting..."
                    : `Submit Vote${poll.allowMultiple && selectedOptions.length > 1 ? "s" : ""}`}
                </button>
              )}

              {/* View Results Button (for already voted / expired) */}
              {(hasVoted || isExpired) && (
                <button
                  onClick={() => navigate(`/results/${poll.resultsId}`)}
                  className="w-full py-3 rounded-md font-medium text-sm sm:text-base transition-colors flex items-center justify-center gap-2 bg-[#4F46E5] text-white hover:bg-[#4338CA]"
                >
                  <Eye size={18} />
                  View Results
                </button>
              )}

              {submitError && (
                <p className="text-red-500 text-sm mt-2">{submitError}</p>
              )}
            </div>
          </div>

          {/* Right Column  */}
          <div className="space-y-4 sm:space-y-6">
            {/* Poll Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">
                Poll Details
              </h3>

              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#E5E7EB] flex items-center justify-center">
                  {poll.creator ? (
                    <span className="text-[#6366F1] font-semibold text-sm">
                      {poll.creator.name?.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User size={20} className="text-[#6B7280]" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    {poll.creator?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-[#6B7280]">Poll Creator</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                  <Calendar size={16} className="text-[#9CA3AF]" />
                  <span className="text-xs">
                    Created:{" "}
                    {new Date(poll.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                  <Eye size={16} className="text-[#9CA3AF]" />
                  <span className="text-xs">{poll.totalVotes || 0} votes</span>
                </div>
              </div>
            </div>

            {/* Share Poll Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-4">
                Share This Poll
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/poll/${voteId}`,
                    );
                    alert("Link copied to clipboard!");
                  }}
                  className="w-full flex items-center gap-3 p-3 border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                  <Link2 size={18} className="text-[#4F46E5]" />
                  <span className="text-sm font-medium text-[#111827]">
                    Copy Link
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VotingPage;
