import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWaitlistWhatsAppUrl, getSkills } from "../data/store";
import { Pill, GhostButton, Card } from "../components/ui";
import Icon from "../components/Icon";

export default function WaitlistPage() {
  const [whatsappUrl, setWhatsappUrl] = useState(getWaitlistWhatsAppUrl());
  const skills = getSkills().filter((s) => s.available);

  useEffect(() => {
    const refresh = () => setWhatsappUrl(getWaitlistWhatsAppUrl());
    window.addEventListener("kr8:waitlist-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:waitlist-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="section-bg min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-5">
        {/* HERO */}
        <div className="text-center">
          <Pill>Admissions Status: Waitlist Active</Pill>
          <h1 className="font-display mt-5 text-4xl text-white sm:text-6xl font-bold tracking-tight">
            Cohort Admissions Are{" "}
            <span className="text-gradient">Currently Closed.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#cabfe0] sm:text-lg leading-relaxed">
            Our creative and digital tech tracks have reached maximum student capacity for this admissions cycle. To ensure high-quality mentorship and real-time live review feedback, registrations are temporarily closed.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-pink px-8 py-4 text-sm font-bold text-white shadow-xl shadow-pink-500/25 hover:scale-[1.03] active:scale-95 transition-all glow-pink-sm"
            >
              <Icon name="message" size={18} />
              <span>Join VIP WhatsApp Waitlist Group</span>
            </a>
            <GhostButton to="/signin">Already Enrolled? Sign In →</GhostButton>
          </div>
        </div>

        {/* NOTICE CARD */}
        <Card className="mt-12 border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-[#160824] to-purple-900/10 p-6 sm:p-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400">
              <Icon name="spark" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Why Join the Official Waitlist Group?</h3>
              <p className="mt-1 text-sm text-[#cabfe0] leading-relaxed">
                Waitlist members receive first-priority enrolment notices, early syllabus drops, pre-cohort workshops, and the direct link 24 hours before public registration reopens.
              </p>
            </div>
          </div>
        </Card>

        {/* UPCOMING TRACKS PREVIEW */}
        <div className="mt-14">
          <h2 className="text-center text-xs font-semibold uppercase tracking-wider text-[#8a7ba8]">
            Upcoming Skills Opening for Next Cohort
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <div
                key={skill.key}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-pink-400">
                      <Icon name={skill.icon as Parameters<typeof Icon>[0]["name"]} size={20} />
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-pink-300">
                      {skill.suffix}
                    </span>
                  </div>
                  <h4 className="mt-3 text-base font-bold text-white">{skill.name}</h4>
                  <p className="mt-2 text-xs text-[#b8aecf] line-clamp-3 leading-relaxed">
                    {skill.snippet}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#8a7ba8]">
                  <span>8 Weeks · 100% Free</span>
                  <span className="font-semibold text-amber-300">Waitlist Only</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM HELP */}
        <div className="mt-14 text-center">
          <p className="text-sm text-[#8a7ba8]">
            Have an urgent organization or enterprise training inquiry?{" "}
            <Link to="/agency" className="text-pink-400 hover:text-pink-300 font-semibold underline">
              Contact our digital agency team →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
