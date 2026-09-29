import { useEffect, useRef, useState } from "react";
import {
  findByResumeCode,
  getMsRegistrations,
  registerForMsEvent,
  MS_STATUS_LABELS,
  type MsEventConfig,
  type MsRegistration,
} from "../data/mindsetShift";
import { buildPhone, countryByCode, normalizePhone } from "../data/store";
import CountryPhone from "./CountryPhone";
import Icon from "./Icon";
import { GradientButton } from "./ui";
import MindsetShiftAccessFlow from "./MindsetShiftAccessFlow";

/* ------------------------------------------------------------------ */
/* Form constants (UI taxonomy — not event facts)                     */
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

const DEBT_OPTIONS = [
  "No debt right now",
  "Managing consumer debt (card, personal loan)",
  "Carrying business debt",
  "Family or repayment obligations",
  "Prefer not to say",
];

const SITUATION_OPTIONS = [
  "Saving and investing some of my income",
  "Steady, but little left at the end of the month",
  "Tight — living close to my limit",
  "Under real financial pressure right now",
  "Prefer not to say",
];

const AREA_OPTIONS = [
  "Paying off debt",
  "Saving & investing",
  "Starting or growing a business",
  "Increasing my income",
  "Financial discipline & habits",
  "Other",
];

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]";
const errCls = "mt-1.5 text-xs font-medium text-red-400";

interface FormState {
  fullName: string;
  email: string;
  country: string;
  phone: string;
  whatsappDiffers: boolean;
  whatsapp: string;
  location: string;
  heardAbout: string;
  hopingToLearn: string;
  moneyQuestion: string;
  biggestChallenge: string;
  debtExperience: string;
  financialSituation: string;
  hasFinancialGoal: "" | "yes" | "no";
  areaToImprove: string;
}

const INITIAL: FormState = {
  fullName: "",
  email: "",
  country: "NG",
  phone: "",
  whatsappDiffers: false,
  whatsapp: "",
  location: "",
  heardAbout: "",
  hopingToLearn: "",
  moneyQuestion: "",
  biggestChallenge: "",
  debtExperience: "",
  financialSituation: "",
  hasFinancialGoal: "",
  areaToImprove: "",
};

/** Latest registration on this device (refresh/crash-safe resume). */
function deviceRegistration(): MsRegistration | undefined {
  const regs = getMsRegistrations();
  if (regs.length === 0) return undefined;
  return [...regs].sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

/* ------------------------------------------------------------------ */
/** A ?resume=CODE link resumes that registration when it exists on this
 *  device (or has arrived via cloud hydration). Unknown codes are ignored
 *  silently — no data is revealed, no error is thrown. */
function resumeFromUrl(): MsRegistration | undefined {
  try {
    const code = new URLSearchParams(window.location.search).get("resume");
    if (!code) return undefined;
    return findByResumeCode(code);
  } catch {
    return undefined;
  }
}

/** The registration this visitor should be looking at: an explicit
 *  ?resume=CODE wins, otherwise the latest registration on this device. */
function effectiveRegistration(): MsRegistration | undefined {
  return resumeFromUrl() || deviceRegistration();
}

/* Confirmation / resume card                                         */
/* ------------------------------------------------------------------ */

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

function DoneCard({
  registration,
  fresh,
  event,
  onShowForm,
}: {
  registration: MsRegistration;
  fresh: boolean;
  event: MsEventConfig;
  onShowForm: () => void;
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
            {fresh ? `You're registered, ${firstName}.` : `Welcome back, ${firstName}.`}
          </h3>
          <p className="mt-1 text-sm text-[#b8aecf]">
            Status: <span className="font-semibold text-white">{MS_STATUS_LABELS[registration.status]}</span>
            {" · "}
            {event.programName} {event.edition}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className={labelCls}>Your confirmation code</p>
        <CopyCode code={registration.id} />
        <p className="mt-2 text-xs text-[#8a7ba8]">
          Save this code — it's how you resume your registration if you come back on this device or another.
        </p>
      </div>

      <MindsetShiftAccessFlow registration={registration} event={event} />

      <button
        type="button"
        onClick={onShowForm}
        className="mt-6 text-xs font-semibold text-[#8a7ba8] underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
      >
        Different person on this device? Register them here.
      </button>

      <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-[#8a7ba8]">
        <Icon name="shield" size={13} className="mt-0.5 shrink-0 text-[#e026c4]" />
        {event.privacyNote}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
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

export default function MindsetShiftRegistration({ event }: { event: MsEventConfig }) {
  const [mode, setMode] = useState<"form" | "done">(() => (effectiveRegistration() ? "done" : "form"));
  const [fresh, setFresh] = useState(false); // true only for the submission that just happened
  const [registration, setRegistration] = useState<MsRegistration | undefined>(() => effectiveRegistration());
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Once the user has interacted with the flow (typed, submitted, or chose
  // "different person"), background registration events must never override
  // the current view — the site dispatches a synthetic `storage` event after
  // EVERY localStorage save (accounts, auth, CMS, live stream), and forcing
  // the done card on any of them would yank a mid-fill form away.
  const hasInteractedRef = useRef(false);
  const markInteracted = () => {
    hasInteractedRef.current = true;
  };

  // Keep data in sync if registrations change from elsewhere (cloud
  // hydration, another tab). Two guards keep background events (the site
  // dispatches a synthetic `storage` event after EVERY localStorage save —
  // accounts, auth, CMS, live stream — several times a minute) from
  // disrupting the user:
  //   1. mode is only forced for a brand-new visitor who hasn't touched the
  //      flow yet (a mid-fill form is never yanked away),
  //   2. `fresh` is never touched here — it belongs to the submit flow.
  useEffect(() => {
    const sync = () => {
      const r = effectiveRegistration();
      if (!r) return;
      // Identity check: skip the re-render when the record didn't actually
      // change (the listener fires on every site-wide localStorage save).
      // Full-content compare — a verification/proof update from the cloud
      // can arrive without a local `updatedAt` bump.
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

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    markInteracted();
    setForm((f) => ({ ...f, [key]: value }));
  };
  // Programmatic updates (country auto-detection on mount) — must NOT count
  // as user interaction, or cloud hydration could never flip a fresh
  // visitor to their existing registration.
  const setInternal = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.fullName.trim()) e.fullName = "Please enter your full name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "That email doesn't look right.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 7) e.phone = "Please enter a valid phone number.";
    if (form.whatsappDiffers && form.whatsapp.replace(/\D/g, "").length < 7)
      e.whatsapp = "Enter the WhatsApp number, or untick the box if it's the same.";
    if (!form.heardAbout) e.heardAbout = "Pick where you heard about us — it helps us understand what's working.";
    if (!form.hopingToLearn.trim()) e.hopingToLearn = "Tell us what you're hoping to learn (a sentence or two is perfect).";
    if (!form.biggestChallenge.trim()) e.biggestChallenge = "Tell us the biggest financial challenge you're facing right now.";
    if (!form.hasFinancialGoal) e.hasFinancialGoal = "Pick one so the conversation can be relevant to you.";
    if (form.hasFinancialGoal === "yes" && !form.areaToImprove) e.areaToImprove = "Pick the area you're working toward.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    markInteracted();
    setSubmitting(true);
    try {
      const fullPhone = buildPhone(countryByCode(form.country).dial, form.phone);
      const result = registerForMsEvent({
        fullName: form.fullName,
        email: form.email,
        phone: fullPhone,
        // Free-form WhatsApp field → canonical normalize (handles +234/0801/00234).
        whatsapp: form.whatsappDiffers ? normalizePhone(form.whatsapp) : "",
        location: form.location,
        heardAbout: form.heardAbout,
        hopingToLearn: form.hopingToLearn,
        moneyQuestion: form.moneyQuestion,
        biggestChallenge: form.biggestChallenge,
        debtExperience: form.debtExperience,
        financialSituation: form.financialSituation,
        hasFinancialGoal: form.hasFinancialGoal === "yes",
        areaToImprove: form.areaToImprove,
      });
      setRegistration(result.registration);
      setFresh(!result.existing);
      setMode("done");
      setForm(INITIAL);
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  // Admin-controlled gates — apply to NEW visitors only. Anyone with an
  // existing registration (device or ?resume=) always sees their own
  // status, no matter when they arrive.
  const regs = getMsRegistrations();
  // Rejected participants don't hold a seat.
  const editionCount = regs.filter((r) => r.edition === event.edition && r.status !== "rejected").length;
  const regClosed = !event.regOpen;
  const regFull = event.capacity > 0 && editionCount >= event.capacity;

  return (
    <div className="text-left">
      {mode === "done" && registration ? (
        <DoneCard
          registration={registration}
          fresh={fresh}
          event={event}
          onShowForm={() => {
            setFresh(false);
            setMode("form");
          }}
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
        <form onSubmit={onSubmit} noValidate className="mt-9 space-y-8">
          {/* ---- Your details ---- */}
          <fieldset>
            <legend className="flex items-center gap-2.5 text-sm font-black uppercase tracking-[0.16em] text-[#e79bf0]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-pink text-xs text-white">1</span>
              Your details
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ms-fullname" className={labelCls}>Full name *</label>
                <input id="ms-fullname" type="text" autoComplete="name" className={inputCls} placeholder="e.g. Ada Obi" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                {errors.fullName && <p className={errCls}>{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="ms-email" className={labelCls}>Email *</label>
                <input id="ms-email" type="email" autoComplete="email" className={inputCls} placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                {errors.email && <p className={errCls}>{errors.email}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Phone number *</label>
                <CountryPhone
                  country={form.country}
                  phone={form.phone}
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
                    checked={form.whatsappDiffers}
                    onChange={(e) => set("whatsappDiffers", e.target.checked)}
                    className="h-4 w-4 rounded accent-[#e026c4]"
                  />
                  My WhatsApp number is different from my phone
                </label>
                {form.whatsappDiffers && (
                  <div className="mt-3">
                    <label htmlFor="ms-whatsapp" className={labelCls}>WhatsApp number</label>
                    <input id="ms-whatsapp" type="tel" autoComplete="off" className={inputCls} placeholder="e.g. +234 801 234 5678" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
                    {errors.whatsapp && <p className={errCls}>{errors.whatsapp}</p>}
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ms-location" className={labelCls}>City / state (optional)</label>
                <input id="ms-location" type="text" className={inputCls} placeholder="e.g. Umuahia, Abia State" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </div>
            </div>
          </fieldset>

          {/* ---- About you ---- */}
          <fieldset>
            <legend className="flex items-center gap-2.5 text-sm font-black uppercase tracking-[0.16em] text-[#e79bf0]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-pink text-xs text-white">2</span>
              About you &amp; this conversation
            </legend>
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="ms-heard" className={labelCls}>How did you hear about {event.programName}? *</label>
                <select id="ms-heard" className={inputCls} value={form.heardAbout} onChange={(e) => set("heardAbout", e.target.value)}>
                  <option value="" className="bg-[#12001f]">Choose one…</option>
                  {SOURCE_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-[#12001f]">{o}</option>
                  ))}
                </select>
                {errors.heardAbout && <p className={errCls}>{errors.heardAbout}</p>}
              </div>
              <div>
                <label htmlFor="ms-hoping" className={labelCls}>What are you hoping to learn? *</label>
                <textarea id="ms-hoping" rows={3} className={`${inputCls} resize-y`} placeholder="A sentence or two — what do you want out of this conversation?" value={form.hopingToLearn} onChange={(e) => set("hopingToLearn", e.target.value)} />
                {errors.hopingToLearn && <p className={errCls}>{errors.hopingToLearn}</p>}
              </div>
              <div>
                <label htmlFor="ms-money-q" className={labelCls}>The money question you've been sitting with (optional)</label>
                <textarea id="ms-money-q" rows={3} className={`${inputCls} resize-y`} placeholder="The question you keep asking yourself about money, debt, or wealth." value={form.moneyQuestion} onChange={(e) => set("moneyQuestion", e.target.value)} />
              </div>
              <div>
                <label htmlFor="ms-challenge" className={labelCls}>Biggest financial challenge right now? *</label>
                <textarea id="ms-challenge" rows={3} className={`${inputCls} resize-y`} placeholder="Be as honest as you're comfortable — this stays private." value={form.biggestChallenge} onChange={(e) => set("biggestChallenge", e.target.value)} />
                {errors.biggestChallenge && <p className={errCls}>{errors.biggestChallenge}</p>}
              </div>
            </div>
          </fieldset>

          {/* ---- Private reflection (optional) ---- */}
          <fieldset>
            <legend className="flex items-center gap-2.5 text-sm font-black uppercase tracking-[0.16em] text-[#e79bf0]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-pink text-xs text-white">3</span>
              A private reflection <span className="text-[10px] font-semibold normal-case tracking-normal text-[#8a7ba8]">(optional — only the team sees this)</span>
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ms-debt" className={labelCls}>Where are you with debt?</label>
                <select id="ms-debt" className={inputCls} value={form.debtExperience} onChange={(e) => set("debtExperience", e.target.value)}>
                  <option value="" className="bg-[#12001f]">Choose…</option>
                  {DEBT_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-[#12001f]">{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="ms-situation" className={labelCls}>How would you describe your finances?</label>
                <select id="ms-situation" className={inputCls} value={form.financialSituation} onChange={(e) => set("financialSituation", e.target.value)}>
                  <option value="" className="bg-[#12001f]">Choose…</option>
                  {SITUATION_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-[#12001f]">{o}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <span className={labelCls}>Do you have a financial goal you're working toward? *</span>
                <div className="flex flex-wrap gap-2.5">
                  {(["yes", "no"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("hasFinancialGoal", v)}
                      className={`rounded-full border px-5 py-2 text-sm font-bold transition-colors ${
                        form.hasFinancialGoal === v
                          ? "border-pink-400/60 bg-pink-500/15 text-white"
                          : "border-white/15 bg-white/[0.03] text-[#b8aecf] hover:border-pink-400/40"
                      }`}
                      aria-pressed={form.hasFinancialGoal === v}
                    >
                      {v === "yes" ? "Yes" : "Not yet"}
                    </button>
                  ))}
                </div>
                {errors.hasFinancialGoal && <p className={errCls}>{errors.hasFinancialGoal}</p>}
                {form.hasFinancialGoal === "yes" && (
                  <div className="mt-3">
                    <label htmlFor="ms-area" className={labelCls}>Which area are you working toward?</label>
                    <select id="ms-area" className={inputCls} value={form.areaToImprove} onChange={(e) => set("areaToImprove", e.target.value)}>
                      <option value="" className="bg-[#12001f]">Choose one…</option>
                      {AREA_OPTIONS.map((o) => (
                        <option key={o} value={o} className="bg-[#12001f]">{o}</option>
                      ))}
                    </select>
                    {errors.areaToImprove && <p className={errCls}>{errors.areaToImprove}</p>}
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* ---- Privacy + submit ---- */}
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-[#e026c4]" />
            <p className="text-xs leading-relaxed text-[#b8aecf]">{event.privacyNote}</p>
          </div>

          <GradientButton type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Saving your registration…" : event.registrationFree ? "Register Free" : "Register"}
            <Icon name="arrowRight" size={16} />
          </GradientButton>
        </form>
      )}
    </div>
  );
}
