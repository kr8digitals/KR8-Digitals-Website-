/**
 * /registered — post-signup celebration (email confirmation ON).
 *
 * Congratulates the student and tells them — in large bold text — to confirm
 * their email. The KR8 ID is NEVER shown here: it only exists once the email
 * is confirmed and the user is signed in (shown on /welcome).
 *
 * Also handles the "invalid or expired email link" state (Supabase redirects
 * back with error params) with a friendly Resend option.
 */
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, GhostButton, GradientButton, Pill } from "../components/ui";
import { resendConfirmation } from "../data/store";
import { useSeo } from "../lib/useSeo";

type LocationState = { email?: string; name?: string } | null;

export default function RegisteredPage() {
  useSeo({ path: "/registered", noindex: true });
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as NonNullable<LocationState>;

  // Fallback for a hard refresh: the email stays in sessionStorage only until
  // the confirmation is done (transient UI state, never a credential).
  const [email, setEmail] = useState<string>(state.email || sessionStorage.getItem("kr8_pending_signup_email") || "");
  const [name] = useState<string>(state.name || sessionStorage.getItem("kr8_pending_signup_name") || "");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // "Email link is invalid or has expired" — Supabase error params on return.
  const params = new URLSearchParams(location.search + (location.hash || "").replace(/^#/, "&"));
  const hashError = params.get("error_description") || params.get("error") || "";
  const linkExpired = /invalid|expired/i.test(hashError);

  useEffect(() => {
    if (email) sessionStorage.setItem("kr8_pending_signup_email", email);
  }, [email]);

  const handleResend = async () => {
    const target = email.trim();
    if (!target) {
      setStatus({ type: "error", text: "Please enter your email address first." });
      return;
    }
    setLoading(true);
    const res = await resendConfirmation(target);
    setLoading(false);
    setStatus({ type: res.ok ? "success" : "error", text: res.message });
  };

  return (
    <div className="section-bg flex min-h-[85vh] items-center justify-center px-5 py-14">
      <div className="w-full max-w-xl">
        <Card className="p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-pink text-white shadow-2xl glow-pink-sm">
            <span className="text-4xl">🎉</span>
          </div>
          <Pill>{linkExpired ? "Link problem" : "First step complete"}</Pill>

          {linkExpired ? (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-white">
                This email link is invalid or has expired
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#b8aecf]">
                Confirmation links can only be used once and expire after a while. No problem — we can send you a
                fresh one.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display mt-4 text-3xl font-bold text-white sm:text-4xl">
                {name ? `Congratulations, ${name.split(" ")[0]}!` : "Congratulations!"} 🚀
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[#cabfe0]">
                You've taken the <strong className="text-white">first bold step</strong> on your creative journey.
                KR8 Digitals Academy is proud of you — and the best is ahead.
              </p>
            </>
          )}

          <p className="mt-7 rounded-2xl border border-pink-400/40 bg-pink-500/10 px-5 py-6 text-2xl font-display font-bold leading-tight text-white sm:text-3xl">
            GO TO YOUR EMAIL AND CONFIRM YOUR REGISTRATION
          </p>

          {email && (
            <p className="mt-4 text-sm text-[#b8aecf]">
              We sent a confirmation link to{" "}
              <strong className="font-mono text-pink-300">{email}</strong>
            </p>
          )}

          <p className="mt-3 text-xs text-[#8a7ba8]">
            💡 Tip: check your spam or promotions folder if you don&apos;t see the email within a few minutes.
          </p>

          {status && (
            <p className={`mt-4 text-sm ${status.type === "success" ? "text-emerald-300" : "text-red-400"}`}>
              {status.text}
            </p>
          )}

          <div className="mt-7 space-y-3">
            <GradientButton onClick={handleResend} className="w-full py-3.5">
              {loading ? "Sending..." : "Resend confirmation email 📩"}
            </GradientButton>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
              <p className="text-xs font-semibold text-[#cabfe0]">Wrong email address?</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-400/60 focus:outline-none"
              />
              <p className="mt-2 text-[11px] text-[#8a7ba8]">
                Update the address above and hit &quot;Resend&quot; — or{" "}
                <Link to="/register" className="text-pink-400 underline underline-offset-2">
                  start the registration again
                </Link>{" "}
                with a different email.
              </p>
            </div>

            <GhostButton onClick={() => navigate("/signin")} className="w-full py-3">
              I&apos;ve confirmed — take me to sign in →
            </GhostButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
