import { useState } from "react";
import { IMG } from "../data/images";
import { PORTFOLIO, getPortfolio, AGENCY_SERVICES, CONTACT, FULL_PORTFOLIO_LINK } from "../data/store";
import { Pill, GradientButton, GhostButton, SectionHead, Card, GlowImage } from "../components/ui";
import Icon from "../components/Icon";
import Marquee from "../components/Marquee";

const filters = ["All", ...Array.from(new Set(PORTFOLIO.map((p) => p.service)))];
const inputCls = "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

export default function Agency() {
  const [filter, setFilter] = useState("All");
  const [path, setPath] = useState<"structured" | "custom">("structured");
  const [sent, setSent] = useState(false);
  const portfolio = getPortfolio();
  const items = filter === "All" ? portfolio : portfolio.filter((p) => p.service === filter);

  return (
    <div>
      <section className="section-bg overflow-hidden py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Pill>The Agency</Pill>
            <h1 className="font-display mt-5 text-5xl leading-tight text-white sm:text-6xl">
              Let's bring your <span className="text-gradient">brand to life.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[#b8aecf]">
              World-class creative work — delivered by our graduate-powered team. From brand design and websites
              to AI agents, video, animation and paid ads.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GradientButton href="#hire">Hire the Agency →</GradientButton>
              <GhostButton href={CONTACT.whatsappTeam}>Chat on WhatsApp</GhostButton>
            </div>
            <div className="mt-10 flex gap-10">
              <div><div className="font-display text-4xl text-gradient">120+</div><div className="text-xs uppercase text-[#8a7ba8]">Projects Completed</div></div>
              <div><div className="font-display text-4xl text-gradient">85+</div><div className="text-xs uppercase text-[#8a7ba8]">Clients Served</div></div>
            </div>
          </div>
          <GlowImage src={IMG.studio} alt="KR8 Agency studio" className="aspect-[4/3]" />
        </div>
      </section>

      <Marquee items={["Real projects", "Professional delivery", "Graduate-powered", "Trusted results"]} />

      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="What we do" title="Services that" highlight="deliver" center />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AGENCY_SERVICES.map((s) => (
              <Card key={s.t}>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white"><Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={22} /></div>
                <h3 className="font-bold text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="Portfolio" title="Selected" highlight="work" />
          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${filter === f ? "bg-gradient-pink text-white" : "border border-white/15 text-[#b8aecf]"}`}>{f}</button>
            ))}
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <div key={p.id} className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/10">
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
                      <span className="text-[10px] font-bold text-pink-300">Live ↗</span>
                    </div>
                  )}

                  {/* Clickable Image Container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
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
          <div className="mt-8"><GhostButton href={FULL_PORTFOLIO_LINK}>View Our Full Portfolio →</GhostButton></div>
        </div>
      </section>

      {/* Clients */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5 text-center">
          <SectionHead label="Clients & collaborators" title="Work we've" highlight="shipped" center />
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 text-left sm:grid-cols-2">
            {portfolio.map((client) => <div key={client.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><p className="text-xs uppercase tracking-wider text-pink-400">{client.service}</p><h3 className="mt-1 font-bold text-white">{client.client}</h3><p className="mt-2 text-sm leading-relaxed text-[#b8aecf]">{client.description}</p></div>)}
          </div>
        </div>
      </section>

      {/* Hire */}
      <section id="hire" className="section-bg py-16">
        <div className="mx-auto max-w-5xl px-5">
          <SectionHead label="Hire us" title="Two ways to" highlight="get started" center />
          <div className="mx-auto mt-8 flex max-w-md justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
            <button onClick={() => setPath("structured")} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold ${path === "structured" ? "bg-gradient-pink text-white" : "text-[#b8aecf]"}`}>Structured Project</button>
            <button onClick={() => setPath("custom")} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold ${path === "custom" ? "bg-gradient-pink text-white" : "text-[#b8aecf]"}`}>Custom Quote</button>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            {sent ? (
              <Card className="flex flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="check" size={24} /></div>
                <h3 className="text-xl font-bold text-white">{path === "custom" ? "Custom Quote received!" : "Project request received!"}</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">Our team will reach out shortly. For a faster response, message us on WhatsApp.</p>
              </Card>
            ) : path === "structured" ? (
              <Card>
                <h3 className="font-bold text-white">Structured Project Request</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <select className={inputCls}><option value="">Service(s) needed</option>{AGENCY_SERVICES.map((s) => <option key={s.t}>{s.t}</option>)}</select>
                  <input className={inputCls} placeholder="Duration / timeline" />
                  <input className={inputCls} placeholder="Budget range" />
                  <select className={inputCls}><option value="">Project type</option><option>Personal</option><option>Contract for a company</option></select>
                  <input className={inputCls} placeholder="Your name" />
                  <input className={inputCls} placeholder="Email or phone" />
                </div>
                <GradientButton onClick={() => setSent(true)} className="mt-4 w-full">Send Project Request →</GradientButton>
              </Card>
            ) : (
              <Card>
                <h3 className="font-bold text-white">Custom Quote Request</h3>
                <p className="mt-1 text-sm text-[#b8aecf]">For smaller or non-standard asks — tell us what you need.</p>
                <textarea className={`${inputCls} mt-4`} rows={4} placeholder="Brief description of what you need" />
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <select className={inputCls}><option value="">Urgency</option><option>ASAP</option><option>Within a week</option><option>Flexible</option></select>
                  <input className={inputCls} placeholder="Rough budget (optional)" />
                  <input className={inputCls} placeholder="Your name" />
                  <input className={inputCls} placeholder="Email or phone" />
                </div>
                <GradientButton onClick={() => setSent(true)} className="mt-4 w-full">Request Custom Quote →</GradientButton>
              </Card>
            )}
            <Card className="flex flex-col justify-center bg-gradient-to-br from-[#1a0030] to-[#12001f]">
              <h3 className="font-display text-2xl text-white">Prefer to chat?</h3>
              <p className="mt-2 text-sm text-[#b8aecf]">Message us directly and get a quote fast.</p>
              <div className="mt-5"><GradientButton href={CONTACT.whatsappTeam} className="w-full">Chat on WhatsApp →</GradientButton></div>
              <div className="mt-6 space-y-1 text-sm text-[#b8aecf]"><p>{CONTACT.phone}</p><p className="break-all">{CONTACT.email}</p></div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
