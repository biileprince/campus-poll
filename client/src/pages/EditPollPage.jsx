import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  X, Plus, Check, Loader2, Calendar, ArrowLeft, GripVertical, Trash2,
  ChevronDown, ChevronUp, MessageSquare, CheckSquare, CircleDot,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const QUESTION_TYPES = [
  { value: "single", label: "Single Choice", icon: CircleDot, desc: "Pick one answer" },
  { value: "multiple", label: "Multiple Choice", icon: CheckSquare, desc: "Pick one or more" },
  { value: "open_ended", label: "Open-Ended", icon: MessageSquare, desc: "Type a written answer" },
];

function EditPollPage() {
  const navigate = useNavigate();
  const { resultsId } = useParams();
  const { isAuthenticated } = useAuth();

  const [pollTitle, setPollTitle] = useState("");
  const [isMultiQuestion, setIsMultiQuestion] = useState(false);

  // Legacy
  const [options, setOptions] = useState(["", ""]);
  // Multi
  const [questions, setQuestions] = useState([
    { text: "", type: "single", options: ["", ""], collapsed: false },
  ]);

  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [canEditContent, setCanEditContent] = useState(true);

  const MAX_OPTIONS = 10;
  const MAX_QUESTIONS = 10;

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setFetchLoading(true);
        const response = await api.get(`/results/${resultsId}`);
        const poll = response.data;

        setPollTitle(poll.question || "");
        setExpiresAt(poll.expiresAt ? new Date(poll.expiresAt).toISOString().slice(0, 16) : "");
        setCanEditContent((poll.totalVotes || 0) === 0);

        if (poll.isMultiQuestion && Array.isArray(poll.questions) && poll.questions.length > 0) {
          setIsMultiQuestion(true);
          setQuestions(
            poll.questions.map((q) => ({
              text: q.text || "",
              type: q.type || "single",
              options: q.type === "open_ended"
                ? ["", ""]
                : (q.options || []).map((o) => o.text).concat(["", ""]).slice(0, Math.max(2, (q.options || []).length)),
              collapsed: false,
            }))
          );
        } else {
          setIsMultiQuestion(false);
          setOptions(poll.options?.length ? poll.options.map((o) => o.text) : ["", ""]);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load poll");
      } finally {
        setFetchLoading(false);
      }
    };

    if (resultsId) fetchPoll();
  }, [resultsId]);

  // Legacy option helpers
  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions([...options, ""]);
  };
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, v) => { const n = [...options]; n[i] = v; setOptions(n); };

  // Multi-question helpers
  const updateQuestion = (i, field, value) => {
    const q = [...questions];
    q[i] = { ...q[i], [field]: value };
    setQuestions(q);
  };
  const toggleCollapse = (i) => {
    const q = [...questions];
    q[i] = { ...q[i], collapsed: !q[i].collapsed };
    setQuestions(q);
  };
  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    setQuestions([...questions, { text: "", type: "single", options: ["", ""], collapsed: false }]);
  };
  const removeQuestion = (i) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };
  const addQuestionOption = (qi) => {
    const q = [...questions];
    if (q[qi].options.length >= MAX_OPTIONS) return;
    q[qi].options = [...q[qi].options, ""];
    setQuestions(q);
  };
  const removeQuestionOption = (qi, oi) => {
    const q = [...questions];
    q[qi].options = q[qi].options.filter((_, idx) => idx !== oi);
    setQuestions(q);
  };
  const updateQuestionOption = (qi, oi, value) => {
    const q = [...questions];
    q[qi].options = [...q[qi].options];
    q[qi].options[oi] = value;
    setQuestions(q);
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    try {
      setLoading(true);

      // If poll has votes, only update the close date
      if (!canEditContent) {
        await api.put(`/polls/${resultsId}`, { expiresAt: expiresAt || null });
        setSuccess(true);
        setTimeout(() => navigate("/my-polls"), 1500);
        return;
      }

      if (!pollTitle.trim() || pollTitle.trim().length < 5) {
        setError("Your poll title is too short — use at least 5 characters");
        setLoading(false);
        return;
      }

      let body;

      if (isMultiQuestion) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.text.trim().length < 3) {
            setError(`Question ${i + 1} is too short`); setLoading(false); return;
          }
          if (q.type !== "open_ended") {
            const valid = q.options.filter((o) => o.trim());
            if (valid.length < 2) {
              setError(`Question ${i + 1} needs at least 2 choices`); setLoading(false); return;
            }
            const lower = valid.map((o) => o.trim().toLowerCase());
            if (new Set(lower).size !== lower.length) {
              setError(`Question ${i + 1} has duplicate choices`); setLoading(false); return;
            }
          }
        }
        body = {
          question: pollTitle.trim(),
          questions: questions.map((q) => ({
            text: q.text.trim(),
            type: q.type,
            options: q.type === "open_ended" ? [] : q.options.filter((o) => o.trim()).map((o) => o.trim()),
          })),
          expiresAt: expiresAt || null,
        };
      } else {
        const valid = options.filter((o) => o.trim());
        if (valid.length < 2) { setError("Add at least 2 choices"); setLoading(false); return; }
        const unique = new Set(valid.map((o) => o.trim().toLowerCase()));
        if (unique.size !== valid.length) { setError("Each choice must be different"); setLoading(false); return; }
        body = {
          question: pollTitle.trim(),
          options: valid.map((o) => o.trim()),
          expiresAt: expiresAt || null,
        };
      }

      await api.put(`/polls/${resultsId}`, body);
      setSuccess(true);
      setTimeout(() => navigate("/my-polls"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to update poll");
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
          <p className="text-gray-500 text-sm">
            {isMultiQuestion ? "Update your questions, choices, or close date." : "Update your question, choices, or close date."}
          </p>
        </div>

        {!canEditContent && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium" style={{ backgroundColor: "var(--warning-50)", color: "var(--warning-600)", border: "1px solid var(--warning-50)" }}>
            This poll already has responses. You can only change the close date.
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
          {/* Poll Title */}
          <div className="card-flat p-5">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {isMultiQuestion ? "Poll Title" : "Your Question"}
            </label>
            <input
              type="text"
              value={pollTitle}
              onChange={(e) => setPollTitle(e.target.value)}
              disabled={!canEditContent}
              placeholder={isMultiQuestion ? "What is your poll about?" : "What do you want to ask?"}
              className="input disabled:bg-gray-50 disabled:cursor-not-allowed"
              maxLength={200}
            />
          </div>

          {/* === LEGACY single-question === */}
          {!isMultiQuestion && (
            <div className="card-flat p-5">
              <label className="text-sm font-semibold text-gray-800 mb-4 block">Answer Choices</label>
              <div className="space-y-2.5 mb-4">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <GripVertical size={14} className="text-gray-300" />
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.trim() ? `hsl(${(i * 60) % 360}, 55%, 50%)` : "var(--gray-300)" }} />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      disabled={!canEditContent}
                      placeholder={`Choice ${i + 1}`}
                      className="input flex-1 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      maxLength={100}
                    />
                    {options.length > 2 && canEditContent && (
                      <button onClick={() => removeOption(i)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
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
          )}

          {/* === MULTI-QUESTION === */}
          {isMultiQuestion && (
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={qi} className="card-flat overflow-hidden">
                  <div
                    className={`flex items-center gap-3 p-4 bg-gray-50/50 border-b border-gray-100 ${canEditContent ? "cursor-pointer" : ""}`}
                    onClick={() => canEditContent && toggleCollapse(qi)}
                  >
                    <span className="w-6 h-6 rounded-md bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">{qi + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate font-semibold">
                        {q.text.trim() || `Question ${qi + 1}`}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {QUESTION_TYPES.find((t) => t.value === q.type)?.label}
                        {q.type !== "open_ended" && ` · ${q.options.filter((o) => o.trim()).length} choices`}
                      </p>
                    </div>
                    {canEditContent && (
                      <div className="flex items-center gap-1">
                        {questions.length > 1 && (
                          <button onClick={(e) => { e.stopPropagation(); removeQuestion(qi); }} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                        {q.collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                      </div>
                    )}
                  </div>

                  {!q.collapsed && (
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5 font-medium">Question</label>
                        <input
                          type="text"
                          value={q.text}
                          onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                          disabled={!canEditContent}
                          placeholder="What do you want to ask?"
                          className="input disabled:bg-gray-50 disabled:cursor-not-allowed"
                          maxLength={200}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5 font-medium">Answer type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {QUESTION_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isActive = q.type === type.value;
                            return (
                              <button
                                key={type.value}
                                onClick={() => canEditContent && updateQuestion(qi, "type", type.value)}
                                disabled={!canEditContent}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${isActive ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"} ${!canEditContent ? "opacity-60 cursor-not-allowed" : ""}`}
                              >
                                <Icon size={16} className={isActive ? "text-brand-600" : "text-gray-400"} />
                                <p className="text-xs mt-1.5 font-semibold" style={{ color: isActive ? "var(--brand-700)" : "var(--gray-700)" }}>{type.label}</p>
                                <p className="text-[10px] mt-0.5 text-gray-400">{type.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {q.type !== "open_ended" && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5 font-medium">Choices</label>
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 group">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.trim() ? `hsl(${(oi * 60) % 360}, 55%, 50%)` : "var(--gray-300)" }} />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateQuestionOption(qi, oi, e.target.value)}
                                  disabled={!canEditContent}
                                  placeholder={`Choice ${oi + 1}`}
                                  className="input flex-1 text-sm disabled:bg-gray-50"
                                  maxLength={100}
                                />
                                {q.options.length > 2 && canEditContent && (
                                  <button onClick={() => removeQuestionOption(qi, oi)} className="p-1 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          {canEditContent && q.options.length < MAX_OPTIONS && (
                            <button onClick={() => addQuestionOption(qi)} className="flex items-center gap-1.5 text-xs mt-2 text-brand-600 font-medium">
                              <Plus size={14} /> Add choice
                            </button>
                          )}
                        </div>
                      )}

                      {q.type === "open_ended" && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                          <MessageSquare size={16} className="text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500">People will see a text box where they can type their answer.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {canEditContent && (
                <button
                  onClick={addQuestion}
                  disabled={questions.length >= MAX_QUESTIONS}
                  className={`w-full p-4 rounded-xl border-2 border-dashed text-sm transition-all font-medium ${questions.length >= MAX_QUESTIONS ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-500 hover:border-brand-300 hover:text-brand-600"}`}
                >
                  <Plus size={16} className="inline mr-1.5 -mt-0.5" />
                  Add Question ({questions.length}/{MAX_QUESTIONS})
                </button>
              )}
            </div>
          )}

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
