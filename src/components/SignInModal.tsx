import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  authenticateAccount,
  requestPasswordReset,
  completePasswordReset,
  getAccounts,
  normalizeEmail,
  submitSuspensionAppeal,
} from "../data/store";
import {
  authenticateWithBiometrics,
} from "../utils/biometrics";
import Icon from "./Icon";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "reset";
}

export default function SignInModal({ isOpen, onClose, initialMode = "signin" }: SignInModalProps) {
  const { signIn, addNotification } = useAuth();
  const [mode, setMode] = useState<"signin" | "reset">(initialMode);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "error" | "success" | "info"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset Password State
  const [resetIdentifier, setResetIdentifier] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Biometrics
  const [bioLoading, setBioLoading] = useState(false);

  // Suspension Appeal State
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [appealResult, setAppealResult] = useState<string | null>(null);

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim()) return;
    const res = submitSuspensionAppeal(identifier.trim(), appealText.trim());
    if (res.ok) {
      setAppealResult("Your appeal has been received. KR8 leadership will review your statement.");
      setAppealText("");
    } else {
      setAppealResult(res.message);
    }
  };

  useEffect(() => {
    setMode(initialMode);
    setStatusMsg(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!identifier.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your KR8 ID, email, or phone number." });
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
      setStatusMsg({ type: "error", text: result.error || "Invalid ID or password." });
      return;
    }

    // Success
    signIn(result.account);
    addNotification(`Welcome back, ${result.account.name}!`);
    onClose();
  };

  const handleBiometricSignIn = async (targetId?: string) => {
    setStatusMsg(null);
    setBioLoading(true);
    try {
      const res = await authenticateWithBiometrics(targetId || (identifier.trim() ? identifier.trim() : undefined));
      if (!res.ok || !res.studentId) {
        setStatusMsg({ type: "error", text: res.error || "Biometric verification cancelled." });
        return;
      }
      const all = getAccounts();
      const account = all.find((a) => a.id.toLowerCase() === res.studentId!.toLowerCase());
      if (!account) {
        setStatusMsg({ type: "error", text: `Account with ID ${res.studentId} was not found.` });
        return;
      }
      signIn(account);
      addNotification(`Biometric sign-in verified. Welcome, ${account.name}!`);
      onClose();
    } catch (err) {
      setStatusMsg({ type: "error", text: err instanceof Error ? err.message : "Biometric authentication failed." });
    } finally {
      setBioLoading(false);
    }
  };

  const handleGooglePrompt = () => {
    setStatusMsg(null);
    const emailPrompt = prompt("Enter your Google Account email to sign in:")?.trim();
    if (!emailPrompt) return;
    const clean = normalizeEmail(emailPrompt);
    const all = getAccounts();
    const existing = all.find((a) => normalizeEmail(a.email) === clean);
    if (existing) {
      signIn(existing);
      addNotification(`Signed in with Google as ${existing.name}!`);
      onClose();
    } else {
      setStatusMsg({
        type: "error",
        text: `No account registered with ${clean}. Google-only instant signup is not permitted — please complete full registration first.`,
      });
    }
  };

  const handleRequestResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!resetIdentifier.trim()) {
      setStatusMsg({ type: "error", text: "Please enter your registered email, KR8 ID, or phone." });
      return;
    }

    setLoading(true);
    const res = requestPasswordReset(resetIdentifier);
    setLoading(false);

    if (!res.ok || !res.code) {
      setStatusMsg({ type: "error", text: res.message });
      return;
    }

    setGeneratedCode(res.code);
    setResetCode(res.code); // Auto-fill for friction-free UX
    setResetStep("verify");
    setStatusMsg({
      type: "success",
      text: `Verification code generated! Enter your new password below.`,
    });
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!resetCode.trim()) {
      setStatusMsg({ type: "error", text: "Please provide the 6-digit verification code." });
      return;
    }
    if (newPassword.trim().length < 4) {
      setStatusMsg({ type: "error", text: "Password must be at least 4 characters long." });
      return;
    }

    setLoading(true);
    const res = completePasswordReset(resetIdentifier, resetCode, newPassword);
    setLoading(false);

    if (!res.ok || !res.account) {
      setStatusMsg({ type: "error", text: res.message });
      return;
    }

    // Auto-sign in the user
    signIn(res.account);
    addNotification(`Password updated! You are now logged in as ${res.account.name}.`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#170a2a] p-6 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400">
              KR8 Digitals Portal
            </span>
            <h3 className="font-display text-2xl font-bold text-white mt-0.5">
              {mode === "signin" ? "Sign In to Account" : "Reset Account Password"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-4 flex rounded-xl border border-white/10 bg-black/30 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setStatusMsg(null);
            }}
            className={`flex-1 rounded-lg py-2 font-bold transition-all ${
              mode === "signin"
                ? "bg-gradient-pink text-white shadow"
                : "text-[#b8aecf] hover:text-white"
            }`}
          >
            Sign In 🔑
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setStatusMsg(null);
              setResetStep("request");
            }}
            className={`flex-1 rounded-lg py-2 font-bold transition-all ${
              mode === "reset"
                ? "bg-gradient-pink text-white shadow"
                : "text-[#b8aecf] hover:text-white"
            }`}
          >
            Lost Password 🔄
          </button>
        </div>

        {/* Feedback Alert */}
        {statusMsg && (
          <div
            className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
              statusMsg.type === "error"
                ? "border border-red-500/40 bg-red-500/10 text-red-200"
                : statusMsg.type === "success"
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border border-blue-500/40 bg-blue-500/10 text-blue-200"
            }`}
          >
            {statusMsg.text}
            {statusMsg.text.includes("suspended") && (
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowAppeal(true)}
                  className="rounded-lg bg-red-500/30 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500/40"
                >
                  Submit 30-Day Appeal Request →
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 1: SIGN IN */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                Email Address or KR8 ID *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or KR8 ID"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#cabfe0]">Password *</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("reset");
                    setResetIdentifier(identifier);
                  }}
                  className="text-[11px] text-pink-400 hover:text-pink-300 underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-[#8a7ba8] hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-pink py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to KR8 →"}
            </button>

            {/* Biometric 1-Tap Login */}
            <div className="border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => handleBiometricSignIn()}
                disabled={bioLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-pink-500/30 bg-pink-500/10 py-2.5 text-xs font-bold text-pink-200 hover:bg-pink-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Icon name="fingerprint" size={16} className="text-pink-400" />
                <span>{bioLoading ? "Scanning sensor..." : "1-Tap Fingerprint / Biometric Sign In"}</span>
              </button>
            </div>

            {/* Google Account Sign-In Button */}
            <div className="border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={handleGooglePrompt}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: PASSWORD RESET */}
        {mode === "reset" && (
          <div className="mt-5 space-y-4">
            {resetStep === "request" ? (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <p className="text-xs text-[#b8aecf]">
                  Enter your registered email address, KR8 ID, or phone number. We'll generate a 6-digit verification code to set your new password.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Registered Email, KR8 ID, or Phone *
                  </label>
                  <input
                    type="text"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    placeholder="e.g. timfire@kr8digitals.com or +2349035655757"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-pink py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Generate Verification Code 📩"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset} className="space-y-4">
                {generatedCode && (
                  <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/60 p-4 text-xs text-emerald-200 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        ✓ Verification Code Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(generatedCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30"
                      >
                        {copiedCode ? "Copied! ✓" : "Copy Code"}
                      </button>
                    </div>
                    <div className="my-2.5 rounded-xl bg-black/60 p-2.5 text-center border border-emerald-500/30">
                      <p className="font-mono text-2xl font-black text-white tracking-widest">{generatedCode}</p>
                    </div>
                    <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                      💡 <strong>Notice:</strong> Your verification code is provided directly on this screen and has been auto-applied below so you can proceed without waiting for email delivery. (Universal testing code: <strong className="font-mono text-white">888999</strong>).
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    6-Digit Verification Code *
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="e.g. 549210 or 888999"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:border-pink-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Create New Password *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-pink py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save New Password & Sign In ✅"}
                </button>

                <button
                  type="button"
                  onClick={() => setResetStep("request")}
                  className="w-full text-center text-xs text-[#8a7ba8] hover:text-white"
                >
                  ← Request a different code
                </button>
              </form>
            )}

            <div className="border-t border-white/10 pt-3 text-center">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-xs text-pink-400 hover:text-pink-300 font-bold"
              >
                ← Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* 30-Day Suspension Appeal Modal */}
        {showAppeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-[#160d2b] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-white text-base">Submit Account Appeal</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAppeal(false);
                    setAppealResult(null);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  ✕
                </button>
              </div>

              {appealResult ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs text-emerald-200">
                    ✓ {appealResult}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAppeal(false);
                      setAppealResult(null);
                    }}
                    className="w-full rounded-xl bg-gradient-pink py-2.5 text-xs font-bold text-white"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="mt-4 space-y-4">
                  <p className="text-xs text-[#cabfe0] leading-relaxed">
                    You have a 30-day appeal window following account suspension. State your situation clearly for review by KR8 leadership.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-[#e8ddf5] mb-1">
                      Account Credential (ID, Email or Phone):
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Your email, KR8 ID, or phone"
                      required
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#e8ddf5] mb-1">
                      Your Appeal Statement:
                    </label>
                    <textarea
                      rows={4}
                      value={appealText}
                      onChange={(e) => setAppealText(e.target.value)}
                      placeholder="Explain the circumstances and why your account should be restored..."
                      required
                      className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowAppeal(false)}
                      className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110"
                    >
                      Submit Appeal for Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
