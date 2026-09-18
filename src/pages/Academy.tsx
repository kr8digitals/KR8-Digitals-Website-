import { useState, useEffect, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  SKILLS, ATTENDANCE_TYPES, getTestimonials, getTribeWhatsApp, getSkillRegistration, getSkillWhatsApp, buildPhone,
  registerStudent, registerTribe, recoverId, authenticateAccount, getStudents, addFeed, getReferralUrl, updateAccount, requestPasswordReset, completePasswordReset, getFounders,
  type Account, type Skill,
} from "../data/store";
import { Pill, GradientButton, GhostButton, SectionHead, Card, Avatar, Check, ImageWithFallback } from "../components/ui";
import Marquee from "../components/Marquee";
import TestimonialCarousel from "../components/TestimonialCarousel";
import Icon from "../components/Icon";
import CountryPhone from "../components/CountryPhone";
import { downloadCertificatePdf } from "../utils/certificate";

export default function Academy() {
  const { student } = useAuth();
  if (student && student.type === "student") return <Profile student={student} />;
  return <GuestAcademy />;
}

const inputCls = "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

function GuestAcademy() {
  const { signIn, addNotification } = useAuth();
  const [view, setView] = useState<"skills" | "auth">("skills");
  const [curriculum, setCurriculum] = useState<Skill | null>(null);
  const [preSkill, setPreSkill] = useState<string>("");

  return (
    <div>
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="max-w-3xl">
            <Pill>The Academy</Pill>
            <h1 className="font-display mt-5 text-5xl text-white sm:text-6xl">
              Learn a digital skill — <span className="text-gradient">completely free.</span>
            </h1>
            <p className="mt-5 text-[#b8aecf]">
              Six in-demand tracks with real, week-by-week curriculum and real instructors. Register once,
              get a verifiable KR8 Identity, and start learning today.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <GradientButton onClick={() => { setPreSkill(""); setView("auth"); window.scrollTo({ top: 9999, behavior: "smooth" }); }}>Register / Sign In →</GradientButton>
              <GhostButton to="/verify">Verify a KR8 ID</GhostButton>
            </div>
          </div>

          {/* Skill cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              (() => {
                const founderKey = s.key === "graphic" ? "stevenson" : s.key === "video" ? "daniel" : s.key === "web" ? "timfire" : "";
                const instructor = founderKey ? getFounders().find((founder) => founder.key === founderKey) : null;
                const displayInstructor = instructor ? { name: instructor.name, photo: instructor.photo, bio: instructor.bio } : s.instructor;
                return (
              <Card key={s.key} className={`flex flex-col ${!s.available ? "opacity-80" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-pink-300"><Icon name={s.icon as Parameters<typeof Icon>[0]["name"]} size={25} /></span>
                  <span className="rounded-full bg-pink-500/10 px-3 py-1 font-mono text-[11px] text-pink-400">{s.suffix}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{s.name}</h3>
                <p className="mt-2 flex-1 text-sm text-[#b8aecf]">{s.snippet}</p>

                {/* instructor */}
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-black/20 p-3">
                  {s.available && displayInstructor ? (
                    <>
                      <InstructorPhoto src={displayInstructor.photo} name={displayInstructor.name} />
                      <div>
                        <p className="text-xs text-[#8a7ba8]">Instructor</p>
                        <p className="text-sm font-semibold text-white">{displayInstructor.name}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#8a7ba8]">{s.available ? "Instructor: To be announced" : "Not Available"}</p>
                  )}
                </div>

                {/* status */}
                {s.available && (
                  <p className={`mt-3 text-xs font-semibold ${getSkillRegistration(s.key) ? "text-green-400" : "text-yellow-300"}`}>
                    {getSkillRegistration(s.key) ? "● Registration open" : "● Registration closed"}
                  </p>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => s.available && setCurriculum(s)}
                    disabled={!s.available}
                    className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:border-pink-400/60 disabled:opacity-40"
                  >View Curriculum</button>
                  <button
                    onClick={() => { setPreSkill(s.key); setView("auth"); window.scrollTo({ top: 9999, behavior: "smooth" }); }}
                    disabled={!s.available || !getSkillRegistration(s.key)}
                    className="flex-1 rounded-full bg-gradient-pink px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                  >Register</button>
                </div>
              </Card>
                );
              })()
            ))}
          </div>
        </div>
      </section>

      <Marquee items={["Zero cost", "Verifiable KR8 ID", "Real curriculum", "Real instructors", "Learn by doing"]} />

      {/* Auth */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-3xl px-5">
          {view === "auth" ? (
            <AuthPanel
              preSkill={preSkill}
              onStudent={(s) => { signIn(s); addNotification("Registration complete — welcome to KR8 Academy."); }}
              onTribe={(m) => { signIn(m); addNotification(`Welcome to the KR8 Tribe. Join the community group: ${getTribeWhatsApp()}`); }}
              onSignIn={(s) => { signIn(s); addNotification(`Welcome back, ${s.name.split(" ")[0]}!`); }}
            />
          ) : (
            <div className="text-center">
              <GradientButton onClick={() => setView("auth")}>Register or Sign In →</GradientButton>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="Real voices" title="From learners to" highlight="earners" center />
          <div className="mt-10"><TestimonialCarousel items={getTestimonials()} /></div>
        </div>
      </section>

      {curriculum && <CurriculumModal skill={curriculum} onClose={() => setCurriculum(null)} onRegister={() => { setPreSkill(curriculum.key); setCurriculum(null); setView("auth"); window.scrollTo({ top: 9999, behavior: "smooth" }); }} />}
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
          {skill.curriculum.map((w) => (
            <div key={w.week} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">{w.week}</p>
              <h4 className="mt-1 font-bold text-white">{w.title}</h4>
              <ul className="mt-3 space-y-2">{w.points.map((p) => <Check key={p}>{p}</Check>)}</ul>
            </div>
          ))}
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
    const skill = SKILLS.find((s) => s.key === result.skill)!;
    return (
      <Card className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="check" size={28} /></div>
        <h3 className="text-2xl font-bold text-white">You're in!</h3>
        <p className="mt-2 text-[#b8aecf]">Your KR8 Identity has been generated.</p>
        <div className="mx-auto mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-pink-400/40 bg-pink-500/10 px-6 py-4">
          <span className="font-mono text-xl font-bold tracking-wider text-gradient sm:text-2xl">{result.id}</span>
          {result.vip && <span className="rounded-full bg-gradient-pink px-3 py-1 text-xs font-bold text-white">VIP</span>}
        </div>
        {result.admin && <div className="mx-auto mt-4 max-w-lg rounded-xl border border-pink-400/30 bg-pink-500/5 px-4 py-3 text-left text-xs leading-relaxed text-pink-100"><strong className="capitalize">{result.admin.role} access recognized.</strong> {result.admin.passwordNotice} Click the Admin menu and enter this password whenever you need your assigned dashboard sections.</div>}
        <div className="mt-6 space-y-3">
          <GradientButton href={getSkillWhatsApp(skill.key)} className="w-full">Join {skill.name} WhatsApp Group →</GradientButton>
          <a href={getReferralUrl(result.id)} className="block break-all rounded-xl bg-black/30 p-3 text-xs text-pink-300 underline underline-offset-2">Referral link: {getReferralUrl(result.id)}</a>
          <GhostButton onClick={() => onDone(result)} className="w-full">Go to My Profile →</GhostButton>
        </div>
      </Card>
    );
  }

  const submit = () => {
    setError("");
    if (!form.name || !form.email || !form.phone || !form.password || !form.skill || !form.y || !form.m || !form.d) { setError("Please fill in every field, including a password."); return; }
    const res = registerStudent({ name: form.name, email: form.email, phone: buildPhone(form.country === "NG" ? "+234" : form.country === "GH" ? "+233" : form.country === "KE" ? "+254" : form.country === "ZA" ? "+27" : form.country === "GB" ? "+44" : form.country === "AU" ? "+61" : "+1", form.phone), country: form.country, password: form.password, skill: form.skill, dob: `${form.y}-${form.m}-${form.d}` });
    if (!res.ok) { setError(res.error!); return; }
    setResult(res.student!);
  };

  const years = Array.from({ length: 40 }, (_, i) => 2010 - i);
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
          {SKILLS.map((s) => <option key={s.key} value={s.key} disabled={!s.available || !getSkillRegistration(s.key)}>{s.name}{!s.available ? " (Not Available)" : !getSkillRegistration(s.key) ? " (Closed)" : ""}</option>)}
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
    const dial = form.country === "NG" ? "+234" : form.country === "GH" ? "+233" : form.country === "KE" ? "+254" : form.country === "ZA" ? "+27" : form.country === "GB" ? "+44" : form.country === "AU" ? "+61" : "+1";
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
  const [resetId, setResetId] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [msg, setMsg] = useState("");
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
  const requestReset = () => { const result = requestPasswordReset(resetEmail, resetId); setMsg(result.message); if (result.code) setDemoCode(result.code); };
  const finishReset = () => { const result = completePasswordReset(resetId, resetCode, newPassword); setMsg(result.message); if (result.ok) { setMode("id"); setValue(resetId); } };
  return (
    <Card>
      <h3 className="text-xl font-bold text-white">{mode === "id" ? "Sign in with your KR8 ID" : mode === "recover" ? "Recover my KR8 ID" : "Reset my password"}</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">{mode === "id" ? "Enter your ID and password." : mode === "recover" ? "Enter your email or phone to retrieve your ID." : "Verify your email and KR8 ID with a reset code."}</p>
      <div className="mt-5 space-y-4">
        {mode === "reset" ? <>
          <input className={inputCls} placeholder="Registered email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
          <input className={inputCls} placeholder="KR8 ID" value={resetId} onChange={(e) => setResetId(e.target.value)} />
          <GradientButton onClick={requestReset} className="w-full">Email Reset Code</GradientButton>
          {demoCode && <p className="rounded-lg bg-pink-500/10 px-4 py-2 text-xs text-pink-200">Preview fallback code: {demoCode}. Configure the Resend server route for live email delivery.</p>}
          <input className={inputCls} placeholder="Reset code" value={resetCode} onChange={(e) => setResetCode(e.target.value)} />
          <input type="password" className={inputCls} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <GradientButton onClick={finishReset} className="w-full">Set New Password</GradientButton>
        </> : <>
          <input className={inputCls} placeholder={mode === "id" ? "e.g. KR82026KT0001GDVFD" : "Email or phone number"} value={value} onChange={(e) => setValue(e.target.value)} />
          {mode === "id" && <input type="password" className={inputCls} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        </>}
        {msg && <p className="rounded-lg bg-white/5 px-4 py-2.5 text-sm text-[#cabfe0]">{msg}</p>}
        {mode !== "reset" && <GradientButton onClick={submit} className="w-full">{mode === "id" ? "Sign In →" : "Recover ID →"}</GradientButton>}
        <button onClick={() => { setMode(mode === "id" ? "recover" : mode === "recover" ? "reset" : "id"); setMsg(""); }} className="w-full text-center text-sm text-pink-400">{mode === "id" ? "Forgot your ID? Recover it →" : mode === "recover" ? "Lost your password? Reset it →" : "← Back to sign in"}</button>
        <p className="text-center text-xs text-[#8a7ba8]">{mode === "id" ? "Passwords are required for every new account." : ""}</p>
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
  const [copiedVerify, setCopiedVerify] = useState(false);
  const { signIn } = useAuth();
  const skill = SKILLS.find((s) => s.key === profile.skill);
  const ranked = getStudents().filter((account) => !account.isPlaceholder).sort((a, b) => b.points - a.points);
  const rank = ranked.findIndex((s) => s.id === profile.id) + 1;

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

  const copyVerifyLink = () => {
    const url = `${window.location.origin}/verify?id=${encodeURIComponent(profile.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedVerify(true);
    setTimeout(() => setCopiedVerify(false), 2000);
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
              {profile.vip && <span className="rounded-full bg-gradient-pink px-3 py-1 text-xs font-bold text-white">VIP</span>}
              {profile.graduated && <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-[#cabfe0]"><Icon name="certificate" size={13} /> {profile.certTier}</span>}
              {profile.admin && <Link to="/admin" className="rounded-full border border-pink-400/50 bg-pink-500/10 px-3 py-1 text-xs font-bold capitalize text-pink-200 hover:border-pink-300">{profile.admin.title ?? profile.admin.role} · open admin</Link>}
            </div>
            <p className="mt-1 font-mono text-sm text-pink-400">{profile.id}</p>
            <span className="mt-2 inline-block rounded-full bg-pink-500/10 px-3 py-1 text-xs font-semibold text-pink-400">{skill?.name}</span>
            <p className="mt-2 text-[11px] text-[#8a7ba8]">Name, KR8 ID, registration date, skill code and suffix are locked identity fields.</p>
            {profile.admin && <div className="mt-3 max-w-xl rounded-xl border border-pink-400/30 bg-pink-500/5 px-3 py-2 text-xs leading-relaxed text-pink-100">Congratulations — you have {profile.admin.title ?? profile.admin.role} access. Open the Admin menu to use your assigned sections. {profile.admin.role !== "ultimate" && profile.admin.passwordNotice}</div>}
          </div>
          <div className="flex gap-6 pb-2">
            <div className="text-center"><div className="font-display text-2xl text-gradient">#{rank}</div><div className="text-[10px] uppercase text-[#8a7ba8]">Rank</div></div>
            <div className="text-center"><div className="font-display text-2xl text-gradient">{profile.points}</div><div className="text-[10px] uppercase text-[#8a7ba8]">Points</div></div>
            <div className="text-center"><div className="font-display text-2xl text-gradient">{profile.referrals}</div><div className="text-[10px] uppercase text-[#8a7ba8]">Referrals</div></div>
          </div>
        </div>

        {/* Congratulatory Graduation Banner */}
        {profile.graduated && (
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

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-white/10 hide-scrollbar">
          {(["posts", "portfolio", "activity", "about"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-5 py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? "border-b-2 border-pink-400 text-white" : "text-[#b8aecf]"}`}>{t === "portfolio" ? "Portfolio / Submissions" : t}</button>
          ))}
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {tab === "posts" && <AttendanceWidget student={profile} />}
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
              <h3 className="flex items-center gap-2 font-bold text-white"><Icon name="certificate" size={18} /> Official Certificate</h3>
              {profile.graduated ? (
                <div className="mt-3 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Certificate of {profile.certTier ?? "Completion"}</p>
                    <p className="text-xs text-[#8a7ba8]">{skill?.name} · KR8 Digitals</p>
                    {profile.certRecognition && <p className="mt-1 text-xs text-pink-400">"{profile.certRecognition}"</p>}
                  </div>

                  {profile.certificateUrl && (
                    <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/40">
                      <img
                        src={profile.certificateUrl}
                        alt={`Certificate of ${profile.name}`}
                        className="w-full object-contain"
                      />
                      <div className="p-2.5 bg-black/70 text-center border-t border-white/10">
                        <span className="text-[11px] text-green-300 font-semibold flex items-center justify-center gap-1">
                          <Icon name="check" size={12} /> Includes verifiable QR code
                        </span>
                      </div>
                    </div>
                  )}

                  <GradientButton onClick={handleDownload} className="w-full flex items-center justify-center gap-2">
                    <Icon name="certificate" size={15} /> Download Certificate (PDF) →
                  </GradientButton>

                  {/* Shareable Verification Link */}
                  <div className="rounded-2xl border border-pink-400/30 bg-pink-500/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">Verification Link</p>
                      <span className="text-[10px] text-pink-300">Direct proof</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#b8aecf]">
                      Share this link with employers, clients or on LinkedIn to confirm your certificate without needing to scan the QR code:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        readOnly
                        value={`${window.location.origin}/verify?id=${encodeURIComponent(profile.id)}`}
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[11px] text-pink-300 focus:outline-none select-all"
                      />
                      <button
                        onClick={copyVerifyLink}
                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20 whitespace-nowrap"
                      >
                        {copiedVerify ? "Copied! ✓" : "Copy Link"}
                      </button>
                    </div>
                    <a
                      href={`/verify?id=${encodeURIComponent(profile.id)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center text-xs text-pink-300 underline underline-offset-2 hover:text-white pt-1"
                    >
                      Open My Verify Page ↗
                    </a>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#8a7ba8]">You don't have a certificate yet — complete your training to earn one.</p>
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
  const [file, setFile] = useState("");
  const [done, setDone] = useState(false);
  const at = ATTENDANCE_TYPES.find((a) => a.key === type);
  const gradLocked = student.graduated && (type === "class" || type === "assignment");
  const needsSpeaker = type === "mindset" || type === "hangout";

  const submit = () => {
    if (!type || !topic || !file) return;
    setDone(true);
    addNotification(`Attendance (${at?.name}) submitted — pending review.`);
    addFeed({ kind: "submission", name: student.name, skill: SKILLS.find((s) => s.key === student.skill)?.name ?? "", avatar: student.avatar });
  };

  if (done) {
    return (
      <Card className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/20 text-white"><Icon name="message" size={22} /></div>
        <h3 className="text-lg font-bold text-white">Submitted — Pending Review</h3>
        <p className="mt-2 text-sm text-[#b8aecf]">Your {at?.name} attendance is now in the coach queue. Check back later for Accepted / Rejected status.</p>
        <button onClick={() => { setDone(false); setType(""); setTopic(""); setFile(""); }} className="mt-4 text-sm text-pink-400">Submit another →</button>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-bold text-white">Mark Attendance</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Private to you. Each type is reviewed manually — submit proof and check back later.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {ATTENDANCE_TYPES.map((a) => (
          <button key={a.key} onClick={() => setType(a.key)} className={`rounded-xl border px-3 py-3 text-left text-sm transition-colors ${type === a.key ? "border-pink-400/60 bg-pink-500/10 text-white" : "border-white/10 text-[#b8aecf]"}`}>
            <span className="font-semibold">{a.name}</span>
            <span className={`block text-[10px] ${a.open ? "text-green-400" : "text-red-400"}`}>{a.open ? "OPEN" : "CLOSED"}</span>
            <span className="mt-1 block text-[10px] text-[#8a7ba8]">{a.schedule}</span>
          </button>
        ))}
      </div>
      {type && (
        <div className="mt-4 space-y-3">
          {gradLocked ? (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">Graduated students no longer have Class & Assignment access. Unlock a new skill track to regain it.</p>
          ) : !at?.open ? (
            <p className="rounded-lg bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-200">This type is currently closed by the coach. Reference: {at?.schedule}.</p>
          ) : (
            <>
              <input className={inputCls} placeholder="Topic covered" value={topic} onChange={(e) => setTopic(e.target.value)} />
              {needsSpeaker && <input className={inputCls} placeholder="Speaker name" value={speaker} onChange={(e) => setSpeaker(e.target.value)} />}
              <label className="block cursor-pointer rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-6 text-center text-sm text-[#8a7ba8]">
                <span className="inline-flex items-center gap-2">{file ? <><Icon name="paperclip" size={15} /> {file}</> : "Upload screenshot proof"}</span>
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
              </label>
              <GradientButton onClick={submit} className="w-full">Submit for Review →</GradientButton>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

