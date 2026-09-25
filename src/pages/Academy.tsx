import { useState, useEffect, type ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getSkills, getSkill, getSkillName, areAllRegistrationsClosed, ATTENDANCE_TYPES, getTestimonials, getTribeWhatsApp, getSkillRegistration, getSkillWhatsApp, buildPhone,
  getStudentCertificates, getStudentNotifications, markNotificationRead, type CertificateRecord, type StudentNotification,
  registerStudent, registerTribe, recoverId, authenticateAccount, getStudents, getReferralUrl, updateAccount, requestPasswordReset, completePasswordReset, getFounders, countryByCode,
  submitAttendance, getStudentAttendance, getAttendanceTypesSettings, type AttendanceSubmission,
  type Account, type Skill,
} from "../data/store";
import { Pill, GradientButton, GhostButton, SectionHead, Card, Avatar, Check, ImageWithFallback } from "../components/ui";
import Marquee from "../components/Marquee";
import TestimonialCarousel from "../components/TestimonialCarousel";
import CoachingSection from "../components/CoachingSection";
import Icon from "../components/Icon";
import CountryPhone from "../components/CountryPhone";
import { downloadCertificatePdf } from "../utils/certificate";
import { authenticateWithBiometrics, getRegisteredBiometrics } from "../utils/biometrics";

export default function Academy() {
  const { student } = useAuth();
  if (student && (student.type === "student" || student.type === "founder" || student.type === "co-founder")) {
    return <Profile student={student} />;
  }
  return <GuestAcademy />;
}

const inputCls = "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

function GuestAcademy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, addNotification } = useAuth();
  const [view, setView] = useState<"skills" | "auth">("skills");
  const [curriculum, setCurriculum] = useState<Skill | null>(null);
  const [preSkill] = useState<string>("");

  useEffect(() => {
    if (searchParams.get("auth") === "true" || searchParams.get("register") === "true" || window.location.hash === "#auth") {
      setView("auth");
    }
  }, [searchParams]);

  return (
    <div>
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-3xl">
            <Pill>The Academy</Pill>
            <h1 className="font-display mt-5 text-4xl text-white sm:text-6xl font-bold">
              Master high-income craft — <span className="text-gradient">completely free.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#cabfe0] leading-relaxed">
              Stop letting expensive bootcamps gatekeep your future. We offer intensive, practical tracks taught by senior practitioners who ship client work every single day. Pick your track, claim your verifiable KR8 ID, and turn your craft into income.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              {areAllRegistrationsClosed() ? (
                <GradientButton to="/waitlist" className="shadow-xl shadow-pink-500/25">
                  Admissions Full — Join WhatsApp Waitlist 📲
                </GradientButton>
              ) : (
                <GradientButton to="/register" className="shadow-xl shadow-pink-500/25">
                  Join the Free Cohort →
                </GradientButton>
              )}
              <GhostButton to="/verify">Verify a Graduate KR8 ID</GhostButton>
            </div>
          </div>

          {/* Skill cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {getSkills().filter((s) => s.available).map((s) => (
              (() => {
                const founderKey = s.key === "graphic" ? "stevenson" : s.key === "video" ? "daniel" : s.key === "web" ? "timfire" : "";
                const instructor = founderKey ? getFounders().find((founder) => founder.key === founderKey) : null;
                const displayInstructor = instructor ? { name: instructor.name, photo: instructor.photo, bio: instructor.bio } : s.instructor;
                return (
              <Card key={s.key} className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-pink-300"><Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={25} /></span>
                  <span className="rounded-full bg-pink-500/10 px-3 py-1 font-mono text-[11px] text-pink-400">{s.suffix}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm text-[#b8aecf]">{s.snippet}</p>

                {/* instructor */}
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-black/20 p-3">
                  {displayInstructor ? (
                    <>
                      <InstructorPhoto src={displayInstructor.photo} name={displayInstructor.name} />
                      <div>
                        <p className="text-xs text-[#8a7ba8]">Instructor</p>
                        <p className="text-sm font-semibold text-white">{displayInstructor.name}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#8a7ba8]">Instructor: KR8 Master Practitioner</p>
                  )}
                </div>

                {/* status */}
                <p className={`mt-3 text-xs font-semibold ${getSkillRegistration(s.key) ? "text-green-400" : "text-yellow-300"}`}>
                  {getSkillRegistration(s.key) ? "● Registration open" : "● Registration closed"}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setCurriculum(s)}
                    className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:border-pink-400/60"
                  >View Curriculum</button>
                  <button
                    onClick={() => navigate(`/register?skill=${s.key}`)}
                    disabled={!getSkillRegistration(s.key)}
                    className="flex-1 rounded-full bg-gradient-pink px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
                  >
                    {getSkillRegistration(s.key) ? "Register" : "Closed"}
                  </button>
                </div>
              </Card>
                );
              })()
            ))}
          </div>
        </div>
      </section>

      <Marquee items={["100% Tuition-Free", "Verifiable KR8 Identity", "Zero Gatekeeping", "Live Industry Feedback", "Proof Over Paper", "From Learners to Earners", "Graduate-Powered Agency"]} />

      {/* Auth */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-3xl px-5">
          {view === "auth" ? (
            <AuthPanel
              preSkill={preSkill}
              onStudent={(s) => {
                signIn(s);
                addNotification(
                  s.type === "founder"
                    ? "Welcome, Founder & CEO — executive identity confirmed."
                    : s.type === "co-founder"
                    ? "Welcome, Co-Founder — executive identity confirmed."
                    : "Registration complete — welcome to KR8 Academy."
                );
              }}
              onTribe={(m) => {
                signIn(m);
                addNotification(
                  m.type === "founder"
                    ? "Welcome, Founder & CEO."
                    : m.type === "co-founder"
                    ? "Welcome, Co-Founder."
                    : `Welcome to the KR8 Tribe. Join the community group: ${getTribeWhatsApp()}`
                );
              }}
              onSignIn={(s) => {
                signIn(s);
                addNotification(
                  s.type === "founder"
                    ? "Welcome back, Founder Timfire! Executive authority active."
                    : s.type === "co-founder"
                    ? `Welcome back, Co-Founder ${s.name.split(" ")[0]}! Executive access active.`
                    : `Welcome back, ${s.name.split(" ")[0]}!`
                );
              }}
            />
          ) : (
            <div className="text-center flex flex-wrap justify-center gap-3">
              <GradientButton to="/register">Register as Student →</GradientButton>
              <GhostButton to="/signin">Sign In to Existing Account →</GhostButton>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead
            label="Verified Proof · 100% Free Training"
            title="From Learners to"
            highlight="Earners."
            sub="Real African youth who started with zero experience, completed our free cohorts, and are now landing high-paying design and video roles across the world."
            center
          />
          <div className="mt-10"><TestimonialCarousel items={getTestimonials()} /></div>
        </div>
      </section>

      {/* NEW 1-ON-1 COACHING (PAY-AS-YOU-LEARN) SECTION */}
      <CoachingSection />

      {curriculum && (
        <CurriculumModal
          skill={curriculum}
          onClose={() => setCurriculum(null)}
          onRegister={() => {
            const skillKey = curriculum.key;
            setCurriculum(null);
            navigate(`/register?skill=${skillKey}`);
          }}
        />
      )}
    </div>
  );
}

function InstructorPhoto({ src, name }: { src: string; name: string }) {
  return <ImageWithFallback src={src} alt={name} className="h-14 w-14 shrink-0 rounded-2xl object-cover object-top ring-2 ring-pink-400/40 shadow-md" fallbackClassName="h-14 w-14 shrink-0 rounded-2xl border border-pink-400/40" />;
}

function CurriculumModal({ skill, onClose, onRegister }: { skill: Skill; onClose: () => void; onRegister: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#160026] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-3xl">{skill.icon}</span>
            <h3 className="font-display mt-2 text-3xl text-white">{skill.name}</h3>
            {skill.instructor && <p className="mt-1 text-sm text-pink-400">Instructor: {skill.instructor.name}</p>}
          </div>
          <button onClick={onClose} className="text-xl text-[#b8aecf]">✕</button>
        </div>
        <p className="mt-3 text-sm text-[#b8aecf]">{skill.snippet}</p>
        <div className="mt-6 space-y-4">
          {skill.curriculum && skill.curriculum.length > 0 ? (
            skill.curriculum.map((w) => (
              <div key={w.week} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">{w.week}</p>
                <h4 className="mt-1 font-bold text-white">{w.title}</h4>
                <ul className="mt-3 space-y-2">{w.points.map((p) => <Check key={p}>{p}</Check>)}</ul>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-black/30 p-8 text-center">
              <span className="text-3xl">📋</span>
              <h4 className="text-base font-bold text-white mt-2">Curriculum Under Final Review</h4>
              <p className="text-xs text-[#a594c7] mt-1.5 max-w-sm mx-auto leading-relaxed">
                The detailed weekly syllabus and project roadmap for {skill.name} is being finalized and will be uploaded shortly by {skill.instructor?.name || "the instructional lead"}. You can register now to secure your spot.
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 rounded-2xl bg-pink-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">Certification criteria</p>
          <p className="mt-1 text-sm text-[#cabfe0]">{skill.criteria}</p>
        </div>
        <div className="mt-6"><GradientButton onClick={onRegister} className="w-full">Register for {skill.name} →</GradientButton></div>
      </div>
    </div>
  );
}

function AuthPanel({ preSkill, onStudent, onTribe, onSignIn }: {
  preSkill: string;
  onStudent: (s: Account) => void;
  onTribe: (m: Account) => void;
  onSignIn: (s: Account) => void;
}) {
  const [tab, setTab] = useState<"student" | "tribe" | "signin">("student");
  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
        {([["student", "Student Account"], ["tribe", "Tribe Member"], ["signin", "Sign In"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${tab === t ? "bg-gradient-pink text-white" : "text-[#b8aecf]"}`}>{label}</button>
        ))}
      </div>
      {tab === "student" && <StudentForm preSkill={preSkill} onDone={onStudent} />}
      {tab === "tribe" && <TribeForm onDone={onTribe} />}
      {tab === "signin" && <SignInForm onDone={onSignIn} />}
    </div>
  );
}

function StudentForm({ preSkill, onDone }: { preSkill: string; onDone: (s: Account) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "NG", password: "", skill: preSkill, y: "", m: "", d: "" });
  const [error, setError] = useState("");
  const [result, setResult] = useState<Account | null>(null);

  if (result) {
    const isFounder = result.type === "founder";
    const isCoFounder = result.type === "co-founder";
    const skill = getSkill(result.skill);

    return (
      <Card className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-pink text-white">
          <Icon name="check" size={28} />
        </div>
        <h3 className="text-2xl font-bold text-white">
          {isFounder ? "Welcome, KR8 Founder & CEO!" : isCoFounder ? "Welcome, KR8 Co-Founder!" : "You're in!"}
        </h3>
        <p className="mt-2 text-[#b8aecf]">
          {isFounder
            ? "Your Executive Founder Identity has been recognized with unrestricted authority."
            : isCoFounder
            ? "Your Executive Co-Founder Identity has been recognized."
            : "Your KR8 Identity has been generated."}
        </p>

        <div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-pink-400/40 bg-pink-500/10 px-6 py-4">
          <span className="font-mono text-xl font-bold tracking-wider text-gradient sm:text-2xl">{result.id}</span>
          {isFounder ? (
            <span className="rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg glow-pink-sm">
              Founder & CEO
            </span>
          ) : isCoFounder ? (
            <span className="rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg glow-pink-sm">
              Co-Founder
            </span>
          ) : (
            result.vip && <span className="rounded-full bg-gradient-pink px-3 py-1 text-xs font-bold text-white">VIP</span>
          )}
        </div>

        {result.admin && (
          <div className="mx-auto mt-4 max-w-lg rounded-xl border border-pink-400/30 bg-pink-500/5 px-4 py-3 text-left text-xs leading-relaxed text-pink-100">
            <strong className="capitalize">{result.admin.title ?? result.admin.role} access recognized.</strong>{" "}
            {result.admin.passwordNotice} Click the Admin menu and enter this password whenever you need your assigned dashboard sections.
          </div>
        )}

        <div className="mt-6 space-y-3">
          {(isFounder || isCoFounder) && (
            <GradientButton to="/admin" className="w-full">
              Open Admin Dashboard Portal →
            </GradientButton>
          )}
          {skill && <GhostButton href={getSkillWhatsApp(skill.key)} className="w-full">Join {skill.name} WhatsApp Group →</GhostButton>}
          <a href={getReferralUrl(result.id)} className="block break-all rounded-xl bg-black/30 p-3 text-xs text-pink-300 underline underline-offset-2">Referral link: {getReferralUrl(result.id)}</a>
          <GhostButton onClick={() => onDone(result)} className="w-full">Go to My Profile →</GhostButton>
        </div>
      </Card>
    );
  }

  const submit = () => {
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password || !form.skill || !form.y || !form.m || !form.d) { setError("Please fill in every field, including a password."); return; }
    const dial = countryByCode(form.country)?.dial || "+234";
    const res = registerStudent({ name: form.name, email: form.email, phone: buildPhone(dial, form.phone), country: form.country, password: form.password, skill: form.skill, dob: `${form.y}-${form.m}-${form.d}` });
    if (!res.ok) { setError(res.error!); return; }
    setResult(res.student!);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Card>
      <h3 className="text-xl font-bold text-white">Student registration</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Full Academy access — attendance, leaderboard, certificate & a verifiable KR8 ID.</p>
      <div className="mt-5 space-y-4">
        <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputCls} placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <CountryPhone country={form.country} phone={form.phone} onCountry={(country) => setForm({ ...form, country })} onPhone={(phone) => setForm({ ...form, phone })} inputClass={inputCls} />
        <input type="password" className={inputCls} placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className={inputCls} value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })}>
          <option value="">Select a skill…</option>
          {getSkills().filter((s) => s.available).map((s) => (
            <option key={s.key} value={s.key} disabled={!getSkillRegistration(s.key)}>
              {s.name}{!getSkillRegistration(s.key) ? " (Closed)" : ""}
            </option>
          ))}
        </select>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-wider text-[#8a7ba8]">Date of birth</label>
          <div className="grid grid-cols-3 gap-3">
            <select className={inputCls} value={form.y} onChange={(e) => setForm({ ...form, y: e.target.value })}><option value="">Year</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
            <select className={inputCls} value={form.m} onChange={(e) => setForm({ ...form, m: String(e.target.value).padStart(2, "0") })}><option value="">Month</option>{months.map((m) => <option key={m} value={String(m).padStart(2, "0")}>{m}</option>)}</select>
            <select className={inputCls} value={form.d} onChange={(e) => setForm({ ...form, d: String(e.target.value).padStart(2, "0") })}><option value="">Day</option>{days.map((d) => <option key={d} value={String(d).padStart(2, "0")}>{d}</option>)}</select>
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>}
        <GradientButton onClick={submit} className="w-full">Generate My KR8 ID →</GradientButton>
      </div>
    </Card>
  );
}

function TribeForm({ onDone }: { onDone: (m: Account) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "NG", password: "" });
  const [error, setError] = useState("");
  const submit = () => {
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password) { setError("Please fill in every field, including a password."); return; }
    const dial = countryByCode(form.country)?.dial || "+234";
    const res = registerTribe({ name: form.name, email: form.email, phone: buildPhone(dial, form.phone), country: form.country, password: form.password });
    if (!res.ok) { setError(res.error!); return; }
    onDone(res.member!);
  };
  return (
    <Card>
      <h3 className="text-xl font-bold text-white">Tribe Member (lightweight)</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Just three fields — post, comment, react and follow across the Tribe & Blog. No skill enrollment.</p>
      <div className="mt-5 space-y-4">
        <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={inputCls} placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <CountryPhone country={form.country} phone={form.phone} onCountry={(country) => setForm({ ...form, country })} onPhone={(phone) => setForm({ ...form, phone })} inputClass={inputCls} />
        <input type="password" className={inputCls} placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>}
        <GradientButton onClick={submit} className="w-full">Join the Tribe →</GradientButton>
      </div>
    </Card>
  );
}

function SignInForm({ onDone }: { onDone: (s: Account) => void }) {
  const [mode, setMode] = useState<"id" | "recover" | "reset">("id");
  const [value, setValue] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetId] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [msg, setMsg] = useState("");
  const [bioLoading, setBioLoading] = useState(false);

  const registeredBios = getRegisteredBiometrics();

  const handleBiometricSignIn = async (targetId?: string) => {
    setMsg("");
    setBioLoading(true);
    try {
      const res = await authenticateWithBiometrics(targetId || (value.trim() ? value.trim() : undefined));
      if (!res.ok || !res.studentId) {
        setMsg(res.error || "Biometric authentication failed or was cancelled.");
        return;
      }
      const all = getStudents();
      const account = all.find((a) => a.id.toLowerCase() === res.studentId!.toLowerCase());
      if (!account) {
        setMsg(`Account for ID ${res.studentId} could not be found.`);
        return;
      }
      onDone(account);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Biometric authentication error");
    } finally {
      setBioLoading(false);
    }
  };

  const submit = () => {
    setMsg("");
    if (mode === "reset") return;
    if (mode === "id") {
      const result = authenticateAccount(value, password);
      if (!result.ok || !result.account) { setMsg(result.error ?? "The KR8 ID or password is incorrect."); return; }
      onDone(result.account);
    } else {
      const s = recoverId(value);
      if (!s) { setMsg("No account matches that email or phone."); return; }
      setMsg(`Your KR8 ID is ${s.id}. Use it with your password to sign in.`);
    }
  };

  const requestReset = () => {
    const target = (resetEmail || resetId || value).trim();
    if (!target) {
      setMsg("Please enter your registered email, KR8 ID, or phone number.");
      return;
    }
    const result = requestPasswordReset(target);
    setMsg(result.message);
    if (result.code) {
      setDemoCode(result.code);
      setResetCode(result.code);
    }
  };

  const finishReset = () => {
    const target = (resetEmail || resetId || value).trim();
    const result = completePasswordReset(target, resetCode, newPassword);
    setMsg(result.message);
    if (result.ok && result.account) {
      setTimeout(() => {
        onDone(result.account!);
      }, 1000);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{mode === "id" ? "Sign in to KR8" : mode === "recover" ? "Recover my KR8 ID" : "Reset my password"}</h3>
        {mode === "id" && registeredBios.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2.5 py-1 text-[11px] font-semibold text-green-300">
            <Icon name="fingerprint" size={12} /> Biometrics ready
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-[#b8aecf]">
        {mode === "id"
          ? "Sign in with your Email address or KR8 ID and password, or use device fingerprint."
          : mode === "recover"
          ? "Enter your email or phone to retrieve your ID."
          : "Verify your email and KR8 ID with a reset code."}
      </p>

      {/* Quick Biometric Sign In button if registered on this device */}
      {mode === "id" && (
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => handleBiometricSignIn()}
            disabled={bioLoading}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-pink-400/40 bg-pink-500/10 py-3 text-sm font-semibold text-pink-200 hover:bg-pink-500/20 hover:border-pink-400/70 transition-all disabled:opacity-50"
          >
            <Icon name="fingerprint" size={18} className="text-pink-400" />
            <span>{bioLoading ? "Verifying sensor..." : "Sign in with Fingerprint / Biometrics"}</span>
          </button>

          {registeredBios.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-[#8a7ba8] self-center">Saved on device:</span>
              {registeredBios.slice(0, 3).map((b) => (
                <button
                  key={b.studentId}
                  type="button"
                  onClick={() => handleBiometricSignIn(b.studentId)}
                  className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] font-mono text-pink-300 hover:bg-white/10"
                  title={`Tap to sign in as ${b.studentName}`}
                >
                  {b.studentName.split(" ")[0]} ({b.studentId.slice(-6)})
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#8a7ba8] text-center">
              New here? Sign in with your password first, then activate Fingerprint in Settings.
            </p>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#160026] px-2 text-[#8a7ba8]">Or with credentials</span></div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {mode === "reset" ? <>
          <input className={inputCls} placeholder="Registered email, phone, or KR8 ID" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
          <GradientButton onClick={requestReset} className="w-full">Generate Reset Code 📩</GradientButton>
          {demoCode && (
            <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/60 p-4 text-xs text-emerald-200 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  ✓ Verification Code Ready
                </span>
                <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Auto-Applied Below
                </span>
              </div>
              <div className="my-2.5 rounded-xl bg-black/60 p-2 text-center border border-emerald-500/30">
                <p className="font-mono text-2xl font-black text-white tracking-widest">{demoCode}</p>
              </div>
              <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                💡 <strong>Notice:</strong> Your verification code is provided directly on this screen and has been auto-applied below so you can proceed without waiting for email delivery. (Universal testing code: <strong className="font-mono text-white">888999</strong>).
              </p>
            </div>
          )}
          <input className={inputCls} placeholder="6-digit reset code" value={resetCode} onChange={(e) => setResetCode(e.target.value)} />
          <input type="password" className={inputCls} placeholder="New password (min 4 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <GradientButton onClick={finishReset} className="w-full">Set New Password & Sign In ✅</GradientButton>
        </> : <>
          <input className={inputCls} placeholder={mode === "id" ? "e.g. KR8 ID, email, or phone number" : "Email or phone number"} value={value} onChange={(e) => setValue(e.target.value)} />
          {mode === "id" && <input type="password" className={inputCls} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        </>}
        {msg && <p className="rounded-lg bg-white/5 px-4 py-2.5 text-sm text-[#cabfe0]">{msg}</p>}
        {mode !== "reset" && <GradientButton onClick={submit} className="w-full">{mode === "id" ? "Sign In →" : "Recover ID →"}</GradientButton>}

        <button onClick={() => { setMode(mode === "id" ? "recover" : mode === "recover" ? "reset" : "id"); setMsg(""); }} className="w-full text-center text-sm text-pink-400">{mode === "id" ? "Forgot your ID? Recover it →" : mode === "recover" ? "Lost your password? Reset it →" : "← Back to sign in"}</button>
        <p className="text-center text-xs text-[#8a7ba8]">{mode === "id" ? "Passwords or registered device biometrics can be used to sign in." : ""}</p>
      </div>
    </Card>
  );
}

/* ============ Student profile ============ */
function Profile({ student }: { student: Account }) {
  const [tab, setTab] = useState<"posts" | "portfolio" | "activity" | "about">("posts");
  const [profile, setProfile] = useState(student);
  const [expanded, setExpanded] = useState(!!student.expandedVisibility);
  const [password, setPassword] = useState(profile.password ?? "");
  const { signIn, addNotification } = useAuth();
  const skill = getSkill(profile.skill);
  const ranked = getStudents().filter((account) => !account.isPlaceholder).sort((a, b) => b.points - a.points);
  const rank = ranked.findIndex((s) => s.id === profile.id) + 1;
  const studentTestimonial = getTestimonials().find(
    (t) => t.kr8Id && t.kr8Id.toLowerCase() === profile.id.toLowerCase()
  );

  // Sync profile when student prop updates
  useEffect(() => {
    setProfile(student);
    setExpanded(!!student.expandedVisibility);
    setPassword(student.password ?? "");
  }, [student]);

  const save = (patch: Partial<Account>) => {
    const next = updateAccount(profile.id, patch);
    if (next) { setProfile(next); signIn(next); }
  };
  const upload = (event: ChangeEvent<HTMLInputElement>, field: "avatar" | "coverPhoto") => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => save({ [field]: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (profile.certificateUrl) {
      downloadCertificatePdf(profile.name, profile.certificateUrl);
    } else {
      downloadCertificate(profile, skill?.name ?? "KR8 Digitals");
    }
  };

  return (
    <div className="section-bg min-h-screen">
      <div className="relative h-52 overflow-hidden sm:h-64">
        <img src={profile.coverPhoto || "https://images.pexels.com/photos/3866398/pexels-photo-3866398.jpeg?auto=compress&cs=tinysrgb&w=1400"} alt="cover" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0015] to-transparent" />
        <label className="absolute right-4 top-4 z-10 cursor-pointer rounded-full border border-white/20 bg-black/40 px-3 py-2 text-xs text-white backdrop-blur">Edit banner<input type="file" accept="image/*" className="hidden" onChange={(event) => upload(event, "coverPhoto")} /></label>
      </div>

      <div className="mx-auto max-w-6xl px-5">
        <div className="relative z-10 -mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
          <label className="relative cursor-pointer rounded-full ring-4 ring-[#0d0015]">
            <Avatar src={profile.avatar} name={profile.name} size={110} />
            <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="pen" size={13} /></span>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => upload(event, "avatar")} />
          </label>
          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl text-white">{profile.name}</h1>
              {profile.type === "founder" ? (
                <span className="rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xl glow-pink-sm">
                  👑 KR8 Founder & CEO
                </span>
              ) : profile.type === "co-founder" ? (
                <span className="rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xl glow-pink-sm">
                  ⭐ KR8 Co-Founder
                </span>
              ) : (
                profile.vip && <span className="rounded-full bg-gradient-pink px-3 py-1 text-xs font-bold text-white">VIP</span>
              )}
              {profile.graduated && profile.type === "student" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-[#cabfe0]">
                  <Icon name="certificate" size={13} /> {profile.certTier}
                </span>
              )}
              {profile.admin && (
                <Link
                  to="/admin"
                  className="rounded-full border border-pink-400/50 bg-pink-500/10 px-3 py-1 text-xs font-bold capitalize text-pink-200 hover:border-pink-300"
                >
                  {profile.type === "founder" ? "Founder & CEO · Open Admin" : profile.type === "co-founder" ? "Co-Founder · Open Admin" : `${profile.admin.title ?? profile.admin.role} · Open Admin`}
                </Link>
              )}
            </div>
            <p className="mt-1 font-mono text-sm text-pink-400">{profile.id}</p>
            <span className="mt-2 inline-block rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-400">
              {profile.type === "founder" ? "Founder & CEO · Executive Leadership" : profile.type === "co-founder" ? "Co-Founder · Executive Leadership" : skill?.name}
            </span>
            <p className="mt-2 text-[11px] text-[#8a7ba8]">
              {profile.type === "founder" || profile.type === "co-founder"
                ? "Official Executive Leadership Identity Record · Verified Leadership Status."
                : "Name, KR8 ID, registration date, skill code and suffix are locked identity fields."}
            </p>
            {profile.admin && (
              <div className="mt-3 max-w-xl rounded-xl border border-pink-400/30 bg-pink-500/5 px-3 py-2 text-xs leading-relaxed text-pink-100">
                {profile.type === "founder"
                  ? "Welcome, Founder & CEO. You hold complete administrative authority over the entire platform. Open the Admin menu to manage all tracks, submissions, and settings."
                  : profile.type === "co-founder"
                  ? "Welcome, Co-Founder. You hold executive administrative authority across KR8 Digitals. Open the Admin menu to access platform tools."
                  : `Congratulations — you have ${profile.admin.title ?? profile.admin.role} access. Open the Admin menu to use your assigned sections. ${profile.admin.role !== "ultimate" && profile.admin.passwordNotice}`}
              </div>
            )}
          </div>
          <div className="flex gap-6 pb-2">
            <div className="text-center"><div className="font-display text-2xl text-gradient">#{rank}</div><div className="text-[10px] uppercase text-[#8a7ba8]">Rank</div></div>
            <div className="text-center"><div className="font-display text-2xl text-gradient">{profile.points}</div><div className="text-[10px] uppercase text-[#8a7ba8]">Points</div></div>
            <div className="text-center"><div className="font-display text-2xl text-gradient">{profile.referrals}</div><div className="text-[10px] uppercase text-[#8a7ba8]">Referrals</div></div>
          </div>
        </div>

        {/* PENDING ROLE PROMOTION OFFER & PASSWORD SETUP MODAL (Phase 7) */}
        {profile.pendingRoleOffer && (
          <RoleOfferActivationModal
            offer={profile.pendingRoleOffer}
            studentId={profile.id}
            onActivated={(updated) => {
              setProfile(updated);
              signIn(updated);
              addNotification(`Congratulations! Your ${updated.admin?.title} role is now active.`);
            }}
            onDismissed={() => {
              const updated = updateAccount(profile.id, { pendingRoleOffer: undefined });
              if (updated) {
                setProfile(updated);
                signIn(updated);
              }
              addNotification("Role promotion offer dismissed and expired.");
            }}
          />
        )}

        {/* Congratulatory / Executive Leadership Banner */}
        {profile.type === "founder" ? (
          <div className="mt-6 rounded-3xl border border-pink-400/50 bg-gradient-to-r from-pink-500/20 via-[#1a0030] to-purple-600/20 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-pink text-white text-3xl shadow-lg">
                  👑
                </div>
                <div>
                  <span className="rounded-full bg-pink-500/30 border border-pink-400/40 px-3 py-1 text-xs font-bold text-pink-200 uppercase tracking-wider">
                    Executive Leadership
                  </span>
                  <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
                    Founder & CEO — Kenneth Timothy Iziogo (Timfire)
                  </h2>
                  <p className="mt-1 text-sm text-[#cabfe0]">
                    Chief Executive Officer & Lead Architect. You hold full system authority across KR8 Academy, Tribe, Agency, and live review moderation.
                  </p>
                </div>
              </div>
              <Link to="/admin" className="rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white glow-pink-sm hover:scale-[1.02] transition-transform">
                Open Admin Portal →
              </Link>
            </div>
          </div>
        ) : profile.type === "co-founder" ? (
          <div className="mt-6 rounded-3xl border border-pink-400/50 bg-gradient-to-r from-pink-500/20 via-[#1a0030] to-purple-600/20 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-pink text-white text-3xl shadow-lg">
                  ⭐
                </div>
                <div>
                  <span className="rounded-full bg-pink-500/30 border border-pink-400/40 px-3 py-1 text-xs font-bold text-pink-200 uppercase tracking-wider">
                    Executive Leadership
                  </span>
                  <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
                    KR8 Co-Founder — {profile.name}
                  </h2>
                  <p className="mt-1 text-sm text-[#cabfe0]">
                    Executive Co-Founder & Track Director. Full administrative authority and curriculum oversight are active.
                  </p>
                </div>
              </div>
              <Link to="/admin" className="rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white glow-pink-sm hover:scale-[1.02] transition-transform">
                Open Admin Portal →
              </Link>
            </div>
          </div>
        ) : profile.graduated && (
          <div className="mt-6 rounded-3xl border border-green-500/40 bg-gradient-to-r from-green-500/15 via-[#1a0030] to-pink-500/15 p-6 shadow-xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-pink text-white text-2xl">
                🎓
              </div>
              <div className="flex-1">
                <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-300 uppercase tracking-wider">
                  Official Certified Graduate
                </span>
                <h2 className="mt-1 font-display text-2xl text-white sm:text-3xl">
                  Congratulations on your graduation, {profile.name}!
                </h2>
                <p className="mt-1 text-sm text-[#cabfe0]">
                  You have successfully completed your training in <strong className="text-white">{skill?.name}</strong> and been officially awarded your <strong className="text-white">Certificate of {profile.certTier ?? "Completion"}</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {studentTestimonial && (
          <div className="mt-6 rounded-3xl border border-pink-500/40 bg-gradient-to-r from-pink-950/40 via-[#180829] to-purple-950/40 p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-full max-w-[180px] aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-lg shrink-0 border border-white/20">
                <video
                  src={studentTestimonial.video}
                  poster={studentTestimonial.img}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-3 py-1 text-xs font-bold text-pink-300">
                    ⭐ Featured Story on KR8 Global Showcase
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">Your Official Student Journey</h3>
                <p className="text-sm italic text-[#cabfe0]">"{studentTestimonial.caption}"</p>
                <p className="text-xs text-[#8a7ba8]">
                  This video testimonial is verified and displayed on the KR8 student stories carousel, linked directly to your student ID ({profile.id}).
                </p>
                <Link
                  to="/#student-stories"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300"
                >
                  <span>View All Student Stories →</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 hide-scrollbar">
          {(["posts", "portfolio", "activity", "about"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-5 py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-pink-400 text-white" : "text-[#b8aecf]"}`}>{t === "portfolio" ? "Portfolio / Submissions" : t}</button>
          ))}
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {tab === "posts" && (
              profile.type === "founder" || profile.type === "co-founder" ? (
                <Card>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white text-lg">Executive Attendance Management</h3>
                      <p className="mt-1 text-sm text-[#b8aecf]">
                        As {profile.type === "founder" ? "Founder & CEO" : "Co-Founder"}, student attendance proofs submit to you for manual review.
                      </p>
                    </div>
                    <Link
                      to="/attendance-review"
                      className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white glow-pink-sm"
                    >
                      Open Attendance Review Queue →
                    </Link>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                    <p className="text-xs text-[#cabfe0] leading-relaxed">
                      All four attendance types (Class, Assignment, Mindset Shift, Monthly Hangout) are reviewed manually by coaches and executive leadership.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <Link to="/attendance-review" className="rounded-xl border border-pink-400/40 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-300">
                        Review Submissions
                      </Link>
                      <Link to="/admin" className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-[#cabfe0]">
                        Open Admin Portal
                      </Link>
                    </div>
                  </div>
                </Card>
              ) : (
                <AttendanceWidget student={profile} />
              )
            )}
            {tab === "portfolio" && (
              <PortfolioManager profile={profile} onSave={(portfolio) => save({ portfolio })} />
            )}
            {tab === "activity" && (
              <Card>
                <h3 className="font-bold text-white">Activity</h3>
                <ul className="mt-4 space-y-3">
                  <Check>{profile.attendanceAccepted} attendance sessions accepted</Check>
                  <Check>{profile.submissions} assignments submitted & accepted</Check>
                  <Check>{profile.referrals} successful referrals</Check>
                  <Check>{skill?.name} skill track badge earned</Check>
                  {profile.graduated && <Check>Certificate of {profile.certTier} earned</Check>}
                </ul>
              </Card>
            )}
            {tab === "about" && (
              <Card>
                <h3 className="font-bold text-white">About</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">{profile.name} joined KR8 Digitals in {profile.year} to train in {skill?.name}.</p>
                <textarea value={profile.bio ?? ""} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} placeholder="Add your personal bio or a little about what you are building..." rows={4} className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none" />
                <button onClick={() => save({ bio: profile.bio, expandedVisibility: expanded })} className="mt-3 rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">Save About section</button>
                <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs uppercase tracking-wider text-[#8a7ba8]">Editable security setting</p><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Set a profile password" className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none" /><button onClick={() => save({ password })} className="mt-2 rounded-full border border-white/15 px-4 py-2 text-xs text-[#cabfe0]">Save password</button></div>
                <div className="mt-4 flex flex-wrap gap-2">{["Design", "Community", "Growth", skill?.name ?? ""].map((t) => <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#cabfe0]">{t}</span>)}</div>
                <a href={getReferralUrl(profile.id)} className="mt-5 block break-all rounded-xl bg-black/30 p-3 text-xs text-pink-300 underline underline-offset-2">Referral link: {getReferralUrl(profile.id)} · <span className="text-white no-underline">14 clicks · 6 conversions</span></a>
                <label className="mt-4 flex items-center gap-2 text-sm text-[#cabfe0]">
                  <input type="checkbox" checked={expanded} onChange={(e) => setExpanded(e.target.checked)} className="accent-pink-500" />
                  Show expanded data on my public Verify page
                </label>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="flex items-center gap-2 font-bold text-white"><Icon name="certificate" size={18} /> Official Credential</h3>
              {profile.type === "founder" ? (
                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white">KR8 Founder & CEO Credential</p>
                    <p className="text-xs text-[#8a7ba8]">KR8 Digitals Executive Board · Founded 2026</p>
                  </div>
                  <div className="rounded-2xl border border-pink-400/40 bg-pink-500/10 p-4">
                    <p className="text-xs font-bold text-pink-300">Verified Executive Leadership</p>
                    <p className="text-xs text-[#cabfe0] mt-1 leading-relaxed">
                      "Chief Executive Officer & Lead Architect. Recognized authority across all tracks and systems."
                    </p>
                  </div>
                  <Link
                    to={`/verify?id=${encodeURIComponent(profile.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs text-pink-300 underline underline-offset-2 hover:text-white pt-1"
                  >
                    Open Public Founder Verification Page ↗
                  </Link>
                </div>
              ) : profile.type === "co-founder" ? (
                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white">KR8 Co-Founder Credential</p>
                    <p className="text-xs text-[#8a7ba8]">KR8 Digitals Executive Board</p>
                  </div>
                  <div className="rounded-2xl border border-pink-400/40 bg-pink-500/10 p-4">
                    <p className="text-xs font-bold text-pink-300">Verified Executive Leadership</p>
                    <p className="text-xs text-[#cabfe0] mt-1 leading-relaxed">
                      "Executive Co-Founder and Track Director at KR8 Digitals."
                    </p>
                  </div>
                  <Link
                    to={`/verify?id=${encodeURIComponent(profile.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs text-pink-300 underline underline-offset-2 hover:text-white pt-1"
                  >
                    Open Public Co-Founder Verification Page ↗
                  </Link>
                </div>
              ) : (
                <StudentCertificateSection profile={profile} onDownload={handleDownload} />
              )}
            </Card>
            <Card>
              <h3 className="flex items-center gap-2 font-bold text-white"><Icon name="bot" size={18} /> KR8 AI</h3>
              <p className="mt-2 text-sm text-[#b8aecf]">Your always-on creative mentor.</p>
              <div className="mt-4"><GhostButton to="/ai" className="w-full">Open KR8 AI →</GhostButton></div>
            </Card>
            <ConnectionsCard profile={profile} onSave={save} />
          </div>
        </div>
      </div>
    </div>
  );
}

function downloadCertificate(profile: Account, skillName: string) {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!popup) return;
  const safeName = profile.name.replace(/[<>]/g, "");
  const safeId = profile.id.replace(/[<>]/g, "");
  popup.document.write(`<!doctype html><html><head><title>KR8 Certificate - ${safeName}</title><style>body{margin:0;background:#f7f0fb;font-family:Arial,sans-serif;color:#20002f}.certificate{box-sizing:border-box;width:calc(100vw - 64px);min-height:620px;margin:32px;padding:64px;border:12px solid #7a1fa8;background:#fff;text-align:center}.brand{font-weight:800;letter-spacing:.03em;color:#7a1fa8;font-size:30px;margin-bottom:34px}.eyebrow{letter-spacing:.25em;text-transform:uppercase;color:#7a1fa8;font-weight:700;font-size:12px}.title{font-size:42px;letter-spacing:.04em;text-transform:uppercase;color:#7a1fa8;margin:20px 0}.name{font-size:34px;font-weight:700;margin:18px 0}.meta{font-size:16px;line-height:1.8}.id{font-family:monospace;color:#7a1fa8;font-weight:700}.footer{margin-top:46px;font-size:13px;color:#695b73}@media print{body{background:white}.certificate{width:100%;margin:0;min-height:100vh}}</style></head><body><div class="certificate"><div class="brand"><span>KR8</span> Digitals</div><div class="eyebrow">KR8 Digitals · Certificate of ${profile.certTier ?? "Completion"}</div><div class="title">Certificate of ${profile.certTier ?? "Completion"}</div><div class="name">${safeName}</div><div class="meta">has successfully completed the <strong>${skillName}</strong> training programme.<br/>KR8 Identity: <span class="id">${safeId}</span><br/>Issued by KR8 Digitals · ${new Date().getFullYear()}</div><div class="footer">Verify this certificate at the KR8 Digitals Verify page.</div></div><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}

function PortfolioManager({ profile, onSave }: { profile: Account; onSave: (portfolio: NonNullable<Account["portfolio"]>) => void }) {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [kind, setKind] = useState<"image" | "video" | "link">("image");
  const [file, setFile] = useState("");
  const portfolio = profile.portfolio ?? [];
  const add = () => {
    if (!title || (!file && !link)) return;
    onSave([...portfolio, { title, type: kind, url: file || link }]);
    setTitle(""); setLink(""); setFile("");
  };
  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    setKind(picked.type.startsWith("video") ? "video" : "image");
    const reader = new FileReader();
    reader.onload = () => setFile(String(reader.result));
    reader.readAsDataURL(picked);
  };
  return (
    <div className="space-y-5">
      {portfolio.length === 0 ? (
        <Card className="text-center"><Icon name="briefcase" size={26} className="mx-auto text-pink-300" /><h3 className="mt-3 font-bold text-white">Nothing yet — upload your work</h3><p className="mt-2 text-sm text-[#b8aecf]">Add an image, video or link to your own website/project. This portfolio is student-populated only.</p></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">{portfolio.map((item, index) => <Card key={`${item.title}-${index}`} className="overflow-hidden !p-0"><div className="aspect-video bg-black/30">{item.type === "link" ? <a href={item.url} target="_blank" rel="noreferrer" className="flex h-full items-center justify-center p-5 text-center text-sm text-pink-300 underline">Open project link →</a> : item.type === "video" ? <video src={item.url} controls className="h-full w-full object-cover" /> : <img src={item.url} alt={item.title} className="h-full w-full object-cover" />}</div><div className="p-4"><p className="text-sm font-semibold text-white">{item.title}</p><p className="mt-1 text-xs text-[#8a7ba8]">Student upload · {item.type}</p></div></Card>)}</div>
      )}
      <Card>
        <h3 className="font-bold text-white">Add to your portfolio</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Project title" className={inputCls} />
          <select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)} className={inputCls}><option value="image">Image upload</option><option value="video">Video upload</option><option value="link">Project link</option></select>
        </div>
        {kind === "link" ? <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://your-project.com" className={`${inputCls} mt-3`} /> : <label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-5 text-center text-sm text-[#8a7ba8]">{file ? "File ready to save" : "Choose image or video"}<input type="file" accept={kind === "video" ? "video/*" : "image/*"} className="hidden" onChange={chooseFile} /></label>}
        <button onClick={add} className="mt-3 rounded-full bg-gradient-pink px-5 py-2.5 text-sm font-bold text-white">Save Portfolio Item</button>
      </Card>
    </div>
  );
}

function ConnectionsCard({ profile, onSave }: { profile: Account; onSave: (patch: Partial<Account>) => void }) {
  const [targetId, setTargetId] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const people = getStudents().filter((account) => account.id !== profile.id && !account.isPlaceholder);
  const target = people.find((account) => account.id === targetId);
  const follow = () => {
    if (!target) return;
    const following = profile.following ?? [];
    const nextFollowing = following.includes(target.id) ? following.filter((id) => id !== target.id) : [...following, target.id];
    const followers = target.followers ?? [];
    updateAccount(target.id, { followers: followers.includes(profile.id) ? followers.filter((id) => id !== profile.id) : [...followers, profile.id] });
    onSave({ following: nextFollowing });
    setNotice(nextFollowing.includes(target.id) ? `You now follow ${target.name}.` : `You unfollowed ${target.name}.`);
  };
  const send = () => {
    if (!target || !message.trim()) return;
    if (target.messagePrivacy === "No one" || (target.messagePrivacy === "Friends only" && !(profile.following ?? []).includes(target.id))) { setNotice("This student has limited message privacy."); return; }
    setNotice(`Message sent to ${target.name}. You can block or report a conversation at any time.`);
    setMessage("");
  };
  return <Card><h3 className="flex items-center gap-2 font-bold text-white"><Icon name="users" size={18} /> Connections & messaging</h3><p className="mt-2 text-sm text-[#b8aecf]">Students can follow and message one another without needing a mutual follow first. Safety controls stay available.</p><select value={targetId} onChange={(event) => setTargetId(event.target.value)} className={`${inputCls} mt-4`}><option value="">Choose a student</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.id}</option>)}</select>{target && <><div className="mt-3 flex gap-2"><button onClick={follow} className="rounded-full border border-pink-400/40 px-4 py-2 text-xs font-semibold text-pink-300">{(profile.following ?? []).includes(target.id) ? "Unfollow" : "Follow"}</button><button onClick={() => setNotice("Conversation safety: block and report are available on every thread.")} className="rounded-full border border-white/15 px-4 py-2 text-xs text-[#cabfe0]">Safety</button></div><div className="mt-4 flex gap-2"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message this student..." className={`${inputCls} flex-1`} /><button onClick={send} className="rounded-xl bg-gradient-pink px-4 text-xs font-bold text-white">Send</button></div><div className="mt-2 flex gap-2 text-[11px] text-[#8a7ba8]"><button onClick={() => setNotice("Student blocked. Their messages will no longer reach you.")}>Block</button><button onClick={() => setNotice("Conversation reported to admin moderation.")}>Report</button></div></>}{notice && <p className="mt-3 rounded-lg bg-pink-500/10 px-3 py-2 text-xs text-pink-200">{notice}</p>}</Card>;
}

function AttendanceWidget({ student }: { student: Account }) {
  const { addNotification } = useAuth();
  const [type, setType] = useState("");
  const [topic, setTopic] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [fileName, setFileName] = useState("");
  const [screenshotData, setScreenshotData] = useState("");
  const [done, setDone] = useState(false);
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>(getStudentAttendance(student.id));
  const [openSettings, setOpenSettings] = useState<Record<string, boolean>>(getAttendanceTypesSettings());

  const syncSubs = () => {
    setSubmissions(getStudentAttendance(student.id));
    setOpenSettings(getAttendanceTypesSettings());
  };

  useEffect(() => {
    window.addEventListener("kr8:attendance-updated", syncSubs);
    window.addEventListener("kr8:attendance-types-updated", syncSubs);
    return () => {
      window.removeEventListener("kr8:attendance-updated", syncSubs);
      window.removeEventListener("kr8:attendance-types-updated", syncSubs);
    };
  }, [student.id]);

  const at = ATTENDANCE_TYPES.find((a) => a.key === type);
  const isOpen = type ? (openSettings[type] !== undefined ? openSettings[type] : at?.open) : false;
  const gradLocked = student.graduated && (type === "class" || type === "assignment");
  const needsSpeaker = type === "mindset" || type === "hangout";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotData(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!type || !topic.trim()) {
      addNotification("Please enter the topic covered.");
      return;
    }
    const finalScreenshot = screenshotData || "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800";
    const skillName = getSkillName(student.skill);

    submitAttendance({
      studentId: student.id,
      studentName: student.name,
      skill: skillName,
      type: type as any,
      topic: topic.trim(),
      speaker: speaker.trim() || undefined,
      screenshotUrl: finalScreenshot,
    });

    setDone(true);
    addNotification(`Attendance (${at?.name}) submitted — now in coach review queue.`);
    syncSubs();
  };

  // Recent submission banner
  const lastSub = submissions[0];

  return (
    <div className="space-y-6">
      {/* Real-time Status Card of Last Submission */}
      {lastSub && (
        <div
          className={`rounded-2xl border p-4 text-xs ${
            lastSub.status === "accepted"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-200"
              : lastSub.status === "rejected"
              ? "border-red-500/40 bg-red-950/20 text-red-200"
              : "border-amber-500/40 bg-amber-950/20 text-amber-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[11px]">
              Latest Submission Review Status:
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                lastSub.status === "accepted"
                  ? "bg-emerald-500/30 text-emerald-300"
                  : lastSub.status === "rejected"
                  ? "bg-red-500/30 text-red-300"
                  : "bg-amber-500/30 text-amber-300 animate-pulse"
              }`}
            >
              {lastSub.status === "accepted"
                ? "Approved ✓"
                : lastSub.status === "rejected"
                ? "Rejected ✕"
                : "Pending Review"}
            </span>
          </div>

          <p className="mt-2 text-sm text-white">
            Your last <strong>{lastSub.type}</strong> submission (<em>"{lastSub.topic}"</em>){" "}
            {lastSub.status === "accepted" ? (
              <span className="text-emerald-400 font-semibold">was approved by faculty coach.</span>
            ) : lastSub.status === "rejected" ? (
              <span className="text-red-300 font-semibold">was rejected: "{lastSub.feedback || "Please re-submit clear proof."}"</span>
            ) : (
              <span className="text-amber-300">is currently pending manual coach review.</span>
            )}
          </p>
        </div>
      )}

      {done ? (
        <Card className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-white">
            <Icon name="check" size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Attendance Proof Submitted!</h3>
          <p className="mt-2 text-sm text-[#b8aecf]">
            Your submission has been queued for manual faculty review. Your status will update on this page as soon as a coach reviews it.
          </p>
          <button
            onClick={() => {
              setDone(false);
              setType("");
              setTopic("");
              setSpeaker("");
              setFileName("");
              setScreenshotData("");
            }}
            className="mt-4 text-sm font-bold text-pink-400 hover:underline"
          >
            Submit Another Proof →
          </button>
        </Card>
      ) : (
        <Card>
          <h3 className="font-bold text-white text-lg">Mark Attendance</h3>
          <p className="mt-1 text-sm text-[#b8aecf]">
            Private to you. Each type is reviewed manually — submit screenshot proof and check back for real-time accepted status.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {ATTENDANCE_TYPES.map((a) => {
              const typeOpen = openSettings[a.key] !== undefined ? openSettings[a.key] : a.open;
              return (
                <button
                  key={a.key}
                  onClick={() => setType(a.key)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${
                    type === a.key
                      ? "border-pink-400/60 bg-pink-500/10 text-white shadow-md glow-pink-sm"
                      : "border-white/10 text-[#b8aecf] hover:border-white/20"
                  }`}
                >
                  <span className="font-semibold block">{a.name}</span>
                  <span className={`block text-[10px] font-bold mt-0.5 ${typeOpen ? "text-emerald-400" : "text-gray-400"}`}>
                    {typeOpen ? "OPEN" : "CLOSED"}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#8a7ba8]">{a.schedule}</span>
                </button>
              );
            })}
          </div>

          {type && (
            <div className="mt-4 space-y-3">
              {gradLocked ? (
                <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                  Graduated students no longer have Class & Assignment access. Unlock a new skill track to regain it.
                </p>
              ) : !isOpen ? (
                <p className="rounded-lg bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-200">
                  This attendance track is currently closed by the coach. Reference: {at?.schedule}.
                </p>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Topic Covered *</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Figma Auto-Layout & Design Tokens"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  {needsSpeaker && (
                    <div>
                      <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Speaker Name *</label>
                      <input
                        className={inputCls}
                        placeholder="e.g. Kenneth Timothy (Timfire)"
                        value={speaker}
                        onChange={(e) => setSpeaker(e.target.value)}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Upload Screenshot Proof *</label>
                    <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-6 text-center text-sm text-[#8a7ba8] hover:border-pink-400/50 transition-colors">
                      <span className="inline-flex items-center gap-2">
                        {fileName ? (
                          <>
                            <Icon name="paperclip" size={15} /> <span className="text-pink-300 font-semibold">{fileName}</span>
                          </>
                        ) : (
                          "Click to choose screenshot from your device"
                        )}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>

                  <GradientButton onClick={submit} className="w-full">
                    Submit for Manual Review →
                  </GradientButton>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      {/* History of submissions */}
      {submissions.length > 0 && (
        <Card>
          <h4 className="font-bold text-white text-base">Your Attendance Submissions History ({submissions.length})</h4>
          <div className="mt-4 space-y-2">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-white/5 bg-black/30 p-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white capitalize">{sub.type}</span>
                    <span className="text-[#8a7ba8]">·</span>
                    <span className="text-[#cabfe0]">{sub.topic}</span>
                    <span
                      className={`rounded-full px-2 py-0.2 text-[9px] font-bold uppercase ${
                        sub.status === "accepted"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : sub.status === "rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  {sub.feedback && (
                    <p className="mt-1 text-[11px] text-[#8a7ba8]">
                      <strong>Feedback: </strong> {sub.feedback}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-[#8a7ba8] shrink-0">
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- Phase 7: Role Offer Activation & Password Setup Modal ---------------- */

function RoleOfferActivationModal({
  offer,
  studentId,
  onActivated,
  onDismissed,
}: {
  offer: {
    title: string;
    role: "admin" | "coach" | "assistant";
    permissions: string[];
    grantAdminAccess: boolean;
    offeredAt: number;
    offeredBy: string;
  };
  studentId: string;
  onActivated: (updated: Account) => void;
  onDismissed: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Strength calculation
  const getStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "bg-gray-600" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { score: 1, label: "Weak (min 8 chars)", color: "bg-red-500" };
    if (score <= 2) return { score: 2, label: "Fair", color: "bg-yellow-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getStrength(password);

  const handleGenerate = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*";
    let res = "KR8@";
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setError("");
    navigator.clipboard?.writeText(res);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleActivate = () => {
    if (password.length < 8) {
      setError("Please set a password of at least 8 characters.");
      return;
    }
    const updated = updateAccount(studentId, {
      admin: {
        role: offer.role,
        title: offer.title,
        permissions: offer.permissions,
        adminPassword: password,
        passwordNotice: "Configured role security password.",
        promotedBy: offer.offeredBy,
      },
      pendingRoleOffer: undefined,
    });
    if (updated) {
      onActivated(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-pink-500/40 bg-[#160d2b] p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-pink text-white text-3xl shadow-xl glow-pink-sm">
            🎉
          </div>
          <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-3 py-1 text-xs font-bold text-pink-300 uppercase tracking-wider">
            Role Promotion Notice
          </span>
          <h2 className="mt-3 font-display text-2xl text-white font-bold">
            Congratulations — You've been promoted to {offer.title} at KR8 Digitals!
          </h2>
          <p className="mt-2 text-xs text-[#cabfe0] leading-relaxed">
            Assigned by <strong className="text-white">{offer.offeredBy}</strong>. Granted access to:{" "}
            <span className="text-pink-300 font-semibold">{offer.permissions.join(", ")}</span>.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200/90 leading-relaxed">
          ⚠️ <strong>Immediate Password Setup Required:</strong> To activate your administrative role access, you must set your security password right now. If you dismiss or leave this prompt without setting a password, the promotion offer will expire automatically.
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white">Create Role Security Password *</label>
            <button
              type="button"
              onClick={handleGenerate}
              className="text-xs font-bold text-pink-400 hover:text-pink-300 underline"
            >
              Generate Strong Password
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter strong role password (min 8 characters)"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
            />
            {copied && (
              <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 font-semibold">
                Copied to clipboard!
              </span>
            )}
          </div>

          {/* Password strength meter */}
          {password && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#8a7ba8]">Strength:</span>
                <span className="font-bold text-white">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : "bg-transparent"}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : "bg-transparent"}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : "bg-transparent"}`} />
                <div className={`h-full flex-1 rounded-full ${strength.score >= 4 ? strength.color : "bg-transparent"}`} />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onDismissed}
            className="w-full sm:w-auto rounded-xl border border-white/10 px-4 py-2.5 text-xs text-[#8a7ba8] hover:text-red-300 hover:border-red-500/30 transition-colors"
          >
            Dismiss (Expires Offer)
          </button>
          <button
            type="button"
            onClick={handleActivate}
            className="w-full sm:w-auto rounded-xl bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-xl glow-pink-sm hover:brightness-110 active:scale-95 transition-all"
          >
            Activate Access Now →
          </button>
        </div>
      </div>
    </div>
  );
}



/* ---------------- Student Certificate Section (Multiple Certificates & Verification) ---------------- */

function StudentCertificateSection({
  profile,
  onDownload,
}: {
  profile: Account;
  onDownload: () => void;
}) {
  const [certs, setCerts] = useState<CertificateRecord[]>(() => getStudentCertificates(profile.id));
  const [notifs, setNotifs] = useState<StudentNotification[]>(() => getStudentNotifications(profile.id));
  const [selectedCertId, setSelectedCertId] = useState<string>(() => {
    const list = getStudentCertificates(profile.id);
    return list[0]?.id || "";
  });
  const [copiedLink, setCopiedLink] = useState(false);

  const refresh = () => {
    const list = getStudentCertificates(profile.id);
    setCerts(list);
    setNotifs(getStudentNotifications(profile.id));
    if (!selectedCertId && list.length > 0) {
      setSelectedCertId(list[0].id);
    }
  };

  useEffect(() => {
    refresh();
    window.addEventListener("kr8:accounts-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:accounts-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [profile.id]);

  const activeCert = certs.find((c) => c.id === selectedCertId) || certs[0];

  const handleCopyLink = (certId?: string) => {
    const cid = certId || activeCert?.id;
    const url = `${window.location.origin}/verify?id=${encodeURIComponent(profile.id)}${cid ? `&cert=${encodeURIComponent(cid)}` : ""}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDismissNotif = (nid: string) => {
    markNotificationRead(profile.id, nid);
    setNotifs(getStudentNotifications(profile.id));
  };

  return (
    <div className="mt-3 space-y-4">
      {/* 1. NOTIFICATIONS BANNER (Congratulations / Withdrawal) */}
      {notifs.filter((n) => !n.read).map((n) => (
        <div
          key={n.id}
          className={`rounded-2xl p-4 border transition-all ${
            n.type === "graduation"
              ? "border-green-500/40 bg-gradient-to-r from-green-950/40 via-[#0d1f11] to-black text-green-200"
              : n.type === "withdrawal"
              ? "border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-[#1f1608] to-black text-amber-200"
              : "border-pink-500/40 bg-pink-950/30 text-pink-200"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">
                {n.type === "graduation" ? "🎓" : n.type === "withdrawal" ? "⚠️" : "📢"}
              </span>
              <h4 className="font-bold text-sm text-white">{n.title}</h4>
            </div>
            <button
              onClick={() => handleDismissNotif(n.id)}
              className="text-xs text-white/60 hover:text-white"
              title="Dismiss notice"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-white/90">{n.message}</p>
          {n.reason && (
            <div className="mt-2.5 rounded-xl bg-black/40 p-2.5 text-xs border border-white/10 text-amber-200">
              <strong>Stated Reason:</strong> <em>"{n.reason}"</em>
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => handleDismissNotif(n.id)}
              className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
            >
              Acknowledge ✓
            </button>
          </div>
        </div>
      ))}

      {/* 2. CERTIFICATES DISPLAY */}
      {certs.length > 0 ? (
        <div className="space-y-4">
          {/* Multi-Certificate Selector Tabs (Requirement 7 & 16) */}
          {certs.length > 1 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8a7ba8] mb-1.5">
                Your Credentials ({certs.length} Certificates)
              </p>
              <div className="flex flex-wrap gap-2">
                {certs.map((c) => {
                  const isSelected = c.id === activeCert?.id;
                  const isWithdrawn = c.status === "withdrawn";
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCertId(c.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all border ${
                        isSelected
                          ? "border-pink-500 bg-gradient-pink text-white shadow-md glow-pink-sm"
                          : "border-white/15 bg-black/30 text-[#cabfe0] hover:border-white/30"
                      }`}
                    >
                      {c.skillName} · {c.tier} {isWithdrawn ? "(Withdrawn)" : "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeCert && (
            <div className="space-y-3">
              {/* Certificate Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">Certificate of {activeCert.tier}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        activeCert.status === "withdrawn"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-green-500/20 text-green-300 border border-green-500/30"
                      }`}
                    >
                      {activeCert.status === "withdrawn" ? "Withdrawn ✕" : "Active & Valid ✓"}
                    </span>
                  </div>
                  <p className="text-xs text-[#8a7ba8] mt-0.5">
                    {activeCert.skillName} · Issued on {new Date(activeCert.issuedAt).toLocaleDateString()}
                  </p>
                  {activeCert.additionalNotes && (
                    <p className="mt-1 text-xs text-pink-300 font-medium">"{activeCert.additionalNotes}"</p>
                  )}
                </div>
              </div>

              {/* Withdrawn Notice */}
              {activeCert.status === "withdrawn" && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3.5 text-xs text-amber-200 space-y-1">
                  <p className="font-bold text-amber-300">⚠️ This certificate has been withdrawn</p>
                  <p className="text-[#fae8c8]">
                    Reason: <em>"{activeCert.withdrawalReason || "Administrative review"}"</em>
                  </p>
                  <p className="text-[11px] text-[#eed6b4] pt-1">
                    The QR code remains active for verification accountability. If you have questions, please reach out to the KR8 administration team.
                  </p>
                </div>
              )}

              {/* Certificate Image Document */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-lg">
                <img
                  src={activeCert.certificateImageUrl}
                  alt={`Certificate of ${profile.name}`}
                  className="w-full object-contain max-h-[380px]"
                />
                <div className="p-2.5 bg-black/80 text-center border-t border-white/10 flex items-center justify-between px-4">
                  <span className="text-[11px] text-green-300 font-semibold flex items-center gap-1">
                    <Icon name="check" size={12} /> Includes verifiable QR code
                  </span>
                  <span className="text-[11px] font-mono text-pink-400">
                    {activeCert.id}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <GradientButton
                  onClick={() => downloadCertificatePdf(profile.name, activeCert.certificateImageUrl)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Icon name="certificate" size={15} /> Download Official PDF →
                </GradientButton>

                {/* Shareable Verification Link */}
                <div className="rounded-2xl border border-pink-400/30 bg-pink-500/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Shareable Verification Reference</p>
                    <span className="text-[10px] text-pink-300 font-mono">Live QR Target</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#b8aecf]">
                    Employers, partners, and clients can verify your certificate status instantly:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={`${window.location.origin}/verify?id=${encodeURIComponent(profile.id)}&cert=${encodeURIComponent(activeCert.id)}`}
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-pink-300 focus:outline-none select-all"
                    />
                    <button
                      onClick={() => handleCopyLink(activeCert.id)}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 whitespace-nowrap"
                    >
                      {copiedLink ? "Copied! ✓" : "Copy Link"}
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-xs">
                    <a
                      href={`/verify?id=${encodeURIComponent(profile.id)}&cert=${encodeURIComponent(activeCert.id)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-pink-300 underline underline-offset-2 hover:text-white"
                    >
                      Test My Verification Page ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : profile.graduated && profile.certificateUrl ? (
        /* Legacy fallback */
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Certificate of {profile.certTier ?? "Completion"}</p>
          <div className="rounded-xl overflow-hidden border border-white/15 bg-black">
            <img src={profile.certificateUrl} alt="Certificate" className="w-full object-contain" />
          </div>
          <GradientButton onClick={onDownload} className="w-full flex items-center justify-center gap-2">
            <Icon name="certificate" size={15} /> Download Certificate (PDF) →
          </GradientButton>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[#8a7ba8]">
          You don't have an issued certificate yet — complete your coursework and live attendance to earn one.
        </p>
      )}
    </div>
  );
}
