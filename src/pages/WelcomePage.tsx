/**
 * /welcome — landing page for the confirmation email link.
 *
 * The student arrives signed in (the Supabase session comes from the link).
 * We congratulate them, show their KR8 ID (profiles.kr8_id) and send them —
 * boldly — to their learning group's WhatsApp (skill_settings.whatsapp_url for
 * their profiles.skill). "Done" / "Skip for now" both go to the dashboard and
 * record completion in the onboarding_status table (never the browser).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, GhostButton, GradientButton, Pill } from "../components/ui";
import { getSkillName, getSkillWhatsApp, getTribeWhatsApp } from "../data/store";
import { apiOnboarding, apiSiteAction, type SkillSettingItem } from "../lib/api";
import { useSeo } from "../lib/useSeo";

export default function WelcomePage() {
  useSeo({ path: "/welcome", noindex: true });
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");
  const skillKey = user?.skill || "";

  // skill_settings.whatsapp_url for this student's skill — live from the DB.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = (await apiSiteAction({ action: "skills" })) as { skills?: SkillSettingItem[] };
        const match = (res.skills || []).find((s) => s.skillKey === skillKey);
        if (!cancelled && match?.whatsappUrl) setWhatsappUrl(match.whatsappUrl);
      } catch {
        /* fall back to the local mirror below */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [skillKey]);

  // The session arrives via the email link; give AuthContext a moment to
  // hydrate the profile (which carries the KR8 ID).
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      await refreshProfile?.().catch(() => undefined);
      if (!cancelled) setReady(true);
    };
    const t = setTimeout(tick, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <div className="section-bg flex min-h-[85vh] items-center justify-center px-5">
        <p className="text-sm text-[#b8aecf]">Preparing your welcome…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section-bg flex min-h-[85vh] items-center justify-center px-5 py-14">
        <Card className="w-full max-w-lg p-8 text-center">
          <Pill>Confirm your email</Pill>
          <h1 className="font-display mt-4 text-3xl font-bold text-white">Almost there!</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#b8aecf]">
            Open the confirmation link in your email to activate your account — then this page will welcome you
            properly.
          </p>
          <p className="mt-3 text-xs text-[#8a7ba8]">
            💡 Tip: check your spam or promotions folder if you don&apos;t see the email.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <GradientButton to="/registered" className="w-full">
              Resend the confirmation email →
            </GradientButton>
            <GhostButton to="/signin" className="w-full">
              Back to sign in
            </GhostButton>
          </div>
        </Card>
      </div>
    );
  }

  const resolvedWhatsapp =
    whatsappUrl || (skillKey ? getSkillWhatsApp(skillKey) : getTribeWhatsApp());
  const groupName = skillKey ? `${getSkillName(skillKey)} learning group` : "KR8 Tribe community";

  const finish = async (whatsappDone: boolean) => {
    setSaving(true);
    try {
      await apiOnboarding(whatsappDone);
    } catch {
      /* navigation proceeds regardless */
    }
    setSaving(false);
    navigate(user.type === "tribe" ? "/tribe" : "/dashboard");
  };

  const joinWhatsApp = () => {
    if (resolvedWhatsapp) {
      window.open(resolvedWhatsapp, "_blank", "noopener,noreferrer");
      // A click through counts as "joined" — remembered in the database.
      void apiSiteAction({ action: "link-click", slug: `whatsapp-${skillKey || "tribe"}` }).catch(() => undefined);
    }
  };

  return (
    <div className="section-bg flex min-h-[85vh] items-center justify-center px-5 py-14">
      <div className="w-full max-w-xl">
        <Card className="p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-pink text-white shadow-2xl glow-pink-sm">
            <span className="text-4xl">🎊</span>
          </div>
          <Pill>Welcome to KR8 Digitals</Pill>

          <h1 className="font-display mt-4 text-3xl font-bold text-white sm:text-4xl">
            {user.name ? `You made it, ${user.name.split(" ")[0]}!` : "You made it!"}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#cabfe0]">
            Look how far you&apos;ve come — from &quot;one day&quot; to <strong className="text-white">day one</strong>.
            Your KR8 Identity is live and the academy is yours. We are proud of you. 🚀
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-pink-400/40 bg-pink-500/10 px-6 py-4">
            <span className="text-xs uppercase tracking-wider text-pink-200">Your KR8 ID</span>
            <span className="font-mono text-xl font-bold tracking-wider text-gradient sm:text-2xl">{user.id}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(user.id);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              }}
              className="rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold text-[#cabfe0] hover:text-white"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          <p className="mt-8 rounded-2xl border border-pink-400/40 bg-pink-500/10 px-5 py-6 text-2xl font-display font-bold leading-tight text-white sm:text-3xl">
            JOIN YOUR LEARNING GROUP ON WHATSAPP
          </p>
          <p className="mt-3 text-sm text-[#b8aecf]">
            Your classes, mentorship and community live in the {groupName}.
          </p>

          <div className="mt-6 space-y-3">
            <GradientButton onClick={joinWhatsApp} className="w-full py-4 text-base">
              {resolvedWhatsapp ? "Join the WhatsApp Group →" : "WhatsApp link coming soon"}
            </GradientButton>

            <div className="grid grid-cols-2 gap-3">
              <GradientButton onClick={() => finish(true)} disabled={saving} className="w-full py-3">
                Done
              </GradientButton>
              <GhostButton onClick={() => finish(false)} className="w-full py-3">
                Skip for now
              </GhostButton>
            </div>
            <p className="text-[11px] text-[#8a7ba8]">
              Both buttons take you to your profile — &quot;Done&quot; marks the WhatsApp group as joined.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
