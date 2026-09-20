import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IMG } from "../data/images";
import { getPortfolio, BLOG, getTestimonials, FULL_PORTFOLIO_LINK, getAnnouncements, getHomepageSettings, studentCount, tribeCount } from "../data/store";
import Marquee from "../components/Marquee";
import LiveFeed from "../components/LiveFeed";
import LeaderboardList from "../components/LeaderboardList";
import TestimonialCarousel from "../components/TestimonialCarousel";
import { Pill, GradientButton, GhostButton, SectionHead, Card, GlowImage } from "../components/ui";
import Dashboard from "./Dashboard";
import Icon from "../components/Icon";
import HeroInteractiveCanvas from "../components/HeroInteractiveCanvas";

export default function Home() {
  const { student } = useAuth();
  if (student) return <Dashboard />;
  return <GuestHome />;
}

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !seen) {
        setSeen(true);
        const dur = 1200, start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          setN(Math.floor(p * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, seen]);
  return <div ref={ref} className="font-display min-w-0 text-2xl text-gradient sm:text-5xl">{n.toLocaleString()}{suffix}</div>;
}

const pillars = [
  {
    icon: "certificate" as const,
    label: "The Academy",
    title: "Zero Tuition. Pure Craft.",
    desc: "Intensive week-by-week cohorts in Graphic Design, Web Engineering, and Video Editing. Real tutors, live feedback, verifiable graduation certificates — 100% free.",
    to: "/academy",
  },
  {
    icon: "users" as const,
    label: "The Tribe",
    title: "Never Build Alone Again.",
    desc: "An unbroken African creative family. Share messy in-progress drafts, find collaborators, exchange paid gigs, and lift each other into high-income careers.",
    to: "/tribe",
  },
  {
    icon: "video" as const,
    label: "The Agency",
    title: "From Free Classes to Paid Retainers.",
    desc: "We engineer brand positioning, conversion websites, and viral short-form video engines for global companies — executed by our vetted senior directors and top graduates.",
    to: "/agency",
  },
];

const journey = [
  { n: "1", t: "Claim Your Verifiable KR8 ID in 60s" },
  { n: "2", t: "Show Up & Ship Daily Live Drills" },
  { n: "3", t: "Earn XP & Build an Undeniable Portfolio" },
  { n: "4", t: "Climb the Leaderboard & Get Discovered" },
  { n: "5", t: "Graduate & Step into Paid Client Work" },
];

function GuestHome() {
  const announcements = getAnnouncements();
  const portfolio = getPortfolio();
  const homepageSettings = getHomepageSettings();
  return (
    <div>
      {/* HERO SECTION — Cinematic & Engaging Experience */}
      <section className="hero-section relative min-h-[auto] md:min-h-[80vh] flex items-center overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-16 md:pt-7 md:pb-20">
        {/* Dynamic Quiet Background Canvas & Ambient Floating Objects */}
        <HeroInteractiveCanvas />

        <div className="hero-container relative z-10 mx-auto grid max-w-7xl items-center gap-8 md:gap-12 px-5 lg:grid-cols-12">
          {/* Left Column: Typography, Bulletins, CTAs & Glass Stats */}
          <div className="hero-content rise-in lg:col-span-7">
            {/* Institution Badge with live pulsing status — Centered in the middle on desktop, laptop & mobile, 1 line on mobile */}
            <div className="flex w-full justify-center mb-3 sm:mb-4">
              <div className="hero-badge inline-flex items-center justify-center gap-2 rounded-full border border-pink-500/30 bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-transparent px-3 py-1 sm:px-4 sm:py-1.5 backdrop-blur-md shadow-lg shadow-pink-500/5 whitespace-nowrap text-center">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-500" />
                </span>
                <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-pink-200 whitespace-nowrap overflow-hidden text-ellipsis">
                  Unified Creative Institution & Digital Agency
                </span>
              </div>
            </div>

            {/* Headline Statement with High-Precision Bulletins */}
            <h1 className="hero-headline font-display mt-3 sm:mt-5 space-y-2.5 sm:space-y-3.5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-xs text-pink-400 ring-1 ring-pink-500/40 shadow-sm shadow-pink-500/20">
                  ✦
                </span>
                <span>Learn digital skills <span className="text-gradient font-extrabold">free.</span></span>
              </span>
              <span className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-xs text-purple-400 ring-1 ring-purple-500/40 shadow-sm shadow-purple-500/20">
                  ✦
                </span>
                <span>Belong and build with our <span className="text-gradient font-extrabold">tribe.</span></span>
              </span>
              <span className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-xs text-pink-400 ring-1 ring-pink-500/40 shadow-sm shadow-pink-500/20">
                  ✦
                </span>
                <span>Let's bring your <span className="text-gradient font-extrabold">brand to life.</span></span>
              </span>
            </h1>

            {/* Interactive Hero CTAs */}
            <div className="hero-actions mt-9 flex flex-wrap items-center gap-3.5">
              <GradientButton to="/academy" className="group shadow-xl shadow-pink-500/25">
                <span>Start Learning Free</span>
                <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </GradientButton>
              <GhostButton to="/tribe" className="hero-tribe-cta border-white/20 bg-white/[0.04] backdrop-blur-md hover:border-pink-500/40 hover:bg-pink-500/10">
                Join the Tribe
              </GhostButton>
              <GhostButton to="/agency" className="hero-agency-cta border-white/15 bg-white/[0.02] backdrop-blur-md hover:border-purple-400/40 hover:bg-purple-500/10">
                Hire the Agency
              </GhostButton>
            </div>

            {/* Stats Row with Frosted Glass Panels */}
            <div className="hero-stats mt-12 grid grid-cols-3 gap-3 sm:gap-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-pink-500/30 hover:bg-white/[0.06] hover:-translate-y-1 sm:p-4">
                <CountUp end={studentCount()} suffix="+" />
                <div className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#a594c7] sm:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Students Trained</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.06] hover:-translate-y-1 sm:p-4">
                <CountUp end={tribeCount()} suffix="+" />
                <div className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#a594c7] sm:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                  <span>Tribe Members</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 backdrop-blur-md transition-all duration-300 hover:border-pink-500/30 hover:bg-white/[0.06] hover:-translate-y-1 sm:p-4">
                <CountUp end={homepageSettings.projectsDone} suffix="+" />
                <div className="mt-1 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#a594c7] sm:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  <span>Projects Done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-layered Interactive Showcase */}
          <div className="hero-media relative lg:col-span-5">
            {/* Ambient Background Glow Layer */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-pink-500/25 via-purple-600/20 to-transparent opacity-60 blur-2xl" />

            {/* Main Showcase Image Frame */}
            <div className="floaty relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-transparent p-2 backdrop-blur-xl shadow-2xl">
              <GlowImage
                src={IMG.heroGroup}
                alt="Diverse African creators collaborating"
                caption="Creators in the making — learning, building, belonging."
                className="aspect-[4/3] rounded-2xl"
              />

              {/* Floating Glass Micro-Card 1: Active Cohort */}
              <div className="absolute top-5 right-5 flex items-center gap-2 rounded-xl border border-white/20 bg-black/70 px-3 py-1.5 backdrop-blur-md shadow-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                  Cohort Active · 100% Free
                </span>
              </div>

              {/* Floating Glass Micro-Card 2: Community Badge */}
              <div className="absolute bottom-5 left-5 hidden sm:flex items-center gap-2 rounded-xl border border-white/20 bg-black/70 px-3 py-1.5 backdrop-blur-md shadow-xl">
                <span className="text-xs">⭐</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-200">
                  Think It. KR8 It
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={["Think It. KR8 It", "Learn free", "Verifiable KR8 ID", "Belong deeply", "Build for real", "Graduate-powered agency"]} />

      {/* THREE PILLARS */}
      <section className="section-bg py-20">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="One platform, three pillars" title="Learn. Belong." highlight="Build." sub="Academy, Tribe and Agency — one unified creative institution." center />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {pillars.map((p) => (
              <Card key={p.label} className="flex flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white"><Icon name={p.icon} size={22} /></div>
                <p className="text-[11px] uppercase tracking-wider text-pink-400">{p.label}</p>
                <h3 className="mt-1 text-xl font-bold text-white">{p.title}</h3>
                <p className="mt-3 flex-1 text-sm text-[#b8aecf]">{p.desc}</p>
                <Link to={p.to} className="mt-5 text-sm font-semibold text-pink-400 underline underline-offset-4 hover:text-pink-300">See how it works →</Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* THE JOURNEY */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#1a0030] to-[#12001f] p-8 sm:p-12">
            <div className="text-center">
              <Pill>The Blueprint</Pill>
              <h2 className="font-display mt-5 text-4xl text-white sm:text-5xl">From zero skills to <span className="text-gradient">getting paid.</span></h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-[#cabfe0]">
                No tuition ransom. No 4-year theory degrees. A battle-tested path from cracking open design and code tools to billing international clients.
              </p>
            </div>
            <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {journey.map((s, i) => (
                <div key={s.n} className="flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-pink font-display text-lg text-white shadow-lg shadow-pink-500/30">{s.n}</div>
                  <p className="text-sm font-medium text-[#cabfe0] lg:px-2">{s.t}</p>
                  {i < journey.length - 1 && <div className="hidden h-px flex-1" />}
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <GradientButton to="/academy" className="shadow-xl shadow-pink-500/25">
                Join the Free Cohort Today →
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      {/* FEED + LEADERBOARD */}
      <section className="section-bg py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <SectionHead label="Live in the Tribe" title="Always something" highlight="happening." sub="Real-time check-ins, portfolio critiques, and creative milestones from our global family." />
            <div className="mt-8"><LiveFeed /></div>
          </div>
          <div>
            <SectionHead label="Top creators" title="The" highlight="leaderboard" sub="Creators shipping daily drills, accumulating XP, and commanding top industry visibility." />
            <div className="mt-8"><LeaderboardList limit={5} /></div>
            <Link to="/leaderboard" className="mt-6 inline-block text-sm font-semibold text-pink-400 hover:text-pink-300">View Full Leaderboard →</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — Real Proof of the Free Academy Training */}
      <section className="section-bg py-20 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead
            label="Verified Proof · 100% Free Training"
            title="From Learners to"
            highlight="Earners."
            sub="Real African youth with zero industry connections who joined KR8's tuition-free cohorts, mastered high-income craft, and stepped into paid freelance retainers and design studios. Hear their unscripted journeys below."
            center
          />
          <div className="mt-12">
            <TestimonialCarousel items={getTestimonials()} />
          </div>
        </div>
      </section>

      {/* REDESIGNED KR8 AGENCY TRANSFORMATION SECTION */}
      <section className="section-bg relative overflow-hidden py-20 border-y border-white/10">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-tr from-pink-500/15 via-purple-600/15 to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5">
          {/* Header Eyebrow & Value Proposition */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-pink-300 backdrop-blur-md mb-4 shadow glow-pink-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 animate-ping" />
              <span>KR8 Creative & Digital Agency</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Stop Being Invisible. We Turn Brands into <span className="text-gradient">Market Leaders.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#cabfe0] leading-relaxed">
              Most businesses lose 60%+ of their potential revenue because their visual identity looks amateur,
              their website fails to convert, or their content gets drowned out by competitors. We engineer your complete
              brand transformation — positioning you to command premium prices, double your digital visibility, and turn
              curious visitors into high-ticket clients.
            </p>
          </div>

          {/* Core Growth Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md">
            <div className="text-center p-3 border-r border-white/5 last:border-0">
              <div className="font-display text-3xl sm:text-4xl text-gradient font-black">+240%</div>
              <p className="mt-1 text-xs font-semibold text-white">Avg. Visibility Growth</p>
              <p className="text-[10px] text-[#8a7ba8]">Across organic social & search</p>
            </div>
            <div className="text-center p-3 border-r border-white/5 last:border-0">
              <div className="font-display text-3xl sm:text-4xl text-gradient font-black">3.2x</div>
              <p className="mt-1 text-xs font-semibold text-white">Conversion Rate Lift</p>
              <p className="text-[10px] text-[#8a7ba8]">From UX & funnel optimization</p>
            </div>
            <div className="text-center p-3 border-r border-white/5 last:border-0">
              <div className="font-display text-3xl sm:text-4xl text-white font-black">120+</div>
              <p className="mt-1 text-xs font-semibold text-white">Projects Delivered</p>
              <p className="text-[10px] text-[#8a7ba8]">For startups, creators & firms</p>
            </div>
            <div className="text-center p-3">
              <div className="font-display text-3xl sm:text-4xl text-pink-300 font-black">100%</div>
              <p className="mt-1 text-xs font-semibold text-white">Bespoke Craftsmanship</p>
              <p className="text-[10px] text-[#8a7ba8]">Zero cookie-cutter templates</p>
            </div>
          </div>

          {/* 4 Pillars of Transformation (What We Offer) */}
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Pillar 1: Brand Positioning */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 sm:p-8 transition-all hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <Icon name="palette" size={24} />
                </div>
                <span className="rounded-full bg-pink-500/10 border border-pink-500/30 px-3 py-1 text-[11px] font-bold text-pink-300">
                  Command Premium Pricing
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                Brand Positioning & Visual Authority
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#b8aecf] leading-relaxed">
                When you look like everyone else, clients negotiate on price. We rebuild your brand narrative, bespoke
                logo suite, luxury typography, packaging, and pitch decks into a unified identity that commands respect
                and attracts high-value buyers who pay without haggling.
              </p>
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Brand Strategy</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Design Systems</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Visual Identity</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Pitch Presentations</span>
              </div>
            </div>

            {/* Pillar 2: Conversion Websites */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 sm:p-8 transition-all hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <Icon name="code" size={24} />
                </div>
                <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-[11px] font-bold text-purple-300">
                  Convert Visitors into Clients
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                High-Converting Websites & Web Platforms
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#b8aecf] leading-relaxed">
                A gorgeous website that gets no inquiries is just expensive digital art. We build lightning-fast,
                SEO-engineered web experiences with conversion copywriting, intuitive mobile UX, and frictionless
                booking flows that work like your hardest-working 24/7 salesperson.
              </p>
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Custom Web Platforms</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Mobile-First UI/UX</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ High-Ticket Funnels</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Technical SEO</span>
              </div>
            </div>

            {/* Pillar 3: Viral Video Engine */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 sm:p-8 transition-all hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <Icon name="video" size={24} />
                </div>
                <span className="rounded-full bg-pink-500/10 border border-pink-500/30 px-3 py-1 text-[11px] font-bold text-pink-300">
                  Double Your Reach
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                High-Retention Video & Motion Engine
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#b8aecf] leading-relaxed">
                The algorithm rewards retention and emotion. Our post-production room crafts cinematic short-form reels,
                YouTube long-form edits, UGC commercials, and 2D/3D motion graphics with psychological pacing, sound
                design, and hooks that keep viewers glued to your story.
              </p>
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ TikTok / Reels Machine</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Commercial Ad Videos</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ 2D/3D Motion Design</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Sound & Color Grading</span>
              </div>
            </div>

            {/* Pillar 4: AI & Systems */}
            <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 sm:p-8 transition-all hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Icon name="spark" size={24} />
                </div>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-[11px] font-bold text-cyan-300">
                  Scale Without Overhead
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-white">
                AI Agent Automations & Growth Funnels
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#b8aecf] leading-relaxed">
                Stop drowning in repetitive inquiries. We deploy smart AI agents that qualify incoming leads on your website
                and social channels, answer FAQs instantly, schedule strategy appointments, and sync data straight to
                your CRM 24 hours a day.
              </p>
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ AI Lead Qualifiers</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Workflow Automations</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ CRM Integration</span>
                <span className="rounded-lg bg-black/40 px-2.5 py-1 text-[#cabfe0]">✦ Paid Ads Strategy</span>
              </div>
            </div>
          </div>

          {/* The 4-Step Brand Velocity Framework */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-black/30 p-6 sm:p-10 backdrop-blur-md">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">Our Methodology</h4>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
                How We Take You From <span className="text-gradient">Overlooked to In-Demand</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#b8aecf] mt-2">
                A proven, battle-tested execution framework designed to eliminate guesswork and drive measurable ROI.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="font-display text-3xl font-black text-pink-400/40 mb-2">01</div>
                <h5 className="font-bold text-white text-sm">Deep Audit & Positioning</h5>
                <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                  We audit your current brand presence, uncover friction in your customer journey, and carve out a distinct market moat.
                </p>
              </div>

              <div className="relative p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="font-display text-3xl font-black text-purple-400/40 mb-2">02</div>
                <h5 className="font-bold text-white text-sm">Design & Web Engineering</h5>
                <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                  Elite creative directors and developers construct your brand identity and conversion web platform with pixel precision.
                </p>
              </div>

              <div className="relative p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="font-display text-3xl font-black text-pink-400/40 mb-2">03</div>
                <h5 className="font-bold text-white text-sm">Visibility Blitz & Media</h5>
                <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                  We launch high-retention video reels, social content machines, and ad creatives that grab attention and build authority.
                </p>
              </div>

              <div className="relative p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="font-display text-3xl font-black text-emerald-400/40 mb-2">04</div>
                <h5 className="font-bold text-white text-sm">Scale, Leads & Retainers</h5>
                <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                  Track real conversion numbers, double down on high-performing creative assets, and grow with ongoing agency retainers.
                </p>
              </div>
            </div>
          </div>

          {/* Convincing Call To Action Banner */}
          <div className="mt-12 rounded-3xl border border-pink-500/30 bg-gradient-to-r from-[#200a36] via-[#140624] to-[#200a36] p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

            <span className="inline-block rounded-full bg-gradient-pink px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow glow-pink-sm mb-3">
              ✦ Guaranteed Creative Excellence
            </span>

            <h3 className="font-display text-2xl sm:text-4xl font-black text-white uppercase max-w-2xl mx-auto">
              Ready to Stop Leaving Money on the Table?
            </h3>

            <p className="mt-3 text-xs sm:text-sm text-[#cabfe0] max-w-xl mx-auto leading-relaxed">
              Book a free 20-minute Brand Strategy & Positioning Audit with Timfire and our senior creative directors.
              We'll point out exactly where your brand is leaking clients and give you an actionable plan to double your visibility.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <GradientButton to="/agency#hire" className="shadow-xl shadow-pink-500/25">
                <span>Claim Your Free Brand Audit →</span>
              </GradientButton>
              <GhostButton href="https://wa.me/2348125687509">
                <span>Chat Direct on WhatsApp ↗</span>
              </GhostButton>
              <Link
                to="/agency"
                className="text-xs font-semibold text-pink-300 hover:text-white underline underline-offset-4 transition-colors px-2 py-1"
              >
                Explore Full Agency Showcase & Pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="section-bg py-16">
          <div className="mx-auto max-w-7xl px-5">
            <SectionHead label="From the desk" title="Latest" highlight="announcements" />
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {announcements.map((a) =>
                a.type === "text" ? (
                    <Card key={a.id}><p className="text-xs uppercase tracking-wider text-[#8a7ba8]">{a.date} · {a.author}</p><h3 className="mt-2 text-xl font-bold text-white">{a.title}</h3><p className="mt-3 text-sm text-[#b8aecf]">{a.body}</p></Card>
                ) : (
                  <Card key={a.id} className="overflow-hidden !p-0"><div className="aspect-square w-full overflow-hidden"><img src={a.image} alt={a.title} className="h-full w-full object-cover" /></div><div className="p-5"><p className="text-xs uppercase tracking-wider text-[#8a7ba8]">{a.date} · {a.author}</p><h3 className="mt-1 text-lg font-bold text-white">{a.title}</h3><p className="mt-2 text-sm text-[#b8aecf]">{a.caption}</p></div></Card>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* BLOG PREVIEW */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex items-end justify-between">
            <SectionHead label="The Blog" title="Read, learn," highlight="grow" />
            <Link to="/blog" className="hidden text-sm font-semibold text-pink-400 sm:block">All posts →</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {BLOG.filter((b) => b.source === "admin").slice(0, 3).map((b) => (
              <Link to="/blog" key={b.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                <div className="aspect-video overflow-hidden"><img src={b.img} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="p-5"><span className="rounded-full bg-pink-500/10 px-3 py-1 text-[11px] font-semibold text-pink-400">{b.category}</span><h4 className="mt-3 font-bold text-white">{b.title}</h4><p className="mt-2 line-clamp-2 text-sm text-[#b8aecf]">{b.excerpt}</p><p className="mt-3 text-xs text-[#8a7ba8]">{b.author} · {b.date} · {b.readTime}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTS / PARTNERS */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <SectionHead label="Clients & collaborators" title="Who we've worked with" highlight="so far" center />
          <div className="mx-auto mt-8 grid max-w-5xl gap-5 text-left sm:grid-cols-2">
            {portfolio.map((client) => (
              <div
                key={client.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/10"
              >
                <div>
                  {client.link && client.service.includes("Website") && (
                    <div className="flex items-center justify-between border-b border-white/10 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500/80" />
                        <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
                        <span className="h-2 w-2 rounded-full bg-green-500/80" />
                      </div>
                      <span className="text-[10px] font-mono text-[#b8aecf]">
                        {"domain" in client ? (client as unknown as { domain: string }).domain : "live website"}
                      </span>
                      <span className="text-[10px] font-bold text-pink-300">Live ↗</span>
                    </div>
                  )}

                  {client.img && (
                    <div className="aspect-[16/9] overflow-hidden bg-black/40">
                      {client.link ? (
                        <a href={client.link} target="_blank" rel="noreferrer" className="block h-full w-full group/link relative">
                          <img
                            src={client.img}
                            alt={client.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/link:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/link:opacity-100 transition-opacity backdrop-blur-[1px]">
                            <span className="flex items-center gap-1 rounded-full bg-gradient-pink px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
                              Open Live Project ↗
                            </span>
                          </div>
                        </a>
                      ) : (
                        <img
                          src={client.img}
                          alt={client.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-pink-400 font-semibold">{client.service}</p>
                    <h3 className="mt-1 font-bold text-white text-base">{client.client}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#b8aecf]">{client.description}</p>
                  </div>
                </div>

                {client.link && (
                  <div className="px-5 pb-5">
                    <a
                      href={client.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-500/10 px-3.5 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all"
                    >
                      <span>{client.service.includes("Website") ? "Visit Live Website" : "View Project"}</span>
                      <span className="text-[11px]">↗</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8"><GhostButton href={FULL_PORTFOLIO_LINK}>View Our Full Portfolio →</GhostButton></div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="section-bg py-20">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-pink-400/30 bg-gradient-to-br from-[#1a0030] to-[#12001f] p-12">
            <div className="absolute -top-20 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-gradient-pink opacity-30 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-4xl text-white sm:text-5xl">Your creative breakthrough <span className="text-gradient">starts today.</span></h2>
              <p className="mx-auto mt-4 max-w-lg text-[#cabfe0] text-base leading-relaxed">
                Stop waiting for the "right time" or saving for overpriced bootcamps. Over 3,000 African youth have proven that with free instruction, honest community, and relentless work ethic, you can build a life you are proud of.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <GradientButton to="/academy" className="shadow-xl shadow-pink-500/25">Join the Next Cohort (100% Free) →</GradientButton>
                <GhostButton to="/about">Read Our Story</GhostButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
