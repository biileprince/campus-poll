import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, LogIn, Vote, Loader2 } from "lucide-react";
import api from "../services/api";

export default function LoginPage() {
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();
    if (!email.trim() || !password.trim()) { setLocalError("Please fill in all fields"); return; }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate("/");
  };

  // Render the official Google button on mount. Avoid a separate custom
  // button + prompt fallback: that flow created a confusing two-click UX.
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
            setLocalError(err.response?.data?.error || err.message || "Google sign-in failed");
          }
        },
      });

      const width = Math.min(400, Math.max(240, googleBtnRef.current.clientWidth || 360));
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width,
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      init();
    } else {
      // GSI script still loading — poll briefly then init
      const t = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(t); init(); }
      }, 100);
      const timeout = setTimeout(() => clearInterval(t), 5000);
      return () => { clearInterval(t); clearTimeout(timeout); };
    }
  }, []);

  const errorMessage = localError || authError;

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
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Your opinion<br />matters here.
            </h1>
            <p className="text-white/70 text-base max-w-sm leading-relaxed">
              Create polls, share them, and see what people think — all in one place.
            </p>
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

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to manage your polls.</p>

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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="input" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="input pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (<><Loader2 size={18} className="animate-spin" /> Signing in...</>) : (<><LogIn size={18} /> Sign In</>)}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
