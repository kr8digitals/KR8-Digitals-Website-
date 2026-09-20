import { useState } from "react";
import { CONTACT, getFounders, getTeam, PARTNERS } from "../data/store";
import { Pill, GradientButton, GhostButton, SectionHead, Card, Check, ImageWithFallback } from "../components/ui";
import Icon from "../components/Icon";

const pillars = [
  {
    icon: "certificate" as const,
    t: "Tuition-Free Skill Acceleration",
    d: "Battle-tested, portfolio-first cohorts in Graphic Design, Full-Stack Web, and Video Motion. Real accountability, zero fees.",
  },
  {
    icon: "users" as const,
    t: "An Unbroken Creative Tribe",
    d: "A borderless family of 3,000+ creators sharing client leads, critiquing raw drafts, and killing the loneliness of solo freelancing.",
  },
  {
    icon: "video" as const,
    t: "Graduate-Powered Studio",
    d: "Our top graduates team up with senior directors to engineer high-converting websites, visual identities, and video engines for global brands.",
  },
];

export default function About() {
  const [form, setForm] = useState({ name: "", org: "", email: "", phone: "", type: "", details: "", links: "" });
  const [sent, setSent] = useState(false);
  const founders = getFounders();
  const team = getTeam();
  const inputCls = "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

  return (
    <div className="section-bg">
      <section className="py-20 border-b border-white/5">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <Pill>Our Mission & Manifesto</Pill>
          <h1 className="font-display mt-5 text-4xl uppercase text-white sm:text-6xl font-bold">
            Raw African talent is everywhere. <span className="text-gradient">Access is not.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#cabfe0] leading-relaxed">
            KR8 Digitals was forged to kill the predatory paywalls and gatekeeping of the tech and creative economy. We believe world-class education should be free, community should feel like family, and high-income skills should translate directly into economic independence.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-6 sm:grid-cols-3">
            {pillars.map((p) => (
              <Card key={p.t} className="flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white shadow-lg shadow-pink-500/20">
                    <Icon name={p.icon} size={22} />
                  </div>
                  <h3 className="font-bold text-white text-lg">{p.t}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#b8aecf]">{p.d}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Executive Founder Portrait Card matching Co-Founders Layout */}
          <div className="group relative mx-auto w-full max-w-2xl lg:max-w-none overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-4 sm:p-6 shadow-2xl transition-all duration-500 hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-500/20">
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-pink-500/25 via-purple-600/20 to-transparent opacity-50 blur-2xl transition-opacity group-hover:opacity-80" />

            {/* Portrait Frame with Horizontally Widened Authentic Backdrop */}
            <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black/60 ring-1 ring-white/15 shadow-2xl">
              <ImageWithFallback
                src="/founder_timfire_wide.jpg"
                alt="Kenneth Timothy Iziogo (Timfire) — Founder & CEO"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                fallbackClassName="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-900/40 text-4xl font-display text-pink-300"
              />
              {/* Seamless Bottom Vignette Gradient blending into page background */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0015] via-[#0d0015]/20 to-transparent pointer-events-none" />

              {/* Founder Spotlight Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xl glow-pink-sm">
                  Founder & CEO
                </span>
              </div>

              {/* Name & Studio tag overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <h3 className="font-display text-2xl font-bold text-white drop-shadow-md sm:text-3xl">
                  Kenneth Timothy Iziogo
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-pink-300 drop-shadow-sm">
                  Also known as Timfire · Lead Architect
                </p>
              </div>
            </div>
          </div>

          <div>
            <Pill>Founder & Visionary</Pill>
            <h2 className="font-display mt-4 text-4xl uppercase text-white sm:text-5xl font-bold">
              Kenneth Timothy Iziogo <span className="text-gradient">(Timfire)</span>
            </h2>
            <p className="mt-4 text-base text-[#cabfe0] leading-relaxed">
              Full-stack software engineer, autonomous AI agent architect, brand designer, video director, and linguistics scholar. Kenneth founded KR8 Digitals to provide the exact ladder, ruthless technical standards, and warm community he wished existed when he picked up his first creative software.
            </p>
            <div className="mt-6 space-y-3.5 text-sm text-[#b8aecf]">
              <Check>Democratizing elite digital skills with zero monetary entry barrier.</Check>
              <Check>Replacing academic certificate inflation with verifiable proof and client work.</Check>
              <Check>Building a direct highway from raw beginner to high-ticket agency earner.</Check>
            </div>
          </div>
        </div>
      </section>

      {/* Co-founders */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="Co-Founders & Core Leadership" title="Built with" highlight="purpose & vision" center />
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2">
            {founders.filter((c) => c.key === "stevenson" || c.key === "daniel").slice(0, 2).map((c) => (
              <div
                key={c.key}
                className="group relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 transition-all duration-300 hover:border-pink-400/50 hover:shadow-2xl hover:shadow-pink-500/10"
              >
                {/* Prominent Portrait Image */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10 shadow-2xl">
                  <ImageWithFallback
                    src={c.photo}
                    alt={c.name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    fallbackClassName="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-900/40 text-4xl font-display text-pink-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d0015] via-[#0d0015]/20 to-transparent" />

                  {/* Co-Founder Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg glow-pink-sm">
                      Co-Founder
                    </span>
                  </div>

                  {/* Name and Role overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-2xl font-bold text-white drop-shadow-md sm:text-3xl">
                      {c.name}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-pink-300 drop-shadow-sm mt-1">
                      {c.role}
                    </p>
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="mt-5 space-y-3">
                  <p className="text-sm leading-relaxed text-[#cabfe0]">
                    {c.bio}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-300 border border-pink-400/20">
                      {c.key === "stevenson" ? "Graphic Design Track Lead" : "Video Editing & Motion Lead"}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#cabfe0]">
                      {c.key === "stevenson" ? "Motionverse Studio" : "Creative Expression Studio"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="Our dedicated team" title="The people who keep KR8" highlight="moving" center />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => <Card key={member.key} className="text-center"><ImageWithFallback src={member.photo} alt={member.name} className="mx-auto h-28 w-28 rounded-2xl object-cover ring-2 ring-pink-400/30" fallbackClassName="mx-auto h-28 w-28 rounded-2xl border border-pink-400/40" /><h3 className="mt-4 font-bold text-white">{member.name}</h3><p className="mt-1 text-sm text-pink-400">{member.role}</p><p className="mt-3 text-left text-xs leading-relaxed text-[#b8aecf]">{member.bio}</p></Card>)}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <SectionHead
            label="Strategic Partners & Enablers"
            title="In our corner for the"
            highlight="creative revolution"
            sub="Forward-thinking companies, media houses, and platforms backing our mission to educate and empower African youth."
            center
          />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{PARTNERS.map((partner) => <span key={partner} className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-[#cabfe0]">{partner}</span>)}</div>
        </div>
      </section>

      {/* Partner form */}
      <section className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-2xl px-5">
          <SectionHead
            label="Sponsor, Hire or Collaborate"
            title="Let's build lasting"
            highlight="economic impact"
            sub="Whether you want to sponsor students, hire our pre-vetted design and engineering graduates, or co-build commercial projects with KR8 Agency, tell us what you're thinking."
            center
          />
          <div className="mt-8">
            {sent ? (
              <Card className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="users" size={24} /></div>
                <h3 className="text-xl font-bold text-white">Thank you!</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">Your partnership request has been received. Our leadership team will review and connect with you within 24 hours.</p>
              </Card>
            ) : (
              <Card>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className={inputCls} placeholder="Organisation / Brand name" value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} />
                  <input className={inputCls} placeholder="Work email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <input className={inputCls} placeholder="Phone / WhatsApp number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <select className={`${inputCls} mt-4`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="">Select partnership objective</option>
                  {["Sponsoring Student Cohorts & Equipment", "Hiring Pre-Vetted KR8 Graduates", "Commercial Agency Retainer", "Content & Media Collaboration", "Strategic Institutional Partnership"].map((t) => <option key={t}>{t}</option>)}
                </select>
                <textarea className={`${inputCls} mt-4`} rows={3} placeholder="Tell us how you would like to collaborate..." value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
                <input className={`${inputCls} mt-4`} placeholder="Website, LinkedIn, or Portfolio Link (optional)" value={form.links} onChange={(e) => setForm({ ...form, links: e.target.value })} />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <GradientButton onClick={() => form.name && setSent(true)} className="flex-1 shadow-lg shadow-pink-500/25">Submit Partnership Proposal →</GradientButton>
                  <GhostButton href={CONTACT.whatsappTeam} className="flex-1">Direct Chat via WhatsApp</GhostButton>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
