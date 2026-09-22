import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  SKILLS,
  registerStudent,
  registerTribe,
  buildPhone,
  countryByCode,
  getSkillRegistration,
  getSkillWhatsApp,
  getReferralUrl,
  type Account,
} from "../data/store";
import { Card, GradientButton, GhostButton, Pill } from "../components/ui";
import CountryPhone from "../components/CountryPhone";
import Icon from "../components/Icon";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const { user, signIn, addNotification } = useAuth();

  const initialSkill = searchParams.get("skill") || "";
  const initialType = searchParams.get("type") === "tribe" ? "tribe" : "student";
  const initialEmail = searchParams.get("email") || "";
  const initialName = searchParams.get("name") || "";

  const [tab, setTab] = useState<"student" | "tribe">(initialType);

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: initialName,
    email: initialEmail,
    phone: "",
    country: "NG",
    password: "",
    skill: initialSkill,
    y: "",
    m: "",
    d: "",
  });

  // Tribe form state
  const [tribeForm, setTribeForm] = useState({
    name: initialName,
    email: initialEmail,
    phone: "",
    country: "NG",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [createdAccount, setCreatedAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (initialSkill) {
      setStudentForm((prev) => ({ ...prev, skill: initialSkill }));
    }
  }, [initialSkill]);

  const currentYear = new Date().getFullYear();
  // No age restrictions: span from current year down to 1920
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  const inputCls =
    "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !studentForm.name.trim() ||
      !studentForm.email.trim() ||
      !studentForm.phone.trim() ||
      !studentForm.password ||
      !studentForm.skill ||
      !studentForm.y ||
      !studentForm.m ||
      !studentForm.d
    ) {
      setError("Please fill in every field, including full name, email, phone, password, skill, and birth date.");
      return;
    }

    if (studentForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const dial = countryByCode(studentForm.country)?.dial || "+234";
    const res = registerStudent({
      name: studentForm.name.trim(),
      email: studentForm.email.trim(),
      phone: buildPhone(dial, studentForm.phone),
      country: studentForm.country,
      password: studentForm.password,
      skill: studentForm.skill,
      dob: `${studentForm.y}-${studentForm.m}-${studentForm.d}`,
    });

    if (!res.ok || !res.student) {
      setError(res.error || "Registration could not be completed. Please check your information.");
      return;
    }

    signIn(res.student);
    addNotification("Registration successful! Welcome to KR8 Academy.");
    setCreatedAccount(res.student);
  };

  const handleTribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tribeForm.name.trim() || !tribeForm.email.trim() || !tribeForm.phone.trim() || !tribeForm.password) {
      setError("Please fill in full name, email, phone number, and a password.");
      return;
    }

    if (tribeForm.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const dial = countryByCode(tribeForm.country)?.dial || "+234";
    const res = registerTribe({
      name: tribeForm.name.trim(),
      email: tribeForm.email.trim(),
      phone: buildPhone(dial, tribeForm.phone),
      country: tribeForm.country,
      password: tribeForm.password,
    });

    if (!res.ok || !res.member) {
      setError(res.error || "Could not register Tribe member.");
      return;
    }

    signIn(res.member);
    addNotification("Welcome to the KR8 Tribe family!");
    setCreatedAccount(res.member);
  };

  // If successfully created
  if (createdAccount) {
    const isFounder = createdAccount.type === "founder";
    const isCoFounder = createdAccount.type === "co-founder";
    const skillObj = SKILLS.find((s) => s.key === createdAccount.skill);

    return (
      <div className="section-bg min-h-[85vh] py-16 px-5 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <Card className="text-center p-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-pink text-white shadow-lg shadow-pink-500/30">
              <Icon name="check" size={32} />
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {isFounder ? "Welcome, KR8 Founder & CEO!" : isCoFounder ? "Welcome, KR8 Co-Founder!" : "You're Registered!"}
            </h2>

            <p className="mt-2 text-sm text-[#cabfe0]">
              Your official KR8 Identity and 5-day persistent device session have been activated.
            </p>

            <div className="mx-auto mt-6 rounded-2xl border border-pink-500/40 bg-pink-500/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-pink-300">Your Verifiable KR8 ID</p>
              <p className="font-mono text-2xl sm:text-3xl font-black text-white mt-1 tracking-wider">{createdAccount.id}</p>
              <p className="mt-2 text-xs text-[#a594c7]">Save this ID or use your registered email with your password anytime.</p>
            </div>

            <div className="mt-6 space-y-3">
              {(isFounder || isCoFounder) && (
                <GradientButton to="/admin" className="w-full">
                  Open Executive Admin Portal →
                </GradientButton>
              )}

              {skillObj && (
                <GhostButton href={getSkillWhatsApp(skillObj.key)} className="w-full border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10">
                  Join {skillObj.name} WhatsApp Cohort Group →
                </GhostButton>
              )}

              <GradientButton to="/dashboard" className="w-full shadow-lg shadow-pink-500/25">
                Go to My Student Dashboard →
              </GradientButton>

              <div className="pt-2">
                <a
                  href={getReferralUrl(createdAccount.id)}
                  className="block break-all rounded-xl bg-black/40 p-3 text-xs text-pink-300 hover:text-pink-200 underline"
                >
                  Your Invite Link: {getReferralUrl(createdAccount.id)}
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="section-bg min-h-[85vh] py-12 sm:py-16 px-5">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <Pill>Official Registration</Pill>
          <h1 className="font-display mt-4 text-3xl sm:text-5xl font-bold text-white">
            Create Your <span className="text-gradient">KR8 Account</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#cabfe0]">
            100% Tuition-Free. Intensive cohorts, verifiable graduation certificates, and lifetime access to our creative network.
          </p>

          {/* Already have an account prompt */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-[#a594c7]">
            <span>Already have an account?</span>
            <Link to="/signin" className="font-bold text-pink-400 hover:text-pink-300 underline">
              Sign In here →
            </Link>
          </div>
        </div>

        {/* Existing active user alert */}
        {user && (
          <div className="mb-6 rounded-2xl border border-pink-500/40 bg-pink-500/10 p-4 text-center">
            <p className="text-xs sm:text-sm text-pink-200">
              You are currently signed in as <span className="font-bold text-white">{user.name}</span> ({user.id}).
            </p>
            <div className="mt-3 flex justify-center gap-3">
              <GradientButton to="/dashboard" className="text-xs px-4 py-2">
                Go to Dashboard →
              </GradientButton>
            </div>
          </div>
        )}

        <Card className="p-6 sm:p-8">
          {/* Tab Selector: Student vs Tribe */}
          <div className="mb-8 flex rounded-full border border-white/10 bg-white/[0.03] p-1.5">
            <button
              type="button"
              onClick={() => {
                setTab("student");
                setError("");
              }}
              className={`flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                tab === "student" ? "bg-gradient-pink text-white shadow-lg" : "text-[#b8aecf] hover:text-white"
              }`}
            >
              Academy Student (Full Cohort)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("tribe");
                setError("");
              }}
              className={`flex-1 rounded-full py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                tab === "tribe" ? "bg-gradient-pink text-white shadow-lg" : "text-[#b8aecf] hover:text-white"
              }`}
            >
              Tribe Member (Community Only)
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/15 p-3.5 text-xs font-semibold text-red-200">
              {error}
            </div>
          )}

          {tab === "student" ? (
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Okafor"
                  className={inputCls}
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Real Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={inputCls}
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-[#8a7ba8]">
                  Used for account recovery and linked sign-in methods (including Google).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Country & Phone Number *
                </label>
                <CountryPhone
                  country={studentForm.country}
                  phone={studentForm.phone}
                  onCountry={(country) => setStudentForm({ ...studentForm, country })}
                  onPhone={(phone) => setStudentForm({ ...studentForm, phone })}
                  inputClass={inputCls}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">
                    Create Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-pink-400 hover:text-pink-300"
                  >
                    {showPassword ? "Hide password" : "Show password"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  className={inputCls}
                  value={studentForm.password}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Select Your Skill Focus *
                </label>
                <select
                  required
                  className={inputCls}
                  value={studentForm.skill}
                  onChange={(e) => setStudentForm({ ...studentForm, skill: e.target.value })}
                >
                  <option value="" className="bg-[#12001f] text-white">Choose a skill track…</option>
                  {SKILLS.map((s) => (
                    <option
                      key={s.key}
                      value={s.key}
                      disabled={!s.available || !getSkillRegistration(s.key)}
                      className="bg-[#12001f] text-white"
                    >
                      {s.name} {!s.available ? "(Not Available)" : !getSkillRegistration(s.key) ? "(Registration Closed)" : "(Cohort Open)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Date of Birth (All ages welcome) *
                </label>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <select
                    required
                    className={inputCls}
                    value={studentForm.y}
                    onChange={(e) => setStudentForm({ ...studentForm, y: e.target.value })}
                  >
                    <option value="" className="bg-[#12001f] text-white">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y} className="bg-[#12001f] text-white">
                        {y}
                      </option>
                    ))}
                  </select>

                  <select
                    required
                    className={inputCls}
                    value={studentForm.m}
                    onChange={(e) => setStudentForm({ ...studentForm, m: e.target.value })}
                  >
                    <option value="" className="bg-[#12001f] text-white">Month</option>
                    {months.map((m) => (
                      <option key={m} value={m} className="bg-[#12001f] text-white">
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    required
                    className={inputCls}
                    value={studentForm.d}
                    onChange={(e) => setStudentForm({ ...studentForm, d: e.target.value })}
                  >
                    <option value="" className="bg-[#12001f] text-white">Day</option>
                    {days.map((d) => (
                      <option key={d} value={d} className="bg-[#12001f] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3">
                <GradientButton type="submit" className="w-full py-3.5 shadow-xl shadow-pink-500/25 text-sm font-bold">
                  Complete Registration & Generate KR8 ID →
                </GradientButton>
              </div>
            </form>
          ) : (
            <form onSubmit={handleTribeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grace Afolayan"
                  className={inputCls}
                  value={tribeForm.name}
                  onChange={(e) => setTribeForm({ ...tribeForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className={inputCls}
                  value={tribeForm.email}
                  onChange={(e) => setTribeForm({ ...tribeForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Country & Phone Number *
                </label>
                <CountryPhone
                  country={tribeForm.country}
                  phone={tribeForm.phone}
                  onCountry={(country) => setTribeForm({ ...tribeForm, country })}
                  onPhone={(phone) => setTribeForm({ ...tribeForm, phone })}
                  inputClass={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className={inputCls}
                  value={tribeForm.password}
                  onChange={(e) => setTribeForm({ ...tribeForm, password: e.target.value })}
                />
              </div>

              <div className="pt-3">
                <GradientButton type="submit" className="w-full py-3.5 shadow-xl shadow-pink-500/25 text-sm font-bold">
                  Join the Tribe Family (100% Free) →
                </GradientButton>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
