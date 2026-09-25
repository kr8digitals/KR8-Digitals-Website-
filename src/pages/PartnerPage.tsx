import { useState } from "react";
import { Link } from "react-router-dom";
import { saveClientRequest, PARTNERS } from "../data/store";
import { Pill, GradientButton, SectionHead, Card } from "../components/ui";
import Icon from "../components/Icon";

const PATHWAYS = [
  {
    id: "support-training",
    title: "Support Tuition-Free Training",
    badge: "High Social Impact",
    icon: "sparkles",
    tagline: "Your ₦2,000 can keep a student connected, learning, and off the streets.",
    desc: "KR8 Digitals trains youths with zero tuition. But data subscriptions, electricity in local learning hubs, generator fuel, and software tools cost real resources. A contribution of just ₦2,000, ₦10,000, or ₦50,000 directly subsidizes internet data and learning equipment for students who have boundless drive but no financial cushion.",
    bullets: [
      "100% transparent fund allocation toward verified student internet & power",
      "Direct updates on cohort learning milestones and graduation showcases",
      "Option to remain anonymous or receive public patron recognition",
    ],
    actionText: "Support Student Training",
  },
  {
    id: "hire-graduates",
    title: "Hire Pre-Vetted KR8 Graduates",
    badge: "Direct Talent Pipeline",
    icon: "users",
    tagline: "Access hungry, verified designers, video editors, and frontend builders.",
    desc: "Tired of sorting through unverified CVs and low-effort freelance proposals? KR8 Digitals graduates have undergone rigorous 8-week bootcamps, submitted 6+ verified real-client assignments, and defended their portfolios before senior directors. Hire top African creative and technical talent ready to hit the ground running on day one.",
    bullets: [
      "Zero recruitment agency markups or placement fees",
      "Review actual portfolio case studies, live code repos, and verified credentials",
      "Direct placement across Graphic Design, Video Motion, Web, and Front-End",
    ],
    actionText: "Request Candidate Portfolios",
  },
  {
    id: "sponsor-cohort",
    title: "Sponsor a Student or Cohort",
    badge: "Named Scholarship",
    icon: "award",
    tagline: "Put your name or corporate brand behind the next creative generation.",
    desc: "Fund dedicated learning tracks for 5, 20, or an entire cohort of 100 students. As a named sponsor, your organization receives full branding across the cohort academy page, certificates, graduation ceremony spotlights, and first right of interview for the graduating talent.",
    bullets: [
      "Official 'Sponsored by [Your Brand]' cohort naming rights",
      "Co-designed graduation challenge solving real problems for your industry",
      "Comprehensive impact and attendance reports delivered to your team",
    ],
    actionText: "Sponsor a Cohort",
  },
  {
    id: "tech-resources",
    title: "Provide Equipment, Tech & Hub Resources",
    badge: "Hardware & Tools",
    icon: "laptop",
    tagline: "Laptops, tablets, creative software, and hub connectivity.",
    desc: "Many talented students share a single borrowed phone or old laptop with family members. Technology partners empower our creators by donating refurbished or new laptops, drawing tablets, licensed creative software licenses, cloud credits, or sponsoring high-speed hub workspaces.",
    bullets: [
      "Direct equipment delivery tracking to high-performing, needy students",
      "Tax-deductible CSR equipment documentation provided",
      "Brand recognition across all KR8 physical and virtual learning hubs",
    ],
    actionText: "Donate Tech Resources",
  },
  {
    id: "mentorship",
    title: "Industry Mentorship & Masterclasses",
    badge: "Knowledge Sharing",
    icon: "message",
    tagline: "Pour your senior industry experience into eager, hungry learners.",
    desc: "Are you a creative director, senior software engineer, agency founder, or product strategist? Partner with us by hosting a 60-minute virtual masterclass, reviewing graduating student portfolios, or mentoring top learners on international client negotiations and remote work etiquette.",
    bullets: [
      "Speak directly to 3,000+ creators across Nigeria and the African diaspora",
      "Give back to the creative ecosystem with zero monetary requirement",
      "Discover and mentor tomorrow's design and engineering leaders early",
    ],
    actionText: "Join as Guest Mentor",
  },
  {
    id: "strategic-csr",
    title: "Strategic CSR & Agency Co-Building",
    badge: "Corporate Collaboration",
    icon: "globe",
    tagline: "Align your corporate mission with verifiable youth economic empowerment.",
    desc: "Partner with KR8 Digitals to deploy CSR budgets where impact is mathematically measurable. Collaborate on national youth digital literacy initiatives, co-brand creative hackathons, or commission KR8 Agency to build your digital assets powered by our senior directors and top graduates.",
    bullets: [
      "Measurable ESG & CSR impact metrics (youth trained, jobs secured, income generated)",
      "National visibility across social media, student networks, and press releases",
      "Custom multi-year partnership frameworks tailored to institutional objectives",
    ],
    actionText: "Initiate Strategic Partnership",
  },
];

export default function PartnerPage() {
  const [selectedPathway, setSelectedPathway] = useState("Support Tuition-Free Training");
  const [form, setForm] = useState({
    name: "",
    org: "",
    email: "",
    phone: "",
    pathway: "Support Tuition-Free Training",
    contributionType: "Financial / Internet Subsidy",
    budget: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter your contact name.");
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setFormError("Please enter an email or phone number.");
      return;
    }
    if (!form.message.trim()) {
      setFormError("Please share brief details about how you would like to partner.");
      return;
    }

    setSubmitting(true);
    const res = saveClientRequest({
      type: "partnership",
      title: `Partnership: ${form.pathway} (${form.org || form.name})`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      details: {
        organization: form.org || "Individual Patron",
        pathway: form.pathway,
        contributionType: form.contributionType,
        budget: form.budget || "Flexible / Discussion",
        message: form.message,
      },
    });

    setSubmitting(false);
    if (!res.success) {
      setFormError(res.error || "Failed to submit proposal. Please try again.");
      return;
    }

    setSent(true);
  };

  const handleSelectPathway = (title: string) => {
    setSelectedPathway(title);
    setForm((prev) => ({ ...prev, pathway: title }));
    const formEl = document.getElementById("partner-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-500 focus:outline-none transition-colors";

  return (
    <div className="section-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 border-b border-white/5 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[800px] rounded-full bg-gradient-to-b from-purple-900/20 via-pink-900/15 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-5 text-center">
          <Pill>Official Partnership Proposition</Pill>

          <h1 className="font-display mt-5 text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            Turn Raw African Potential Into <span className="text-gradient">Economic Sovereignty.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-[#cabfe0] leading-relaxed">
            Millions of brilliant young minds across Africa want to work, create, and build. What stands between them and high-income digital careers isn't lack of intelligence—it is access to structured training, hardware, and client opportunities.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href="#pathways" className="inline-block">
              <GradientButton className="shadow-xl shadow-pink-500/25">
                Explore Partnership Pathways ↓
              </GradientButton>
            </a>
            <a
              href="#partner-form"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              Submit Partnership Pitch →
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <span className="font-display text-3xl font-extrabold text-white block">3,000+</span>
              <span className="text-xs text-[#a594c7]">Youth Trained Tuition-Free</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <span className="font-display text-3xl font-extrabold text-pink-300 block">21+</span>
              <span className="text-xs text-[#a594c7]">Verified Video Testimonials</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <span className="font-display text-3xl font-extrabold text-white block">₦0</span>
              <span className="text-xs text-[#a594c7]">Tuition Barrier for Students</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <span className="font-display text-3xl font-extrabold text-emerald-300 block">100%</span>
              <span className="text-xs text-[#a594c7]">Portfolio-Proven Graduation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner With KR8 Digitals? */}
      <section className="py-16 lg:py-20 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead
            label="Why Partner With Us?"
            title="The KR8 Difference:"
            highlight="Real Skills, Zero Fluff"
            sub="We are not a certificate mill or a corporate talk shop. We build creators who actually do the work."
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white shadow-lg shadow-pink-500/20">
                  <Icon name="check" size={22} />
                </div>
                <h3 className="text-lg font-bold text-white">Ruthless Verification Standards</h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#b8aecf]">
                  No student receives a KR8 certificate merely for showing up. They must complete 6+ accepted client-style briefs and defend a final project before our leadership team. When you sponsor or hire from KR8, you back verified competence.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/30 text-purple-300 shadow-lg border border-purple-500/30">
                  <Icon name="bolt" size={22} />
                </div>
                <h3 className="text-lg font-bold text-white">Direct Economic Elevation</h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#b8aecf]">
                  We bridge learners directly into KR8 Agency commercial retainers, international remote contracts, and local brand design gigs. Every naira or dollar invested here creates compounding financial independence for African families.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-600/30 text-pink-300 shadow-lg border border-pink-500/30">
                  <Icon name="heart" size={22} />
                </div>
                <h3 className="text-lg font-bold text-white">A Deep, Unbroken Community</h3>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#b8aecf]">
                  Our students do not disappear after graduation. They remain active inside the KR8 Tribe, peer-mentoring younger cohorts, sharing paid gig referrals, and building collective creative studios.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 6 Distinct Partnership Pathways */}
      <section id="pathways" className="py-16 lg:py-20 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-5">
          <SectionHead
            label="Flexible Collaboration Pathways"
            title="Six Legitimate Ways to"
            highlight="Partner With KR8 Digitals"
            sub="Choose the pathway that matches your organization's mission, CSR agenda, or individual philanthropic desire."
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PATHWAYS.map((p) => {
              const isSelected = selectedPathway === p.title;
              return (
                <div
                  key={p.id}
                  className={`group relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 backdrop-blur-md ${
                    isSelected
                      ? "border-pink-500 bg-pink-500/10 shadow-2xl glow-pink-sm"
                      : "border-white/10 bg-white/[0.03] hover:border-pink-400/40 hover:bg-white/[0.05]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-300">
                        {p.badge}
                      </span>
                      <span className="text-xl">
                        {p.id === "support-training" ? "🌱" : p.id === "hire-graduates" ? "💼" : p.id === "sponsor-cohort" ? "🏆" : p.id === "tech-resources" ? "💻" : p.id === "mentorship" ? "🎓" : "🏛️"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mt-3.5 leading-snug">
                      {p.title}
                    </h3>

                    <p className="text-xs font-semibold text-pink-300 mt-1 italic">
                      "{p.tagline}"
                    </p>

                    <p className="mt-3 text-xs leading-relaxed text-[#b8aecf]">
                      {p.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      {p.bullets.map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-[#cabfe0]">
                          <span className="text-pink-400 font-bold">✓</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => handleSelectPathway(p.title)}
                      className="w-full rounded-xl bg-white/10 hover:bg-pink-600 hover:text-white px-4 py-2.5 text-xs font-bold text-white transition-all text-center flex items-center justify-center gap-2 group-hover:bg-gradient-pink"
                    >
                      <span>{p.actionText} →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strategic Partners & Brand Trust */}
      <section className="py-14 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-5 text-center">
          <SectionHead
            label="Trusted Collaborators"
            title="Backed by Visionaries &"
            highlight="Industry Champions"
            center
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {PARTNERS.map((partner) => (
              <span
                key={partner}
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs sm:text-sm font-semibold text-[#cabfe0] backdrop-blur-sm"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* The Interactive Partnership Proposal Form */}
      <section id="partner-form" className="py-20">
        <div className="mx-auto max-w-3xl px-5">
          <SectionHead
            label="Take the First Step"
            title="Submit Your"
            highlight="Partnership Proposal"
            sub="Tell us how you would like to collaborate. Our leadership team (Kenneth Timothy & Co-Founders) reviews each submission personally and responds within 24 hours."
            center
          />

          <div className="mt-10">
            {sent ? (
              <Card className="text-center p-8 sm:p-12 border-pink-500/40 bg-pink-500/10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-pink text-white text-3xl shadow-xl glow-pink">
                  ✓
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Proposal Received!</h3>
                <p className="mt-2 text-sm text-[#cabfe0] max-w-md mx-auto leading-relaxed">
                  Thank you for stepping forward to build with KR8 Digitals. We have recorded your interest in <strong className="text-pink-300">{form.pathway}</strong>. An executive director will reach out to you via email/WhatsApp within 24 hours to coordinate next steps.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: "",
                        org: "",
                        email: "",
                        phone: "",
                        pathway: "Support Tuition-Free Training",
                        contributionType: "Financial / Internet Subsidy",
                        budget: "",
                        message: "",
                      });
                    }}
                    className="rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition-all"
                  >
                    Submit Another Proposal
                  </button>
                  <Link
                    to="/academy"
                    className="rounded-xl bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 transition-all"
                  >
                    Visit Academy →
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="border border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-6 sm:p-10 shadow-2xl">
                {formError && (
                  <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        required
                        className={inputCls}
                        placeholder="e.g. Dr. Adaobi Okon"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                        Organisation / Brand / Entity Name
                      </label>
                      <input
                        className={inputCls}
                        placeholder="e.g. Acme Tech Africa or Individual Patron"
                        value={form.org}
                        onChange={(e) => setForm({ ...form, org: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className={inputCls}
                        placeholder="adaobi@organization.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                        WhatsApp / Phone Number
                      </label>
                      <input
                        type="tel"
                        className={inputCls}
                        placeholder="+234 800 000 0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                        Preferred Partnership Pathway *
                      </label>
                      <select
                        className={`${inputCls} cursor-pointer`}
                        value={form.pathway}
                        onChange={(e) => setForm({ ...form, pathway: e.target.value })}
                      >
                        {PATHWAYS.map((p) => (
                          <option key={p.id} value={p.title} className="bg-[#12001f] text-white">
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                        Contribution or Resource Scope
                      </label>
                      <select
                        className={`${inputCls} cursor-pointer`}
                        value={form.contributionType}
                        onChange={(e) => setForm({ ...form, contributionType: e.target.value })}
                      >
                        <option value="Financial / Internet Subsidy" className="bg-[#12001f] text-white">
                          Financial / Internet Data Subsidies (₦2,000 - ₦500,000+)
                        </option>
                        <option value="Hiring Full-Time or Contract Talent" className="bg-[#12001f] text-white">
                          Hiring Full-Time or Contract Talent
                        </option>
                        <option value="Cohort Sponsorship & Naming" className="bg-[#12001f] text-white">
                          Cohort Sponsorship & Naming
                        </option>
                        <option value="Hardware / Laptops / Software Credits" className="bg-[#12001f] text-white">
                          Hardware / Laptops / Software Credits
                        </option>
                        <option value="Executive Mentorship / Masterclass" className="bg-[#12001f] text-white">
                          Executive Mentorship / Masterclass
                        </option>
                        <option value="Corporate CSR & Strategic Co-Building" className="bg-[#12001f] text-white">
                          Corporate CSR & Strategic Co-Building
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                      Estimated Budget / Scale (Optional)
                    </label>
                    <input
                      className={inputCls}
                      placeholder="e.g. ₦50,000 one-time, $2,000/cohort, 5 laptops, or 2 junior designer openings"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#b8aecf] mb-1.5">
                      Partnership Vision & Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className={`${inputCls} resize-none`}
                      placeholder="Tell us what you want to achieve together, target timelines, or any specific questions you have for our team..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <div className="pt-3">
                    <GradientButton
                      type="submit"
                      disabled={submitting}
                      className="w-full justify-center py-3 shadow-xl shadow-pink-500/25"
                    >
                      <span>{submitting ? "Submitting Proposal..." : "Submit Partnership Proposal →"}</span>
                    </GradientButton>
                    <p className="mt-2.5 text-center text-[11px] text-[#7d6f96]">
                      We respect your privacy. Submissions go straight to the executive leadership team.
                    </p>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
