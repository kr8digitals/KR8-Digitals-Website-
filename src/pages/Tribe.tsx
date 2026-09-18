import { useState } from "react";
import { IMG } from "../data/images";
import { tribeCount, CONTACT, getTribeWhatsApp, registerTribe, buildPhone, type Account } from "../data/store";
import { useAuth } from "../context/AuthContext";
import { Pill, GradientButton, GhostButton, SectionHead, Card, Check, GlowImage } from "../components/ui";
import Marquee from "../components/Marquee";
import LiveFeed from "../components/LiveFeed";
import Icon from "../components/Icon";
import CountryPhone from "../components/CountryPhone";

const how = [
  { icon: "palette" as const, t: "Share your work", d: "Post progress, get feedback, and be seen." },
  { icon: "users" as const, t: "Get recommended", d: "Members refer each other for real opportunities." },
  { icon: "bolt" as const, t: "Collaborate", d: "Team up on projects and grow faster together." },
  { icon: "calendar" as const, t: "Attend programs", d: "Mindset Shifts, Hangouts and special days." },
];

const rules = ["No spam links unless authorised", "Respect everyone, always", "No unsolicited self-promotion", "Lift others as you climb"];

export default function Tribe() {
  const { signIn, addNotification } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "NG", password: "", reason: "" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const inputCls = "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

  const join = () => {
    setErr("");
    if (!form.name || !form.email || !form.phone || !form.password) { setErr("Please fill in name, email, phone and password."); return; }
    const dial = form.country === "NG" ? "+234" : form.country === "GH" ? "+233" : form.country === "KE" ? "+254" : form.country === "ZA" ? "+27" : form.country === "GB" ? "+44" : form.country === "AU" ? "+61" : "+1";
    const res = registerTribe({ name: form.name, email: form.email, phone: buildPhone(dial, form.phone), country: form.country, password: form.password });
    if (!res.ok) { setErr(res.error!); return; }
    signIn(res.member!);
    const isFounder = res.member?.type === "founder";
    const isCoFounder = res.member?.type === "co-founder";
    addNotification(
      isFounder
        ? "Welcome, Founder & CEO! Executive identity confirmed."
        : isCoFounder
        ? "Welcome, Co-Founder! Executive identity confirmed."
        : "Welcome to the KR8 Tribe."
    );
    setDone(true);
  };

  return (
    <div>
      <section className="section-bg overflow-hidden py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <Pill>The Community</Pill>
            <h1 className="font-display mt-5 text-5xl uppercase leading-[0.95] text-white sm:text-6xl">
              You don't have to <span className="text-gradient">build alone.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[#b8aecf]">
              The KR8 Tribe is an open community of creatives, professionals, learners, and builders —
              growing together, recommending each other, and winning together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GradientButton href="#join">Join the Tribe →</GradientButton>
              <GhostButton href={CONTACT.whatsappTeam}>Send via WhatsApp</GhostButton>
            </div>
            <div className="mt-10">
              <div className="font-display text-5xl text-gradient">{tribeCount().toLocaleString()}</div>
              <div className="text-xs uppercase tracking-wider text-[#8a7ba8]">Members worldwide</div>
            </div>
          </div>
          <GlowImage src={IMG.collab2} alt="The KR8 Tribe" className="aspect-[4/3]" />
        </div>
      </section>

      <Marquee items={["Everyone belongs", "No status barriers", "Win together", "Grow together", "Recommend each other"]} />

      <section className="section-bg py-16">
        <div className="mx-auto max-w-7xl px-5">
          <SectionHead label="How it works" title="Show up, share," highlight="grow" center />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {how.map((h) => (
              <Card key={h.t}>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white"><Icon name={h.icon} size={22} /></div>
                <h3 className="font-bold text-white">{h.t}</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">{h.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-bg py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-3">
          <Card>
            <h3 className="font-display text-2xl uppercase text-white">Who can join</h3>
            <p className="mt-3 text-sm text-[#b8aecf]">Everyone. No KR8 ID or skill required. If you create, learn, or build — this is home.</p>
          </Card>
          <Card>
            <h3 className="font-display text-2xl uppercase text-white">Programs</h3>
            <ul className="mt-4 space-y-3">
              <Check>Mindset Shift — biweekly</Check>
              <Check>Hangout — monthly</Check>
              <Check>Special Days — announced by admin</Check>
            </ul>
          </Card>
          <Card>
            <h3 className="font-display text-2xl uppercase text-white">Tribe rules</h3>
            <ul className="mt-4 space-y-3">
              {rules.map((r) => <Check key={r}>{r}</Check>)}
            </ul>
          </Card>
        </div>
      </section>

      <section className="section-bg py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2">
          <div>
            <SectionHead label="Live in the Tribe" title="Happening" highlight="right now" />
            <div className="mt-8"><LiveFeed /></div>
          </div>
          <div>
            <SectionHead label="Upcoming events" title="Mark your" highlight="calendar" />
            <div className="mt-8 space-y-4">
              {[
                { d: "SUN", n: "16", t: "Mindset Shift", s: "9PM–12AM WAT" },
                { d: "SUN", n: "23", t: "Creator Hangout", s: "9PM–12AM WAT" },
                { d: "SAT", n: "01", t: "Special Portfolio Day", s: "All day" },
              ].map((e) => (
                <div key={e.t} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-gradient-pink text-white">
                    <span className="text-[10px]">{e.d}</span><span className="font-display text-xl leading-none">{e.n}</span>
                  </div>
                  <div><p className="font-semibold text-white">{e.t}</p><p className="text-xs text-[#8a7ba8]">{e.s}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="join" className="section-bg py-16">
        <div className="mx-auto max-w-2xl px-5">
          <SectionHead label="Join the Tribe" title="Become a" highlight="member" center />
          <div className="mt-8">
            {done ? (
              <Card className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="check" size={24} /></div>
                {(() => {
                  const account = JSON.parse(localStorage.getItem("kr8_current") || "null") as Account | null;
                  const isFounder = account?.type === "founder";
                  const isCoFounder = account?.type === "co-founder";
                  return (
                    <>
                      <h3 className="text-xl font-bold text-white">
                        {isFounder ? "Welcome, Founder & CEO!" : isCoFounder ? "Welcome, Co-Founder!" : "Welcome to the Tribe!"}
                      </h3>
                      <p className="mt-2 text-sm text-[#b8aecf]">
                        {isFounder
                          ? "Your Founder identity has been confirmed across the Tribe and Academy."
                          : isCoFounder
                          ? "Your Co-Founder identity has been confirmed."
                          : "You're in. Join your WhatsApp community to get started."}
                      </p>
                      {account?.admin && (
                        <div className="mt-4 rounded-xl border border-pink-400/30 bg-pink-500/5 px-4 py-3 text-left text-xs leading-relaxed text-pink-100">
                          <strong className="capitalize">{account.admin.title ?? account.admin.role} access active.</strong> {account.admin.passwordNotice}
                        </div>
                      )}
                      <div className="mt-5 space-y-2">
                        {(isFounder || isCoFounder) && (
                          <GradientButton to="/admin" className="w-full">
                            Open Admin Portal →
                          </GradientButton>
                        )}
                        <GhostButton href={getTribeWhatsApp()} className="w-full">
                          Open Tribe WhatsApp Group →
                        </GhostButton>
                      </div>
                    </>
                  );
                })()}
              </Card>
            ) : (
              <Card>
                <div className="space-y-4">
                  <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className={inputCls} placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <CountryPhone country={form.country} phone={form.phone} onCountry={(country) => setForm({ ...form, country })} onPhone={(phone) => setForm({ ...form, phone })} inputClass={inputCls} />
                  <input type="password" className={inputCls} placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <select className={inputCls} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                    <option value="">What brings you to the tribe?</option>
                    {["Learning", "Networking", "Finding Clients", "Sharing My Work", "Other"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                  {err && <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{err}</p>}
                  <GradientButton onClick={join} className="w-full">Join the Tribe →</GradientButton>
                  <a href={CONTACT.whatsappTeam} target="_blank" rel="noreferrer" className="block text-center text-sm text-pink-400">Send via WhatsApp instead →</a>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
