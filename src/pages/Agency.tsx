import { useState } from "react";
import { IMG } from "../data/images";
import { PORTFOLIO, getPortfolio, CONTACT, FULL_PORTFOLIO_LINK } from "../data/store";
import { Pill, GradientButton, GhostButton, SectionHead, Card, GlowImage } from "../components/ui";
import Icon from "../components/Icon";
import Marquee from "../components/Marquee";

const filters = ["All", ...Array.from(new Set(PORTFOLIO.map((p) => p.service)))];
const inputCls = "w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none transition-colors";

const agencyTransformationPillars = [
  {
    icon: "spark" as const,
    badge: "Pillar 01 · Positioning",
    title: "Brand Strategy & Category Authority",
    description:
      "We dissect what makes your business unmatched, strip away generic clichés, and position you as the definitive high-value authority so premium clients stop price-shopping you.",
    deliverables: ["Category Definition & Messaging", "Identity Systems & Visual Guidelines", "Competitive Moat Framing"],
  },
  {
    icon: "code" as const,
    badge: "Pillar 02 · Conversion",
    title: "High-Performance Digital Architecture",
    description:
      "Websites and web applications engineered with modern stacks that load in milliseconds, command instant trust, and systematically turn passive traffic into paying clients.",
    deliverables: ["Custom Fast Web Experiences", "E-Commerce & Funnel Engineering", "Interactive Web Portals"],
  },
  {
    icon: "video" as const,
    badge: "Pillar 03 · Attention",
    title: "Viral Short-Form Video & Motion",
    description:
      "High-retention video reels, cinematic 3D motion, and scroll-stopping social creative built for algorithm velocity to systematically double organic impressions and buyer interest.",
    deliverables: ["Short-Form Video Production (Reels/TikTok)", "3D & Motion Graphics", "Product Commercials & Ads"],
  },
  {
    icon: "bolt" as const,
    badge: "Pillar 04 · Scale",
    title: "AI Workflows & Growth Systems",
    description:
      "Intelligent AI customer agents, automated qualification funnels, and CRM pipelines that capture leads 24/7 so your brand converts while you sleep.",
    deliverables: ["Custom AI Support & Lead Bots", "Automated Booking Workflows", "Performance Creative Loops"],
  },
];

const transformationSteps = [
  {
    step: "01",
    phase: "Diagnostic & Moat Audit",
    summary:
      "We stress-test your existing customer touchpoints, reveal silent revenue leaks, and isolate your single strongest market advantage.",
  },
  {
    step: "02",
    phase: "Identity & Visual Sprints",
    summary:
      "Our directors and senior specialists build an undeniable brand world: typography, colour psychology, motion rules, and custom web blueprints.",
  },
  {
    step: "03",
    phase: "Asset & Engine Production",
    summary:
      "We build your digital flagship: lightning-fast code, high-retention video assets, and conversion-optimized sales pages shipped to standard.",
  },
  {
    step: "04",
    phase: "Market Launch & 2X Visibility",
    summary:
      "We roll out your new presence, activate algorithm-tailored video creative, and track organic engagement and inbound qualified leads.",
  },
];

export default function Agency() {
  const [filter, setFilter] = useState("All");
  const [path, setPath] = useState<"structured" | "custom" | "audit">("structured");
  const [sent, setSent] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditSent, setAuditSent] = useState(false);

  // In-page audit booking form state
  const [auditForm, setAuditForm] = useState({
    brandName: "",
    fullName: "",
    email: "",
    phone: "",
    websiteUrl: "",
    primaryChallenge: "Conversion & Sales",
    preferredFormat: "Live 20-min Strategic Call",
    notes: "",
  });

  const handleAuditSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const existing = JSON.parse(localStorage.getItem("kr8_brand_audits") || "[]");
      existing.unshift({
        ...auditForm,
        id: "audit_" + Date.now(),
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("kr8_brand_audits", JSON.stringify(existing));
    } catch {
      // fallback
    }
    setAuditSent(true);
  };

  const portfolio = getPortfolio();
  const items = filter === "All" ? portfolio : portfolio.filter((p) => p.service === filter);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="section-bg relative overflow-hidden pt-8 pb-20">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-bl from-pink-500/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Pill>Strategic Growth & Digital Agency</Pill>
            <h1 className="font-display mt-5 text-4xl leading-tight text-white sm:text-6xl font-bold">
              We Don't Just Design. We <span className="text-gradient">Re-Engineer</span> How Clients See and Pay You.
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg text-[#cabfe0] leading-relaxed">
              Most businesses look like ten other competitors in their industry. KR8 Agency breaks that cycle. We combine category-defining brand strategy, high-speed digital architecture, and algorithm-engineered video to make your business unmistakable and scale your revenue.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <GradientButton
                onClick={() => setShowAuditModal(true)}
                className="shadow-xl shadow-pink-500/25 cursor-pointer"
              >
                <span>Book a Free Brand Audit →</span>
              </GradientButton>
              <GhostButton href="#hire" className="border-white/20 bg-white/[0.04] hover:border-pink-500/40">
                <span>Start a Project</span>
              </GhostButton>
            </div>

            {/* Core Proof Metrics */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/10 pt-8">
              <div>
                <div className="font-display text-3xl sm:text-4xl text-gradient font-bold">+240%</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#a594c7] mt-1">Avg Visibility Lift</div>
              </div>
              <div>
                <div className="font-display text-3xl sm:text-4xl text-gradient font-bold">3.2x</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#a594c7] mt-1">Conversion Jump</div>
              </div>
              <div>
                <div className="font-display text-3xl sm:text-4xl text-gradient font-bold">120+</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#a594c7] mt-1">Client Deployments</div>
              </div>
              <div>
                <div className="font-display text-3xl sm:text-4xl text-gradient font-bold">100%</div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#a594c7] mt-1">Bespoke Strategy</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-pink-500/20 via-purple-600/15 to-transparent blur-2xl pointer-events-none" />
            <GlowImage src={IMG.studio} alt="KR8 Agency Studio & Production" className="aspect-[4/3] rounded-3xl" />
          </div>
        </div>
      </section>

      <Marquee items={["Brand transformation", "Positioning mastery", "Double your visibility", "Conversion web design", "Viral short-form engine", "Autonomous AI workflows", "Bespoke execution"]} />

      {/* 4 CORE TRANSFORMATION PILLARS */}
      <section className="section-bg py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead
            label="What We Deliver"
            title="The 4 pillars of"
            highlight="brand transformation"
            sub="We eliminate the guesswork. Every engagement is engineered to elevate your perception, dominate search and social feeds, and generate inbound customer demand."
            center
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {agencyTransformationPillars.map((p) => (
              <div
                key={p.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-300 hover:border-pink-500/40 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-pink-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">
                      {p.badge}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 group-hover:bg-gradient-pink group-hover:text-white transition-all">
                      <Icon name={p.icon} size={20} />
                    </div>
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white group-hover:text-pink-100 transition-colors">
                    {p.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8a7ba8] mb-2.5">Key Deliverables</p>
                  <div className="flex flex-wrap gap-2">
                    {p.deliverables.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#cabfe0]"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-STEP VELOCITY FRAMEWORK */}
      <section className="section-bg py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead
            label="Our Framework"
            title="How we take your brand"
            highlight="to the top"
            sub="A disciplined, four-phase sprint designed to execute quickly, validate early, and deliver outsized market impact."
            center
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {transformationSteps.map((s) => (
              <div
                key={s.step}
                className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 hover:border-purple-400/30 transition-all"
              >
                <div>
                  <span className="font-display text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-pink-400/80 to-purple-600/40">
                    {s.step}
                  </span>
                  <h4 className="mt-3 text-lg font-bold text-white">{s.phase}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-[#b8aecf]">{s.summary}</p>
                </div>
                <div className="mt-6 h-1 w-12 rounded-full bg-gradient-pink" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE BRAND AUDIT CALLOUT BANNER */}
      <section id="audit" className="py-12">
        <div className="mx-auto max-w-7xl px-5">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-pink-500/30 bg-gradient-to-br from-[#24003d] via-[#160027] to-[#0c0018] p-8 sm:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Limited Availability · 100% Free
                </span>
                <h3 className="font-display mt-4 text-3xl font-bold text-white sm:text-4xl">
                  Ready to 2X your visibility? Let's review your brand live.
                </h3>
                <p className="mt-3 text-sm sm:text-base text-[#cabfe0] leading-relaxed">
                  Book an unscripted 20-minute Brand Diagnostic with our senior creative director. We will pinpoint exactly where your current identity is leaking high-value leads and present an actionable blueprint to dominate your niche.
                </p>
                <div className="mt-6">
                  <GradientButton
                    onClick={() => setShowAuditModal(true)}
                    className="shadow-xl shadow-pink-500/30 cursor-pointer"
                  >
                    Book Your Free Brand Audit →
                  </GradientButton>
                </div>
                <p className="text-xs text-[#a594c7] mt-4">
                  Prefer to chat instead?{" "}
                  <a
                    href={CONTACT.whatsappTeam}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                  >
                    Message us on WhatsApp
                  </a>
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-wider text-pink-300 mb-3">What You Get On The Call:</p>
                <ul className="space-y-2.5 text-xs text-[#cabfe0]">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Direct review of your visual identity, typography, and website speed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Competitor moat dissection: why customers currently hesitate to buy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Tailored short-form video hooks designed for your exact audience.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Zero sales pressure, no locked contracts, pure strategic clarity.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERABLE PORTFOLIO SHOWCASE */}
      <section className="section-bg py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead
            label="Selected Work"
            title="Recent client"
            highlight="transformations"
            sub="Browse our live deployments across brand identity, e-commerce, web applications, and digital marketing."
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  filter === f
                    ? "bg-gradient-pink text-white shadow-lg shadow-pink-500/20"
                    : "border border-white/15 text-[#b8aecf] hover:border-white/30"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/10"
              >
                <div>
                  {/* Browser Mockup Top-Bar for Live Websites */}
                  {p.link && p.service.includes("Website") && (
                    <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-3.5 py-2 backdrop-blur-md">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500/80" />
                        <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                        <span className="h-2 w-2 rounded-full bg-green-500/80" />
                      </div>
                      <span className="text-[10px] font-mono text-[#b8aecf] truncate max-w-[180px]">
                        {"domain" in p ? (p as unknown as { domain: string }).domain : "live website"}
                      </span>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Live
                      </span>
                    </div>
                  )}

                  <div className="relative aspect-video overflow-hidden bg-black/40">
                    {p.link ? (
                      <a href={p.link} target="_blank" rel="noreferrer" className="block h-full w-full group/img">
                        <img
                          src={p.img}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <span className="flex items-center gap-1.5 rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-xl glow-pink-sm">
                            Open Project ↗
                          </span>
                        </div>
                      </a>
                    ) : (
                      <img
                        src={p.img}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-wider text-pink-400 font-semibold">{p.service}</p>
                    <h4 className="mt-1 font-bold text-white text-base">{p.title}</h4>
                    <p className="mt-1 text-xs text-[#8a7ba8]">Client: {p.client}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#b8aecf]">{p.description}</p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-500/10 px-3.5 py-2 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all"
                    >
                      <span>{p.service.includes("Website") ? "Visit Live Website" : "Open Project"}</span>
                      <span className="text-[11px]">↗</span>
                    </a>
                  )}
                  {p.showPrice && <p className="mt-2 inline-block rounded-full bg-white/5 px-3 py-1 text-xs text-[#cabfe0]">{p.price}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <GhostButton href={FULL_PORTFOLIO_LINK} className="border-white/20 hover:border-pink-500/40">
              View Our Full Portfolio & Case Studies →
            </GhostButton>
          </div>
        </div>
      </section>

      {/* HIRE SECTION */}
      <section id="hire" className="section-bg py-20 border-t border-white/5">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHead
            label="Let's Build Together"
            title="Start your brand"
            highlight="transformation"
            sub="Tell us where you are, where you want to go, and let's craft an experience that turns heads."
            center
          />

          <div className="mx-auto mt-8 flex max-w-lg justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
            <button
              onClick={() => { setPath("structured"); setSent(false); }}
              className={`flex-1 rounded-full px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                path === "structured" ? "bg-gradient-pink text-white shadow-lg shadow-pink-500/25" : "text-[#b8aecf]"
              }`}
            >
              Structured Project
            </button>
            <button
              onClick={() => { setPath("custom"); setSent(false); }}
              className={`flex-1 rounded-full px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                path === "custom" ? "bg-gradient-pink text-white shadow-lg shadow-pink-500/25" : "text-[#b8aecf]"
              }`}
            >
              Custom Quote
            </button>
            <button
              onClick={() => { setPath("audit"); setSent(false); }}
              className={`flex-1 rounded-full px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                path === "audit" ? "bg-gradient-pink text-white shadow-lg shadow-pink-500/25" : "text-[#b8aecf]"
              }`}
            >
              Free Brand Audit
            </button>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {sent ? (
              <Card className="flex flex-col items-center justify-center text-center p-10">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-pink text-white shadow-lg shadow-pink-500/30">
                  <Icon name="check" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {path === "audit"
                    ? "Brand Audit Request Received!"
                    : path === "custom"
                    ? "Custom Quote Request Received!"
                    : "Project Brief Received!"}
                </h3>
                <p className="mt-3 text-sm text-[#b8aecf] max-w-md">
                  A senior brand director will review your requirements and reach out within 12 hours. We have logged your request securely.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <GhostButton
                    onClick={() => setSent(false)}
                    className="border-white/20 text-xs text-white hover:border-pink-500/40"
                  >
                    Submit Another Inquiry
                  </GhostButton>
                  <p className="text-xs text-[#a594c7]">
                    Prefer to chat instead?{" "}
                    <a
                      href={CONTACT.whatsappTeam}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                    >
                      Message us on WhatsApp
                    </a>
                  </p>
                </div>
              </Card>
            ) : path === "audit" ? (
              <Card>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-bold text-white text-lg">Book a Free Brand Audit</h3>
                    <p className="text-xs text-[#a594c7] mt-0.5">
                      Complimentary 20-minute strategic diagnostic with our creative director.
                    </p>
                  </div>
                  <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase text-pink-300">
                    100% Free
                  </span>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                  className="mt-5 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      required
                      className={inputCls}
                      placeholder="Brand or Company Name *"
                    />
                    <input
                      required
                      className={inputCls}
                      placeholder="Your Full Name *"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="email"
                      required
                      className={inputCls}
                      placeholder="Work Email Address *"
                    />
                    <input
                      required
                      className={inputCls}
                      placeholder="Phone or WhatsApp Number *"
                    />
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Current Website or Instagram Handle (e.g. brand.com)"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select className={inputCls} defaultValue="Conversion & Sales">
                      <option value="Conversion & Sales">Primary Challenge: Low Conversions</option>
                      <option value="Visual Identity">Primary Challenge: Outdated Branding</option>
                      <option value="Video & Content">Primary Challenge: Low Video Reach</option>
                      <option value="High-Ticket Pricing">Primary Challenge: Price Shopped by Clients</option>
                      <option value="Other">Primary Challenge: Other</option>
                    </select>
                    <select className={inputCls} defaultValue="Live 20-min Strategic Call">
                      <option value="Live 20-min Strategic Call">Format: Live Video Call (Google Meet)</option>
                      <option value="Recorded Loom Video Teardown">Format: Recorded Loom Video Teardown</option>
                    </select>
                  </div>
                  <GradientButton type="submit" className="w-full shadow-lg shadow-pink-500/20">
                    Book Free Brand Audit Request →
                  </GradientButton>
                  <p className="text-xs text-[#a594c7] text-center pt-2">
                    Prefer to chat instead?{" "}
                    <a
                      href={CONTACT.whatsappTeam}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                    >
                      Message us on WhatsApp
                    </a>
                  </p>
                </form>
              </Card>
            ) : path === "structured" ? (
              <Card>
                <h3 className="font-bold text-white text-lg">Structured Project Request</h3>
                <p className="text-xs text-[#a594c7] mt-1">Fill out the details below to receive a formal project proposal.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <select className={inputCls}>
                    <option value="">Primary Service Needed</option>
                    <option>Brand Identity & Strategy</option>
                    <option>Website Design & Web App</option>
                    <option>Short-Form Video Production</option>
                    <option>AI Automation & Funnels</option>
                    <option>Full Brand Overhaul (All Pillars)</option>
                  </select>
                  <input className={inputCls} placeholder="Target Timeline (e.g. 3-4 Weeks)" />
                  <input className={inputCls} placeholder="Estimated Budget Range" />
                  <select className={inputCls}>
                    <option value="">Client Type</option>
                    <option>High-Growth Startup</option>
                    <option>Established Business / Enterprise</option>
                    <option>Creator / Personal Brand</option>
                    <option>Non-Profit / Institution</option>
                  </select>
                  <input className={inputCls} placeholder="Your Full Name" />
                  <input className={inputCls} placeholder="Email Address or Phone" />
                </div>
                <GradientButton onClick={() => setSent(true)} className="mt-6 w-full shadow-lg shadow-pink-500/20">
                  Submit Project Request →
                </GradientButton>
                <p className="text-xs text-[#a594c7] text-center mt-4">
                  Prefer to chat instead?{" "}
                  <a
                    href={CONTACT.whatsappTeam}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                  >
                    Message us on WhatsApp
                  </a>
                </p>
              </Card>
            ) : (
              <Card>
                <h3 className="font-bold text-white text-lg">Custom Quote Request</h3>
                <p className="mt-1 text-xs text-[#a594c7]">
                  For non-standard projects, consultations, or bespoke scopes — let us know your goals.
                </p>
                <textarea
                  className={`${inputCls} mt-4`}
                  rows={4}
                  placeholder="Tell us about your brand, current challenges, and what you aim to achieve..."
                />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <select className={inputCls}>
                    <option value="">Urgency Level</option>
                    <option>Immediate / Urgent</option>
                    <option>Within 2-3 Weeks</option>
                    <option>Planning for Next Quarter</option>
                  </select>
                  <input className={inputCls} placeholder="Approximate Budget (Optional)" />
                  <input className={inputCls} placeholder="Your Name" />
                  <input className={inputCls} placeholder="Email or Phone" />
                </div>
                <GradientButton onClick={() => setSent(true)} className="mt-6 w-full shadow-lg shadow-pink-500/20">
                  Request Custom Quote →
                </GradientButton>
                <p className="text-xs text-[#a594c7] text-center mt-4">
                  Prefer to chat instead?{" "}
                  <a
                    href={CONTACT.whatsappTeam}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                  >
                    Message us on WhatsApp
                  </a>
                </p>
              </Card>
            )}

            <Card className="flex flex-col justify-between bg-gradient-to-br from-[#1a0030] to-[#12001f] border-pink-500/20 p-7">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-pink-400">Enterprise Standards</span>
                <h3 className="font-display text-2xl text-white font-bold mt-2">Engineered for Impact</h3>
                <p className="mt-3 text-sm text-[#cabfe0] leading-relaxed">
                  Every client engagement receives dedicated creative direction, transparent sprint deliverables, and production-ready source files.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs text-[#cabfe0]">
                  <li className="flex items-center gap-2">
                    <span className="text-pink-400">✦</span>
                    <span>Dedicated Senior Creative Director</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-400">✦</span>
                    <span>Transparent Weekly Sprint Reviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-400">✦</span>
                    <span>Full Commercial Rights & Source Assets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-pink-400">✦</span>
                    <span>Post-Deployment Conversion Tracking</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 space-y-2 text-xs text-[#cabfe0]">
                <p className="flex items-center gap-2">
                  <span className="text-pink-400">📞</span>
                  <span>{CONTACT.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-pink-400">✉️</span>
                  <span className="break-all">{CONTACT.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-pink-400">📍</span>
                  <span>Lagos & Global Remote</span>
                </p>
                <p className="pt-3 border-t border-white/10 text-[11px] text-[#a594c7]">
                  Prefer to chat instead?{" "}
                  <a
                    href={CONTACT.whatsappTeam}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                  >
                    Message us on WhatsApp
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* DEDICATED IN-PAGE BRAND AUDIT MODAL */}
      {showAuditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAuditModal(false);
              setAuditSent(false);
            }
          }}
        >
          <div className="relative w-full max-w-xl rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#1c002c] to-[#0c0018] p-6 sm:p-8 shadow-2xl my-8">
            <button
              onClick={() => {
                setShowAuditModal(false);
                setAuditSent(false);
              }}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#cabfe0] hover:bg-white/20 hover:text-white transition-all text-lg"
              aria-label="Close modal"
            >
              ×
            </button>

            {auditSent ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-pink text-white shadow-xl glow-pink-sm">
                  <Icon name="check" size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Brand Audit Request Received!</h3>
                <p className="mt-3 text-sm text-[#cabfe0] leading-relaxed max-w-md mx-auto">
                  Our senior creative director will review your assets and send your private calendar invitation and diagnostic details within 24 hours.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  <GradientButton
                    onClick={() => {
                      setShowAuditModal(false);
                      setAuditSent(false);
                    }}
                    className="shadow-lg shadow-pink-500/25"
                  >
                    Done
                  </GradientButton>
                  <p className="text-xs text-[#a594c7]">
                    Prefer to chat instead?{" "}
                    <a
                      href={CONTACT.whatsappTeam}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                    >
                      Message us on WhatsApp
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-pink-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  100% Free · Zero Obligation
                </span>
                <h3 className="font-display mt-3 text-2xl sm:text-3xl font-bold text-white">
                  Book Your Free Brand Audit
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#cabfe0] leading-relaxed">
                  A 20-minute strategic diagnostic with our creative director. We will dissect your identity, positioning, and conversion friction to give you a clear roadmap.
                </p>

                <form onSubmit={handleAuditSubmit} className="mt-5 space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#a594c7] block mb-1">Brand or Business Name *</label>
                      <input
                        required
                        value={auditForm.brandName}
                        onChange={(e) => setAuditForm({ ...auditForm, brandName: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. Acme Studio"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#a594c7] block mb-1">Your Full Name *</label>
                      <input
                        required
                        value={auditForm.fullName}
                        onChange={(e) => setAuditForm({ ...auditForm, fullName: e.target.value })}
                        className={inputCls}
                        placeholder="e.g. Alex Morgan"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#a594c7] block mb-1">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={auditForm.email}
                        onChange={(e) => setAuditForm({ ...auditForm, email: e.target.value })}
                        className={inputCls}
                        placeholder="alex@acme.com"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#a594c7] block mb-1">Phone Number *</label>
                      <input
                        required
                        value={auditForm.phone}
                        onChange={(e) => setAuditForm({ ...auditForm, phone: e.target.value })}
                        className={inputCls}
                        placeholder="+234 ... or +1 ..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#a594c7] block mb-1">Website or Social Handle</label>
                    <input
                      value={auditForm.websiteUrl}
                      onChange={(e) => setAuditForm({ ...auditForm, websiteUrl: e.target.value })}
                      className={inputCls}
                      placeholder="e.g. yourbrand.com or @yourhandle"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#a594c7] block mb-1">Primary Growth Bottleneck</label>
                      <select
                        value={auditForm.primaryChallenge}
                        onChange={(e) => setAuditForm({ ...auditForm, primaryChallenge: e.target.value })}
                        className={inputCls}
                      >
                        <option value="Conversion & Sales">Low Website Conversions</option>
                        <option value="Visual Identity">Outdated Visual Identity</option>
                        <option value="Video & Content">Weak Social & Video Presence</option>
                        <option value="High-Ticket Pricing">Trouble Charging Premium Rates</option>
                        <option value="Other">Other / General Strategy</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#a594c7] block mb-1">Preferred Delivery</label>
                      <select
                        value={auditForm.preferredFormat}
                        onChange={(e) => setAuditForm({ ...auditForm, preferredFormat: e.target.value })}
                        className={inputCls}
                      >
                        <option value="Live 20-min Strategic Call (Google Meet)">Live Video Call (Google Meet)</option>
                        <option value="Recorded Loom Video Teardown">Recorded Loom Video Teardown</option>
                      </select>
                    </div>
                  </div>

                  <GradientButton type="submit" className="w-full mt-2 shadow-xl shadow-pink-500/25">
                    Submit Free Brand Audit Request →
                  </GradientButton>

                  <p className="text-xs text-[#a594c7] text-center pt-2">
                    Prefer to chat instead?{" "}
                    <a
                      href={CONTACT.whatsappTeam}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-400 hover:text-pink-300 underline underline-offset-2"
                    >
                      Message us on WhatsApp
                    </a>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
