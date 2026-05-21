import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, UserPlus, Vote, Loader2, Check, X } from "lucide-react";
import api from "../services/api";

const PASSWORD_RULES = [
  { test: (p) => p.length >= 6, label: "At least 6 characters" },
  { test: (p) => /\d/.test(p), label: "Has a number" },
];

export default function RegisterPage() {
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(""); clearError();
    if (!email.trim() || !password.trim()) { setLocalError("Please fill in all required fields"); return; }
    if (password.length < 6) { setLocalError("Password needs at least 6 characters"); return; }
    if (!/\d/.test(password)) { setLocalError("Password needs at least one number"); return; }
    setLoading(true);
    const result = await register(email, password, name || undefined);
    setLoading(false);
    if (result.success) navigate("/");
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const init = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        use_fedcm_for_prompt: true,
        callback: async (response) => {
          try {
            const res = await api.post("/auth/google", { credential: response.credential });
            const { token } = res.data.data || res.data;
            localStorage.setItem("token", token);
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            window.location.href = "/";
          } catch (err) {
            setLocalError(err.response?.data?.error || err.message || "Google sign-up failed");
          }
        },
      });

      const width = Math.min(400, Math.max(240, googleBtnRef.current.clientWidth || 360));
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width,
        text: "signup_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      const t = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(t); init(); }
      }, 100);
      const timeout = setTimeout(() => clearInterval(t), 5000);
      return () => { clearInterval(t); clearTimeout(timeout); };
    }
  }, []);

  const errorMessage = localError || authError;
  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;

  return (
    <div className="min-h-screen flex">
      {/* Left — Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="/auth-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gray-900/50" />
        <div className="relative flex flex-col justify-between h-full p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Vote size={18} className="text-white" /></div>
            <span className="text-lg font-bold text-white tracking-tight">Campus Poll</span>
          </Link>
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">Start creating<br />polls today.</h1>
            <p className="text-white/70 text-base max-w-sm leading-relaxed">Sign up to create, manage, and track your polls. It only takes a few seconds.</p>
          </div>
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} Campus Poll</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center"><Vote size={18} className="text-white" /></div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">Campus Poll</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h2>
          <p className="text-sm text-gray-500 mb-6">Sign up so you can manage your polls later.</p>

          {errorMessage && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium animate-scale-in" style={{ backgroundColor: "var(--error-50)", color: "var(--error-700)", border: "1px solid var(--error-100)" }}>
              {errorMessage}
            </div>
          )}

          {/* Official Google button — GSI mutates this div's DOM, so React
              must not track any children inside it. The loader is a sibling. */}
          <div className="mb-4 flex flex-col items-center justify-center min-h-[44px]">
            {!googleReady && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={14} className="animate-spin" /> Loading Google sign-in...
              </div>
            )}
            <div ref={googleBtnRef} />
          </div>

          <div className="divider mb-4">or</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="input" autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="input" autoComplete="email" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="input pr-10" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-3 space-y-2 animate-fade-in">
                  <div className="flex gap-1">
                    {PASSWORD_RULES.map((_, i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ backgroundColor: i < passwordStrength ? (passwordStrength === PASSWORD_RULES.length ? "var(--success-500)" : "var(--warning-500)") : "var(--gray-200)" }} />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {PASSWORD_RULES.map((rule, i) => {
                      const pass = rule.test(password);
                      return <div key={i} className="flex items-center gap-2 text-xs" style={{ color: pass ? "var(--success-600)" : "var(--gray-400)" }}>{pass ? <Check size={12} /> : <X size={12} />} {rule.label}</div>;
                    })}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (<><Loader2 size={18} className="animate-spin" /> Creating account...</>) : (<><UserPlus size={18} /> Create Account</>)}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
