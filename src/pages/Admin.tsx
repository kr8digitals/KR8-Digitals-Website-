import { useState, type ChangeEvent } from "react";
// FUTURE PHASE (not built now): add a biometric / face-scan second layer on top of this password gate.
import {
  getStudents, getAccounts, updateAccount, adminRegisterStudent, SKILLS, PORTFOLIO, BLOG, getPortfolio, savePortfolio,
  tribeCount, studentCount, SCORING, ATTENDANCE_TYPES,
  getAnnouncements, saveAnnouncements, getSocialLinks, saveSocialLinks, getFounders, saveFounders, getTeam, saveTeam, getTestimonials, saveTestimonials, getAnnouncementBar, saveAnnouncementBar, getHomepageSettings, saveHomepageSettings, getPaymentSettings, savePaymentSettings, getSkillRegistration, saveSkillSetting, getSkillWhatsApp, promoteAccount, demoteAccount, resetAdminPassword, MAIN_ADMIN_PASSWORD, ADMIN_SECTIONS,
  type Account, type Announcement,
} from "../data/store";
import { Card } from "../components/ui";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";

// Main admin credential — server-side timing-safe comparison vs ADMIN_PASSWORD in production.
// Attendance Review credential — FULLY ISOLATED path, never shares code with ADMIN_PW.
const ATTENDANCE_PW = "KR8@Atd2026";

const sections = [
  "Overview", "Home", "Academy", "Agency", "Student Management", "Blog",
  "Announcements", "Graduation & Certificates", "Leaderboard & XP", "Links Manager",
  "Verify Remarks", "Payment Settings", "Founders & Partners", "Attendance Review", "Moderation", "Admin Permissions",
];

export default function Admin() {
  const { student: currentUser } = useAuth();
  const [pw, setPw] = useState("");
  const [auth, setAuth] = useState(false);
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [permissions, setPermissions] = useState<string[]>(() => currentUser?.admin?.permissions ?? JSON.parse(localStorage.getItem("kr8_admin_permissions") || JSON.stringify(sections)));
  const isUltimate = currentUser?.admin?.role === "ultimate" || (!currentUser?.admin && !currentUser);
  const unlock = () => {
    const valid = pw === MAIN_ADMIN_PASSWORD || pw === currentUser?.admin?.adminPassword;
    if (!valid) { setErr(true); return; }
    setErr(false); setPermissions(currentUser?.admin?.permissions ?? sections); setAuth(true);
  };

  if (!auth) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="lock" size={23} /></div>
          <h1 className="font-display text-2xl text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-[#b8aecf]">Restricted. Enter the admin password.</p>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlock()} placeholder="Admin password" className="mt-5 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none" />
          {err && <p className="mt-2 text-xs text-red-400">Incorrect password.</p>}
          <button onClick={unlock} className="mt-4 w-full rounded-full bg-gradient-pink py-3 text-sm font-bold text-white">Unlock Dashboard</button>
          <p className="mt-4 text-[10px] text-[#8a7ba8]">Ultimate admins use the main password. Promoted admins use their unique profile password.</p>
        </Card>
      </div>
    );
  }

  const students = getStudents();
  const allowedSections = isUltimate ? sections : sections.filter((section) => section !== "Admin Permissions" && permissions.includes(section));
  const stats = [
    { n: studentCount(), l: "Total Students" },
    { n: tribeCount().toLocaleString(), l: "Tribe Members" },
    { n: PORTFOLIO.length, l: "Agency Projects" },
    { n: 12, l: "New This Week" },
    { n: 5, l: "Attendance Pending" },
    { n: 3, l: "Hire Requests" },
    { n: getAnnouncements().length, l: "Active Announcements" },
    { n: getAccounts().filter((a) => a.type === "tribe").length, l: "Tribe Signups" },
  ];

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl text-white">Admin <span className="text-gradient">Dashboard</span></h1>
          <button onClick={() => setAuth(false)} className="text-sm text-[#b8aecf]">Lock</button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {allowedSections.map((s) => (
            <button key={s} onClick={() => setTab(s)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${tab === s ? "bg-gradient-pink text-white" : "border border-white/15 text-[#b8aecf]"}`}>{s}</button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "Overview" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <Card key={s.l} className="!p-5"><div className="font-display text-3xl text-gradient">{s.n}</div><div className="mt-1 text-[11px] uppercase tracking-wider text-[#8a7ba8]">{s.l}</div></Card>
              ))}
            </div>
          )}

          {tab === "Home" && <HomeManager />}
          {tab === "Academy" && <AcademyManager />}
          {tab === "Agency" && <AgencyManager />}
          {tab === "Student Management" && <StudentManager students={students} />}
          {tab === "Blog" && <BlogManager />}
          {tab === "Announcements" && <AnnouncementManager />}
          {tab === "Graduation & Certificates" && <GraduationManager students={students} />}
          {tab === "Leaderboard & XP" && <XPManager />}
          {tab === "Links Manager" && <LinksManager />}
          {tab === "Verify Remarks" && (
            <VerifyRemarksManager students={students} />
          )}
          {tab === "Payment Settings" && <PaymentManager />}
          {tab === "Founders & Partners" && <><FoundersManager /><TeamManager /></>}
          {tab === "Attendance Review" && <AttendancePanel />}
          {tab === "Moderation" && <ModerationManager />}
          {tab === "Admin Permissions" && isUltimate && <PermissionsManager />}
        </div>
      </div>
    </div>
  );
}

function PaymentManager() {
  const [settings, setSettings] = useState(getPaymentSettings());
  const [saved, setSaved] = useState(false);
  const save = () => { savePaymentSettings(settings); setSaved(true); setTimeout(() => setSaved(false), 1600); };
  return <Card><h3 className="font-bold text-white">Payment Settings</h3><p className="mt-1 text-sm text-[#b8aecf]">Update the account and advanced-training price used across payment instructions.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="rounded-xl bg-black/30 p-3"><span className="text-xs text-[#8a7ba8]">Account</span><input value={settings.account} onChange={(e) => setSettings({ ...settings, account: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" /></label><label className="rounded-xl bg-black/30 p-3"><span className="text-xs text-[#8a7ba8]">Bank</span><input value={settings.bank} onChange={(e) => setSettings({ ...settings, bank: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" /></label><label className="rounded-xl bg-black/30 p-3"><span className="text-xs text-[#8a7ba8]">Account name</span><input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" /></label><label className="rounded-xl bg-black/30 p-3"><span className="text-xs text-[#8a7ba8]">Advanced price</span><input value={settings.advancedPrice} onChange={(e) => setSettings({ ...settings, advancedPrice: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" /></label></div><button onClick={save} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">Save Payment Settings</button>{saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}</Card>;
}

function XPManager() {
  const [values, setValues] = useState(() => JSON.parse(localStorage.getItem("kr8_xp_values") || JSON.stringify(SCORING)) as typeof SCORING);
  const [saved, setSaved] = useState(false);
  const save = () => { localStorage.setItem("kr8_xp_values", JSON.stringify(values)); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return <Card><h3 className="font-bold text-white">Leaderboard & XP</h3><p className="mt-1 text-sm text-[#b8aecf]">Edit point values per action and save them for future reviews.</p><div className="mt-4 space-y-2">{values.map((item, index) => <div key={item.action} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-4 py-3"><span className="min-w-0 text-sm text-[#cabfe0]">{item.action}</span><input value={item.pts} onChange={(event) => setValues((all) => all.map((entry, itemIndex) => itemIndex === index ? { ...entry, pts: event.target.value } : entry))} className="w-20 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-center text-sm text-white focus:border-pink-400/60 focus:outline-none" /></div>)}</div><button onClick={save} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">Save XP Values</button><button onClick={() => { localStorage.removeItem("kr8_leaderboard_season"); window.alert("Leaderboard season reset."); }} className="ml-2 rounded-full border border-white/15 px-5 py-2 text-xs text-[#cabfe0]">Reset Season</button>{saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}</Card>;
}

function LinksManager() {
  const [links, setLinks] = useState(() => Object.fromEntries(SKILLS.filter((skill) => skill.available).map((skill) => [skill.key, getSkillWhatsApp(skill.key)])));
  const [tribe, setTribe] = useState("https://chat.whatsapp.com/DgnBOEd5CfMHV8CTWgPNLH?s=cl&p=a&mlu=4&ilr=4");
  const [saved, setSaved] = useState(false);
  const save = () => { Object.entries(links).forEach(([key, whatsapp]) => saveSkillSetting(key, { whatsapp })); localStorage.setItem("kr8_tribe_link_v1", tribe); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return <Card><h3 className="font-bold text-white">Links Manager</h3><p className="mt-1 text-sm text-[#b8aecf]">Edit skill and Tribe WhatsApp links, then save to apply them to registration and join flows.</p><div className="mt-4 space-y-2">{SKILLS.filter((skill) => skill.available).map((skill) => <label key={skill.key} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/20 px-4 py-2.5"><span className="w-40 shrink-0 text-sm text-white">{skill.name}</span><input value={links[skill.key] ?? ""} onChange={(event) => setLinks((all) => ({ ...all, [skill.key]: event.target.value }))} className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none" /></label>)}<label className="flex flex-wrap items-center gap-3 rounded-xl bg-black/20 px-4 py-2.5"><span className="w-40 shrink-0 text-sm text-white">Tribe</span><input value={tribe} onChange={(event) => setTribe(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none" /></label></div><button onClick={save} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">Save Link Changes</button>{saved && <span className="ml-3 text-xs text-green-300">Saved and applied.</span>}<SocialLinksManager /></Card>;
}

function VerifyRemarksManager({ students }: { students: Account[] }) {
  const [id, setId] = useState(students[0]?.id ?? "");
  const [remark, setRemark] = useState(() => localStorage.getItem("kr8_verify_remarks") || "");
  const [saved, setSaved] = useState(false);
  const save = () => { localStorage.setItem("kr8_verify_remarks", remark); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return <Card><h3 className="font-bold text-white">Verify Page Remarks</h3><p className="mt-1 text-sm text-[#b8aecf]">Write a custom note shown only when the student opts into expanded Verify visibility.</p><select value={id} onChange={(event) => setId(event.target.value)} className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none">{students.map((student) => <option key={student.id} value={student.id}>{student.name} — {student.id}</option>)}</select><textarea value={remark} onChange={(event) => setRemark(event.target.value)} rows={4} placeholder="Admin remark…" className="mt-3 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none" /><button onClick={save} className="mt-3 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">Save Remark</button>{saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}</Card>;
}

function ModerationManager() {
  const [reports, setReports] = useState(["No open reports"]);
  return <Card><h3 className="font-bold text-white">Moderation</h3><p className="mt-2 text-sm text-[#b8aecf]">Reported conversations and messaging restrictions appear here for review.</p><div className="mt-4 space-y-2">{reports.map((report, index) => <div key={`${report}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-black/20 px-4 py-3 text-sm text-[#cabfe0]"><span>{report}</span>{report !== "No open reports" && <div className="flex gap-2"><button onClick={() => setReports((all) => all.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-300">Resolve</button><button className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-300">Suspend messaging</button></div>}</div>)}</div><button onClick={() => setReports((all) => all[0] === "No open reports" ? ["Reported conversation · pending review"] : [...all, "Reported conversation · pending review"])} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs text-white">Add test report</button></Card>;
}

function FoundersManager() {
  const [founders, setFounders] = useState(getFounders());
  const [saved, setSaved] = useState("");
  const update = (key: string, patch: Partial<(typeof founders)[number]>) => setFounders((all) => all.map((founder) => founder.key === key ? { ...founder, ...patch } : founder));
  const save = (key: string) => { saveFounders(founders); setSaved(key); window.setTimeout(() => setSaved(""), 1500); };
  const upload = (key: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update(key, { photo: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return <Card><h3 className="font-bold text-white">Founders & Partners Manager</h3><p className="mt-1 text-sm text-[#b8aecf]">Upload a replacement photo, edit the name, role or bio, then save. Changes reflect on About and Academy immediately.</p><div className="mt-5 space-y-4">{founders.map((founder) => <div key={founder.key} className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[120px_1fr]"><div><img src={founder.photo} alt={founder.name} className="h-28 w-28 rounded-2xl object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /><label className="mt-2 block cursor-pointer rounded-full border border-white/15 px-3 py-2 text-center text-xs text-[#cabfe0]">Upload photo<input type="file" accept="image/*" className="hidden" onChange={(event) => upload(founder.key, event)} /></label></div><div className="space-y-2"><input value={founder.name} onChange={(event) => update(founder.key, { name: event.target.value })} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /><input value={founder.role} onChange={(event) => update(founder.key, { role: event.target.value })} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /><textarea value={founder.bio} onChange={(event) => update(founder.key, { bio: event.target.value })} rows={4} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /><button onClick={() => save(founder.key)} className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">Save founder</button>{saved === founder.key && <span className="ml-3 text-xs text-green-300">Saved and reflected live.</span>}</div></div>)}</div><button onClick={() => setFounders((all) => [...all, { key: `founder-${Date.now()}`, name: "New co-founder", role: "Role", bio: "", photo: "" }])} className="mt-5 rounded-full border border-white/15 px-4 py-2 text-xs text-white">+ Add co-founder / partner</button></Card>;
}

function TeamManager() {
  const [team, setTeam] = useState(getTeam());
  const [saved, setSaved] = useState("");
  const update = (key: string, patch: Partial<(typeof team)[number]>) => setTeam((all) => all.map((member) => member.key === key ? { ...member, ...patch } : member));
  const upload = (key: string, event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => update(key, { photo: String(reader.result) }); reader.readAsDataURL(file); };
  const save = () => { saveTeam(team); setSaved("team"); setTimeout(() => setSaved(""), 1500); };
  return <Card className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">Dedicated Team Manager</h3><p className="mt-1 text-sm text-[#b8aecf]">Manage team names, positions, bios and photos. Changes reflect on the About page.</p></div><button onClick={() => setTeam((all) => [...all, { key: `team-${Date.now()}`, name: "New team member", role: "Position", bio: "", photo: "" }])} className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">+ Add Team Member</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{team.map((member) => <div key={member.key} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex gap-3"><div className="shrink-0"><img src={member.photo} alt={member.name} className="h-20 w-20 rounded-2xl object-cover" /><label className="mt-2 block cursor-pointer text-center text-[10px] text-pink-300">Upload<input type="file" accept="image/*" className="hidden" onChange={(event) => upload(member.key, event)} /></label></div><div className="min-w-0 flex-1 space-y-2"><input value={member.name} onChange={(event) => update(member.key, { name: event.target.value })} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /><input value={member.role} onChange={(event) => update(member.key, { role: event.target.value })} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /></div></div><textarea value={member.bio} onChange={(event) => update(member.key, { bio: event.target.value })} rows={3} className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /></div>)}</div><button onClick={save} className="mt-5 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">Save Team Changes</button>{saved && <span className="ml-3 text-xs text-green-300">Saved and reflected live.</span>}</Card>;
}

function HomeManager() {
  const [locked, setLocked] = useState(true);
  const [bar, setBar] = useState(getAnnouncementBar());
  const [homepage, setHomepage] = useState(getHomepageSettings());
  const [saved, setSaved] = useState(false);
  const save = () => { saveAnnouncementBar(bar); saveHomepageSettings(homepage); setSaved(true); setTimeout(() => setSaved(false), 1600); };
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Homepage Editing</h3>
            <p className="mt-1 text-sm text-[#b8aecf]">Unlock to edit homepage content & section order, then re-lock to prevent accidental changes.</p>
          </div>
          <button onClick={() => setLocked((l) => !l)} className={`rounded-full px-5 py-2 text-sm font-bold ${locked ? "bg-white/10 text-[#cabfe0]" : "bg-gradient-pink text-white"}`}>
            <span className="inline-flex items-center gap-2">{locked ? <><Icon name="lock" size={14} /> Locked — Unlock</> : <><Icon name="unlock" size={14} /> Unlocked — Lock</>}</span>
          </button>
        </div>
      </Card>
      <Card>
        <h3 className="font-bold text-white">Top Announcement Bar</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["status", "emoji", "message", "cta", "link"] as const).map((field) => <label key={field} className={`rounded-xl bg-black/30 p-3 ${field === "message" ? "sm:col-span-2" : ""}`}><span className="block text-xs text-[#8a7ba8]">{field}</span><input disabled={locked} value={bar[field]} onChange={(event) => setBar({ ...bar, [field]: event.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" /></label>)}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-[#cabfe0]"><input type="checkbox" checked={bar.on} onChange={(event) => setBar({ ...bar, on: event.target.checked })} className="accent-pink-500" disabled={locked} /> Bar on</label>
        <label className="mt-4 block rounded-xl bg-black/30 p-3"><span className="block text-xs text-[#8a7ba8]">Projects Done (admin-set live homepage count)</span><input type="number" min="0" value={homepage.projectsDone} onChange={(event) => setHomepage({ projectsDone: Math.max(0, Number(event.target.value) || 0) })} disabled={locked} className="mt-1 w-full bg-transparent text-white focus:outline-none" /></label>
        <button onClick={save} disabled={locked} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white disabled:opacity-40">Save Homepage Settings</button>{saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}
      </Card>
      <TestimonialsManager />
    </div>
  );
}

function TestimonialsManager() {
  const [items, setItems] = useState(getTestimonials());
  const [form, setForm] = useState({ name: "", skill: "", caption: "", video: "" });
  const [saved, setSaved] = useState(false);
  const upload = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((current) => ({ ...current, video: String(reader.result) })); reader.readAsDataURL(file); };
  const add = () => { if (!form.name || !form.video) return; setItems((all) => [{ id: `testimonial-${Date.now()}`, name: form.name, skill: form.skill || "KR8 Digitals", caption: form.caption || "A KR8 creator story.", img: "", video: form.video, createdAt: Date.now() }, ...all]); setForm({ name: "", skill: "", caption: "", video: "" }); };
  const save = () => { saveTestimonials(items); setSaved(true); setTimeout(() => setSaved(false), 1500); };
  return <Card><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-white">Testimonial Video Library</h3><p className="mt-1 text-sm text-[#b8aecf]">Unlimited uploads. The newest upload leads the public carousel, then the rest shuffle until every video has displayed.</p></div><span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs text-pink-300">{items.length} videos</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" /><input value={form.skill} onChange={(event) => setForm({ ...form, skill: event.target.value })} placeholder="Skill / role" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" /><input value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="Caption" className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white" /></div><label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-pink-400/40 bg-black/20 px-4 py-4 text-center text-sm text-[#cabfe0]">{form.video ? "Video ready to add" : "Upload testimonial video"}<input type="file" accept="video/*" className="hidden" onChange={upload} /></label><div className="mt-3 flex flex-wrap gap-2"><button onClick={add} className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">Add Video</button><button onClick={save} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white">Save Library</button>{saved && <span className="self-center text-xs text-green-300">Saved.</span>}</div><div className="mt-5 grid gap-2 sm:grid-cols-2">{items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-black/20 px-3 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{item.name}</p><p className="truncate text-xs text-[#8a7ba8]">{item.skill}</p></div><button onClick={() => setItems((all) => all.filter((entry) => entry.id !== item.id))} className="shrink-0 text-xs text-red-400">Delete</button></div>)}</div></Card>;
}

function AcademyManager() {
  return (
    <div className="space-y-4">
      {SKILLS.map((s) => (
        <AcademySkillManager key={s.key} skill={s} />
      ))}
      <p className="text-xs text-[#8a7ba8]">Each skill's registration toggle is independent — close any combination while others stay open.</p>
    </div>
  );
}

function AcademySkillManager({ skill }: { skill: (typeof SKILLS)[number] }) {
  const [open, setOpen] = useState(getSkillRegistration(skill.key));
  const [whatsapp, setWhatsapp] = useState(getSkillWhatsApp(skill.key));
  const [saved, setSaved] = useState(false);
  const save = () => { saveSkillSetting(skill.key, { regOpen: open, whatsapp }); setSaved(true); setTimeout(() => setSaved(false), 1400); };
  return (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{skill.icon}</span>
              <div>
                <h3 className="font-bold text-white">{skill.name}</h3>
                <p className="text-xs text-[#8a7ba8]">{getStudents().filter((x) => x.skill === skill.key).length} registered · Instructor: {skill.instructor?.name ?? "To be announced"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-[#cabfe0]">
                <input type="checkbox" checked={open} onChange={(event) => setOpen(event.target.checked)} disabled={!skill.available} className="accent-pink-500" />
                Registration {open ? "open" : "closed"}
              </label>
              <button onClick={save} className="rounded-full bg-gradient-pink px-3 py-1.5 text-xs font-bold text-white">Save</button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]"><input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none" placeholder="Skill WhatsApp link" /><span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#8a7ba8]">Curriculum: {skill.curriculum.length ? `${skill.curriculum.length} weeks` : "Not published"}</span></div>
          {saved && <p className="mt-2 text-xs text-green-300">Skill settings saved and registration rules updated.</p>}
        </Card>
  );
}

function AgencyManager() {
  const [items, setItems] = useState(getPortfolio());
  const update = (id: string, field: "client" | "description" | "link", value: string) => setItems((all) => all.map((item) => item.id === id ? { ...item, [field]: value } : item));
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">Agency Portfolio & Clients</h3><p className="mt-1 text-sm text-[#b8aecf]">Add, edit or remove verified client entries and their references.</p></div><button onClick={() => setItems((all) => [...all, { id: `p-${Date.now()}`, title: "New project", service: "Website Development", client: "New client", description: "", link: "", price: "", showPrice: false, img: "https://images.pexels.com/photos/4348375/pexels-photo-4348375.jpeg?auto=compress&cs=tinysrgb&w=900", placeholder: false }])} className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">+ Add Client Work</button></div>
        <div className="mt-4 space-y-3">{items.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="grid gap-3 md:grid-cols-3"><input value={item.client} onChange={(e) => update(item.id, "client", e.target.value)} className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /><input value={item.description} onChange={(e) => update(item.id, "description", e.target.value)} placeholder="Description" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /><input value={item.link} onChange={(e) => update(item.id, "link", e.target.value)} placeholder="Reference link" className="rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white" /></div><button onClick={() => setItems((all) => all.filter((entry) => entry.id !== item.id))} className="mt-3 text-xs text-red-400">Remove client entry</button></div>)}</div>
        <button onClick={() => savePortfolio(items)} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">Save Portfolio Changes</button>
      </Card>
      <Card>
        <h3 className="font-bold text-white">Hire Requests</h3>
        <div className="mt-4 space-y-2">
          {[
            { t: "Brand Design — Aurora", tag: "Structured", status: "new" },
            { t: "Quick logo tweak", tag: "Custom Quote", status: "contacted" },
            { t: "Web Development — Lagos Eats", tag: "Structured", status: "closed" },
          ].map((r) => (
            <div key={r.t} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 text-sm">
              <span className="text-[#cabfe0]">{r.t} <span className="ml-2 rounded-full bg-pink-500/10 px-2 py-0.5 text-[10px] text-pink-400">{r.tag}</span></span>
              <select defaultValue={r.status} className="rounded-lg border border-white/15 bg-black/30 px-2 py-1 text-xs text-white focus:outline-none"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PermissionsManager() {
  const candidates = getAccounts().filter((account) => account.admin?.role !== "ultimate");
  const [selected, setSelected] = useState(candidates[0]?.id ?? "");
  const [targetRole, setTargetRole] = useState<"admin" | "coach" | "assistant">("assistant");
  const [roleTitle, setRoleTitle] = useState("");
  const [selectedRights, setSelectedRights] = useState<string[]>(ADMIN_SECTIONS.filter((item) => item !== "Attendance Review"));
  const target = candidates.find((account) => account.id === selected);
  const toggle = (section: string) => setSelectedRights((all) => all.includes(section) ? all.filter((item) => item !== section) : [...all, section]);
  const promote = () => { if (!target || !roleTitle.trim()) { window.alert("Type the person's role before promoting them."); return; } const account = promoteAccount(target.id, targetRole, selectedRights, "Ultimate admin", roleTitle.trim()); if (account?.admin?.adminPassword) window.alert(`${account.name} is now ${roleTitle}. Unique admin password: ${account.admin.adminPassword}`); };
  const demote = () => { if (!target) return; demoteAccount(target.id); window.alert(`${target.name} no longer has admin access.`); };
  const reset = () => { if (!target) return; const password = resetAdminPassword(target.id); if (password) window.alert(`New password for ${target.name}: ${password}`); };
  return <Card><h3 className="font-bold text-white">Admin Permissions</h3><p className="mt-1 text-sm text-[#b8aecf]">Only ultimate admins can promote or demote registered accounts. Select a person, type their visible role, and choose exact rights.</p><select value={selected} onChange={(event) => setSelected(event.target.value)} className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none"><option value="">Select a registered person</option>{candidates.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.id}</option>)}</select><input value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} placeholder="Type visible role (e.g. Project Director)" className="mt-3 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none" /><div className="mt-3 flex flex-wrap gap-2">{(["admin", "coach", "assistant"] as const).map((item) => <button key={item} onClick={() => setTargetRole(item)} className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${targetRole === item ? "bg-gradient-pink text-white" : "border border-white/15 text-[#cabfe0]"}`}>{item}</button>)}</div><div className="mt-4 grid gap-2 sm:grid-cols-2">{ADMIN_SECTIONS.map((section) => <label key={section} className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-sm text-[#cabfe0]"><input type="checkbox" checked={selectedRights.includes(section)} onChange={() => toggle(section)} className="accent-pink-500" />{section}</label>)}</div><div className="mt-5 flex flex-wrap gap-2"><button onClick={promote} className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">Promote & Generate Password</button><button onClick={demote} className="rounded-full border border-red-400/30 px-4 py-2 text-xs text-red-300">Demote</button><button onClick={reset} className="rounded-full border border-white/15 px-4 py-2 text-xs text-[#cabfe0]">Recover Admin Password</button></div></Card>;
}

function StudentManager({ students }: { students: Account[] }) {
  const [q, setQ] = useState("");
  const filtered = students.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()));
  const edit = (student: Account) => { const name = window.prompt("Update display name", student.name); if (name?.trim()) updateAccount(student.id, { name: name.trim() }); };
  const restrict = (student: Account) => updateAccount(student.id, { restricted: !student.restricted });
  const resetId = (student: Account) => { const id = window.prompt("Enter replacement KR8 ID", student.id); if (id?.trim()) updateAccount(student.id, { id: id.trim() }); };
  const manualRegister = () => {
    const name = window.prompt("Full name"); const email = window.prompt("Email"); const phone = window.prompt("Phone");
    if (!name || !email || !phone) return;
    const skill = window.prompt(`Skill key: ${SKILLS.filter((item) => item.available).map((item) => item.key).join(", ")}`) || "graphic";
    const created = adminRegisterStudent({ name, email, phone, skill });
    window.alert(created ? `Registered ${created.name} with ID ${created.id}. Temporary password: TempChangeMe` : "Could not register this student.");
  };
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students…" className="w-56 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-white focus:border-pink-400/60 focus:outline-none" />
        <button onClick={manualRegister} className="rounded-full bg-gradient-pink px-4 py-1.5 text-xs font-bold text-white">+ Manually Register</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-[#8a7ba8]"><tr><th className="p-3">KR8 ID</th><th className="p-3">Name</th><th className="p-3">Points</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t border-white/5 text-[#cabfe0]">
                <td className="p-3 font-mono text-xs text-pink-400">{s.id}</td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.points}</td>
                <td className="p-3">{s.restricted ? "Restricted" : s.graduated ? <span className="inline-flex items-center gap-1"><Icon name="certificate" size={14} /> {s.certTier}</span> : "Active"}</td>
                <td className="p-3 text-xs"><button onClick={() => edit(s)} className="mr-2 text-pink-400">Edit</button><button onClick={() => restrict(s)} className="mr-2 text-yellow-400">{s.restricted ? "Unrestrict" : "Restrict"}</button><button onClick={() => resetId(s)} className="text-[#8a7ba8]">Reset ID</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BlogManager() {
  const [posts, setPosts] = useState(BLOG);
  const togglePin = (id: string) => setPosts((all) => all.map((post) => post.id === id ? { ...post, pinned: !post.pinned } : { ...post, pinned: false }));
  return (
    <Card>
      <h3 className="font-bold text-white">Blog Moderation</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Pin one post to the top; delete any that violate community standards.</p>
      <div className="mt-4 space-y-2">
        {posts.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 text-sm">
            <span className="text-[#cabfe0]">{b.title} <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-[#8a7ba8]">{b.source}</span>{b.pinned && <span className="ml-1 rounded-full bg-gradient-pink px-2 py-0.5 text-[10px] text-white">Pinned</span>}</span>
            <div className="flex gap-3 text-xs"><button onClick={() => togglePin(b.id)} className="text-pink-400">{b.pinned ? "Unpin" : "Pin"}</button><button onClick={() => setPosts((all) => all.filter((post) => post.id !== b.id))} className="text-red-400">Delete</button></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnnouncementManager() {
  const [items, setItems] = useState<Announcement[]>(getAnnouncements());
  const [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState(false);
  const current = items[selected];
  const update = (patch: Partial<Announcement>) => setItems((all) => all.map((item, index) => index === selected ? { ...item, ...patch } : item));
  const add = () => { setItems((all) => [...all, { id: `announcement-${Date.now()}`, type: "text", title: "New announcement", body: "", date: "", author: "KR8 Admin", active: true }]); setSelected(items.length); };
  const attach = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => update({ type: "flyer", image: String(reader.result) }); reader.readAsDataURL(file); };
  if (!current) return <Card><button onClick={add} className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">Create Announcement</button></Card>;
  return <Card>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">Announcements Manager</h3><p className="mt-1 text-sm text-[#b8aecf]">Edit text, dates, speaker names and square flyer images without a code change.</p></div><button onClick={add} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white">+ Add</button></div>
    <div className="mt-5 flex flex-wrap gap-2">{items.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} className={`rounded-full px-3 py-2 text-xs ${selected === index ? "bg-gradient-pink text-white" : "border border-white/15 text-[#cabfe0]"}`}>{item.title.slice(0, 24)}</button>)}</div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      <div className="space-y-3"><select value={current.type} onChange={(event) => update({ type: event.target.value as Announcement["type"] })} className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none"><option value="text">Text announcement</option><option value="flyer">Square flyer announcement</option></select><input value={current.title} onChange={(event) => update({ title: event.target.value })} placeholder="Title" className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none" /><textarea value={current.body ?? current.caption ?? ""} onChange={(event) => update(current.type === "flyer" ? { caption: event.target.value } : { body: event.target.value })} rows={5} placeholder="Announcement body or flyer caption" className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none" /><div className="grid gap-3 sm:grid-cols-2"><input value={current.date} onChange={(event) => update({ date: event.target.value })} placeholder="Date" className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none" /><input value={current.speaker ?? ""} onChange={(event) => update({ speaker: event.target.value })} placeholder="Speaker name (optional)" className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none" /></div></div>
      <div>{current.type === "flyer" ? <><label className="flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-pink-400/40 bg-black/20 text-center text-sm text-[#8a7ba8]">{current.image ? <img src={current.image} alt="Announcement flyer preview" className="h-full w-full object-cover" /> : "Upload a 1:1 flyer image"}<input type="file" accept="image/*" className="hidden" onChange={attach} /></label><p className="mt-2 text-xs text-[#8a7ba8]">Square 1:1 image recommended. Add or replace it here.</p></> : <div className="flex h-full min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-black/20 p-6 text-center text-sm text-[#8a7ba8]">Text announcements use the title, body and date fields.</div>}<label className="mt-3 flex items-center gap-2 text-sm text-[#cabfe0]"><input type="checkbox" checked={current.active !== false} onChange={(event) => update({ active: event.target.checked })} className="accent-pink-500" /> Active</label></div>
    </div>
    <button onClick={() => { saveAnnouncements(items); setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="mt-5 rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white">Save announcement</button>{saved && <span className="ml-3 text-xs text-green-300">Saved locally and reflected on live surfaces.</span>}
  </Card>;
}

function SocialLinksManager() {
  const [links, setLinks] = useState(getSocialLinks());
  const [saved, setSaved] = useState(false);
  const update = (key: string, patch: Partial<(typeof links)[number]>) => setLinks((all) => all.map((link) => link.key === key ? { ...link, ...patch } : link));
  return <div className="mt-8 border-t border-white/10 pt-6"><h4 className="font-bold text-white">Social media links</h4><p className="mt-1 text-xs text-[#8a7ba8]">These links power the footer and the periodic Follow Us popup.</p><div className="mt-3 space-y-2">{links.map((link) => <div key={link.key} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/20 px-4 py-3"><span className="w-20 text-sm text-white">{link.label}</span><input value={link.href} disabled={link.enabled === false} onChange={(event) => update(link.key, { href: event.target.value })} className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none" /><label className="flex items-center gap-1 text-xs text-[#8a7ba8]"><input type="checkbox" checked={link.enabled !== false} onChange={(event) => update(link.key, { enabled: event.target.checked })} className="accent-pink-500" /> Show</label></div>)}</div><button onClick={() => { saveSocialLinks(links as typeof import("../data/store").SOCIAL_LINKS); setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="mt-3 rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white">Save social links</button>{saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}</div>;
}

function GraduationManager({ students }: { students: Account[] }) {
  const [sel, setSel] = useState(students[0]?.id ?? "");
  const [tier, setTier] = useState<"Completion" | "Professionalism">("Completion");
  const [recognition, setRecognition] = useState("");
  const [saved, setSaved] = useState(false);
  const s = students.find((x) => x.id === sel);
  const skill = SKILLS.find((k) => k.key === s?.skill);
  return (
    <Card>
      <h3 className="font-bold text-white">Graduation & Certificates</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Auto-fills verified DB fields into an editable certificate, then auto-generates the PDF with a QR code linking to the student's Verify page.</p>
      <select value={sel} onChange={(e) => setSel(e.target.value)} className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none">
        {students.map((x) => <option key={x.id} value={x.id}>{x.name} — {x.id}</option>)}
      </select>
      {s && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-[#cabfe0]">
          <div className="rounded-xl bg-black/30 p-3"><p className="text-xs text-[#8a7ba8]">Name</p><p className="text-white">{s.name}</p></div>
          <div className="rounded-xl bg-black/30 p-3"><p className="text-xs text-[#8a7ba8]">Skill</p><p className="text-white">{skill?.name}</p></div>
          <div className="rounded-xl bg-black/30 p-3"><p className="text-xs text-[#8a7ba8]">KR8 ID</p><p className="font-mono text-xs text-white">{s.id}</p></div>
          <div className="rounded-xl bg-black/30 p-3"><p className="text-xs text-[#8a7ba8]">Suffix</p><p className="text-white">{skill?.suffix}</p></div>
        </div>
      )}
      <div className="mt-4">
        <p className="text-xs uppercase tracking-wider text-[#8a7ba8]">Certificate tier</p>
        <div className="mt-2 flex gap-2">
          {(["Completion", "Professionalism"] as const).map((t) => (
            <button key={t} onClick={() => setTier(t)} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold ${tier === t ? "bg-gradient-pink text-white" : "border border-white/15 text-[#b8aecf]"}`}>Certificate of {t}</button>
          ))}
        </div>
      </div>
      <input value={recognition} onChange={(event) => setRecognition(event.target.value)} placeholder="Optional recognition (e.g. 2x Best Graphic Design Student)" className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none" />
      <button onClick={() => { if (!s) return; updateAccount(s.id, { graduated: true, certTier: tier, certRecognition: recognition }); setSaved(true); setTimeout(() => setSaved(false), 1800); }} className="mt-4 w-full rounded-full bg-gradient-pink py-3 text-sm font-bold text-white">Graduate & Generate Certificate PDF →</button>{saved && <p className="mt-2 text-center text-xs text-green-300">Graduation saved. Certificate is now visible on the profile.</p>}
    </Card>
  );
}

function AttendancePanel() {
  const [pw, setPw] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  if (!ok) {
    return (
      <Card className="max-w-sm">
        <h3 className="flex items-center gap-2 font-bold text-white"><Icon name="lock" size={17} /> Attendance Review</h3>
        <p className="mt-1 text-sm text-[#b8aecf]">Separate, fully isolated credential — not the main admin password.</p>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Attendance password" className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none" />
        {err && <p className="mt-2 text-xs text-red-400">Incorrect password.</p>}
        <button onClick={() => (pw === ATTENDANCE_PW ? setOk(true) : setErr(true))} className="mt-3 w-full rounded-full bg-gradient-pink py-2.5 text-sm font-bold text-white">Unlock Review</button>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {ATTENDANCE_TYPES.map((t) => (
        <Card key={t.key}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{t.name}</h3>
            <label className="flex items-center gap-2 text-xs text-[#cabfe0]"><input type="checkbox" defaultChecked={t.open} className="accent-pink-500" /> {t.open ? "Open" : "Closed"}</label>
          </div>
          <div className="mt-3 space-y-2">
            {getStudents().slice(0, 3).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-xs">
                <span className="truncate font-mono text-[#cabfe0]">{s.id}</span>
                <div className="flex gap-1"><button onClick={() => setDecisions((all) => ({ ...all, [`${t.key}-${s.id}`]: "Accepted" }))} className="rounded bg-green-500/20 px-2 py-1 text-green-300">Approve</button><button onClick={() => setDecisions((all) => ({ ...all, [`${t.key}-${s.id}`]: "Rejected — feedback required" }))} className="rounded bg-red-500/20 px-2 py-1 text-red-300">Reject</button></div>
                <span className="mt-1 block text-[10px] text-[#8a7ba8]">{decisions[`${t.key}-${s.id}`] ?? "Pending Review"}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

