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
  { icon: "certificate" as const, label: "Academy", title: "Free training, real certificate", desc: "Structured week-by-week curriculum in the skills people hire for. Zero cost, real instructors.", to: "/academy" },
  { icon: "users" as const, label: "Tribe", title: "An open creative community", desc: "Creatives, professionals and beginners share work, recommend each other, and grow together.", to: "/tribe" },
  { icon: "video" as const, label: "Agency", title: "Real client work, real delivery", desc: "World-class creative work shipped by our graduate-powered team.", to: "/agency" },
];

const journey = [
  { n: "1", t: "Register & get your KR8 ID" },
  { n: "2", t: "Show up & learn — take your attendance" },
  { n: "3", t: "Earn points" },
  { n: "4", t: "Climb the leaderboard" },
  { n: "5", t: "Graduate with a verified certificate" },
];

function GuestHome() {
  const announcements = getAnnouncements();
  const portfolio = getPortfolio();
  const homepageSettings = getHomepageSettings();
  return (
    <div>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-container mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2">
          <div className="hero-content rise-in">
            <Pill className="hero-badge"><span>Unified Creative Institution & Digital Agency</span></Pill>
            <h1 className="hero-headline font-display mt-6 space-y-2 text-white sm:space-y-1">
              <span className="flex items-start gap-2"><span className="mt-2 text-[0.6em] text-pink-400">•</span><span>Learn digital skills <span className="text-gradient">free.</span></span></span>
              <span className="flex items-start gap-2"><span className="mt-2 text-[0.6em] text-pink-400">•</span><span>Belong and build with our <span className="text-gradient">tribe.</span></span></span>
              <span className="flex items-start gap-2"><span className="mt-2 text-[0.6em] text-pink-400">•</span><span>Let's bring your <span className="text-gradient">brand to life.</span></span></span>
            </h1>
            <div className="hero-actions mt-8 flex flex-wrap gap-3">
              <GradientButton to="/academy">Start Learning Free</GradientButton>
              <GhostButton to="/tribe" className="hero-tribe-cta">Join the Tribe</GhostButton>
              <GhostButton to="/agency" className="hero-agency-cta">Hire the Agency</GhostButton>
            </div>
            <div className="hero-stats mt-10 grid grid-cols-3 gap-6">
              <div className="min-w-0"><CountUp end={studentCount()} suffix="+" /><div className="mt-1 text-[9px] uppercase leading-tight tracking-[0.08em] text-[#8a7ba8] sm:text-xs sm:tracking-wider">Students Trained</div></div>
              <div className="min-w-0"><CountUp end={tribeCount()} suffix="+" /><div className="mt-1 text-[9px] uppercase leading-tight tracking-[0.08em] text-[#8a7ba8] sm:text-xs sm:tracking-wider">Tribe Members</div></div>
              <div className="min-w-0"><CountUp end={homepageSettings.projectsDone} suffix="+" /><div className="mt-1 text-[9px] uppercase leading-tight tracking-[0.08em] text-[#8a7ba8] sm:text-xs sm:tracking-wider">Projects Done</div></div>
            </div>
          </div>
          <div className="floaty">
            <GlowImage src={IMG.heroGroup} alt="Diverse African creators collaborating" caption="Creators in the making — learning, building, belonging." className="aspect-[4/3]" />
          </div>
        </div>
      </section>

      <Marquee items={["Learn free", "Verifiable KR8 ID", "Belong deeply", "Build for real", "Graduate-powered agency"]} />

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
              <Pill>The Journey</Pill>
              <h2 className="font-display mt-5 text-4xl text-white sm:text-5xl">From zero to <span className="text-gradient">certified.</span></h2>
            </div>
            <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {journey.map((s, i) => (
                <div key={s.n} className="flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-pink font-display text-lg text-white">{s.n}</div>
                  <p className="text-sm font-medium text-[#cabfe0] lg:px-2">{s.t}</p>
                  {i < journey.length - 1 && <div className="hidden h-px flex-1" />}
                </div>
              ))}
            </div>
            <div className="mt-12 text-center"><GradientButton to="/academy">Apply for Free →</GradientButton></div>
          </div>
        </div>
      </section>

      {/* FEED + LEADERBOARD */}
      <section className="section-bg py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <SectionHead label="Live in the Tribe" title="Always something" highlight="happening." />
            <div className="mt-8"><LiveFeed /></div>
          </div>
          <div>
            <SectionHead label="Top creators" title="The" highlight="leaderboard" />
            <div className="mt-8"><LeaderboardList limit={5} /></div>
            <Link to="/leaderboard" className="mt-6 inline-block text-sm font-semibold text-pink-400 hover:text-pink-300">View Full Leaderboard →</Link>
          </div>
        </div>
      </section>

      {/* AGENCY PORTFOLIO */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead label="KR8 Agency" title="Your brand deserves" highlight="better." />
            <div className="text-right"><CountUp end={120} suffix="+" /><div className="text-xs uppercase tracking-wider text-[#8a7ba8]">Projects completed</div></div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {portfolio.slice(0, 4).map((p) => (
              <div key={p.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                <div className="aspect-[4/3] overflow-hidden"><img src={p.img} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="p-4"><p className="text-[11px] uppercase tracking-wider text-pink-400">{p.service}</p><h4 className="mt-1 text-sm font-bold text-white">{p.title}</h4>{p.showPrice && <p className="mt-1 text-xs text-[#b8aecf]">{p.price}</p>}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <GradientButton to="/agency">Let's Handle Your Project →</GradientButton>
            <GhostButton href="https://wa.me/2348125687509">Chat on WhatsApp</GhostButton>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="Real voices" title="From learners to" highlight="earners" center />
          <div className="mt-12"><TestimonialCarousel items={getTestimonials()} /></div>
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
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 text-left sm:grid-cols-2">
            {portfolio.map((client) => <div key={client.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-wider text-pink-400">{client.service}</p><h3 className="mt-1 font-bold text-white">{client.client}</h3><p className="mt-2 text-sm leading-relaxed text-[#b8aecf]">{client.description}</p></div>)}
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
              <h2 className="font-display text-4xl text-white sm:text-5xl">Your craft starts <span className="text-gradient">today.</span></h2>
              <p className="mx-auto mt-4 max-w-md text-[#b8aecf]">Join thousands of creators learning free, belonging deeply, and building for real.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3"><GradientButton to="/academy">Join for Free →</GradientButton><GhostButton to="/about">Our Story</GhostButton></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
