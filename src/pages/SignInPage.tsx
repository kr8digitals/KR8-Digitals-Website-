import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  authenticateAccount,
  getAccounts,
  normalizeEmail,
  requestPasswordReset,
  completePasswordReset,
  MAIN_ADMIN_PASSWORD,
  type Account,
} from "../data/store";
import { Card, GradientButton, GhostButton, Pill } from "../components/ui";
import Icon from "../components/Icon";
import { authenticateWithBiometrics, getRegisteredBiometrics } from "../utils/biometrics";

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signOut, addNotification } = useAuth();

  const [mode, setMode] = useState<"credentials" | "google" | "reset">("credentials");
  const [identifier, setIdentifier] = useState(searchParams.get("id") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null);

  // Google sign-in modal/state
  const [googleEmail, setGoogleEmail] = useState("");

  // Password reset state
  const [resetTarget, setResetTarget] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const registeredBios = getRegisteredBiometrics();

  const inputCls =
    "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (!identifier.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your registered Email address or KR8 ID." });
      return;
    }
    if (!password) {
      setStatusMsg({ type: "error", text: "Please enter your account password." });
      return;
    }

    setLoading(true);
    const result = authenticateAccount(identifier, password);
    setLoading(false);

    if (!result.ok || !result.account) {
      setStatusMsg({
        type: "error",
        text: result.error || "The email/ID or password is incorrect. Please check and try again.",
      });
      return;
    }

    signIn(result.account);
    addNotification(`Welcome back, ${result.account.name}! Device session active.`);
    navigate("/dashboard");
  };

  const handleGoogleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const emailClean = normalizeEmail(googleEmail);
    if (!emailClean) {
      setStatusMsg({ type: "error", text: "Please enter your Google account email." });
      return;
    }

    const all = getAccounts();
    const existing = all.find((a) => normalizeEmail(a.email) === emailClean);

    if (existing) {
      signIn(existing);
      addNotification(`Signed in with Google as ${existing.name}!`);
      navigate("/dashboard");
    } else {
      setStatusMsg({
        type: "error",
        text: `No account registered with ${emailClean}. Google-only instant signup is not permitted — please complete the registration form first to set up your skill track.`,
      });
    }
  };

  const handleBiometricSignIn = async (targetId?: string) => {
    setStatusMsg(null);
    setBioLoading(true);
    try {
      const res = await authenticateWithBiometrics(targetId || (identifier.trim() ? identifier.trim() : undefined));
      if (!res.ok || !res.studentId) {
        setStatusMsg({ type: "error", text: res.error || "Biometric authentication cancelled or unavailable." });
        return;
      }
      const all = getAccounts();
      const account = all.find((a) => a.id.toLowerCase() === res.studentId!.toLowerCase());
      if (!account) {
        setStatusMsg({ type: "error", text: `Account for ID ${res.studentId} could not be found.` });
        return;
      }
      signIn(account);
      addNotification(`Biometric authentication verified — welcome back, ${account.name}!`);
      navigate("/dashboard");
    } catch (e: unknown) {
      setStatusMsg({ type: "error", text: e instanceof Error ? e.message : "Biometric error." });
    } finally {
      setBioLoading(false);
    }
  };

  const handleQuickDemo = (type: "founder" | "stevenson" | "daniel" | "student") => {
    setStatusMsg(null);
    if (type === "founder") {
      setIdentifier("timfire@kr8digitals.com");
      setPassword(MAIN_ADMIN_PASSWORD);
    } else if (type === "stevenson") {
      setIdentifier("stevenson@kr8digitals.com");
      setPassword(MAIN_ADMIN_PASSWORD);
    } else if (type === "daniel") {
      setIdentifier("daniel@kr8digitals.com");
      setPassword(MAIN_ADMIN_PASSWORD);
    } else {
      const anyStudent = getAccounts().find((a) => a.type === "student");
      if (anyStudent) {
        setIdentifier(anyStudent.email || anyStudent.id);
        setPassword(anyStudent.password || "kr8-student");
      } else {
        setIdentifier("KR82026KT0001GDVFD");
        setPassword("kr8-student");
      }
    }
  };

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    const target = resetTarget.trim() || identifier.trim();
    if (!target) {
      setStatusMsg({ type: "error", text: "Please enter your registered Email, KR8 ID, or Phone." });
      return;
    }
    const res = requestPasswordReset(target);
    setStatusMsg({ type: res.ok ? "success" : "error", text: res.message });
    if (res.code) {
      setDemoCode(res.code);
      setResetCode(res.code);
    }
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    const target = resetTarget.trim() || identifier.trim();
    const res = completePasswordReset(target, resetCode, newPassword);
    setStatusMsg({ type: res.ok ? "success" : "error", text: res.message });
    if (res.ok && res.account) {
      signIn(res.account);
      setTimeout(() => navigate("/dashboard"), 1200);
    }
  };

  return (
    <div className="section-bg min-h-[85vh] py-12 sm:py-16 px-5">
      <div className="mx-auto max-w-lg">
        <div className="text-center mb-8">
          <Pill>Member Portal</Pill>
          <h1 className="font-display mt-4 text-3xl sm:text-4xl font-bold text-white">
            Sign In to <span className="text-gradient">KR8 Platform</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#cabfe0]">
            Sign in with your Email, Google, KR8 ID, or registered Biometrics.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#a594c7]">
            <span>Need an account?</span>
            <Link to="/register" className="font-bold text-pink-400 hover:text-pink-300 underline">
              Register Free here →
            </Link>
          </div>
        </div>

        {/* Existing active user card */}
        {user && (
          <div className="mb-6 rounded-2xl border border-pink-500/40 bg-pink-500/10 p-4 text-center">
            <p className="text-xs sm:text-sm text-pink-200">
              You are currently signed in as <span className="font-bold text-white">{user.name}</span>.
            </p>
            <div className="mt-3 flex justify-center gap-2.5">
              <GradientButton to="/dashboard" className="text-xs px-4 py-2">
                Open Dashboard →
              </GradientButton>
              <GhostButton onClick={signOut} className="text-xs px-4 py-2 border-white/20">
                Sign Out
              </GhostButton>
            </div>
          </div>
        )}

        <Card className="p-6 sm:p-8">
          {/* Top Tabs */}
          <div className="mb-6 flex rounded-xl border border-white/10 bg-black/30 p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode("credentials");
                setStatusMsg(null);
              }}
              className={`flex-1 rounded-lg py-2 font-bold transition-all ${
                mode === "credentials" ? "bg-gradient-pink text-white shadow" : "text-[#b8aecf] hover:text-white"
              }`}
            >
              Email / ID 🔑
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("google");
                setStatusMsg(null);
              }}
              className={`flex-1 rounded-lg py-2 font-bold transition-all ${
                mode === "google" ? "bg-gradient-pink text-white shadow" : "text-[#b8aecf] hover:text-white"
              }`}
            >
              Google Account 🌐
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setStatusMsg(null);
              }}
              className={`flex-1 rounded-lg py-2 font-bold transition-all ${
                mode === "reset" ? "bg-gradient-pink text-white shadow" : "text-[#b8aecf] hover:text-white"
              }`}
            >
              Lost Password 🔄
            </button>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`mb-5 rounded-xl p-3.5 text-xs font-semibold ${
                statusMsg.type === "error"
                  ? "border border-red-500/40 bg-red-500/15 text-red-200"
                  : statusMsg.type === "success"
                  ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                  : "border border-blue-500/40 bg-blue-500/15 text-blue-200"
              }`}
            >
              {statusMsg.text}
              {statusMsg.text.includes("Google-only instant signup is not permitted") && (
                <div className="mt-2.5">
                  <Link
                    to={`/register?email=${encodeURIComponent(googleEmail)}`}
                    className="inline-block rounded-lg bg-pink-500/30 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-500/40"
                  >
                    Go to Full Registration Form →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* METHOD 1: EMAIL OR KR8 ID + PASSWORD */}
          {mode === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1.5">
                  Email Address or KR8 ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. name@example.com or KR82026KT0001GDVFD"
                  className={inputCls}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#cabfe0]">Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setResetTarget(identifier);
                    }}
                    className="text-xs text-pink-400 hover:text-pink-300 underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className={`${inputCls} pr-12`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-xs text-[#8a7ba8] hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <GradientButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 shadow-xl shadow-pink-500/25 text-sm font-bold disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "Sign In to KR8 →"}
                </GradientButton>
              </div>

              {/* Biometric Sign-In Section */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleBiometricSignIn()}
                  disabled={bioLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 py-3 text-xs font-bold text-pink-200 hover:bg-pink-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  <Icon name="fingerprint" size={18} className="text-pink-400" />
                  <span>{bioLoading ? "Verifying Sensor..." : "Sign in with Biometrics / Passkey"}</span>
                </button>

                {registeredBios.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-[#8a7ba8]">Saved on this device:</span>
                    {registeredBios.map((b) => (
                      <button
                        key={b.studentId}
                        type="button"
                        onClick={() => handleBiometricSignIn(b.studentId)}
                        className="rounded-full bg-white/5 border border-white/15 px-2.5 py-0.5 text-[10px] font-mono text-pink-300 hover:bg-white/10"
                      >
                        {b.studentName.split(" ")[0]} ({b.studentId.slice(-6)})
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[11px] text-[#8a7ba8] text-center">
                    Biometrics can be enabled in your profile Settings after sign-in.
                  </p>
                )}
              </div>

              {/* Quick Demo Pre-fill Links for Testing */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7ba8] mb-2 text-center">
                  Quick Demo Testing Access
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("founder")}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-left hover:border-pink-500/40 text-pink-300"
                  >
                    👑 Founder Timfire
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("stevenson")}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-left hover:border-purple-500/40 text-purple-300"
                  >
                    🎬 Co-Founder Stevenson
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("daniel")}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-left hover:border-purple-500/40 text-purple-300"
                  >
                    💼 Co-Founder Daniel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("student")}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-left hover:border-emerald-500/40 text-emerald-300"
                  >
                    🎓 Sample Student
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* METHOD 2: SIGN IN WITH GOOGLE */}
          {mode === "google" && (
            <form onSubmit={handleGoogleSignIn} className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-white">Google Account Sign-In</h3>
                <p className="mt-1 text-xs text-[#cabfe0]">
                  Resolves to your existing registered KR8 account matching your Google email address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1.5">
                  Enter your Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  className={inputCls}
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <GradientButton type="submit" className="w-full py-3.5 shadow-xl shadow-pink-500/25 text-sm font-bold">
                  Continue with Google →
                </GradientButton>
              </div>

              <p className="text-[11px] text-[#8a7ba8] text-center">
                Note: Google-only instant registration is not permitted. All new accounts must register via the full form.
              </p>
            </form>
          )}

          {/* METHOD 3: LOST PASSWORD RESET */}
          {mode === "reset" && (
            <div className="space-y-4">
              <form onSubmit={handleRequestReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1.5">
                    Registered Email, KR8 ID, or Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. name@example.com or KR82026KT0001GDVFD"
                    className={inputCls}
                    value={resetTarget}
                    onChange={(e) => setResetTarget(e.target.value)}
                  />
                </div>
                <GradientButton type="submit" className="w-full py-3 text-xs font-bold">
                  Request Reset Verification Code 📩
                </GradientButton>
              </form>

              {demoCode && (
                <form onSubmit={handleCompleteReset} className="mt-5 space-y-3 border-t border-white/10 pt-4">
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                      Verification Code Generated:
                    </p>
                    <p className="font-mono text-2xl font-black text-white tracking-widest my-1">{demoCode}</p>
                    <p className="text-[10px] text-emerald-300">Enter your new password below.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                      Reset Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit code"
                      className={inputCls}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                      New Password (at least 6 characters)
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className={inputCls}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <GradientButton type="submit" className="w-full py-3 text-xs font-bold">
                    Save New Password & Sign In →
                  </GradientButton>
                </form>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
