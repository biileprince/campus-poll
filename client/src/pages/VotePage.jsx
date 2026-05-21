import { useState, useEffect } from "react";
import { Check, Calendar, Eye, Clock, Link2, User, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Vote, Copy, MessageSquare } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPoll, useSubmitVote } from "../hooks/useApi";
import { submitResponse } from "../services/api";

function VotingPage() {
  const navigate = useNavigate();
  const { voteId } = useParams();
  // Single-question state (legacy)
  const [selectedOptions, setSelectedOptions] = useState([]);
  // Multi-question state: { [questionId]: string[] | string }
  const [answers, setAnswers] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [previousVote, setPreviousVote] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [localError, setLocalError] = useState("");

  const { data: poll, loading, error, execute: fetchPoll } = useGetPoll();
  const { loading: submitting, error: submitError, execute: submitVote } = useSubmitVote();

  useEffect(() => {
    if (voteId) {
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
      if (votedPolls[voteId]) { setHasVoted(true); setPreviousVote(votedPolls[voteId]); }
      fetchPoll(voteId);
    }
  }, [voteId]);

  const isMulti = poll?.isMultiQuestion && Array.isArray(poll.questions) && poll.questions.length > 0;

  // === Single-question handlers (legacy) ===
  const handleOptionClick = (optionId) => {
    if (hasVoted || poll?.isExpired) return;
    if (poll?.allowMultiple) {
      setSelectedOptions((prev) => prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]);
    } else {
      setSelectedOptions([optionId]);
    }
  };

  // === Multi-question handlers ===
  const handleChoice = (question, optionId) => {
    if (hasVoted || poll?.isExpired) return;
    setAnswers((prev) => {
      if (question.type === "multiple") {
        const current = Array.isArray(prev[question.id]) ? prev[question.id] : [];
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [question.id]: next };
      }
      return { ...prev, [question.id]: [optionId] };
    });
  };

  const handleText = (questionId, text) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  // === Submit ===
  const handleSubmit = async () => {
    setLocalError("");
    if (hasVoted || poll?.isExpired) return;

    try {
      if (isMulti) {
        // Validate all questions answered
        for (const q of poll.questions) {
          const ans = answers[q.id];
          if (q.type === "open_ended") {
            if (!ans || !ans.toString().trim()) {
              setLocalError(`Please answer: "${q.text}"`); return;
            }
          } else {
            if (!Array.isArray(ans) || ans.length === 0) {
              setLocalError(`Please pick an answer for: "${q.text}"`); return;
            }
          }
        }

        // Submit each question's answer
        for (const q of poll.questions) {
          const ans = answers[q.id];
          if (q.type === "open_ended") {
            await submitResponse(q.id, ans.toString().trim(), voteId);
          } else {
            for (const optionId of ans) {
              await submitVote(voteId, optionId);
            }
          }
        }

        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
        votedPolls[voteId] = { votedAt: new Date().toISOString(), answers };
        localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
      } else {
        if (selectedOptions.length === 0 || !voteId) {
          setLocalError("Please pick an answer"); return;
        }
        for (const optionId of selectedOptions) { await submitVote(voteId, optionId); }
        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
        votedPolls[voteId] = { votedAt: new Date().toISOString(), options: selectedOptions };
        localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
      }
      setShowSuccess(true);
      setHasVoted(true);
    } catch (err) {
      console.error("Error submitting vote:", err);
      setLocalError(err.response?.data?.error || err.message || "Failed to submit. Please try again.");
    }
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/poll/${voteId}`); } catch { /* */ }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-fade-in">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-brand-500" />
          <p className="text-sm text-gray-500">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card-flat p-8 max-w-md text-center animate-scale-in">
          <AlertCircle size={24} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Poll not found</h2>
          <p className="text-sm text-gray-500 mb-5">{error || "This link doesn't work. The poll may have been removed."}</p>
          <button onClick={() => navigate("/polls")} className="btn-primary">Browse Polls</button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="page-enter max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-3xl bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanks for voting!</h1>
          <p className="text-gray-500 text-sm mb-8">Your answer{isMulti ? "s have" : " has"} been recorded.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate(`/results/${poll.resultsId}`)} className="btn-primary py-3 px-6"><Eye size={16} /> See Results</button>
            <button onClick={copyLink} className="btn-secondary py-3 px-6">
              {copiedLink ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Share Poll</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = poll.isExpired;
  const isDisabled = hasVoted || isExpired;

  // Render a single choice/open-ended question block
  const renderQuestion = (q, qIdx) => {
    const ans = answers[q.id];
    const selected = Array.isArray(ans) ? ans : [];

    if (q.type === "open_ended") {
      return (
        <div key={q.id} className="card-flat p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: `${qIdx * 50}ms` }}>
          <div className="flex items-start gap-3 mb-4">
            <span className="w-6 h-6 rounded-md bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{qIdx + 1}</span>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">{q.text}</h3>
              <p className="text-xs text-gray-400 mt-0.5">Type your answer below</p>
            </div>
            <MessageSquare size={16} className="text-gray-300" />
          </div>
          <textarea
            value={typeof ans === "string" ? ans : ""}
            onChange={(e) => handleText(q.id, e.target.value)}
            disabled={isDisabled}
            placeholder="Type your answer..."
            className="input w-full min-h-[100px] resize-y"
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{(typeof ans === "string" ? ans.length : 0)}/1000</p>
        </div>
      );
    }

    return (
      <div key={q.id} className="card-flat p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: `${qIdx * 50}ms` }}>
        <div className="flex items-start gap-3 mb-4">
          <span className="w-6 h-6 rounded-md bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{qIdx + 1}</span>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{q.text}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{q.type === "multiple" ? "Pick one or more" : "Pick one"}</p>
          </div>
        </div>
        <div className="space-y-2.5">
          {q.options.map((option, oIdx) => {
            const isSelected = selected.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleChoice(q, option.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left
                  ${isDisabled ? "cursor-not-allowed opacity-70" : "hover:border-brand-300 hover:bg-brand-50/30"}
                  ${isSelected ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white"}`}
                style={{ animationDelay: `${oIdx * 30}ms` }}
              >
                <div className={`w-5 h-5 ${q.type === "multiple" ? "rounded-md" : "rounded-full"} border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected ? "border-brand-500 bg-brand-500" : "border-gray-300"}`}>
                  {isSelected && (q.type === "multiple" ? <Check size={12} className="text-white" /> : <div className="w-2 h-2 bg-white rounded-full" />)}
                </div>
                <span className={`text-sm font-medium ${isSelected ? "text-brand-800" : "text-gray-800"}`}>{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="page-enter">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate("/polls")} className="btn-ghost text-sm mb-5 text-brand-600">
          <ArrowLeft size={16} /> Back to Polls
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 sm:gap-5">
          {/* Left */}
          <div className="space-y-4">
            {/* Header card */}
            <div className="card-flat p-5 sm:p-7">
              {isExpired ? (
                <div className="badge badge-neutral mb-4"><Clock size={12} /> Poll Closed</div>
              ) : hasVoted ? (
                <div className="badge badge-brand mb-4"><CheckCircle2 size={12} /> You Already Voted</div>
              ) : (
                <div className="badge badge-success mb-4"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Open</div>
              )}

              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{poll.question}</h1>
              <p className="text-sm text-gray-500">
                {isExpired ? "This poll is closed. You can still see the results." :
                 hasVoted ? "You already submitted your answers. Check the results." :
                 isMulti ? `Answer ${poll.questions.length} question${poll.questions.length > 1 ? "s" : ""} below.` :
                 poll.allowMultiple ? "You can pick more than one." : "Pick the answer you like best."}
              </p>

              {(hasVoted || isExpired) && !showSuccess && (
                <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${isExpired ? "bg-gray-50 border border-gray-200" : "bg-blue-50 border border-blue-100"}`}>
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{isExpired ? "Voting is over" : "You already voted"}</p>
                    <button onClick={() => navigate(`/results/${poll.resultsId}`)} className="mt-1 text-xs font-semibold text-brand-600">See Results →</button>
                  </div>
                </div>
              )}
            </div>

            {/* Questions */}
            {isMulti ? (
              poll.questions.map((q, i) => renderQuestion(q, i))
            ) : (
              <div className="card-flat p-5 sm:p-7">
                <div className="space-y-2.5">
                  {poll.options.map((option, index) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const wasPrevious = previousVote?.options?.includes(option.id);

                    return (
                      <button key={option.id} onClick={() => handleOptionClick(option.id)} disabled={isDisabled}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all animate-fade-in-up
                          ${isDisabled ? "cursor-not-allowed" : "hover:border-brand-300 hover:bg-brand-50/30"}
                          ${isSelected ? "border-brand-500 bg-brand-50" : wasPrevious ? "border-brand-200 bg-brand-50/40" : "border-gray-200 bg-white"}`}
                        style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 ${poll.allowMultiple ? "rounded-md" : "rounded-full"} border-2 flex items-center justify-center flex-shrink-0 transition-all
                            ${isSelected ? "border-brand-500 bg-brand-500" : wasPrevious ? "border-brand-300 bg-brand-100" : "border-gray-300"}`}>
                            {isSelected && (poll.allowMultiple ? <Check size={12} className="text-white" /> : <div className="w-2 h-2 bg-white rounded-full" />)}
                            {wasPrevious && !isSelected && <Check size={12} className="text-brand-400" />}
                          </div>
                          <span className={`text-sm font-medium text-left ${isSelected ? "text-brand-800" : "text-gray-800"}`}>{option.text}</span>
                        </div>
                        {wasPrevious && <span className="badge badge-brand text-[10px]">Your pick</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="card-flat p-5">
              {!hasVoted && !isExpired && (
                <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-3.5 text-base">
                  {submitting ? (<><Loader2 size={18} className="animate-spin" /> Submitting...</>) : (<><Vote size={18} /> Submit {isMulti ? "Answers" : "Vote"}</>)}
                </button>
              )}

              {(hasVoted || isExpired) && (
                <button onClick={() => navigate(`/results/${poll.resultsId}`)} className="btn-primary w-full py-3.5 text-base"><Eye size={18} /> See Results</button>
              )}

              {(localError || submitError) && <p className="text-sm mt-3 text-red-600">{localError || submitError}</p>}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className="card-flat p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">About This Poll</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {poll.creator ? poll.creator.name?.charAt(0).toUpperCase() : <User size={18} className="text-white" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{poll.creator?.name || "Someone"}</p>
                  <p className="text-xs text-gray-400">Created this poll</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-500"><Calendar size={14} className="text-gray-400" /> {new Date(poll.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                {isMulti && <div className="flex items-center gap-3 text-xs text-gray-500"><MessageSquare size={14} className="text-gray-400" /> {poll.questions.length} question{poll.questions.length > 1 ? "s" : ""}</div>}
                {!isMulti && poll.allowMultiple && <div className="flex items-center gap-3 text-xs text-gray-500"><CheckCircle2 size={14} className="text-gray-400" /> You can pick more than one</div>}
              </div>
            </div>
            <div className="card-flat p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Share This Poll</h3>
              <button onClick={copyLink} className="btn-secondary w-full">
                {copiedLink ? <><Check size={16} className="text-green-600" /> Copied!</> : <><Link2 size={16} /> Copy Link</>}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VotingPage;
