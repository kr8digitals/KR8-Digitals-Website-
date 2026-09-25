import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import { getSkill, getStudents, getAnnouncements, CONTACT, getReferralUrl, getStudentCertificates } from "../data/store";
import LiveFeed from "../components/LiveFeed";
import LeaderboardList from "../components/LeaderboardList";
import { Pill, Card } from "../components/ui";
import Icon from "../components/Icon";
import CertificateDocumentView from "../components/CertificateDocumentView";
import { downloadCertificatePdf } from "../utils/certificate";

const actions = [
  { icon: "book" as const, label: "Program", title: "Continue Learning", desc: "Pick up your skill track where you left off.", to: "/academy" },
  { icon: "check" as const, label: "Attendance", title: "Mark Attendance", desc: "Submit class, assignment or hangout proof.", to: "/academy" },
  { icon: "user" as const, label: "Profile", title: "View My Profile", desc: "Portfolio, activity, badges & referrals.", to: "/academy" },
  { icon: "briefcase" as const, label: "Opportunities", title: "Browse Opportunities", desc: "Real client work from KR8 Agency.", to: "/agency" },
  { icon: "bot" as const, label: "Mentor", title: "Chat on KR8 AI", desc: "Unlimited access to your creative mentor.", to: "/ai" },
  { icon: "fingerprint" as const, label: "Security", title: "Settings & Biometrics", desc: "Manage Touch ID / Fingerprint, password and privacy.", to: "/settings" },
];

export default function Dashboard() {
  const { student } = useAuth();
  const { isLive, activeStream, openStage } = useLiveStream();
  if (!student) return null;
  const isFounder = student.type === "founder";
  const isCoFounder = student.type === "co-founder";
  const skill = getSkill(student.skill);
  const ranked = [...getStudents()].sort((a, b) => b.points - a.points);
  const rank = ranked.findIndex((s) => s.id === student.id) + 1;
  const first = student.name.split(" ")[0];
  const certs = getStudentCertificates(student.id);
  const primaryCert = certs[0];

  const executiveActions = [
    { icon: "lock" as const, label: "Administration", title: "Admin Portal", desc: "Manage students, certifications, tracks, and settings.", to: "/admin" },
    { icon: "calendar" as const, label: "Attendance", title: "Review Submissions", desc: "Open manual review queue for all tracks.", to: "/attendance-review" },
    { icon: "user" as const, label: "Profile", title: "Leadership Profile", desc: "View and edit your executive profile and portfolio.", to: "/academy" },
    { icon: "briefcase" as const, label: "Opportunities", title: "Agency Projects", desc: "Browse real client work shipped by graduate teams.", to: "/agency" },
    { icon: "bot" as const, label: "Creative AI", title: "KR8 AI Mentor", desc: "Access the creative mentor and AI workspace.", to: "/ai" },
    { icon: "fingerprint" as const, label: "Security", title: "Settings & Biometrics", desc: "Manage Touch ID / Fingerprint, password and privacy.", to: "/settings" },
  ];

  const currentActions = (isFounder || isCoFounder) ? executiveActions : actions;

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-12">
        {/* LIVE STREAM BROADCAST BADGE FOR REGISTERED ACCOUNTS */}
        {isLive && activeStream && (
          <div className="mb-8 overflow-hidden rounded-3xl border-2 border-red-500/70 bg-gradient-to-r from-red-600/25 via-pink-600/20 to-purple-800/30 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3.5 w-3.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-red-400">🔴 WE'RE LIVE RIGHT NOW</span>
                    {activeStream.visibility === "private" ? (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">🔒 Private Session</span>
                    ) : (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">🌐 Open Stage</span>
                    )}
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">{activeStream.title}</h4>
                  <p className="text-xs text-[#cabfe0]">Hosted by {activeStream.hostName} · {activeStream.viewers?.length || 1} creator(s) connected</p>
                </div>
              </div>
              <button
                onClick={() => openStage()}
                className="rounded-xl bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                Join Live Stream Stage →
              </button>
            </div>
          </div>
        )}

        {/* Greeting */}
        <div className="rise-in">
          <Pill>
            {isFounder
              ? "KR8 Founder & CEO"
              : isCoFounder
              ? "KR8 Co-Founder"
              : student.graduated
              ? `🎓 Certified Graduate · ${skill?.name ?? "Design"}`
              : student.type === "tribe"
              ? "Tribe Member"
              : skill?.name ?? "Student"}{" "}
            · {student.id}
          </Pill>
          <h1 className="font-display mt-4 text-5xl text-white sm:text-6xl">
            {isFounder ? (
              <>Welcome back, <span className="text-gradient">Founder Timfire</span> 👑</>
            ) : isCoFounder ? (
              <>Welcome back, <span className="text-gradient">Co-Founder {first}</span> ⭐</>
            ) : (
              <>Welcome back, <span className="text-gradient">{first}</span> 👋</>
            )}
          </h1>

          {/* CERTIFIED GRADUATE HERO CELEBRATION CARD */}
          {student.graduated && !isFounder && !isCoFounder && (
            <div className="mt-6 overflow-hidden rounded-3xl border-2 border-green-500/50 bg-gradient-to-br from-green-950/40 via-[#0e1f13] to-purple-950/30 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-500/40 bg-green-500/15 px-3.5 py-1 text-xs font-bold text-green-300">
                    <span>🎓</span> OFFICIAL KR8 CERTIFIED GRADUATE
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                    Certificate of {student.certTier ?? "Completion"} Earned!
                  </h3>
                  <p className="text-sm leading-relaxed text-[#d4c6e6] max-w-2xl">
                    Congratulations, <strong className="text-white">{student.name}</strong>! You have successfully graduated from <strong className="text-white">{skill?.name || "Professional Track"}</strong> at KR8 Digitals. Your official credential has been issued with permanent QR verification and is recognized across the platform.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      to="/academy"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-xl glow-pink-sm hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Icon name="certificate" size={14} /> Open Full Credential in Profile →
                    </Link>
                    {primaryCert && (
                      <button
                        onClick={() => downloadCertificatePdf(student.name, null, primaryCert, student)}
                        className="inline-flex items-center gap-2 rounded-full border border-pink-500/40 bg-pink-500/10 px-5 py-2.5 text-xs font-bold text-pink-300 hover:bg-pink-500/20 transition-colors"
                      >
                        <Icon name="certificate" size={14} /> Download Official PDF
                      </button>
                    )}
                    <Link
                      to={`/verify?id=${encodeURIComponent(student.id)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Public QR Verification Page ↗
                    </Link>
                  </div>
                </div>

                {/* Certificate preview document */}
                {primaryCert && (
                  <div className="w-full sm:w-80 shrink-0">
                    <CertificateDocumentView
                      cert={primaryCert}
                      student={student}
                      maxHeight="220px"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {isFounder ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-pink-400/40 bg-gradient-to-r from-pink-500/15 via-[#1a0030] to-purple-600/15 p-4 shadow-xl">
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>👑</span> Founder & CEO Executive Authority Active
                </p>
                <p className="text-xs text-[#cabfe0] mt-1">
                  You have full, unrestricted access across all 17 admin sections, review queues, and system parameters.
                </p>
              </div>
              <Link
                to="/admin"
                className="rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white glow-pink-sm hover:scale-[1.02] transition-transform"
              >
                Open Admin Dashboard →
              </Link>
            </div>
          ) : isCoFounder ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-pink-400/40 bg-gradient-to-r from-pink-500/15 via-[#1a0030] to-purple-600/15 p-4 shadow-xl">
              <div>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>⭐</span> Co-Founder Executive Access Active
                </p>
                <p className="text-xs text-[#cabfe0] mt-1">
                  You hold executive authority across KR8 Digitals. Open the Admin menu to manage tracks and reviews.
                </p>
              </div>
              <Link
                to="/admin"
                className="rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white glow-pink-sm hover:scale-[1.02] transition-transform"
              >
                Open Admin Dashboard →
              </Link>
            </div>
          ) : student.admin ? (
            <Link to="/admin" className="mt-4 block max-w-xl rounded-2xl border border-pink-400/30 bg-pink-500/5 px-4 py-3 text-sm leading-relaxed text-pink-100 hover:border-pink-300">
              Congratulations — you are recognized as a {student.admin.title ?? student.admin.role}. Click here to open your password-protected admin access. Your assigned rights are managed from the Admin Permissions system.
            </Link>
          ) : null}
        </div>

        {/* Stats bar */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { n: student.attendanceAccepted, l: isFounder || isCoFounder ? "Attendance Sessions" : "Attendance Accepted" },
            { n: student.submissions, l: isFounder || isCoFounder ? "Assignments Reviewed" : "Assignments Submitted" },
            { n: isFounder ? "👑 Founder" : isCoFounder ? "⭐ Co-Founder" : student.graduated ? "🎓 Certified" : `#${rank}`, l: "Leadership Status" },
            { n: student.points, l: "Points" },
            { n: student.referrals, l: "Referrals" },
          ].map((s) => (
            <Card key={s.l} className="!p-5 text-center">
              <div className="font-display text-3xl text-gradient">{s.n}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-[#8a7ba8]">{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Action cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {currentActions.map((a) => (
            <Link key={a.title} to={a.to} className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-pink-400/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white"><Icon name={a.icon} size={22} /></div>
              <p className="text-[11px] uppercase tracking-wider text-pink-400">{a.label}</p>
              <h3 className="mt-1 text-lg font-bold text-white">{a.title}</h3>
              <p className="mt-2 text-sm text-[#b8aecf]">{a.desc}</p>
              <p className="mt-4 text-sm font-semibold text-pink-400 group-hover:translate-x-1">Go →</p>
            </Link>
          ))}
        </div>

        {/* Referral banner */}
        <div className="mt-6">
          <Card className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-pink-400 font-bold">Referral Program</p>
              <h3 className="mt-1 text-lg font-bold text-white">Your Personal KR8 Referral Link</h3>
              <p className="mt-1 text-xs text-[#b8aecf]">Share this link to invite fellow creatives and earn XP points on the leaderboard.</p>
              <a href={getReferralUrl(student.id)} className="mt-2 inline-block break-all rounded-lg bg-black/40 px-3 py-1.5 font-mono text-xs text-pink-300 underline underline-offset-2">
                {getReferralUrl(student.id)}
              </a>
            </div>
            {student.graduated && (
              <div className="sm:self-center shrink-0">
                <Link to="/academy" className="inline-flex items-center gap-1.5 rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white glow-pink-sm">
                  <Icon name="certificate" size={14} /> View My Certificate →
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Feed + Leaderboard + Announcements */}
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-white">Live in the Community</h2>
            <div className="mt-6"><LiveFeed /></div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">Your Rank</h2>
            <div className="mt-6"><LeaderboardList limit={6} /></div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold text-white">Announcements</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {getAnnouncements().map((a) => (
              <Card key={a.id}>
                <p className="text-xs uppercase tracking-wider text-[#8a7ba8]">{a.date}</p>
                <h3 className="mt-1 text-lg font-bold text-white">{a.title}</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">{a.type === "text" ? a.body : a.caption}</p>
              </Card>
            ))}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-[#8a7ba8]">
          Need help? Reach the team on WhatsApp: {CONTACT.phone}
        </p>
      </div>
    </div>
  );
}
