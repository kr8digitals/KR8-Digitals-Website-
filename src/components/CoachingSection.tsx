import { useState, useEffect } from "react";
import { GradientButton } from "./ui";
import { saveClientRequest } from "../data/store";

interface CurrencyInfo {
  code: string;
  symbol: string;
  rateAgainstNGN: number;
}

const FALLBACK_CURRENCIES: Record<string, { symbol: string; rate: number }> = {
  NGN: { symbol: "₦", rate: 1 },
  USD: { symbol: "$", rate: 0.00067 },
  GBP: { symbol: "£", rate: 0.00052 },
  EUR: { symbol: "€", rate: 0.00061 },
  GHS: { symbol: "GH₵", rate: 0.01 },
  KES: { symbol: "KSh ", rate: 0.086 },
  ZAR: { symbol: "R ", rate: 0.012 },
  INR: { symbol: "₹", rate: 0.056 },
  CAD: { symbol: "CA$ ", rate: 0.00091 },
  AUD: { symbol: "AU$ ", rate: 0.001 },
};

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#6f6390] focus:border-pink-500 focus:outline-none transition-colors";

export default function CoachingSection() {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    code: "NGN",
    symbol: "₦",
    rateAgainstNGN: 1,
  });
  const [rates, setRates] = useState<Record<string, number>>({});
  const [detectedCountry, setDetectedCountry] = useState<string>("Nigeria");
  const [modalOpen, setModalOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    track: "Graphic Design & Brand Identity",
    schedule: "Flexible / Evenings & Weekends",
    duration: "60 Minutes (Discounted Intensive)",
    goals: "",
  });

  // Detect location and load live exchange rate
  useEffect(() => {
    let active = true;

    async function detectLocationAndRates() {
      let userCurrency = "NGN";
      let userCountry = "Nigeria";

      try {
        const geoRes = await fetch("https://ipapi.co/json/", { cache: "force-cache" });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData?.currency) {
            userCurrency = geoData.currency;
            userCountry = geoData.country_name || geoData.country || "Your Region";
          }
        }
      } catch {
        // Fallback or offline
      }

      if (!active) return;
      setDetectedCountry(userCountry);

      try {
        const rateRes = await fetch("https://open.er-api.com/v6/latest/NGN");
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          if (rateData?.rates && active) {
            setRates(rateData.rates);
            const userRate = rateData.rates[userCurrency] || FALLBACK_CURRENCIES[userCurrency]?.rate || 1;
            const sym = FALLBACK_CURRENCIES[userCurrency]?.symbol || `${userCurrency} `;
            setCurrency({
              code: userCurrency,
              symbol: sym,
              rateAgainstNGN: userRate,
            });
            return;
          }
        }
      } catch {
        // Fallback rates
      }

      if (active) {
        const fallback = FALLBACK_CURRENCIES[userCurrency] || FALLBACK_CURRENCIES.NGN;
        setCurrency({
          code: userCurrency in FALLBACK_CURRENCIES ? userCurrency : "NGN",
          symbol: fallback.symbol,
          rateAgainstNGN: fallback.rate,
        });
      }
    }

    void detectLocationAndRates();
    return () => {
      active = false;
    };
  }, []);

  const handleManualCurrencyChange = (newCode: string) => {
    const r = rates[newCode] || FALLBACK_CURRENCIES[newCode]?.rate || 1;
    const sym = FALLBACK_CURRENCIES[newCode]?.symbol || `${newCode} `;
    setCurrency({
      code: newCode,
      symbol: sym,
      rateAgainstNGN: r,
    });
  };

  // Base pricing:
  // Base rate: ₦50/min
  // Hourly rate: 60 x ₦50 = ₦3,000, with ₦500 discount = ₦2,500/hr
  const baseMinuteNGN = 50;
  const baseHourlyNGN = 2500;
  const originalHourlyNGN = 3000;
  const convertedMinute = baseMinuteNGN * currency.rateAgainstNGN;
  const convertedHourly = baseHourlyNGN * currency.rateAgainstNGN;
  const convertedOriginal = originalHourlyNGN * currency.rateAgainstNGN;

  const formatPrice = (val: number) => {
    if (currency.code === "NGN") {
      return `${currency.symbol}${Math.round(val).toLocaleString()}`;
    }
    if (val < 1) {
      return `${currency.symbol}${val.toFixed(2)}`;
    }
    return `${currency.symbol}${val.toFixed(2)}`;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setFormError("Please enter an email address or phone number.");
      return;
    }
    if (!form.goals.trim()) {
      setFormError("Please describe the specific skills, projects, or blockers you want to tackle.");
      return;
    }

    const res = saveClientRequest({
      type: "coaching",
      title: `1-on-1 Coaching: ${form.track} (${form.name})`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      details: {
        track: form.track,
        schedule: form.schedule,
        duration: form.duration,
        goals: form.goals,
        billingCurrency: `${currency.code} (${formatPrice(convertedHourly)}/hr)`,
        detectedLocation: detectedCountry,
      },
    });

    if (!res.success) {
      setFormError(res.error || "Failed to record your booking. Please try again.");
      return;
    }

    setBooked(true);
  };

  return (
    <section id="coaching" className="relative py-20 border-t border-white/10 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-gradient-to-b from-purple-900/20 via-pink-900/15 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Core Conversion Header: Answering "Why Pay When General Class Is Free?" */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-pink-300 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
            Personalized Acceleration · 1-on-1 Private Coaching
          </div>

          <h2 className="font-display mt-5 text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Why Pay for 1-on-1 Coaching When the General Class Is <span className="text-gradient">Completely Free?</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#cabfe0] leading-relaxed">
            The free KR8 Digitals cohort is extraordinary for disciplined learners who enjoy group pacing. But if you have tight deadlines, specific client projects, a busy work schedule, or need an elite mentor looking exclusively at your screen — private coaching collapses months of trial-and-error into hours.
          </p>

          {/* Currency Auto-detection Pill */}
          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-xs text-[#b8aecf]">
            <span>📍 Auto-detected location: <strong className="text-white">{detectedCountry}</strong></span>
            <span className="text-pink-400">·</span>
            <span>Display currency:</span>
            <select
              value={currency.code}
              onChange={(e) => handleManualCurrencyChange(e.target.value)}
              className="bg-transparent font-bold text-pink-300 focus:outline-none cursor-pointer"
            >
              {Object.keys(FALLBACK_CURRENCIES).map((c) => (
                <option key={c} value={c} className="bg-[#12001f] text-white">
                  {c} ({FALLBACK_CURRENCIES[c].symbol.trim()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* The Honest Head-to-Head Comparison: Free Cohort vs 1-on-1 Coaching */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {/* Column 1: General Free Cohort */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8a7ba8]">Standard Option</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Free Group Cohort</h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                  100% Free
                </span>
              </div>

              <p className="text-xs text-[#a594c7] mt-4 leading-relaxed">
                High-impact, structured communal learning. Excellent for complete beginners ready to commit to an 8-week shared schedule.
              </p>

              <ul className="mt-5 space-y-3 text-xs text-[#cabfe0]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8a7ba8] font-bold">―</span>
                  <span><strong>Shared Attention:</strong> 1 instructor teaching hundreds of students simultaneously.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8a7ba8] font-bold">―</span>
                  <span><strong>Fixed Pacing:</strong> 8-week calendar where everyone moves at the exact same group speed.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8a7ba8] font-bold">―</span>
                  <span><strong>Standard Syllabus:</strong> You must follow pre-set chapters even if you already know the basics.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#8a7ba8] font-bold">―</span>
                  <span><strong>Broadcast Reviews:</strong> General class critiques rather than line-by-line review of your personal portfolio.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-center">
              <span className="text-[11px] text-[#8a7ba8]">Best for: Self-starters with flexible schedules and standard goals</span>
            </div>
          </div>

          {/* Column 2: 1-on-1 Private Coaching (The High-Value Choice) */}
          <div className="relative rounded-3xl border-2 border-pink-500/50 bg-gradient-to-b from-[#240038] via-[#150022] to-[#0c0015] p-6 sm:p-7 shadow-2xl glow-pink-sm flex flex-col justify-between">
            <div className="absolute -top-3 right-6 rounded-full bg-gradient-pink px-3.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
              Maximum Speed & ROI
            </div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-pink-500/30">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-pink-300">Fast-Track Accelerator</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">Private 1-on-1 Coaching</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#a594c7]">From</span>
                  <p className="font-display text-lg font-extrabold text-gradient leading-none">
                    {formatPrice(convertedMinute)}<span className="text-xs font-normal text-white">/min</span>
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#cabfe0] mt-4 leading-relaxed">
                Hyper-focused, unhurried personal mentorship directly on your live screen. Your goals, your actual work, and instant answers.
              </p>

              <ul className="mt-5 space-y-3 text-xs text-white">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>100% Dedicated Eyes:</strong> Zero distractions. The instructor reviews only your screen, habits, and files.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Customized Syllabus:</strong> Skip what you already understand. Focus 100% on your specific project or blind spot.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>On-Demand Scheduling:</strong> Book sessions when you are free — early mornings, late nights, or weekends.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Immediate Feedback:</strong> Live line-by-line debugging, bezier adjustments, and client pitching critiques in real time.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-pink-500/20 text-center">
              <span className="text-[11px] text-pink-300 font-medium">Best for: Ambitious builders who value time over trial-and-error</span>
            </div>
          </div>
        </div>

        {/* The 6 Pillars of 1-on-1 Value: Detailed Benefits */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="font-display text-2xl font-bold text-white">
              Why Personalized Mentorship Pays For Itself
            </h3>
            <p className="text-xs sm:text-sm text-[#a594c7] mt-1.5">
              The tangible advantages that turn raw effort into commercial-grade execution.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 font-bold text-base mb-3 ring-1 ring-pink-500/40">
                ⚡
              </div>
              <h4 className="text-sm font-bold text-white">Faster Breakthroughs</h4>
              <p className="mt-1.5 text-xs text-[#b8aecf] leading-relaxed">
                Stuck on keyframes, layout hierarchy, or component lifecycle? Fix in 10 live minutes what typically takes 3 weeks of frantic Google searches.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold text-base mb-3 ring-1 ring-purple-500/40">
                🎯
              </div>
              <h4 className="text-sm font-bold text-white">Personal Client Work Review</h4>
              <p className="mt-1.5 text-xs text-[#b8aecf] leading-relaxed">
                Have an active client brief or job interview test? Bring the live project into your session and refine it under professional supervision before delivery.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 font-bold text-base mb-3 ring-1 ring-pink-500/40">
                ⏱
              </div>
              <h4 className="text-sm font-bold text-white">Learn at Your Velocity</h4>
              <p className="mt-1.5 text-xs text-[#b8aecf] leading-relaxed">
                Whether you want to sprint through a track in 10 intensive days or progress steadily around your 9-to-5, your calendar dictates the pace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold text-base mb-3 ring-1 ring-purple-500/40">
                🔍
              </div>
              <h4 className="text-sm font-bold text-white">Diagnostic on Blind Spots</h4>
              <p className="mt-1.5 text-xs text-[#b8aecf] leading-relaxed">
                Most self-taught creators never realize the tiny ergonomic or typographic errors costing them high-ticket clients. Your coach spots and fixes them instantly.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 font-bold text-base mb-3 ring-1 ring-pink-500/40">
                🤝
              </div>
              <h4 className="text-sm font-bold text-white">Real Accountability</h4>
              <p className="mt-1.5 text-xs text-[#b8aecf] leading-relaxed">
                80% of free course students abandon before week 4. With a scheduled coach expecting your progress, procrastination disappears.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-base mb-3 ring-1 ring-emerald-500/40">
                💳
              </div>
              <h4 className="text-sm font-bold text-white">Pay-As-You-Learn Freedom</h4>
              <p className="mt-1.5 text-xs text-[#b8aecf] leading-relaxed">
                Zero multi-thousand-dollar commitments. Pay for only the exact time you need—from a quick 20-minute bug fix to a deep 60-minute portfolio overhaul.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Box & Final Conversion Trigger */}
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#1d002e] to-[#0c0016] p-6 sm:p-10 shadow-2xl">
          <div className="grid gap-8 md:grid-cols-12 items-center">
            <div className="md:col-span-7 space-y-4">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                Transparent & Accessible Rates
              </span>

              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Book Once, Advance by Weeks.
              </h3>

              <p className="text-xs sm:text-sm text-[#cabfe0] leading-relaxed">
                Pick your skill track, tell us your exact goals, and get paired with a senior mentor. Every session includes full screen recording and follow-up resources.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-white">
                <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                  <span className="text-[#8a7ba8] block text-[11px]">Pay-by-Minute</span>
                  <span className="font-display text-xl font-bold text-white mt-0.5 block">
                    {formatPrice(convertedMinute)}
                  </span>
                  <span className="text-[10px] text-[#a594c7]">Base ₦50/min rate</span>
                </div>

                <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-3 relative">
                  <span className="absolute -top-2 right-2 rounded bg-gradient-pink px-1.5 py-0.2 text-[9px] font-bold text-white">
                    Save 17%
                  </span>
                  <span className="text-pink-300 block text-[11px]">60-Min Intensive</span>
                  <span className="font-display text-xl font-bold text-gradient mt-0.5 block">
                    {formatPrice(convertedHourly)}
                  </span>
                  <span className="text-[10px] line-through text-[#7f739c] mr-1">
                    {formatPrice(convertedOriginal)}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-semibold">
                    Best value
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col justify-center items-center text-center p-4 border-t md:border-t-0 md:border-l border-white/10">
              <div className="mb-4">
                <span className="text-3xl">🚀</span>
                <p className="font-bold text-white text-base mt-2">Ready to accelerate?</p>
                <p className="text-xs text-[#a594c7] mt-1 max-w-xs">
                  Zero long-term contracts. Book a single session and evaluate the value for yourself.
                </p>
              </div>

              <GradientButton
                onClick={() => {
                  setBooked(false);
                  setFormError("");
                  setModalOpen(true);
                }}
                className="w-full shadow-xl shadow-pink-500/25 justify-center text-center cursor-pointer py-3"
              >
                <span>Book 1-on-1 Coaching Session →</span>
              </GradientButton>

              <span className="text-[10px] text-[#8a7ba8] mt-3">
                Immediate confirmation · Matched within 12 hours
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1-on-1 Coaching Booking Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#1b002c] to-[#090013] p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-xs"
              aria-label="Close"
            >
              ✕
            </button>

            {booked ? (
              <div className="text-center py-6 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-3xl">
                  ✓
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Coaching Request Confirmed!</h3>
                <p className="text-xs sm:text-sm text-[#cabfe0] leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong className="text-white">{form.name}</strong>. Your private session request for{" "}
                  <strong className="text-pink-300">{form.track}</strong> has been logged. Our lead coach will reach out to you via WhatsApp or Email within 12 hours to lock in your live calendar link.
                </p>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-left space-y-1 text-[#b8aecf]">
                  <div><strong>Track:</strong> {form.track}</div>
                  <div><strong>Preferred Time:</strong> {form.schedule}</div>
                  <div><strong>Session Rate:</strong> {form.duration} ({formatPrice(convertedHourly)}/hr equivalent)</div>
                </div>
                <GradientButton onClick={() => setModalOpen(false)} className="w-full justify-center">
                  Done
                </GradientButton>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <span className="rounded-full bg-pink-500/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-300">
                    Direct Mentor Match
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mt-1.5">
                    Schedule Your 1-on-1 Coaching
                  </h3>
                  <p className="text-xs text-[#a594c7] mt-0.5">
                    Tell us what you want to achieve. We match you with the senior specialist best suited to help you win.
                  </p>
                </div>

                {formError && (
                  <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                    {formError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#b8aecf] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ebuka Okafor"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#b8aecf] mb-1">WhatsApp / Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 800 000 0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#b8aecf] mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@domain.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#b8aecf] mb-1">Skill Track *</label>
                    <select
                      value={form.track}
                      onChange={(e) => setForm({ ...form, track: e.target.value })}
                      className={`${inputCls} cursor-pointer`}
                    >
                      <option value="Graphic Design & Brand Identity" className="bg-[#12001f] text-white">
                        Graphic Design & Brand Identity (Stevenson)
                      </option>
                      <option value="Video Editing & Motion Design" className="bg-[#12001f] text-white">
                        Video Editing & Motion Design (Daniel)
                      </option>
                      <option value="Website Development & AI Web Builders" className="bg-[#12001f] text-white">
                        Website Development & AI Web (Timfire)
                      </option>
                      <option value="Front-End Development & React" className="bg-[#12001f] text-white">
                        Front-End Development & React (Nonye Mercy)
                      </option>
                      <option value="Content Creation & Viral Growth" className="bg-[#12001f] text-white">
                        Content Creation & Viral Growth
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#b8aecf] mb-1">Preferred Timeframe</label>
                      <select
                        value={form.schedule}
                        onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="Flexible / Any Day" className="bg-[#12001f] text-white">Flexible / Any Day</option>
                        <option value="Weekday Evenings" className="bg-[#12001f] text-white">Weekday Evenings</option>
                        <option value="Weekends (Sat/Sun)" className="bg-[#12001f] text-white">Weekends (Sat/Sun)</option>
                        <option value="Morning Sprints" className="bg-[#12001f] text-white">Morning Sprints</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#b8aecf] mb-1">Session Duration</label>
                      <select
                        value={form.duration}
                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                        className={`${inputCls} cursor-pointer`}
                      >
                        <option value="60 Minutes (Discounted Intensive)" className="bg-[#12001f] text-white">
                          60 Minutes ({formatPrice(convertedHourly)} - Best Value)
                        </option>
                        <option value="30 Minutes (Quick Diagnostic)" className="bg-[#12001f] text-white">
                          30 Minutes (~{formatPrice(convertedMinute * 30)})
                        </option>
                        <option value="90 Minutes (Deep Portfolio Sprint)" className="bg-[#12001f] text-white">
                          90 Minutes (~{formatPrice(convertedHourly * 1.5)})
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#b8aecf] mb-1">
                      What specific challenges or client projects do you want to conquer? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. I am preparing a brand identity pitch for a fintech client and want live feedback on my typography hierarchy and motion logo curve..."
                      value={form.goals}
                      onChange={(e) => setForm({ ...form, goals: e.target.value })}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <GradientButton type="submit" className="w-full justify-center py-3">
                    <span>Submit 1-on-1 Coaching Request →</span>
                  </GradientButton>
                  <p className="text-[10px] text-center text-[#7d6f96] mt-2">
                    Zero upfront payment required to request. We confirm schedule and coach match first.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
