import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { IMG } from "../data/images";
import {
  tribeCount,
  registerTribe,
  buildPhone,
  updateAccount,
} from "../data/store";
import { useAuth } from "../context/AuthContext";
import { Pill, GradientButton, GhostButton, SectionHead, Card, Check, GlowImage } from "../components/ui";
import Marquee from "../components/Marquee";
import LiveFeed from "../components/LiveFeed";
import Icon from "../components/Icon";
import CountryPhone from "../components/CountryPhone";

const how = [
  { icon: "palette" as const, t: "Critique Over Clout", d: "Post messy work-in-progress drafts and get actionable technical feedback from seasoned seniors without being judged." },
  { icon: "users" as const, t: "Internal Gig Flow", d: "When one of our creators gets overwhelmed with client retainers, the overflow goes straight into the Tribe WhatsApp & forum." },
  { icon: "bolt" as const, t: "Interdisciplinary Sprints", d: "Developers partner with 3D artists and copywriters to ship comprehensive client proposals and split high tickets." },
  { icon: "calendar" as const, t: "Mindset & Industry Shifts", d: "Fortnightly live teardowns on freelancing, client psychology, international pricing, and career longevity." },
];

const rules = [
  "Zero spam, fake guru schemes, or unsolicited sales pitches",
  "Radical generosity: uplift and mentor younger creators with patience",
  "Ruthless craft standards: give specific, actionable design & code feedback",
  "Lift as you climb: share client leads and opportunities openly",
];

const AVAILABLE_INTERESTS = [
  "Graphic Design",
  "Video Editing",
  "Web Development",
  "UI/UX Design",
  "AI & Content Creation",
  "Brand Strategy",
  "Freelancing & Client Acquisition",
  "Motion Graphics",
];

export default function Tribe() {
  const { user, signIn, addNotification } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "NG",
    password: "",
    reason: "",
    interests: [] as string[],
  });
  const [err, setErr] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ org: "", email: "", proposal: "" });
  const [editingInterests, setEditingInterests] = useState(false);
  const [activeInterests, setActiveInterests] = useState<string[]>(
    user?.interests && user.interests.length > 0 ? user.interests : ["Graphic Design", "Digital Skills"]
  );

  const inputCls =
    "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

  const toggleInterest = (interest: string) => {
    setForm((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
      };
    });
  };

  const toggleUserInterest = (interest: string) => {
    const updated = activeInterests.includes(interest)
      ? activeInterests.filter((i) => i !== interest)
      : [...activeInterests, interest];
    setActiveInterests(updated);
    if (user) {
      updateAccount(user.id, { interests: updated });
    }
  };

  const join = () => {
    setErr("");
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.password) {
      setErr("Please fill in full name, email, phone number, and a password.");
      return;
    }
    const dial =
      form.country === "NG"
        ? "+234"
        : form.country === "GH"
        ? "+233"
        : form.country === "KE"
        ? "+254"
        : form.country === "ZA"
        ? "+27"
        : form.country === "GB"
        ? "+44"
        : form.country === "AU"
        ? "+61"
        : "+1";

    const res = registerTribe({
      name: form.name,
      email: form.email,
      phone: buildPhone(dial, form.phone),
      country: form.country,
      password: form.password,
      interests: form.interests.length > 0 ? form.interests : ["Creative Tech & Design"],
      reason: form.reason || "Learning & Growing in Community",
    });

    if (!res.ok) {
      setErr(res.error!);
      return;
    }

    signIn(res.member!);
    const isFounder = res.member?.type === "founder";
    const isCoFounder = res.member?.type === "co-founder";

    addNotification(
      isFounder
        ? "Welcome Founder & CEO! Executive identity confirmed."
        : isCoFounder
        ? "Welcome Co-Founder! Executive identity confirmed."
        : "Welcome to the KR8 Tribe! Your membership is active."
    );
  };

  const copyReferral = () => {
    const code = user?.id || "TRIBE";
    const refUrl = `${window.location.origin}/tribe?ref=${code}`;
    navigator.clipboard?.writeText(refUrl);
    setCopiedLink(true);
    addNotification("Referral link copied! Share with friends to earn XP.");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerSubmitted(true);
    addNotification("Partnership inquiry recorded! Our leadership team will connect.");
    setTimeout(() => {
      setPartnerModalOpen(false);
      setPartnerSubmitted(false);
      setPartnerForm({ org: "", email: "", proposal: "" });
    }, 2500);
  };

  const memberRank = useMemo(() => {
    if (!user) return null;
    if (user.type === "founder") return { title: "Founder & CEO", badgeCls: "bg-amber-500/20 text-amber-300 border-amber-500/40" };
    if (user.type === "co-founder") return { title: "Co-Founder", badgeCls: "bg-purple-500/20 text-purple-300 border-purple-500/40" };
    if (user.type === "student") return { title: "Academy Scholar & Citizen", badgeCls: "bg-pink-500/20 text-pink-300 border-pink-500/40" };
    return { title: "Tribe Citizen", badgeCls: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" };
  }, [user]);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="section-bg overflow-hidden py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Pill>The Creative Family</Pill>
            <h1 className="font-display mt-5 text-4xl uppercase leading-[0.98] text-white sm:text-6xl font-bold">
              Isolation kills craft. You never have to <span className="text-gradient">build alone.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base sm:text-lg text-[#cabfe0] leading-relaxed">
              Late nights staring at Figma, Premiere, or VS Code trying to figure it all out alone are over. The KR8 Tribe is an unbroken African creative family of 3,000+ designers, video directors, web developers, and founders. We share raw drafts, swap paid gigs, review portfolios with zero ego, and lift each other into financial freedom.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              {user ? (
                <GradientButton href="#profile">View Your Tribe Profile ↓</GradientButton>
              ) : (
                <GradientButton href="#join" className="shadow-xl shadow-pink-500/25">Join the Tribe (100% Free) →</GradientButton>
              )}
              <GhostButton to="/blog">Read Community Stories</GhostButton>
            </div>
            <div className="mt-10 flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="font-display text-4xl sm:text-5xl text-gradient font-bold">{tribeCount().toLocaleString()}</div>
                <div className="text-xs uppercase tracking-wider text-[#a594c7] mt-1">Creators & Builders</div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div>
                <div className="font-display text-4xl sm:text-5xl text-white font-bold">100% Free</div>
                <div className="text-xs uppercase tracking-wider text-[#a594c7] mt-1">Zero Cost Barrier</div>
              </div>
            </div>
          </div>
          <GlowImage src={IMG.collab2} alt="The KR8 Tribe" className="aspect-[4/3]" />
        </div>
      </section>

      <Marquee
        items={[
          "Think It. KR8 It",
          "Everyone belongs",
          "No status barriers",
          "Win together",
          "Grow together",
          "Recommend each other",
          "Zero tuition barrier",
        ]}
      />

      {/* DISTINCTIVE TRIBE MEMBER PROFILE (WHEN LOGGED IN) */}
      {user && (
        <section id="profile" className="section-bg py-16">
          <div className="mx-auto max-w-5xl px-5">
            <SectionHead label="Tribe Citizen Profile" title="Your distinctive" highlight="membership" center />
            
            <div className="mt-8 overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-b from-[#1f1238] to-[#120a22] p-6 sm:p-10 shadow-2xl relative">
              {/* Subtle ambient glow */}
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-pink text-white text-3xl font-black shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black text-white text-xs">
                      ✓
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                      <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${memberRank?.badgeCls}`}>
                        {memberRank?.title}
                      </span>
                    </div>
                    <p className="text-xs text-[#b8aecf] mt-1">{user.email} · {user.country || "Global"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-mono text-pink-300">
                        {user.id}
                      </span>
                      {user.type === "student" && (
                        <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[11px] text-emerald-300">
                          Automatic Academy Enrollment Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-black/40 p-4 rounded-2xl border border-white/10">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase tracking-wider text-[#8a7ba8]">Community XP</p>
                    <p className="text-2xl font-black text-gradient">{user.points || 50} XP</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-pink-300">
                    <Icon name="trophy" size={14} />
                    <span>Good Standing</span>
                  </div>
                </div>
              </div>

              {/* Creative Interests Section */}
              <div className="mt-6 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="palette" size={16} className="text-pink-400" />
                    <h3 className="text-sm font-bold text-white">Your Creative Interests & Tracks</h3>
                  </div>
                  <button
                    onClick={() => setEditingInterests(!editingInterests)}
                    className="text-xs text-pink-400 hover:text-pink-300 underline"
                  >
                    {editingInterests ? "Done Editing" : "Edit Interests"}
                  </button>
                </div>

                {editingInterests ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {AVAILABLE_INTERESTS.map((int) => {
                      const selected = activeInterests.includes(int);
                      return (
                        <button
                          key={int}
                          onClick={() => toggleUserInterest(int)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                            selected
                              ? "bg-gradient-pink text-white shadow-md"
                              : "border border-white/15 bg-black/30 text-[#b8aecf] hover:border-white/30"
                          }`}
                        >
                          {selected ? "✓ " : "+ "} {int}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {activeInterests.map((int) => (
                      <span
                        key={int}
                        className="rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-xs font-medium text-pink-200"
                      >
                        ✦ {int}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* THE 5 DISTINCTIVE MEMBER ACTIONS ("THE URGES") */}
              <div className="mt-8">
                <h3 className="text-base font-bold text-white mb-2">Member Action Center</h3>
                <p className="text-xs text-[#b8aecf] mb-6">
                  As a KR8 Tribe citizen, unlock high-income opportunities through our 5 core pillars:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Urge 1: Master Skills */}
                  <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-pink-500/40 transition-all">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 mb-3">
                        <Icon name="certificate" size={20} />
                      </div>
                      <h4 className="font-bold text-white text-sm">1. Master High-Demand Skills</h4>
                      <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                        Transition from amateur to paid pro. Join our cohort classes in graphic design, web dev, and video editing 100% free.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <Link
                        to="/academy"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300"
                      >
                        Go to Academy Classes →
                      </Link>
                    </div>
                  </div>

                  {/* Urge 2: Hire Agency */}
                  <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-pink-500/40 transition-all">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mb-3">
                        <Icon name="briefcase" size={20} />
                      </div>
                      <h4 className="font-bold text-white text-sm">2. Hire KR8 Agency</h4>
                      <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                        Running a business or project? Hire our elite team of vetted African designers, video editors, and engineers.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <Link
                        to="/agency"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-purple-200"
                      >
                        Explore Agency Portfolio →
                      </Link>
                    </div>
                  </div>

                  {/* Urge 3: Partner With Us */}
                  <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-pink-500/40 transition-all">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 mb-3">
                        <Icon name="bolt" size={20} />
                      </div>
                      <h4 className="font-bold text-white text-sm">3. Partner With Us</h4>
                      <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                        Sponsor cohorts, co-host campus hackathons, or hire direct talent pipelines from our verified graduate network.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <button
                        onClick={() => setPartnerModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-cyan-200"
                      >
                        Submit Partnership Pitch →
                      </button>
                    </div>
                  </div>

                  {/* Urge 4: Refer Creatives */}
                  <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-pink-500/40 transition-all">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-3">
                        <Icon name="users" size={20} />
                      </div>
                      <h4 className="font-bold text-white text-sm">4. Refer Fellow Creatives</h4>
                      <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                        Earn 50 Community XP when you invite friends and fellow builders into the Tribe.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <button
                        onClick={copyReferral}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200"
                      >
                        {copiedLink ? "✓ Invite Link Copied!" : "Copy Your Invite Link →"}
                      </button>
                    </div>
                  </div>

                  {/* Urge 5: Blog & Storytelling */}
                  <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-pink-500/40 transition-all">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 mb-3">
                        <Icon name="pen" size={20} />
                      </div>
                      <h4 className="font-bold text-white text-sm">5. Open Community Blog</h4>
                      <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                        Publish your stories, design processes, videos, or tutorials directly to our public audience.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <Link
                        to="/blog"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300"
                      >
                        Write or Read Stories →
                      </Link>
                    </div>
                  </div>

                  {/* Urge 6: AI Mentorship */}
                  <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/40 p-5 hover:border-pink-500/40 transition-all">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-3">
                        <Icon name="spark" size={20} />
                      </div>
                      <h4 className="font-bold text-white text-sm">6. KR8 AI Assistant</h4>
                      <p className="text-xs text-[#b8aecf] mt-1.5 leading-relaxed">
                        Consult your 24/7 AI creative director for feedback, project breakdowns, and prompt generation.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <Link
                        to="/ai"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200"
                      >
                        Chat with KR8 AI →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* PARTNERSHIP MODAL */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-[#160d2b] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Icon name="bolt" size={18} className="text-pink-400" />
                <h4 className="font-bold text-white text-base">Partner With KR8 Digitals</h4>
              </div>
              <button
                onClick={() => setPartnerModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            {partnerSubmitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Icon name="check" size={22} />
                </div>
                <h4 className="font-bold text-white text-lg">Proposal Received!</h4>
                <p className="mt-2 text-xs text-[#b8aecf]">
                  Our leadership team (Timfire & Co-Founders) will review your partnership request and reach out.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Brand or Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fintech Africa, Campus Tech Club, Media Studio"
                    value={partnerForm.org}
                    onChange={(e) => setPartnerForm({ ...partnerForm, org: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Official Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@organization.com"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Partnership Vision / Scope *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="How would you like to collaborate? (e.g. Sponsoring cohort prizes, co-creating creative curriculum, hiring grads)"
                    value={partnerForm.proposal}
                    onChange={(e) => setPartnerForm({ ...partnerForm, proposal: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setPartnerModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[#b8aecf]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Send Proposal →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* HOW IT WORKS */}
      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="How it works" title="Show up, share," highlight="grow" center />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {how.map((h) => (
              <Card key={h.t}>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white">
                  <Icon name={h.icon} size={22} />
                </div>
                <h3 className="font-bold text-white">{h.t}</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">{h.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHO CAN JOIN & RULES */}
      <section className="section-bg py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-3">
          <Card>
            <h3 className="font-display text-2xl uppercase text-white">Who can join</h3>
            <p className="mt-3 text-sm text-[#b8aecf]">
              Everyone. No KR8 ID or preliminary test required. If you want to learn, collaborate, hire,
              or build creative projects across Africa, you have a seat at this table.
            </p>
          </Card>
          <Card>
            <h3 className="font-display text-2xl uppercase text-white">Programs</h3>
            <ul className="mt-4 space-y-3">
              <Check>Mindset Shift — biweekly live creative sessions</Check>
              <Check>Creator Hangout — monthly showcase & games</Check>
              <Check>Special Portfolio Days — capstone reviews</Check>
            </ul>
          </Card>
          <Card>
            <h3 className="font-display text-2xl uppercase text-white">Tribe rules</h3>
            <ul className="mt-4 space-y-3">
              {rules.map((r) => (
                <Check key={r}>{r}</Check>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* LIVE FEED & EVENTS */}
      <section className="section-bg py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <SectionHead label="Live in the Tribe" title="Happening" highlight="right now" />
            <div className="mt-8">
              <LiveFeed />
            </div>
          </div>
          <div>
            <SectionHead label="Upcoming events" title="Mark your" highlight="calendar" />
            <div className="mt-8 space-y-4">
              {[
                { d: "SUN", n: "16", t: "Mindset Shift Session", s: "9PM–12AM WAT · Live Online" },
                { d: "SUN", n: "23", t: "Creator Portfolio Jam", s: "9PM–12AM WAT · Tribe Room" },
                { d: "SAT", n: "01", t: "Agency Spec Challenge", s: "All day · Client Simulation" },
              ].map((e) => (
                <div key={e.t} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-gradient-pink text-white">
                    <span className="text-[10px]">{e.d}</span>
                    <span className="font-display text-xl leading-none">{e.n}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{e.t}</p>
                    <p className="text-xs text-[#8a7ba8]">{e.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION SECTION (NO ID REQUIRED) */}
      {!user && (
        <section id="join" className="section-bg py-16">
          <div className="mx-auto max-w-2xl px-5">
            <SectionHead label="Tribe Onboarding" title="Join the" highlight="Tribe" center />
            <p className="text-center text-xs text-[#8a7ba8] mt-2">
              Zero ID barrier. Enter your basic details and creative interests to start connecting immediately.
            </p>

            <div className="mt-8">
              <Card>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Full Name *</label>
                    <input
                      className={inputCls}
                      placeholder="e.g. Emmanuel Okon"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Email Address *</label>
                    <input
                      className={inputCls}
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Phone Number (with country) *</label>
                    <CountryPhone
                      country={form.country}
                      phone={form.phone}
                      onCountry={(country) => setForm({ ...form, country })}
                      onPhone={(phone) => setForm({ ...form, phone })}
                      inputClass={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Create Password *</label>
                    <input
                      type="password"
                      className={inputCls}
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>

                  {/* Creative Interests Multi-Select */}
                  <div>
                    <label className="block text-xs font-semibold text-[#e8ddf5] mb-1.5">
                      Select Your Creative Interests (Pick one or more)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_INTERESTS.map((interest) => {
                        const isSelected = form.interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-gradient-pink text-white shadow-md scale-105"
                                : "border border-white/15 bg-black/30 text-[#b8aecf] hover:border-white/30"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "} {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">What brings you to the Tribe?</label>
                    <select
                      className={inputCls}
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    >
                      <option value="">Select your main goal</option>
                      {[
                        "Learn High-Income Creative Skills",
                        "Find Freelance Clients & Projects",
                        "Collaborate with Fellow Builders",
                        "Hire Agency Talents for My Brand",
                        "Explore Creative Networking & Mentorship",
                      ].map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {err && (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
                      {err}
                    </p>
                  )}

                  <GradientButton onClick={join} className="w-full">
                    Join the Tribe (Free, No ID Required) →
                  </GradientButton>

                  <div className="text-center pt-2">
                    <p className="text-xs text-[#8a7ba8]">
                      Already have an account?{" "}
                      <Link to="/academy" className="text-pink-400 font-semibold hover:underline">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
