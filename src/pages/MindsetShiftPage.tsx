import { useEffect, useState, type ReactNode } from "react";
import { getMsEvent, type MsEventConfig } from "../data/mindsetShift";
import { Pill, GradientButton, GhostButton, SectionHead, Check, GlowImage, Card } from "../components/ui";
import MindsetShiftRegistration from "../components/MindsetShiftRegistration";
import Icon, { type IconName } from "../components/Icon";
import { useSeo } from "../lib/useSeo";
import { AssetImage } from "../lib/msMedia";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Topic icons are admin-editable strings; map them onto the site icon
 *  set with a safe fallback so a typo in the admin panel never breaks
 *  the page. */
const KNOWN_ICONS: Record<string, IconName> = {
  chart: "chart", unlock: "unlock", trophy: "trophy", spark: "spark", check: "check",
  bolt: "bolt", book: "book", pen: "pen", shield: "shield", user: "user", users: "users",
  briefcase: "briefcase", heart: "heart", calendar: "calendar", message: "message",
  share: "share", lock: "lock", certificate: "certificate", bell: "bell",
};
const iconFor = (name: string): IconName => (KNOWN_ICONS[name] ? KNOWN_ICONS[name] : "spark");

function MetaChip({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#e3d9f2] sm:text-sm">
      <Icon name={icon} size={15} className="shrink-0 text-[#e026c4]" />
      <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function MindsetShiftPage() {
  const [ev, setEv] = useState<MsEventConfig>(() => getMsEvent());

  // Live updates: admin edits on any device re-render this page instantly.
  useEffect(() => {
    const sync = () => setEv(getMsEvent());
    window.addEventListener("kr8:ms-event-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kr8:ms-event-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Social preview image: the flyer (when it's a public/remote URL).
  // Admin-uploaded "idb:" keys can't be shared as a URL, so fall back to
  // the site OG image.
  const ogImage = ev.flyer && ev.flyer.startsWith("/")
    ? `https://kr8digitals.com${ev.flyer}`
    : ev.flyer && !ev.flyer.startsWith("idb:")
      ? ev.flyer
      : undefined;

  useSeo({
    title: ev.seoTitle,
    description: ev.seoDescription,
    path: "/mindset-shift",
    ogType: "event",
    image: ogImage,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Event",
      name: `${ev.programName} ${ev.edition} — ${ev.theme}`,
      description: ev.seoDescription,
      ...(ev.startDate ? { startDate: ev.startDate } : {}),
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      image: ogImage,
      isAccessibleForFree: ev.registrationFree,
      location: { "@type": "VirtualLocation", url: ev.locationUrl },
      organizer: { "@type": "Organization", name: "KR8 Digitals", url: "https://kr8digitals.com" },
      ...(ev.speaker.name
        ? { performer: { "@type": "Person", name: ev.speaker.name } }
        : {}),
    },
  });

  return (
    <div className="min-w-0 w-full">
      {/* ============================== HERO ============================== */}
      <section className="hero-section relative overflow-hidden" aria-labelledby="ms-hero-title">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#7a1fa8]/20 blur-[140px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="hero-content min-w-0">
            <Pill>
              {ev.programName} {ev.edition} · {ev.dateLabel}
            </Pill>

            <h1 id="ms-hero-title" className="font-display mt-6 text-[clamp(2.6rem,7vw,4.75rem)] leading-[0.98]">
              <span className="text-gradient block">{ev.theme}</span>
              <span className="mt-3 block text-[clamp(1.05rem,2.6vw,1.6rem)] font-bold tracking-normal text-white">
                {ev.subtitle}
              </span>
            </h1>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <MetaChip icon="calendar">{ev.dateLabel} · {ev.timeLabel}</MetaChip>
              <MetaChip icon="message">{ev.locationLabel}</MetaChip>
              {ev.registrationFree && <MetaChip icon="check">Registration is free</MetaChip>}
            </div>

            <div className="hero-actions mt-9 flex flex-col gap-3 sm:flex-row">
              {ev.regOpen ? (
                <GradientButton href="#register">
                  Register Free
                  <Icon name="arrowRight" size={16} />
                </GradientButton>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-[#b8aecf]">
                  <Icon name="lock" size={15} /> Registration Closed
                </span>
              )}
              <GhostButton href="#explore">What You'll Explore</GhostButton>
              {ev.regOpen && ev.regDeadlineLabel && (
                <span className="text-xs font-medium text-[#8a7ba8] sm:mt-1">
                  {ev.regDeadlineLabel}
                </span>
              )}
            </div>

            <p className="mt-8 text-sm leading-relaxed text-[#8a7ba8]">
              A {ev.programName.toLowerCase()} conversation hosted by{" "}
              <span className="font-semibold text-[#d9a8e8]">{ev.host.name}</span> with{" "}
              <span className="font-semibold text-[#d9a8e8]">{ev.speaker.name}</span> — part of a
              recurring series held twice every month, the 1st and 3rd Sunday.
            </p>
          </div>

          {/* Official flyer — the campaign's visual anchor */}
          <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[400px]">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-pink opacity-25 blur-3xl" />
            <div className="floaty relative">
              <AssetImage
                src={ev.flyer}
                alt={`${ev.programName} ${ev.edition} official flyer — ${ev.theme}, ${ev.dateLabel}`}
                className="relative w-full rounded-[1.5rem] border border-white/15 shadow-2xl shadow-black/60"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================ THE STORY ============================ */}
      <section id="why" className="section-bg py-20 lg:py-28" aria-labelledby="ms-story-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            center
            label={`01 · ${ev.programName} ${ev.edition}`}
            title={
              <span id="ms-story-title">
                The conversation behind <span className="text-gradient">{ev.theme.toLowerCase()}</span>
              </span>
            }
            sub={ev.storyIntro}
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {ev.storyPoints.map((p, i) => (
              <Card key={p.title} className="group relative overflow-hidden transition-colors hover:border-pink-400/40">
                <span className="font-display text-5xl font-black text-white/10 transition-colors group-hover:text-pink-400/25">
                  0{i + 1}
                </span>
                <h3 className="font-display mt-3 text-xl font-bold text-white sm:text-2xl">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">{p.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= WHAT YOU'LL EXPLORE ======================= */}
      <section id="explore" className="py-20 lg:py-28" aria-labelledby="ms-explore-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            center
            label="02 · What You'll Explore"
            title={
              <span id="ms-explore-title">
                Five threads of this <span className="text-gradient">edition</span>
              </span>
            }
            sub={"Every topic is drawn from this edition's theme — " + ev.subtitle.toLowerCase()}
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ev.topics.map((t, i) => (
              <Card key={t.title} className="relative flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white shadow-lg shadow-pink-500/25">
                    <Icon name={iconFor(t.icon)} size={22} />
                  </span>
                  <span className="font-display text-sm font-black tracking-widest text-[#8a7ba8]">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-lg font-bold leading-snug text-white sm:text-xl">
                  {t.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">{t.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= SPEAKER ============================= */}
      <section id="speaker" className="section-bg py-20 lg:py-28" aria-labelledby="ms-speaker-title">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="relative mx-auto w-full max-w-[420px]">
            <GlowImage
              src={ev.speaker.photo}
              alt={`Portrait of ${ev.speaker.name}`}
              className="aspect-[4/5] w-full"
            />
          </div>
          <div className="min-w-0">
            <Pill>03 · {ev.speaker.role}</Pill>
            <h2 id="ms-speaker-title" className="font-display mt-5 text-4xl font-bold text-white sm:text-5xl">
              {ev.speaker.name}
            </h2>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#e026c4]">
              {ev.speaker.tagline}
            </p>
            <p className="mt-5 text-base leading-relaxed text-[#b8aecf]">{ev.speaker.bio}</p>
            {ev.speaker.credentials.length > 0 && (
              <ul className="mt-7 space-y-3">
                {ev.speaker.credentials.map((c) => (
                  <Check key={c}>{c}</Check>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ============================== HOST =============================== */}
      <section id="host" className="py-20 lg:py-28" aria-labelledby="ms-host-title">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="order-2 min-w-0 lg:order-1">
            <Pill>04 · {ev.host.role}</Pill>
            <h2 id="ms-host-title" className="font-display mt-5 text-4xl font-bold text-white sm:text-5xl">
              {ev.host.name}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#b8aecf]">{ev.host.bio}</p>

            {/* Recurring series cadence — verified program fact */}
            <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-pink-400/25 bg-pink-500/5 px-5 py-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9a8e8]">
                Recurring Series
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-pink px-3.5 py-1.5 text-xs font-bold text-white">
                <Icon name="calendar" size={13} /> 1st Sunday
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-pink px-3.5 py-1.5 text-xs font-bold text-white">
                <Icon name="calendar" size={13} /> 3rd Sunday
              </span>
            </div>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-[420px] lg:order-2">
            <GlowImage
              src={ev.host.photo}
              alt={`Portrait of ${ev.host.name}`}
              className="aspect-square w-full"
            />
          </div>
        </div>
      </section>

      {/* ========================== WHO IT'S FOR =========================== */}
      <section id="who" className="section-bg py-20 lg:py-28" aria-labelledby="ms-who-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHead
            center
            label="05 · Who This Is For"
            title={
              <span id="ms-who-title">
                Built for people ready to <span className="text-gradient">shift</span>
              </span>
            }
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Card className="p-7 sm:p-8">
              <h3 className="font-display flex items-center gap-3 text-xl font-bold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-pink text-white">
                  <Icon name="users" size={18} />
                </span>
                This is for you if
              </h3>
              <ul className="mt-6 space-y-3.5">
                {ev.audience.map((a) => (
                  <Check key={a}>{a}</Check>
                ))}
              </ul>
            </Card>
            <Card className="p-7 sm:p-8">
              <h3 className="font-display flex items-center gap-3 text-xl font-bold text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-pink text-white">
                  <Icon name="spark" size={18} />
                </span>
                What to expect
              </h3>
              <ul className="mt-6 space-y-3.5">
                {ev.expectations.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-sm text-[#cabfe0]">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-pink-400/50 text-[#e026c4]">
                      <Icon name="spark" size={11} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ======================= DETAILS + REGISTRATION ==================== */}
      <section id="register" className="relative overflow-hidden py-20 lg:py-28" aria-labelledby="ms-register-title">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[380px] bg-[radial-gradient(ellipse_60%_100%_at_50%_100%,rgba(224,38,196,0.14),transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-pink-400/25 bg-[#12001f] p-8 text-center shadow-2xl shadow-pink-500/10 sm:p-12">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[420px] -translate-x-1/2 rounded-full bg-[#e026c4]/15 blur-3xl" />
            <Pill>06 · Secure Your Spot</Pill>
            <h2 id="ms-register-title" className="font-display mt-5 text-3xl font-bold text-white sm:text-4xl">
              {ev.regOpen ? "Registration is open" : "Registration is closed"}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#b8aecf] sm:text-base">
              {ev.programName} {ev.edition} — {ev.theme}: {ev.subtitle}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              <MetaChip icon="calendar">{ev.dateLabel} · {ev.timeLabel}</MetaChip>
              <MetaChip icon="message">{ev.locationLabel}</MetaChip>
              {ev.registrationFree && <MetaChip icon="check">Free</MetaChip>}
              {ev.regOpen && ev.regDeadlineLabel && <MetaChip icon="bell">{ev.regDeadlineLabel}</MetaChip>}
            </div>

            {ev.regOpen && (
              <p className="mt-9 text-sm font-semibold text-[#cabfe0]">
                {ev.registrationFree
                  ? "Registration for this edition is completely free."
                  : "Registration for this edition is open."}
              </p>
            )}
            {/* Always mounted: existing participants must keep access to
                their status (and confirmation code) after registration
                closes. New visitors see the component's closed/full gate. */}
            <MindsetShiftRegistration event={ev} />
          </div>
        </div>
      </section>
    </div>
  );
}
