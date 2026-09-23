import { useState, useEffect } from "react";
import { GradientButton, GhostButton, Card } from "./ui";
import Icon from "./Icon";
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
    track: "Graphic Design & Branding",
    schedule: "Flexible / Any Day",
    duration: "60 Minutes (Hourly Discounted)",
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
  const discountHourlyNGN = 500;

  const convertedMinute = baseMinuteNGN * currency.rateAgainstNGN;
  const convertedHourly = baseHourlyNGN * currency.rateAgainstNGN;
  const convertedOriginal = originalHourlyNGN * currency.rateAgainstNGN;
  const convertedDiscount = discountHourlyNGN * currency.rateAgainstNGN;

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
      setFormError("Please share what specific skills or projects you want to focus on.");
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
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-gradient-to-b from-purple-900/15 via-pink-900/10 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-pink-300">
            <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
            1-on-1 Private Mentorship · Pay-As-You-Learn
          </div>

          <h2 className="font-display mt-4 text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Need Individual Attention? Learn <span className="text-gradient">1-on-1</span> with a Senior Mentor.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#cabfe0] leading-relaxed">
            Prefer not to share class time in a group cohort? Skip the waiting lists and get unhurried, private instruction. Learn your custom syllabus at your own pace, with real-time feedback on your personal projects.
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

        {/* Pricing & Value Proposition Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-12 items-stretch">
          {/* Left: 5 Pillars of 1-on-1 Coaching */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-pink-400">✦</span>
                Why Choose 1-on-1 Coaching?
              </h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 font-bold text-xs ring-1 ring-pink-500/30">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">100% Dedicated Attention</h4>
                    <p className="mt-0.5 text-xs text-[#cabfe0] leading-relaxed">
                      Zero sharing instructor attention with a classroom. Every minute is spent diagnosing your exact stumbling blocks and polishing your actual client work.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs ring-1 ring-purple-500/30">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Choose Your Track & Custom Syllabus</h4>
                    <p className="mt-0.5 text-xs text-[#cabfe0] leading-relaxed">
                      Skip introductory chapters you already know. Dive straight into advanced motion curves, web application state, client pricing frameworks, or 3D composition.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-300 font-bold text-xs ring-1 ring-pink-500/30">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Your Schedule, Your Velocity</h4>
                    <p className="mt-0.5 text-xs text-[#cabfe0] leading-relaxed">
                      Book sessions whenever you are free — mornings, late nights, or weekends. Progress 4x faster without waiting on cohort scheduling.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs ring-1 ring-purple-500/30">
                    4
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">The "Pay-As-You-Learn" Freedom</h4>
                    <p className="mt-0.5 text-xs text-[#cabfe0] leading-relaxed">
                      No locked-in thousands of dollars upfront. You only pay for the time you actually use, experiencing the tangible value live as you learn.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Transparent Pricing Box & Instant Booking Trigger */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#1f0033] to-[#0d0017] p-6 sm:p-8 shadow-2xl">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Transparent Pricing
                </span>
                <span className="text-xs text-[#a594c7]">Auto-calculated in {currency.code}</span>
              </div>

              {/* Minute Rate */}
              <div className="mt-6 border-b border-white/10 pb-5">
                <p className="text-xs text-[#a594c7] uppercase tracking-wider font-semibold">Per-Minute Rate</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                    {formatPrice(convertedMinute)}
                  </span>
                  <span className="text-xs text-[#cabfe0]">/ minute</span>
                </div>
                <p className="text-[11px] text-[#8a7ba8] mt-1">
                  Base rate: ₦50/min · Pay only for what you need
                </p>
              </div>

              {/* Hourly Discounted Rate */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-pink-300 uppercase tracking-wider font-bold">
                    1-Hour Full Session (Best Value)
                  </p>
                  <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                    Save 17%
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-display text-4xl sm:text-5xl font-extrabold text-gradient">
                    {formatPrice(convertedHourly)}
                  </span>
                  <span className="text-sm line-through text-[#7f739c]">
                    {formatPrice(convertedOriginal)}
                  </span>
                  <span className="text-xs text-[#cabfe0]">/ hour</span>
                </div>

                <p className="text-xs text-emerald-300 font-semibold mt-1">
                  ✓ Includes {formatPrice(convertedDiscount)} proportional discount on 60-minute bookings
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-3.5 text-xs text-[#cabfe0] space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>1-on-1 screen share & live Figma/IDE drills</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Full recording of your session provided</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Direct WhatsApp access to your mentor</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <GradientButton
                onClick={() => {
                  setBooked(false);
                  setFormError("");
                  setModalOpen(true);
                }}
                className="w-full shadow-xl shadow-pink-500/25 justify-center text-center cursor-pointer"
              >
                <span>Book a 1-on-1 Coaching Session →</span>
              </GradientButton>
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
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-lg"
              aria-label="Close"
            >
              ×
            </button>

            {booked ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-pink text-white shadow-xl glow-pink-sm">
                  <Icon name="check" size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Coaching Request Confirmed!</h3>
                <p className="mt-3 text-sm text-[#cabfe0] leading-relaxed max-w-md mx-auto">
                  We have logged your request in our private coaching queue. Our lead mentor will review your goals and reach out to you within 12 hours with your session calendar link.
                </p>
                <div className="mt-6">
                  <GradientButton onClick={() => setModalOpen(false)} className="shadow-lg">
                    Done
                  </GradientButton>
                </div>
              </div>
            ) : (
              <div>
                <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pink-300">
                  Private Mentorship Application
                </span>
                <h3 className="font-display mt-3 text-2xl sm:text-3xl font-bold text-white">
                  Book Your 1-on-1 Session
                </h3>
                <p className="mt-1 text-xs text-[#a594c7]">
                  Rate: {formatPrice(convertedHourly)}/hr ({formatPrice(convertedMinute)}/min). Pay only for what you use.
                </p>

                {formError && (
                  <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/20 p-3 text-xs text-red-200">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#a594c7] mb-1">Your Full Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Samuel Adekunle"
                      className={inputCls}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#a594c7] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="samuel@gmail.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#a594c7] mb-1">Phone / WhatsApp *</label>
                      <input
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+234 ... or +1 ..."
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#a594c7] mb-1">Skill Track *</label>
                      <select
                        value={form.track}
                        onChange={(e) => setForm({ ...form, track: e.target.value })}
                        className={inputCls}
                      >
                        <option>Graphic Design & Branding</option>
                        <option>Web Engineering & Full-Stack</option>
                        <option>Video Editing & Motion Design</option>
                        <option>AI Automation & Funnels</option>
                        <option>Portfolio Review & Pricing Strategy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#a594c7] mb-1">Preferred Schedule *</label>
                      <select
                        value={form.schedule}
                        onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                        className={inputCls}
                      >
                        <option>Weekday Mornings (9am - 12pm)</option>
                        <option>Weekday Evenings (6pm - 9pm)</option>
                        <option>Weekend Sprints (Sat/Sun)</option>
                        <option>Flexible / Any Day</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#a594c7] mb-1">Session Duration</label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className={inputCls}
                    >
                      <option>30 Minutes ({formatPrice(convertedMinute * 30)})</option>
                      <option>60 Minutes ({formatPrice(convertedHourly)} - Hourly Discounted)</option>
                      <option>90 Minutes ({formatPrice(convertedHourly + convertedMinute * 30)})</option>
                      <option>120 Minutes ({formatPrice(convertedHourly * 2)})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#a594c7] mb-1">
                      What specific challenge or project do you want to conquer? *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={form.goals}
                      onChange={(e) => setForm({ ...form, goals: e.target.value })}
                      placeholder="e.g. I need 1-on-1 assistance with advanced typography pairing and building my portfolio site..."
                      className={inputCls}
                    />
                  </div>

                  <GradientButton type="submit" className="w-full mt-2 shadow-xl shadow-pink-500/25">
                    Submit 1-on-1 Coaching Request →
                  </GradientButton>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
