/**
 * /reset-password — landing page for the Supabase recovery link.
 *
 * The student arrives with a recovery session (from
 * resetPasswordForEmail → emailRedirectTo) and sets a new password via
 * supabase.auth.updateUser. No reset codes are generated or shown anywhere.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, GhostButton, GradientButton, Pill } from "../components/ui";
import { setNewPassword } from "../data/store";
import { useSeo } from "../lib/useSeo";
import { getSupabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  useSeo({ path: "/reset-password", noindex: true });
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = new URLSearchParams(window.location.search + (window.location.hash || "").replace(/^#/, "&"));
  const hashError = params.get("error_description") || params.get("error") || "";
  const linkProblem = /invalid|expired/i.test(hashError);
  const hasSession = !!getSupabase();

  const submit = async () => {
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await setNewPassword(password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Could not update the password. Please request a new reset link.");
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/signin"), 1600);
  };

  return (
    <div className="section-bg flex min-h-[85vh] items-center justify-center px-5 py-14">
      <div className="w-full max-w-lg">
        <Card className="p-8 text-center">
          <Pill>{done ? "All set" : linkProblem ? "Link problem" : "Password reset"}</Pill>

          {done ? (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-white">Password updated! ✅</h1>
              <p className="mt-4 text-sm leading-relaxed text-[#b8aecf]">
                You can now sign in with your new password. Taking you there…
              </p>
            </>
          ) : linkProblem ? (
            <>
              <h1 className="font-display mt-4 text-2xl font-bold text-white">
                This reset link is invalid or has expired
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#b8aecf]">
                Reset links can only be used once and expire after a while. Request a fresh one and check your email
                (and spam folder) for the new link.
              </p>
              <div className="mt-6 space-y-3">
                <GradientButton to="/signin" className="w-full">
                  Request a new reset link →
                </GradientButton>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-white">Choose a new password</h1>
              <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">
                {hasSession
                  ? "Set your new KR8 account password below."
                  : "Open this page from the link in your reset email, then set a new password."}
              </p>

              <div className="mt-6 space-y-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-[#cabfe0]">New password (min 6 characters)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#cabfe0]">Confirm new password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none"
                  />
                </div>
              </div>

              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

              <div className="mt-6 space-y-3">
                <GradientButton onClick={submit} disabled={loading} className="w-full py-3.5">
                  {loading ? "Saving..." : "Save New Password ✅"}
                </GradientButton>
                <GhostButton to="/signin" className="w-full py-3">
                  ← Back to sign in
                </GhostButton>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
