import { useEffect, useRef, useState } from "react";
import {
  findByResumeCode,
  getMsRegistrations,
  registerForMsEvent,
  updateMsRegistration,
  MS_STATUS_LABELS,
  type MsEventConfig,
  type MsRegistration,
} from "../data/mindsetShift";
import { buildPhone, countryByCode, normalizePhone } from "../data/store";
import CountryPhone from "./CountryPhone";
import Icon from "./Icon";
import { GradientButton, GhostButton } from "./ui";
import { AssetImage } from "../lib/msMedia";
import MindsetShiftAccessFlow from "./MindsetShiftAccessFlow";
import MindsetShiftSharePanel from "./MindsetShiftSharePanel";

/* ------------------------------------------------------------------ */
/* Mindset Shift — adaptive onboarding (v2)                           */
/*                                                                    */
/* One honest question at a time. The visitor's answers branch the    */
/* next question, the copy uses their name from step one, and the     */
/* final step recaps their own words before they commit. Purpose:     */
/* give the speaker exactly the context to choose the right approach  */
/* — while making every visitor feel this was made for them.          */
/*                                                                    */
/* No share gate: completing onboarding unlocks the WhatsApp space    */
/* immediately (see MindsetShiftAccessFlow).                          */
/* ------------------------------------------------------------------ */

const SOURCE_OPTIONS = [
  "Facebook",
  "Instagram",
  "X (Twitter)",
  "WhatsApp",
  "LinkedIn",
  "KR8 Academy / Tribe",
  "Friend or family",
  "Blog / article",
  "Other",
];

type WhyKey = "money" | "debt" | "build" | "curious";

const WHY_OPTIONS: { key: WhyKey; label: string }[] = [
  { key: "money", label: "Money never seems to last, no matter how much I make" },
  { key: "debt", label: "I'm trying to get out of debt" },
  { key: "build", label: "I want to build something — savings, a business, a future" },
  { key: "curious", label: "I'm just curious (I might be braver than I look)" },
];

const WHY_LABEL: Record<WhyKey, string> = Object.fromEntries(
  WHY_OPTIONS.map((o) => [o.key, o.label])
) as Record<WhyKey, string>;

/* Branch follow-ups (UI taxonomy — the saved label is what the admin
 * and the speaker see). */
const DEBT_TYPE_OPTIONS = [
  "Loan app or card",
  "Business debt",
  "Family or repayment obligations",
  "A mix of everything (it gets worse)",
];
const DEBT_DURATION_OPTIONS = ["Less than a year", "A couple of years", "Longer than I want to admit"];
const SITUATION_OPTIONS = [
  "Saving and investing some of my income",
  "Steady, but little left at the end of the month",
  "Tight — living close to my limit",
  "Under real financial pressure right now",
  "Prefer not to say",
];
const BUILD_OPTIONS = [
  "Paying off debt",
  "Saving & investing",
  "Starting or growing a business",
  "Increasing my income",
  "Financial discipline & habits",
];
const AREA_OPTIONS = BUILD_OPTIONS;
const STRESS_OPTIONS = [
  "It's heavy — and I don't talk about it",
  "We've started avoiding the topic",
  "It's okay. I'm mostly in control",
  "I'd rather not say",
];

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";
const errCls = "mt-1.5 text-xs font-medium text-red-400";

interface WState {
  fullName: string;
  why: "" | WhyKey;
  branchAnswer: string; // debt type | situation | first build move
  debtDuration: string;
  stress: string;
  challenge: string;
  goal: "" | "yes" | "no";
  area: string;
  question: string; // optional money question
  email: string;
  country: string;
  phone: string;
  whatsappDiffers: boolean;
  whatsapp: string;
  location: string;
  heard: string;
}

const W_INITIAL: WState = {
  fullName: "",
  why: "",
  branchAnswer: "",
  debtDuration: "",
  stress: "",
  challenge: "",
  goal: "",
  area: "",
  question: "",
  email: "",
  country: "NG",
  phone: "",
  whatsappDiffers: false,
  whatsapp: "",
  location: "",
  heard: "",
};

/** Latest registration on this device (refresh/crash-safe resume). */
function deviceRegistration(): MsRegistration | undefined {
  const regs = getMsRegistrations();
  if (regs.length === 0) return undefined;
  return [...regs].sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

/* A ?resume=CODE link resumes that registration when it exists on this
 * device (or has arrived via cloud hydration). Unknown codes are ignored
 * silently — no data is revealed, no error is thrown. */
function resumeFromUrl(): MsRegistration | undefined {
  try {
    const code = new URLSearchParams(window.location.search).get("resume");
    if (!code) return undefined;
    return findByResumeCode(code);
  } catch {
    return undefined;
  }
}

function effectiveRegistration(): MsRegistration | undefined {
  return resumeFromUrl() || deviceRegistration();
}

/* ------------------------------------------------------------------ */
/* Wizard atoms                                                       */
/* ------------------------------------------------------------------ */

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`w-full rounded-2xl border px-5 py-4 text-left text-sm font-semibold leading-snug transition ${
        selected
          ? "border-pink-400/70 bg-pink-500/15 text-white shadow-md shadow-pink-500/10"
          : "border-white/15 bg-white/[0.03] text-[#cabfe0] hover:border-pink-400/40 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StepFrame({
  kicker,
  title,
  children,
  note,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9a8e8]">{kicker}</p>
      <h3 className="font-display mt-2 text-2xl font-bold leading-snug text-white">{title}</h3>
      <div className="mt-5">{children}</div>
      {note && <p className="mt-4 text-xs leading-relaxed text-[#8a7ba8]">{note}</p>}
    </div>
  );
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable (private mode) — code stays visible */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center gap-2.5 rounded-xl border border-pink-400/40 bg-pink-500/10 px-4 py-2.5 font-mono text-sm font-bold tracking-wider text-[#e79bf0] transition-colors hover:bg-pink-500/20"
      aria-label={`Copy confirmation code ${code}`}
    >
      {code}
      <Icon name={copied ? "check" : "certificate"} size={14} className={copied ? "text-emerald-400" : "text-pink-400 group-hover:text-[#e79bf0]"} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Graduation card (post-onboarding): access + the share moment       */
/* ------------------------------------------------------------------ */

function DoneCard({
  registration,
  fresh,
  event,
  onShowForm,
  onReonboard,
}: {
  registration: MsRegistration;
  fresh: boolean;
  event: MsEventConfig;
  onShowForm: () => void;
  onReonboard: () => void;
}) {
  const firstName = registration.fullName.split(" ")[0] || "there";

  return (
    <div className="mt-9 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-6 text-left sm:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-pink text-white">
          <Icon name="check" size={22} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold text-white">
            {fresh ? `You're in, ${firstName}.` : `Welcome back, ${firstName}.`}
          </h3>
          <p className="mt-1 text-sm text-[#b8aecf]">
            Status: <span className="font-semibold text-white">{MS_STATUS_LABELS[registration.status]}</span>
            {" · "}
            {event.programName} {event.edition}
          </p>
        </div>
      </div>

      {/* Confirmation code */}
      <div className="mt-6">
        <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">
          Your confirmation code
        </p>
        <CopyCode code={registration.id} />
        <p className="mt-2 text-xs text-[#8a7ba8]">
          Save this code — it's how you resume your registration if you come back on this device or another.
        </p>
      </div>

      {/* Access (no share gate) — the flow block also handles the
          revoked / rejected / legacy states with a re-onboard path. */}
      <MindsetShiftAccessFlow registration={registration} event={event} onReonboard={onReonboard} />

      {/* The share moment — voluntary, after access, framed as a gift */}
      {registration.status === "access_granted" && (
        <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9a8e8]">
            One last thing, {firstName}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#d5cbe6]">
            You just did something most people only talk about: you looked your money situation in
            the face, honestly. That's the first move — and it's yours now.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#d5cbe6]">
            Here's a small ask. It's not for us — it's for someone you love. Someone still in the
            loop you just stepped out of: a sibling, a friend who keeps saying{" "}
            <span className="font-semibold text-white">“I'll start next month”</span>, your group chat.
            <span className="font-semibold text-white"> Just one person.</span> You don't have to
            write a speech — the words are ready below. Save the flyer, tap once, and hand them
            what you just got.
          </p>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="relative w-24 shrink-0 sm:w-28">
              <div className="absolute -inset-1.5 rounded-xl bg-gradient-pink opacity-30 blur-lg" />
              <AssetImage
                src={event.flyer}
                alt={`${event.programName} ${event.edition} flyer — save and share this`}
                className="relative w-full rounded-lg border border-white/15"
                loading="lazy"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-[#cabfe0]">
                Save it first
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-[#8a7ba8]">
                Long-press (mobile) or right-click (desktop) to save the flyer — then pick your
                platform below and send. Sharing this isn't marketing; it's the most practical
                “I care about you” you can send this week.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#6f6390]">
            Optional — your access is already active, and no one is waiting on a screenshot from
            you.
          </p>
          <MindsetShiftSharePanel event={event} />
        </div>
      )}

      <button
        type="button"
        onClick={onShowForm}
        className="mt-6 text-xs font-semibold text-[#8a7ba8] underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
      >
        Different person on this device? Onboard them here.
      </button>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-[#8a7ba8]">
        <Icon name="shield" size={13} className="mt-0.5 shrink-0 text-[#e026c4]" />
        {event.privacyNote}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gates                                                              */
/* ------------------------------------------------------------------ */

function GateCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-9 rounded-2xl border border-white/15 bg-black/25 p-8 text-center">
      <Icon name="lock" className="mx-auto h-8 w-8 text-[#8d81ab]" />
      <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#b8aecf]">{body}</p>
      <p className="mt-4 text-xs text-[#6f6390]">
        All the event details are on this page above — and if you've registered, your confirmation code is how you get back in.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Wizard                                                             */
/* ------------------------------------------------------------------ */

function buildSteps(why: "" | WhyKey): string[] {
  const s = ["name", "why"];
  if (why === "money" || why === "debt" || why === "build") s.push("branch");
  if (why === "debt") s.push("duration");
  s.push("stress", "challenge", "goal", "question", "details", "recap");
  return s;
}

function RecapLine({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-[#d5cbe6]">
      <Icon name="check" size={14} className="mt-0.5 shrink-0 text-[#e026c4]" />
      <span>{text}</span>
    </li>
  );
}

export default function MindsetShiftRegistration({ event }: { event: MsEventConfig }) {
  const [mode, setMode] = useState<"form" | "done">(() => (effectiveRegistration() ? "done" : "form"));
  const [fresh, setFresh] = useState(false); // true only for the submission that just happened
  const [registration, setRegistration] = useState<MsRegistration | undefined>(() => effectiveRegistration());
  const [w, setW] = useState<WState>(W_INITIAL);
  const [stepIdx, setStepIdx] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof WState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const hasInteractedRef = useRef(false);
  const markInteracted = () => {
    hasInteractedRef.current = true;
  };

  // Keep data in sync if registrations change from elsewhere (cloud
  // hydration, another tab). Two guards keep background events (the site
  // dispatches a synthetic `storage` event after EVERY localStorage save)
  // from disrupting the user: a mid-wizard visitor is never yanked away,
  // and `fresh` is never touched here.
  useEffect(() => {
    const sync = () => {
      const r = effectiveRegistration();
      if (!r) return;
      setRegistration((prev) => (prev && JSON.stringify(prev) === JSON.stringify(r) ? prev : r));
      if (!hasInteractedRef.current) setMode("done");
    };
    window.addEventListener("kr8:ms-regs-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kr8:ms-regs-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const set = <K extends keyof WState>(key: K, value: WState[K]) => {
    markInteracted();
    setW((f) => ({ ...f, [key]: value }));
  };
  // Programmatic updates (country auto-detection) — must NOT count as user
  // interaction, or cloud hydration could never flip a fresh visitor to
  // their existing registration.
  const setInternal = <K extends keyof WState>(key: K, value: WState[K]) => {
    setW((f) => ({ ...f, [key]: value }));
  };

  const firstName = w.fullName.trim().split(" ")[0] || "";

  const steps = buildSteps(w.why);
  const step = steps[Math.min(stepIdx, steps.length - 1)];
  const goTo = (idx: number) => setStepIdx(Math.max(0, Math.min(idx, steps.length - 1)));
  const next = (idx: number) => {
    markInteracted();
    goTo(idx + 1);
  };

  /* Per-step validation ------------------------------------------------ */
  const stepError = (idx: number): string | null => {
    const e: Partial<Record<keyof WState, string>> = {};
    const s = steps[idx];
    if (s === "name" && w.fullName.trim().length < 2) e.fullName = "Please enter your name.";
    if (s === "why" && !w.why) e.why = "Pick the one that fits — it shapes what comes next.";
    if (s === "branch" && !w.branchAnswer) e.branchAnswer = "Pick the closest fit.";
    if (s === "duration" && !w.debtDuration) e.debtDuration = "Pick the closest fit.";
    if (s === "stress" && !w.stress) e.stress = "Pick whatever feels closest — there are no wrong answers.";
    if (s === "challenge" && w.challenge.trim().length < 3)
      e.challenge = "A sentence is plenty — tell us in your own words.";
    if (s === "goal" && !w.goal) e.goal = "Pick one so the conversation can be relevant to you.";
    if (s === "goal" && w.goal === "yes" && !w.area) e.area = "Pick the area you're working toward.";
    if (s === "details") {
      if (!w.email.trim()) e.email = "Please enter your email.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(w.email.trim())) e.email = "That email doesn't look right.";
      if (w.phone.replace(/\D/g, "").length < 7) e.phone = "Please enter a valid phone number.";
      if (w.whatsappDiffers && w.whatsapp.replace(/\D/g, "").length < 7)
        e.whatsapp = "Enter the WhatsApp number, or untick the box if it's the same.";
      if (!w.heard) e.heard = "Pick where you heard about us — it helps us understand what's working.";
    }
    setErrors(e);
    return Object.keys(e).length === 0 ? null : "Fix the highlighted field to continue.";
  };

  const tryNext = (idx: number) => {
    if (stepError(idx)) return;
    next(idx);
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    if (stepError(steps.length - 1)) return;
    markInteracted();
    setSubmitting(true);
    try {
      const fullPhone = buildPhone(countryByCode(w.country).dial, w.phone);
      const input = {
        fullName: w.fullName,
        email: w.email,
        phone: fullPhone,
        whatsapp: w.whatsappDiffers ? normalizePhone(w.whatsapp) : "",
        location: w.location,
        heardAbout: w.heard,
        hopingToLearn: w.why === "build" ? w.branchAnswer : "",
        moneyQuestion: w.question,
        biggestChallenge: w.challenge,
        debtExperience: w.why === "debt" ? w.branchAnswer : "",
        financialSituation: w.why === "money" ? w.branchAnswer : "",
        hasFinancialGoal: w.goal === "yes",
        areaToImprove: w.goal === "yes" ? w.area : "",
        whyHere: w.why ? WHY_LABEL[w.why] : "",
        debtDuration: w.why === "debt" ? w.debtDuration : "",
        moneyStress: w.stress,
      };
      const result = registerForMsEvent(input);
      let reg = result.registration;
      // Re-onboarding a revoked participant: restore access + fresh answers.
      if (result.existing && reg.status !== "access_granted") {
        reg =
          updateMsRegistration(reg.id, {
            ...input,
            status: "access_granted",
            adminNote: reg.status === "rejected" ? reg.adminNote : "Access restored after re-onboarding.",
            verifiedBy: null,
            verifiedAt: null,
          }) || reg;
      }
      setRegistration(reg);
      setFresh(!result.existing);
      setMode("done");
      setW(W_INITIAL);
      setStepIdx(0);
      setErrors({});
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setSubmitting(false);
    }
  };

  /* Gates — apply to NEW visitors only. */
  const regs = getMsRegistrations();
  const editionCount = regs.filter((r) => r.edition === event.edition && r.status !== "rejected").length;
  const regClosed = !event.regOpen;
  const regFull = event.capacity > 0 && editionCount >= event.capacity;

  const openForm = () => {
    markInteracted();
    setFresh(false);
    setW(W_INITIAL);
    setStepIdx(0);
    setErrors({});
    setMode("form");
  };

  /* Progress ----------------------------------------------------------- */
  const progressPct = ((stepIdx + 1) / steps.length) * 100;

  return (
    <div className="text-left">
      {mode === "done" && registration ? (
        <DoneCard
          registration={registration}
          fresh={fresh}
          event={event}
          onShowForm={openForm}
          onReonboard={openForm}
        />
      ) : regClosed ? (
        <GateCard
          title="Already registered?"
          body={`Registration for Mindset Shift ${event.edition} has closed${event.regDeadlineLabel ? ` (${event.regDeadlineLabel})` : ""}. If you registered earlier, your confirmation code still works — it's how you check your status. Otherwise, join us at the next edition: the series runs twice a month, on the 1st and 3rd Sunday.`}
        />
      ) : regFull ? (
        <GateCard
          title="This edition is fully booked"
          body={`We've reached the ${event.capacity}-participant capacity set for Mindset Shift ${event.edition}. If you've already registered, use your confirmation code to check your status — your spot is held.`}
        />
      ) : (
        <div className="mt-9">
          {/* Progress */}
          <div className="mb-7 flex items-center gap-4">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-400 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs font-bold text-[#8a7ba8]" aria-live="polite">
              {step === "details" ? "Details" : step === "recap" ? "Almost done" : `Question ${stepIdx + 1} of ${steps.length}`}
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            {/* ---- 0 · NAME ---- */}
            {step === "name" && (
              <StepFrame
                kicker="First things first"
                title="What should we call you?"
                note="We'll remember it for the rest of this."
              >
                <input
                  type="text"
                  autoComplete="name"
                  className={inputCls}
                  placeholder="Your name — e.g. Ada Obi"
                  value={w.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  aria-label="Your name"
                  autoFocus
                />
                {errors.fullName && <p className={errCls}>{errors.fullName}</p>}
                <div className="mt-5">
                  <GradientButton type="button" onClick={() => tryNext(0)}>
                    Continue
                    <Icon name="arrowRight" size={16} />
                  </GradientButton>
                </div>
              </StepFrame>
            )}

            {/* ---- 1 · WHY (branching opener) ---- */}
            {step === "why" && (
              <StepFrame
                kicker={`Honest question, ${firstName || "friend"}`}
                title="What's pulling you toward this event right now?"
                note="There are no wrong answers — this decides what we ask next."
              >
                <div className="space-y-2.5">
                  {WHY_OPTIONS.map((o) => (
                    <Choice
                      key={o.key}
                      selected={w.why === o.key}
                      onClick={() => {
                        set("why", o.key);
                        // Reset branch-dependent answers when the branch changes.
                        setW((f) =>
                          f.why !== o.key
                            ? { ...f, why: o.key, branchAnswer: "", debtDuration: "" }
                            : f
                        );
                        next(stepIdx);
                      }}
                    >
                      {o.label}
                    </Choice>
                  ))}
                </div>
                {errors.why && <p className={errCls}>{errors.why}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                </div>
              </StepFrame>
            )}

            {/* ---- 2 · BRANCH FOLLOW-UP ---- */}
            {step === "branch" && w.why === "debt" && (
              <StepFrame
                kicker="No judgment — we know these"
                title="What kind of debt is it?"
              >
                <div className="space-y-2.5">
                  {DEBT_TYPE_OPTIONS.map((o) => (
                    <Choice key={o} selected={w.branchAnswer === o} onClick={() => { set("branchAnswer", o); next(stepIdx); }}>
                      {o}
                    </Choice>
                  ))}
                </div>
                {errors.branchAnswer && <p className={errCls}>{errors.branchAnswer}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                </div>
              </StepFrame>
            )}
            {step === "branch" && w.why === "money" && (
              <StepFrame kicker="So where are you?" title="Right now, where are you with your finances?">
                <div className="space-y-2.5">
                  {SITUATION_OPTIONS.map((o) => (
                    <Choice key={o} selected={w.branchAnswer === o} onClick={() => { set("branchAnswer", o); next(stepIdx); }}>
                      {o}
                    </Choice>
                  ))}
                </div>
                {errors.branchAnswer && <p className={errCls}>{errors.branchAnswer}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                </div>
              </StepFrame>
            )}
            {step === "branch" && w.why === "build" && (
              <StepFrame kicker="Good — builders get to choose" title="If this works, what's the first thing you'd change?">
                <div className="space-y-2.5">
                  {BUILD_OPTIONS.map((o) => (
                    <Choice key={o} selected={w.branchAnswer === o} onClick={() => { set("branchAnswer", o); next(stepIdx); }}>
                      {o}
                    </Choice>
                  ))}
                </div>
                {errors.branchAnswer && <p className={errCls}>{errors.branchAnswer}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                </div>
              </StepFrame>
            )}

            {/* ---- 2b · DEBT DURATION ---- */}
            {step === "duration" && (
              <StepFrame kicker="One more on this" title="How long has it been sitting on your chest?">
                <div className="space-y-2.5">
                  {DEBT_DURATION_OPTIONS.map((o) => (
                    <Choice key={o} selected={w.debtDuration === o} onClick={() => { set("debtDuration", o); next(stepIdx); }}>
                      {o}
                    </Choice>
                  ))}
                </div>
                {errors.debtDuration && <p className={errCls}>{errors.debtDuration}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                </div>
              </StepFrame>
            )}

            {/* ---- 3 · THE HONEST ONE ---- */}
            {step === "stress" && (
              <StepFrame
                kicker="The one nobody asks"
                title={`Be real with me, ${firstName || "friend"} — is money a quiet stress in your home right now?`}
                note="Only the team reads this. It's how the speaker knows where to be gentle and where to be direct."
              >
                <div className="space-y-2.5">
                  {STRESS_OPTIONS.map((o) => (
                    <Choice key={o} selected={w.stress === o} onClick={() => { set("stress", o); next(stepIdx); }}>
                      {o}
                    </Choice>
                  ))}
                </div>
                {errors.stress && <p className={errCls}>{errors.stress}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                </div>
              </StepFrame>
            )}

            {/* ---- 4 · BIGGEST CHALLENGE (in their words) ---- */}
            {step === "challenge" && (
              <StepFrame
                kicker="In your own words"
                title="What's the biggest money problem you're carrying right now?"
                note="As much or as little as you like. One true sentence is plenty."
              >
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder="e.g. My money never lasts past the 20th, and I don't know why."
                  value={w.challenge}
                  onChange={(e) => set("challenge", e.target.value)}
                  aria-label="Your biggest money problem, in your own words"
                />
                {errors.challenge && <p className={errCls}>{errors.challenge}</p>}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                  <GradientButton type="button" onClick={() => tryNext(stepIdx)}>
                    Continue
                    <Icon name="arrowRight" size={16} />
                  </GradientButton>
                </div>
              </StepFrame>
            )}

            {/* ---- 5 · GOAL ---- */}
            {step === "goal" && (
              <StepFrame kicker="Quick one" title="Are you quietly working toward a financial goal right now?">
                <div className="flex flex-wrap gap-2.5">
                  {(["yes", "no"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={w.goal === v}
                      onClick={() => {
                        // "Yes, I am" stays on this step: the area choices
                        // appear inline below and advance the wizard.
                        set("goal", v);
                      }}
                      className={`rounded-full border px-6 py-2.5 text-sm font-bold transition-colors ${
                        w.goal === v
                          ? "border-pink-400/60 bg-pink-500/15 text-white"
                          : "border-white/15 bg-white/[0.03] text-[#b8aecf] hover:border-pink-400/40"
                      }`}
                    >
                      {v === "yes" ? "Yes, I am" : "Not yet"}
                    </button>
                  ))}
                </div>
                {errors.goal && <p className={errCls}>{errors.goal}</p>}
                {w.goal === "yes" && (
                  <div className="mt-5">
                    <p className="mb-2.5 text-sm font-semibold text-[#cabfe0]">Which area is it?</p>
                    <div className="space-y-2.5">
                      {AREA_OPTIONS.map((o) => (
                        <Choice key={o} selected={w.area === o} onClick={() => { set("area", o); next(stepIdx); }}>
                          {o}
                        </Choice>
                      ))}
                    </div>
                    {errors.area && <p className={errCls}>{errors.area}</p>}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                  {w.goal === "no" && (
                    <GradientButton type="button" onClick={() => tryNext(stepIdx)}>
                      Continue
                      <Icon name="arrowRight" size={16} />
                    </GradientButton>
                  )}
                </div>
              </StepFrame>
            )}

            {/* ---- 6 · THE QUESTION (optional) ---- */}
            {step === "question" && (
              <StepFrame
                kicker="If you have one"
                title="The money question you keep asking yourself:"
                note="Skip it if you prefer — it's optional. If you share it, the speaker may answer it in the room."
              >
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  placeholder="e.g. Will I ever be able to own a home, or am I just delaying it?"
                  value={w.question}
                  onChange={(e) => set("question", e.target.value)}
                  aria-label="The money question you keep asking yourself (optional)"
                />
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                  <GhostButton onClick={() => next(stepIdx)}>
                    Skip for now
                  </GhostButton>
                  <GradientButton type="button" onClick={() => tryNext(stepIdx)}>
                    Save my answer
                    <Icon name="arrowRight" size={16} />
                  </GradientButton>
                </div>
              </StepFrame>
            )}

            {/* ---- 7 · DETAILS ---- */}
            {step === "details" && (
              <StepFrame
                kicker={`Now the boring part, ${firstName || "friend"}`}
                title="So the team can actually reach you."
                note="This is what goes in the participant list — name, contact, city. Nothing else."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ms-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">
                      Email *
                    </label>
                    <input id="ms-email" type="email" autoComplete="email" className={inputCls} placeholder="you@example.com" value={w.email} onChange={(e) => set("email", e.target.value)} />
                    {errors.email && <p className={errCls}>{errors.email}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">Phone number *</label>
                    <CountryPhone
                      country={w.country}
                      phone={w.phone}
                      onCountry={(c) => setInternal("country", c)}
                      onPhone={(p) => set("phone", p)}
                      inputClass={inputCls}
                    />
                    {errors.phone && <p className={errCls}>{errors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#cabfe0]">
                      <input
                        type="checkbox"
                        checked={w.whatsappDiffers}
                        onChange={(e) => set("whatsappDiffers", e.target.checked)}
                        className="h-4 w-4 rounded accent-[#e026c4]"
                      />
                      My WhatsApp number is different from my phone
                    </label>
                    {w.whatsappDiffers && (
                      <div className="mt-3">
                        <label htmlFor="ms-whatsapp" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">
                          WhatsApp number
                        </label>
                        <input id="ms-whatsapp" type="tel" autoComplete="off" className={inputCls} placeholder="e.g. +234 801 234 5678" value={w.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                        {errors.whatsapp && <p className={errCls}>{errors.whatsapp}</p>}
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="ms-location" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">
                      City / state (optional)
                    </label>
                    <input id="ms-location" type="text" className={inputCls} placeholder="e.g. Umuahia, Abia State" value={w.location} onChange={(e) => set("location", e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="ms-heard" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">
                      How did you find this? *
                    </label>
                    <select id="ms-heard" className={inputCls} value={w.heard} onChange={(e) => set("heard", e.target.value)}>
                      <option value="" className="bg-[#12001f]">Choose one…</option>
                      {SOURCE_OPTIONS.map((o) => (
                        <option key={o} value={o} className="bg-[#12001f]">{o}</option>
                      ))}
                    </select>
                    {errors.heard && <p className={errCls}>{errors.heard}</p>}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {stepIdx > 0 && (
                    <GhostButton onClick={() => goTo(stepIdx - 1)}>
                      Back
                    </GhostButton>
                  )}
                  <GradientButton type="button" onClick={() => tryNext(stepIdx)}>
                    Continue
                    <Icon name="arrowRight" size={16} />
                  </GradientButton>
                </div>
              </StepFrame>
            )}

            {/* ---- 8 · RECAP + COMMIT ---- */}
            {step === "recap" && (
              <StepFrame
                kicker={`Before you lock it in, ${firstName || "friend"}`}
                title="Here's what you told us."
                note={`${event.speaker.name} and the team will read this before Sunday — so the conversation meets you where you actually are. Nothing you said is public.`}
              >
                <ul className="space-y-2.5 rounded-2xl border border-white/10 bg-black/25 p-5">
                  <RecapLine text={`You came because — “${WHY_LABEL[w.why || "curious"]}”`} />
                  {w.why === "debt" && (
                    <RecapLine text={`Your debt — “${w.branchAnswer}” · ${w.debtDuration.toLowerCase()}`} />
                  )}
                  {w.why === "money" && <RecapLine text={`Right now — “${w.branchAnswer}”`} />}
                  {w.why === "build" && <RecapLine text={`First move — “${w.branchAnswer}”`} />}
                  {w.stress && w.stress !== "I'd rather not say" && (
                    <RecapLine text={`Money at home — “${w.stress}”`} />
                  )}
                  {w.challenge.trim() && <RecapLine text={`In your words — “${w.challenge.trim()}”`} />}
                  {w.goal === "yes" && <RecapLine text={`Working toward — ${w.area}`} />}
                  {w.question.trim() && <RecapLine text={`Your question — “${w.question.trim()}”`} />}
                </ul>

                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-[#e026c4]" />
                  <p className="text-xs leading-relaxed text-[#b8aecf]">{event.privacyNote}</p>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <GhostButton onClick={() => goTo(stepIdx - 1)}>
                    Back
                  </GhostButton>
                  <GradientButton type="submit" disabled={submitting}>
                    {submitting ? "Saving your seat…" : "Save My Seat"}
                    <Icon name="arrowRight" size={16} />
                  </GradientButton>
                </div>
              </StepFrame>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
