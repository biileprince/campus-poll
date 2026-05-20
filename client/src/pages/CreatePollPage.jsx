import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Plus, Check, Loader2, Copy, ExternalLink, Calendar,
  GripVertical, CheckCircle2, ArrowRight, Link2, FileQuestion,
  ChevronDown, ChevronUp, Trash2, MessageSquare, CheckSquare, CircleDot,
} from "lucide-react";
import { createPoll } from "../services/api";

const QUESTION_TYPES = [
  { value: "single", label: "Single Choice", icon: CircleDot, desc: "Pick one answer" },
  { value: "multiple", label: "Multiple Choice", icon: CheckSquare, desc: "Pick one or more" },
  { value: "open_ended", label: "Open-Ended", icon: MessageSquare, desc: "Type a written answer" },
];

function CreatePollPage() {
  const navigate = useNavigate();
  const [pollTitle, setPollTitle] = useState("");
  const [useMultiQuestion, setUseMultiQuestion] = useState(false);

  // Single-question mode (legacy)
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);

  // Multi-question mode
  const [questions, setQuestions] = useState([
    { text: "", type: "single", options: ["", ""], collapsed: false },
  ]);

  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pollLinks, setPollLinks] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const MAX_OPTIONS = 10;
  const MAX_QUESTIONS = 10;

  // Single-question helpers
  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions([...options, ""]);
  };
  const removeOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i, v) => { const n = [...options]; n[i] = v; setOptions(n); };

  // Multi-question helpers
  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    setQuestions([...questions, { text: "", type: "single", options: ["", ""], collapsed: false }]);
  };
  const removeQuestion = (i) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };
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

  // Validation
  const isFormValid = (() => {
    if (pollTitle.trim().length < 5) return false;
    if (useMultiQuestion) {
      return questions.every((q) => {
        if (q.text.trim().length < 3) return false;
        if (q.type !== "open_ended") {
          return q.options.filter((o) => o.trim()).length >= 2;
        }
        return true;
      });
    }
    return options.filter((o) => o.trim()).length >= 2;
  })();

  const handleSubmit = async () => {
    setError("");
    if (pollTitle.trim().length < 5) { setError("Your poll title is too short — use at least 5 characters"); return; }

    try {
      setLoading(true);
      let body;

      if (useMultiQuestion) {
        // Validate questions
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.text.trim().length < 3) { setError(`Question ${i + 1} is too short`); setLoading(false); return; }
          if (q.type !== "open_ended") {
            const valid = q.options.filter((o) => o.trim());
            if (valid.length < 2) { setError(`Question ${i + 1} needs at least 2 choices`); setLoading(false); return; }
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
        body = {
          question: pollTitle.trim(),
          options: valid.map((o) => o.trim()),
          expiresAt: expiresAt || null,
          allowMultiple,
        };
      }

      const response = await createPoll(body);
      setSuccess(true);
      setPollLinks({
        voteUrl: `${window.location.origin}/poll/${response.voteId}`,
        resultsUrl: `${window.location.origin}/results/${response.resultsId}`,
        voteId: response.voteId,
        resultsId: response.resultsId,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (url, field) => {
    try { await navigator.clipboard.writeText(url); } catch {}
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Success view
  if (success && pollLinks) {
    return (
      <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl text-gray-900 mb-2">Your poll is ready!</h1>
          <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>Send the voting link to people you want to hear from.</p>
        </div>
        <div className="space-y-4 animate-fade-in-up delay-2">
          <div className="card-flat p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={14} className="text-brand-600" />
              <span className="text-sm font-semibold text-gray-900">Voting Link</span>
              <span className="badge badge-brand text-[10px]">Share this</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={pollLinks.voteUrl} readOnly className="input text-sm bg-gray-50" />
              <button onClick={() => copy(pollLinks.voteUrl, "vote")} className={`btn-secondary flex-shrink-0 px-3 py-2.5 ${copiedField === "vote" ? "!bg-green-50 !border-green-500 !text-green-700" : ""}`}>
                {copiedField === "vote" ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <a href={pollLinks.voteUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-shrink-0 px-3 py-2.5"><ExternalLink size={16} /></a>
            </div>
          </div>
          <div className="card-flat p-5">
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink size={14} className="text-purple-600" />
              <span className="text-sm font-semibold text-gray-900">Results Link</span>
              <span className="badge badge-neutral text-[10px]">Only for you</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" value={pollLinks.resultsUrl} readOnly className="input text-sm bg-gray-50" />
              <button onClick={() => copy(pollLinks.resultsUrl, "results")} className={`btn-secondary flex-shrink-0 px-3 py-2.5 ${copiedField === "results" ? "!bg-green-50 !border-green-500 !text-green-700" : ""}`}>
                {copiedField === "results" ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <a href={pollLinks.resultsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-shrink-0 px-3 py-2.5"><ExternalLink size={16} /></a>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 animate-fade-in-up delay-3">
          <button onClick={() => navigate(`/results/${pollLinks.resultsId}`)} className="btn-primary flex-1 py-3">View Results <ArrowRight size={16} /></button>
          <button onClick={() => { setSuccess(false); setPollLinks(null); setPollTitle(""); setOptions(["", ""]); setQuestions([{ text: "", type: "single", options: ["", ""], collapsed: false }]); setAllowMultiple(false); setExpiresAt(""); setUseMultiQuestion(false); }} className="btn-secondary flex-1 py-3"><Plus size={16} /> Make Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl text-gray-900 mb-1">Create a Poll</h1>
          <p className="text-sm text-gray-500" style={{ fontWeight: 400 }}>Ask one question or build a poll with several questions.</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm animate-scale-in" style={{ backgroundColor: "var(--error-50)", color: "var(--error-700)", border: "1px solid var(--error-100)", fontWeight: 550 }}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Poll Title */}
          <div className="card-flat p-5">
            <label className="block text-sm text-gray-800 mb-2" style={{ fontWeight: 600 }}>Poll Title</label>
            <input type="text" placeholder="What is your poll about?" value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} className="input" maxLength={200} />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400" style={{ fontWeight: 400 }}>This is the main heading people will see</p>
              <p className="text-xs text-gray-400">{pollTitle.length}/200</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="card-flat p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800" style={{ fontWeight: 600 }}>
                  <FileQuestion size={15} className="inline mr-1.5 -mt-0.5" />
                  Multiple Questions
                </p>
                <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>Add several questions with different types in one poll</p>
              </div>
              <button
                onClick={() => setUseMultiQuestion(!useMultiQuestion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useMultiQuestion ? "bg-brand-600" : "bg-gray-300"}`}
                role="switch"
                aria-checked={useMultiQuestion}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${useMultiQuestion ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* === SINGLE QUESTION MODE === */}
          {!useMultiQuestion && (
            <>
              <div className="card-flat p-5">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm text-gray-800" style={{ fontWeight: 600 }}>Answer Choices</label>
                  <span className="text-xs text-gray-400">{options.filter((o) => o.trim()).length} of {options.length} filled</span>
                </div>
                <div className="space-y-2.5 mb-4">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 group animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                      <GripVertical size={14} className="text-gray-300" />
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.trim() ? `hsl(${(i * 60) % 360}, 55%, 50%)` : "var(--gray-300)" }} />
                      <input type="text" placeholder={`Choice ${i + 1}`} value={opt} onChange={(e) => updateOption(i, e.target.value)} className="input flex-1" maxLength={100} />
                      {options.length > 2 && (
                        <button onClick={() => removeOption(i)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addOption} disabled={options.length >= MAX_OPTIONS} className={`flex items-center gap-2 text-sm ${options.length >= MAX_OPTIONS ? "text-gray-300 cursor-not-allowed" : "text-brand-600 hover:text-brand-700"}`} style={{ fontWeight: 550 }}>
                  <Plus size={16} /> Add a choice
                </button>
              </div>

              {/* Allow multiple */}
              <div className="card-flat p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700" style={{ fontWeight: 550 }}>Allow multiple answers</p>
                    <p className="text-xs text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>Let people pick more than one choice</p>
                  </div>
                  <button onClick={() => setAllowMultiple(!allowMultiple)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowMultiple ? "bg-brand-600" : "bg-gray-300"}`} role="switch" aria-checked={allowMultiple}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${allowMultiple ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* === MULTI-QUESTION MODE === */}
          {useMultiQuestion && (
            <div className="space-y-3">
              {questions.map((q, qi) => (
                <div key={qi} className="card-flat overflow-hidden animate-fade-in-up" style={{ animationDelay: `${qi * 50}ms` }}>
                  {/* Question Header */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50/50 border-b border-gray-100 cursor-pointer" onClick={() => toggleCollapse(qi)}>
                    <span className="w-6 h-6 rounded-md bg-brand-600 text-white text-xs flex items-center justify-center flex-shrink-0" style={{ fontWeight: 700 }}>{qi + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate" style={{ fontWeight: 600 }}>
                        {q.text.trim() || `Question ${qi + 1}`}
                      </p>
                      <p className="text-[11px] text-gray-400" style={{ fontWeight: 400 }}>
                        {QUESTION_TYPES.find((t) => t.value === q.type)?.label}
                        {q.type !== "open_ended" && ` · ${q.options.filter((o) => o.trim()).length} choices`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {questions.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); removeQuestion(qi); }} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {q.collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Question Body */}
                  {!q.collapsed && (
                    <div className="p-5 space-y-4">
                      {/* Question Text */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 550 }}>Question</label>
                        <input type="text" placeholder="What do you want to ask?" value={q.text} onChange={(e) => updateQuestion(qi, "text", e.target.value)} className="input" maxLength={200} />
                      </div>

                      {/* Question Type */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 550 }}>Answer type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {QUESTION_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isActive = q.type === type.value;
                            return (
                              <button
                                key={type.value}
                                onClick={() => updateQuestion(qi, "type", type.value)}
                                className={`p-3 rounded-xl border-2 text-left transition-all ${isActive ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-gray-300"}`}
                              >
                                <Icon size={16} className={isActive ? "text-brand-600" : "text-gray-400"} />
                                <p className="text-xs mt-1.5" style={{ fontWeight: 600, color: isActive ? "var(--brand-700)" : "var(--gray-700)" }}>{type.label}</p>
                                <p className="text-[10px] mt-0.5" style={{ fontWeight: 400, color: "var(--gray-400)" }}>{type.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Options (for choice types) */}
                      {q.type !== "open_ended" && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1.5" style={{ fontWeight: 550 }}>Choices</label>
                          <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 group">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.trim() ? `hsl(${(oi * 60) % 360}, 55%, 50%)` : "var(--gray-300)" }} />
                                <input type="text" placeholder={`Choice ${oi + 1}`} value={opt} onChange={(e) => updateQuestionOption(qi, oi, e.target.value)} className="input flex-1 text-sm" maxLength={100} />
                                {q.options.length > 2 && (
                                  <button onClick={() => removeQuestionOption(qi, oi)} className="p-1 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14} /></button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button onClick={() => addQuestionOption(qi)} disabled={q.options.length >= MAX_OPTIONS} className={`flex items-center gap-1.5 text-xs mt-2 ${q.options.length >= MAX_OPTIONS ? "text-gray-300" : "text-brand-600"}`} style={{ fontWeight: 550 }}>
                            <Plus size={14} /> Add choice
                          </button>
                        </div>
                      )}

                      {q.type === "open_ended" && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                          <MessageSquare size={16} className="text-gray-400 mb-1" />
                          <p className="text-xs text-gray-500" style={{ fontWeight: 400 }}>People will see a text box where they can type their answer.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Add question */}
              <button onClick={addQuestion} disabled={questions.length >= MAX_QUESTIONS} className={`w-full p-4 rounded-xl border-2 border-dashed text-sm transition-all ${questions.length >= MAX_QUESTIONS ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-500 hover:border-brand-300 hover:text-brand-600"}`} style={{ fontWeight: 550 }}>
                <Plus size={16} className="inline mr-1.5 -mt-0.5" />
                Add Question ({questions.length}/{MAX_QUESTIONS})
              </button>
            </div>
          )}

          {/* Close Date */}
          <div className="card-flat p-5">
            <h3 className="text-sm text-gray-800 mb-4" style={{ fontWeight: 600 }}>Settings</h3>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2" style={{ fontWeight: 550 }}>
              <Calendar size={14} className="text-gray-400" /> Close date <span className="badge badge-neutral text-[10px]">Optional</span>
            </label>
            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="input" />
            <p className="text-xs text-gray-400 mt-1" style={{ fontWeight: 400 }}>The poll will stop accepting answers after this date.</p>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading || !isFormValid} className="btn-primary w-full py-3.5 text-base">
            {loading ? (<><Loader2 size={18} className="animate-spin" /> Creating...</>) : (<><Check size={18} /> Create Poll</>)}
          </button>
        </div>
      </main>
    </div>
  );
}

export default CreatePollPage;
