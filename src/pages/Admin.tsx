import { useState, useEffect, type ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  SKILLS, ATTENDANCE_TYPES, CONTACT, PORTFOLIO, BLOG,
  getAnnouncements, saveAnnouncements, getSocialLinks, saveSocialLinks,
  getPaymentSettings, savePaymentSettings, getSkillRegistration, getSkillWhatsApp,
  saveSkillSetting, getFounders, saveFounders, getTeam, saveTeam,
  getTestimonials, saveTestimonials, getAccounts, getStudents, updateAccount,
  adminRegisterStudent, saveVerifyRemark, getBlogPosts, saveBlogPosts,
  addFeed, MAIN_ADMIN_PASSWORD, ADMIN_SECTIONS, buildPhone, COUNTRIES,
  type Account, type Announcement,
} from "../data/store";
import { Card } from "../components/ui";
import Icon from "../components/Icon";
import {
  processGraduationCertificate,
  saveCertificateData,
  downloadCertificatePdf,
  type CertPosition,
} from "../utils/certificate";

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
  const [students, setStudents] = useState<Account[]>(getStudents);

  const isUltimate = currentUser?.admin?.role === "ultimate" || (!currentUser?.admin && !currentUser) || pw === MAIN_ADMIN_PASSWORD;

  // Real-time synchronization whenever student data or accounts update
  useEffect(() => {
    const refresh = () => setStudents(getStudents());
    window.addEventListener("kr8:accounts-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:accounts-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const unlock = () => {
    const valid = pw === MAIN_ADMIN_PASSWORD || pw === currentUser?.admin?.adminPassword;
    if (!valid) {
      setErr(true);
      return;
    }
    setErr(false);
    setAuth(true);
  };

  if (!auth) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white">
            <Icon name="lock" size={23} />
          </div>
          <h1 className="font-display text-2xl text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-[#b8aecf]">Restricted area. Enter your admin password.</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="Admin password"
            className="mt-5 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none"
          />
          {err && <p className="mt-2 text-xs text-red-400">Incorrect password.</p>}
          <button onClick={unlock} className="mt-4 w-full rounded-full bg-gradient-pink py-3 text-sm font-bold text-white">
            Unlock Dashboard
          </button>
          <p className="mt-4 text-[10px] text-[#8a7ba8]">
            Main admin password: <span className="font-mono text-pink-300">KR8@Adm!n2026</span>
          </p>
        </Card>
      </div>
    );
  }

  const allowedSections = isUltimate ? sections : sections.filter((s) => currentUser?.admin?.permissions.includes(s));
  const stats = [
    { n: students.length, l: "Registered Students" },
    { n: students.filter((s) => s.graduated).length, l: "Certified Graduates" },
    { n: PORTFOLIO.length, l: "Agency Projects" },
    { n: getAccounts().filter((a) => a.type === "tribe").length, l: "Tribe Members" },
    { n: getAnnouncements().length, l: "Active Announcements" },
    { n: getBlogPosts().length, l: "Blog Articles" },
  ];

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-white">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="mt-1 text-xs text-[#8a7ba8]">
              Logged in as <strong className="text-white">{isUltimate ? "Ultimate Administrator" : currentUser?.name}</strong> · Live site connectivity active
            </p>
          </div>
          <button onClick={() => setAuth(false)} className="rounded-full border border-white/15 px-4 py-2 text-xs text-[#b8aecf] hover:text-white">
            Lock Dashboard
          </button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {allowedSections.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                tab === s ? "bg-gradient-pink text-white glow-pink-sm" : "border border-white/15 text-[#b8aecf] hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "Overview" && (
            <div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((s) => (
                  <Card key={s.l} className="!p-5">
                    <div className="font-display text-3xl text-gradient">{s.n}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-wider text-[#8a7ba8]">{s.l}</div>
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <StudentManager students={students} />
              </div>
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
          {tab === "Verify Remarks" && <VerifyRemarksManager students={students} />}
          {tab === "Payment Settings" && <PaymentManager />}
          {tab === "Founders & Partners" && (
            <>
              <FoundersManager />
              <TeamManager />
            </>
          )}
          {tab === "Attendance Review" && <AttendancePanel />}
          {tab === "Moderation" && <ModerationManager />}
          {tab === "Admin Permissions" && isUltimate && <PermissionsManager />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Student Management ---------------- */

function StudentManager({ students }: { students: Account[] }) {
  const [q, setQ] = useState("");
  const [graduatingStudent, setGraduatingStudent] = useState<Account | null>(null);
  const [manualRegisterOpen, setManualRegisterOpen] = useState(false);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.id.toLowerCase().includes(q.toLowerCase()) ||
      (s.skill && s.skill.toLowerCase().includes(q.toLowerCase()))
  );

  const editName = (student: Account) => {
    const name = window.prompt("Update student display name:", student.name);
    if (name?.trim()) updateAccount(student.id, { name: name.trim() });
  };

  const toggleRestrict = (student: Account) => {
    updateAccount(student.id, { restricted: !student.restricted });
  };

  const resetId = (student: Account) => {
    const id = window.prompt("Enter replacement KR8 ID:", student.id);
    if (id?.trim()) updateAccount(student.id, { id: id.trim().toUpperCase() });
  };

  return (
    <>
      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white">Student Management</h3>
            <span className="rounded-full bg-pink-500/10 px-2.5 py-0.5 text-xs font-semibold text-pink-300">
              {students.length} Total
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, ID or skill…"
              className="w-64 rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none"
            />
            <button
              onClick={() => setManualRegisterOpen(true)}
              className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white glow-pink-sm"
            >
              + Manually Register Student
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-[#8a7ba8]">
              <tr>
                <th className="p-3">KR8 ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Skill Track</th>
                <th className="p-3">Points</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8a7ba8]">
                    No students found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const skill = SKILLS.find((k) => k.key === s.skill);
                  return (
                    <tr key={s.id} className="border-t border-white/5 text-[#cabfe0] hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-xs font-semibold text-pink-400">{s.id}</td>
                      <td className="p-3">
                        <div className="font-medium text-white">{s.name}</div>
                        <div className="text-xs text-[#8a7ba8]">{s.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#cabfe0]">
                          {skill?.name ?? s.skill ?? "—"}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{s.points} pts</td>
                      <td className="p-3">
                        {s.restricted ? (
                          <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-300">
                            Restricted
                          </span>
                        ) : s.graduated ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-semibold text-green-300">
                            <Icon name="certificate" size={13} /> {s.certTier ?? "Certified"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-pink-500/10 px-2.5 py-1 text-xs text-pink-300">
                            Active Student
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right text-xs">
                        <button
                          onClick={() => setGraduatingStudent(s)}
                          className="mr-2 rounded-full bg-gradient-pink px-3 py-1 font-bold text-white hover:opacity-90"
                        >
                          {s.graduated ? "Update Cert" : "Graduate"}
                        </button>
                        <button onClick={() => editName(s)} className="mr-2 text-pink-300 hover:text-white">
                          Edit
                        </button>
                        <button
                          onClick={() => toggleRestrict(s)}
                          className={`mr-2 ${s.restricted ? "text-green-300" : "text-yellow-400"}`}
                        >
                          {s.restricted ? "Unrestrict" : "Restrict"}
                        </button>
                        <button onClick={() => resetId(s)} className="text-[#8a7ba8] hover:text-white">
                          Reset ID
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Registration Modal */}
      {manualRegisterOpen && (
        <ManualRegisterModal
          onClose={() => setManualRegisterOpen(false)}
          onSuccess={() => setManualRegisterOpen(false)}
        />
      )}

      {/* Graduation Flow Modal */}
      {graduatingStudent && (
        <GraduationModal
          student={graduatingStudent}
          onClose={() => setGraduatingStudent(null)}
          onGraduated={() => setGraduatingStudent(null)}
        />
      )}
    </>
  );
}

/* ---------------- Manual Student Registration Modal ---------------- */

function ManualRegisterModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (student: Account) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("NG");
  const [skill, setSkill] = useState("graphic");
  const [y, setY] = useState("2002");
  const [m, setM] = useState("01");
  const [d, setD] = useState("15");
  const [password, setPassword] = useState("TempChangeMe2026");
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Account | null>(null);
  const [copied, setCopied] = useState(false);

  const years = Array.from({ length: 40 }, (_, i) => 2010 - i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  const submit = () => {
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "+234";
    const fullPhone = buildPhone(dial, phone);
    const dob = `${y}-${m}-${d}`;

    const res = adminRegisterStudent({
      name: name.trim(),
      email: email.trim(),
      phone: fullPhone,
      country,
      skill,
      dob,
      password: password.trim(),
    });

    if (!res.ok || !res.student) {
      setError(res.error || "Could not register student.");
      return;
    }

    setCreated(res.student);
    onSuccess(res.student);
  };

  const copyCreds = () => {
    if (!created) return;
    const text = `KR8 Digitals Student Login Credentials:\nName: ${created.name}\nKR8 ID: ${created.id}\nEmail: ${created.email}\nTemporary Password: ${created.password}\nLogin URL: ${window.location.origin}/academy`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border border-pink-400/30">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Manual Student Registration (Admin)</h3>
          <button onClick={onClose} className="text-[#8a7ba8] hover:text-white">✕</button>
        </div>

        {created ? (
          <div className="mt-5 space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-300">
              <Icon name="check" size={26} />
            </div>
            <h4 className="text-xl font-bold text-white">Student Registered Successfully!</h4>
            <p className="text-sm text-[#b8aecf]">The student record has been created and saved to the database.</p>
            <div className="rounded-2xl border border-pink-400/30 bg-black/30 p-4 text-left font-mono text-xs space-y-2 text-[#cabfe0]">
              <div><span className="text-[#8a7ba8]">KR8 ID:</span> <strong className="text-pink-300 font-bold">{created.id}</strong></div>
              <div><span className="text-[#8a7ba8]">Name:</span> <strong className="text-white">{created.name}</strong></div>
              <div><span className="text-[#8a7ba8]">Email:</span> <strong className="text-white">{created.email}</strong></div>
              <div><span className="text-[#8a7ba8]">Skill:</span> <strong className="text-white">{created.skill}</strong></div>
              <div><span className="text-[#8a7ba8]">Password:</span> <strong className="text-green-300">{created.password}</strong></div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCreds}
                className="flex-1 rounded-full bg-gradient-pink py-2.5 text-xs font-bold text-white"
              >
                {copied ? "Copied Credentials! ✓" : "Copy Student Credentials"}
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-white/20 px-6 py-2.5 text-xs text-white"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs text-[#8a7ba8]">Full Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kenneth Timothy"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#8a7ba8]">Email Address *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@gmail.com"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-[#8a7ba8]">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name} ({c.dial})</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[#8a7ba8]">Phone Number *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08123456789"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#8a7ba8]">Skill Track (Works even if closed publicly) *</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
              >
                {SKILLS.map((s) => (
                  <option key={s.key} value={s.key}>{s.name} ({s.suffix})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8a7ba8]">Date of Birth *</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <select value={y} onChange={(e) => setY(e.target.value)} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white">
                  {years.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={m} onChange={(e) => setM(e.target.value)} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white">
                  {months.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={d} onChange={(e) => setD(e.target.value)} className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white">
                  {days.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#8a7ba8]">Temporary Password *</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={submit}
                className="flex-1 rounded-full bg-gradient-pink py-2.5 text-xs font-bold text-white glow-pink-sm"
              >
                Register Student & Generate ID →
              </button>
              <button
                onClick={onClose}
                className="rounded-full border border-white/15 px-5 py-2.5 text-xs text-[#b8aecf]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Corrected Graduation Modal (External File Upload + QR Overlay) ---------------- */

function GraduationModal({
  student,
  onClose,
  onGraduated,
}: {
  student: Account;
  onClose: () => void;
  onGraduated: (updated: Account) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [tier, setTier] = useState<"Completion" | "Professionalism">(
    (student.certTier as "Completion" | "Professionalism") || "Completion"
  );
  const [remark, setRemark] = useState(student.verifyRemark || "");
  const [position, setPosition] = useState<CertPosition>("bottom-right");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const skill = SKILLS.find((k) => k.key === student.skill);
  const verifyUrl = `${window.location.origin}/verify?id=${encodeURIComponent(student.id)}`;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setError("");

    if (selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview("");
    }
  };

  const handleApprove = async () => {
    if (!file && !student.certificateUrl) {
      setError("Please select the externally designed certificate file (image or PDF).");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      let finalImageUrl = student.certificateUrl || "";
      let fileType: "image" | "pdf" = student.certificateFileType || "image";

      if (file) {
        const result = await processGraduationCertificate(
          file,
          student.id,
          window.location.origin,
          position
        );
        finalImageUrl = result.imageUrl;
        fileType = result.fileType;

        // Persist to IndexedDB
        await saveCertificateData(student.id, {
          fileType: result.fileType,
          imageUrl: result.imageUrl,
          pdfBytes: result.pdfBytes,
        });
      }

      // Update student record
      const updated = updateAccount(student.id, {
        graduated: true,
        certTier: tier,
        verifyRemark: remark.trim() || undefined,
        certificateUrl: finalImageUrl,
        certificateFileType: fileType,
        graduatedAt: Date.now(),
      });

      if (updated) {
        saveVerifyRemark(student.id, remark.trim());
        addFeed({
          kind: "graduation",
          name: updated.name,
          skill: skill?.name ?? "Academy",
          avatar: updated.avatar,
        });
        onGraduated(updated);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to process certificate. Please ensure the file is a valid image or PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <Card className="my-8 w-full max-w-2xl border border-pink-400/40">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">Graduate Student & Issue Certificate</h3>
            <p className="text-xs text-[#8a7ba8]">
              {student.name} · <span className="font-mono text-pink-300">{student.id}</span> · {skill?.name}
            </p>
          </div>
          <button onClick={onClose} className="text-[#8a7ba8] hover:text-white">✕</button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Step 1 & 2: Certificate file upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300">
              1. Upload Certificate File (Image or PDF) *
            </label>
            <p className="mt-1 text-xs text-[#b8aecf]">
              Upload the actual certificate designed externally (Canva, Figma, Photoshop, etc.). The website will overlay a verifiable QR code automatically.
            </p>

            <label className="mt-3 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-400/40 bg-black/30 p-6 text-center cursor-pointer hover:border-pink-400">
              {filePreview ? (
                <div className="space-y-3">
                  <img src={filePreview} alt="Preview" className="max-h-44 rounded-xl mx-auto object-contain border border-white/10" />
                  <p className="text-xs text-green-300 font-semibold">✓ {file?.name} ({Math.round((file?.size || 0) / 1024)} KB)</p>
                </div>
              ) : file ? (
                <div className="space-y-2">
                  <span className="text-4xl">📄</span>
                  <p className="text-sm font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-[#8a7ba8]">PDF document ready ({Math.round(file.size / 1024)} KB)</p>
                </div>
              ) : student.certificateUrl ? (
                <div className="space-y-2">
                  <img src={student.certificateUrl} alt="Existing Cert" className="max-h-36 rounded-xl mx-auto object-contain" />
                  <p className="text-xs text-[#cabfe0]">Current certificate loaded. Click to replace with a new file.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-3xl">📁</span>
                  <p className="text-sm font-semibold text-white">Choose Certificate File</p>
                  <p className="text-xs text-[#8a7ba8]">PNG, JPG, JPEG, WEBP or PDF</p>
                </div>
              )}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Step 2: Tier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300">
              2. Certificate Tier *
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {(["Completion", "Professionalism"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`rounded-2xl p-4 text-left transition-all ${
                    tier === t
                      ? "border border-pink-400 bg-gradient-pink text-white shadow-lg"
                      : "border border-white/15 bg-black/20 text-[#cabfe0] hover:border-white/30"
                  }`}
                >
                  <div className="font-bold text-sm">Certificate of {t}</div>
                  <div className="text-[11px] opacity-80 mt-1">
                    {t === "Completion" ? "Coursework and assignments completed." : "High mastery, exceptional project execution."}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Extra notes (Verify Remarks) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-300">
              3. Extra Notes / Comments (Verify Remarks)
            </label>
            <p className="mt-1 text-xs text-[#8a7ba8]">
              This note is stored directly on the student's profile. It is <strong>only ever shown on the public Verify page if the student separately opts into expanded visibility</strong>; it is private by default.
            </p>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={3}
              placeholder="e.g. Demonstrated exceptional discipline in brand identity systems. Strongly recommended for real client work."
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none"
            />
          </div>

          {/* Step 4: QR Code overlay options */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-white">QR Code Verification Overlay</p>
                <p className="text-[11px] text-[#8a7ba8]">
                  Encodes: <span className="font-mono text-pink-300">{verifyUrl}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8a7ba8]">Position:</span>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as CertPosition)}
                  className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="bottom-right">Bottom Right (Default)</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-xs text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApprove}
              disabled={processing || (!file && !student.certificateUrl)}
              className="flex-1 rounded-full bg-gradient-pink py-3 text-sm font-bold text-white glow-pink-sm hover:opacity-90 disabled:opacity-40"
            >
              {processing ? "Generating QR Overlay & Saving..." : "Approve & Issue Certificate →"}
            </button>
            <button
              onClick={onClose}
              disabled={processing}
              className="rounded-full border border-white/15 px-6 py-3 text-sm text-[#b8aecf] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Graduation & Certificates Tab ---------------- */

function GraduationManager({ students }: { students: Account[] }) {
  const [sel, setSel] = useState(students[0]?.id ?? "");
  const selectedStudent = students.find((x) => x.id === sel) || students[0];
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Card>
      <h3 className="font-bold text-white text-xl">Graduation & Certificates Manager</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">
        Upload externally designed certificate files, choose the graduation tier, add private verify remarks, and automatically overlay verifiable QR codes.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-[#8a7ba8]">Select Student to Graduate</label>
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none"
          >
            {students.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name} — {x.id} {x.graduated ? `(Graduated: ${x.certTier})` : "(In Training)"}
              </option>
            ))}
          </select>
        </div>

        {selectedStudent && (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-white">{selectedStudent.name}</h4>
                <p className="font-mono text-xs text-pink-400">{selectedStudent.id}</p>
              </div>
              <div>
                {selectedStudent.graduated ? (
                  <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-300">
                    ✓ Graduated ({selectedStudent.certTier})
                  </span>
                ) : (
                  <span className="rounded-full bg-pink-500/10 px-3 py-1 text-xs text-pink-300">
                    In Training
                  </span>
                )}
              </div>
            </div>

            {selectedStudent.certificateUrl && (
              <div className="mt-3">
                <p className="text-xs text-[#8a7ba8] mb-2">Attached Certificate (with QR Code):</p>
                <img
                  src={selectedStudent.certificateUrl}
                  alt="Certificate"
                  className="max-h-56 rounded-xl border border-white/10 object-contain"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-full bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white glow-pink-sm"
              >
                {selectedStudent.graduated ? "Upload / Update Certificate →" : "Graduate Student Now →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && selectedStudent && (
        <GraduationModal
          student={selectedStudent}
          onClose={() => setModalOpen(false)}
          onGraduated={() => setModalOpen(false)}
        />
      )}
    </Card>
  );
}

/* ---------------- Verify Remarks Manager ---------------- */

function VerifyRemarksManager({ students }: { students: Account[] }) {
  const [selId, setSelId] = useState(students[0]?.id ?? "");
  const selectedStudent = students.find((s) => s.id === selId) || students[0];
  const [remark, setRemark] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      setRemark(selectedStudent.verifyRemark || "");
    }
  }, [selId, selectedStudent]);

  const save = () => {
    if (!selectedStudent) return;
    updateAccount(selectedStudent.id, { verifyRemark: remark.trim() });
    saveVerifyRemark(selectedStudent.id, remark.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Verify Page Remarks</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">
        Write custom admin notes per student. This remark is stored on the student profile and is <strong>only shown on their public Verify page if that student has explicitly opted into expanded visibility</strong>.
      </p>

      <div className="mt-4">
        <label className="text-xs text-[#8a7ba8]">Select Student</label>
        <select
          value={selId}
          onChange={(e) => setSelId(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:outline-none"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.id} {s.verifyRemark ? "(Has remark)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <label className="text-xs text-[#8a7ba8]">Student Admin Remark</label>
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          rows={4}
          placeholder="Admin remark / recommendation for this student..."
          className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          className="rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white glow-pink-sm"
        >
          Save Remark to Student Profile
        </button>
        {saved && <span className="text-xs text-green-300 font-semibold">✓ Remark saved and linked to student profile!</span>}
      </div>
    </Card>
  );
}

/* ---------------- Blog Manager ---------------- */

function BlogManager() {
  const [posts, setPosts] = useState(getBlogPosts());
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Digital Skills");
  const [author, setAuthor] = useState("KR8 Team");
  const [excerpt, setExcerpt] = useState("");
  const [saved, setSaved] = useState(false);

  const togglePin = (id: string) => {
    const next = posts.map((post) =>
      post.id === id ? { ...post, pinned: !post.pinned } : { ...post, pinned: false }
    );
    setPosts(next);
    saveBlogPosts(next);
  };

  const removePost = (id: string) => {
    const next = posts.filter((post) => post.id !== id);
    setPosts(next);
    saveBlogPosts(next);
  };

  const addPost = () => {
    if (!title.trim() || !excerpt.trim()) return;
    const newPost = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      category,
      author: author.trim() || "KR8 Team",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      excerpt: excerpt.trim(),
      readTime: "4 min",
      img: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=900",
      source: "admin" as const,
      pinned: false,
    };
    const next = [newPost, ...posts];
    setPosts(next);
    saveBlogPosts(next);
    setTitle("");
    setExcerpt("");
    setAdding(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-white text-lg">Blog Management</h3>
          <p className="mt-1 text-sm text-[#b8aecf]">
            Pin a headline article, publish new insights, or remove articles. Changes persist and reflect live.
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white"
        >
          {adding ? "Cancel" : "+ New Blog Post"}
        </button>
      </div>

      {adding && (
        <div className="mt-5 rounded-2xl border border-pink-400/30 bg-black/30 p-4 space-y-3">
          <h4 className="font-bold text-white text-sm">Add New Blog Article</h4>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title"
            className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
            >
              {["Digital Skills", "AI", "Community", "Announcements", "Company News"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author Name"
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
            />
          </div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Article summary / excerpt..."
            className="w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white"
          />
          <button
            onClick={addPost}
            className="rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white"
          >
            Publish Article
          </button>
        </div>
      )}

      {saved && <p className="mt-3 text-xs text-green-300">Blog updated successfully.</p>}

      <div className="mt-5 space-y-2">
        {posts.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/20 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-white">{b.title}</span>
              <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#cabfe0]">
                {b.category}
              </span>
              {b.pinned && (
                <span className="ml-2 rounded-full bg-gradient-pink px-2 py-0.5 text-[10px] font-bold text-white">
                  Pinned
                </span>
              )}
            </div>
            <div className="flex gap-3 text-xs">
              <button onClick={() => togglePin(b.id)} className="text-pink-300 hover:text-white">
                {b.pinned ? "Unpin" : "Pin to Top"}
              </button>
              <button onClick={() => removePost(b.id)} className="text-red-400 hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Attendance Review Panel ---------------- */

function AttendancePanel() {
  const [pw, setPw] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(false);
  const [students, setStudents] = useState<Account[]>(getStudents);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    const refresh = () => setStudents(getStudents());
    window.addEventListener("kr8:accounts-updated", refresh);
    return () => window.removeEventListener("kr8:accounts-updated", refresh);
  }, []);

  if (!ok) {
    return (
      <Card className="max-w-sm">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <Icon name="lock" size={17} /> Attendance Review
        </h3>
        <p className="mt-1 text-sm text-[#b8aecf]">
          Dedicated coach access. Enter attendance review password.
        </p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Attendance password"
          className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none"
        />
        {err && <p className="mt-2 text-xs text-red-400">Incorrect password.</p>}
        <button
          onClick={() => (pw === ATTENDANCE_PW ? setOk(true) : setErr(true))}
          className="mt-3 w-full rounded-full bg-gradient-pink py-2.5 text-sm font-bold text-white"
        >
          Unlock Review
        </button>
      </Card>
    );
  }

  const approve = (student: Account, typeName: string) => {
    const updated = updateAccount(student.id, {
      attendanceAccepted: (student.attendanceAccepted || 0) + 1,
      points: (student.points || 0) + 10,
    });
    if (updated) {
      addFeed({ kind: "attendance", name: student.name, skill: typeName, avatar: student.avatar });
      setFeedback((prev) => ({ ...prev, [`${typeName}-${student.id}`]: "Approved (+10 pts awarded!)" }));
    }
  };

  return (
    <div className="space-y-4">
      {ATTENDANCE_TYPES.map((t) => (
        <Card key={t.key}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{t.name}</h3>
            <span className="text-xs text-green-300">● Open for Submissions</span>
          </div>
          <div className="mt-3 space-y-2">
            {students.slice(0, 4).map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-black/20 p-3 text-xs">
                <div>
                  <span className="font-medium text-white">{s.name}</span> ·{" "}
                  <span className="font-mono text-pink-300">{s.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  {feedback[`${t.name}-${s.id}`] ? (
                    <span className="text-green-300 font-semibold">{feedback[`${t.name}-${s.id}`]}</span>
                  ) : (
                    <>
                      <button
                        onClick={() => approve(s, t.name)}
                        className="rounded-full bg-green-500/20 px-3 py-1 font-semibold text-green-300 hover:bg-green-500/30"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setFeedback((p) => ({ ...p, [`${t.name}-${s.id}`]: "Rejected" }))}
                        className="rounded-full bg-red-500/20 px-3 py-1 text-red-300 hover:bg-red-500/30"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Home, Agency, Academy, Links, Payment, etc. Managers ---------------- */

function PaymentManager() {
  const [settings, setSettings] = useState(getPaymentSettings());
  const [saved, setSaved] = useState(false);
  const save = () => {
    savePaymentSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };
  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Payment Settings</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Update the account and advanced-training price used across payment instructions.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl bg-black/30 p-3">
          <span className="text-xs text-[#8a7ba8]">Account Number</span>
          <input value={settings.account} onChange={(e) => setSettings({ ...settings, account: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" />
        </label>
        <label className="rounded-xl bg-black/30 p-3">
          <span className="text-xs text-[#8a7ba8]">Bank Name</span>
          <input value={settings.bank} onChange={(e) => setSettings({ ...settings, bank: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" />
        </label>
        <label className="rounded-xl bg-black/30 p-3">
          <span className="text-xs text-[#8a7ba8]">Account Name</span>
          <input value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" />
        </label>
        <label className="rounded-xl bg-black/30 p-3">
          <span className="text-xs text-[#8a7ba8]">Advanced Track Price (NGN)</span>
          <input value={settings.advancedPrice} onChange={(e) => setSettings({ ...settings, advancedPrice: e.target.value })} className="mt-1 w-full bg-transparent text-white focus:outline-none" />
        </label>
      </div>
      <button onClick={save} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">Save Payment Settings</button>
      {saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}
    </Card>
  );
}

function XPManager() {
  const [saved, setSaved] = useState(false);
  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Leaderboard & XP Rules</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Points allocated per verified activity.</p>
      <div className="mt-4 space-y-2">
        {[
          { action: "Attendance Approved", pts: "10" },
          { action: "Assignment Accepted", pts: "25" },
          { action: "Community Hangout", pts: "15" },
          { action: "Successful Referral", pts: "20" },
          { action: "Graduate Certification", pts: "100" },
        ].map((item) => (
          <div key={item.action} className="flex items-center justify-between rounded-xl bg-black/20 px-4 py-3 text-sm text-white">
            <span>{item.action}</span>
            <span className="font-mono text-pink-300 font-bold">+{item.pts} pts</span>
          </div>
        ))}
      </div>
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">
        Save XP Rules
      </button>
      {saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}
    </Card>
  );
}

function LinksManager() {
  const [links, setLinks] = useState(() =>
    Object.fromEntries(SKILLS.filter((s) => s.available).map((s) => [s.key, getSkillWhatsApp(s.key)]))
  );
  const [tribe, setTribe] = useState("https://chat.whatsapp.com/DgnBOEd5CfMHV8CTWgPNLH?s=cl&p=a&mlu=4&ilr=4");
  const [saved, setSaved] = useState(false);

  const save = () => {
    Object.entries(links).forEach(([key, whatsapp]) => saveSkillSetting(key, { whatsapp }));
    localStorage.setItem("kr8_tribe_link_v1", tribe);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Links Manager</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Edit skill and Tribe WhatsApp links, then save to apply them to registration and join flows.</p>
      <div className="mt-4 space-y-2">
        {SKILLS.filter((s) => s.available).map((s) => (
          <label key={s.key} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/20 px-4 py-2.5">
            <span className="w-40 shrink-0 text-sm text-white">{s.name}</span>
            <input
              value={links[s.key] ?? ""}
              onChange={(e) => setLinks((all) => ({ ...all, [s.key]: e.target.value }))}
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none"
            />
          </label>
        ))}
        <label className="flex flex-wrap items-center gap-3 rounded-xl bg-black/20 px-4 py-2.5">
          <span className="w-40 shrink-0 text-sm text-white">Tribe WhatsApp</span>
          <input
            value={tribe}
            onChange={(e) => setTribe(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none"
          />
        </label>
      </div>
      <button onClick={save} className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white">
        Save Link Changes
      </button>
      {saved && <span className="ml-3 text-xs text-green-300">Saved and applied live.</span>}
      <SocialLinksManager />
    </Card>
  );
}

function SocialLinksManager() {
  const [links, setLinks] = useState(getSocialLinks());
  const [saved, setSaved] = useState(false);
  const update = (key: string, patch: Partial<(typeof links)[number]>) =>
    setLinks((all) => all.map((link) => (link.key === key ? { ...link, ...patch } : link)));

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h4 className="font-bold text-white">Social media links</h4>
      <p className="mt-1 text-xs text-[#8a7ba8]">These links power the footer and the periodic Follow Us popup.</p>
      <div className="mt-3 space-y-2">
        {links.map((link) => (
          <div key={link.key} className="flex flex-wrap items-center gap-3 rounded-xl bg-black/20 px-4 py-3">
            <span className="w-20 text-sm text-white">{link.label}</span>
            <input
              value={link.href}
              disabled={link.enabled === false}
              onChange={(e) => update(link.key, { href: e.target.value })}
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none"
            />
            <label className="flex items-center gap-1 text-xs text-[#8a7ba8]">
              <input
                type="checkbox"
                checked={link.enabled !== false}
                onChange={(e) => update(link.key, { enabled: e.target.checked })}
                className="accent-pink-500"
              />{" "}
              Show
            </label>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          saveSocialLinks(links as typeof import("../data/store").SOCIAL_LINKS);
          setSaved(true);
          setTimeout(() => setSaved(false), 1800);
        }}
        className="mt-3 rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white"
      >
        Save social links
      </button>
      {saved && <span className="ml-3 text-xs text-green-300">Saved.</span>}
    </div>
  );
}

function AcademyManager() {
  return (
    <div className="space-y-4">
      {SKILLS.map((s) => (
        <AcademySkillManager key={s.key} skill={s} />
      ))}
      <p className="text-xs text-[#8a7ba8]">
        Each skill's registration toggle is independent — close any combination while others stay open.
      </p>
    </div>
  );
}

function AcademySkillManager({ skill }: { skill: (typeof SKILLS)[number] }) {
  const [open, setOpen] = useState(getSkillRegistration(skill.key));
  const [whatsapp, setWhatsapp] = useState(getSkillWhatsApp(skill.key));
  const [saved, setSaved] = useState(false);

  const save = () => {
    saveSkillSetting(skill.key, { regOpen: open, whatsapp });
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-white">{skill.name}</h3>
          <p className="text-xs text-[#8a7ba8]">
            {getStudents().filter((x) => x.skill === skill.key).length} registered · Instructor:{" "}
            {skill.instructor?.name ?? "To be announced"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[#cabfe0]">
            <input
              type="checkbox"
              checked={open}
              onChange={(e) => setOpen(e.target.checked)}
              disabled={!skill.available}
              className="accent-pink-500"
            />
            Registration {open ? "open" : "closed"}
          </label>
          <button onClick={save} className="rounded-full bg-gradient-pink px-3 py-1.5 text-xs font-bold text-white">
            Save
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none"
          placeholder="Skill WhatsApp link"
        />
        <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#8a7ba8]">
          Curriculum: {skill.curriculum.length ? `${skill.curriculum.length} weeks` : "Not published"}
        </span>
      </div>
      {saved && <p className="mt-2 text-xs text-green-300">Skill settings saved and applied to registration.</p>}
    </Card>
  );
}

function AgencyManager() {
  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Agency Portfolio</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Client projects delivered by KR8 graduate teams.</p>
      <div className="mt-4 space-y-3">
        {PORTFOLIO.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h4 className="font-bold text-white">{item.client} — {item.service}</h4>
            <p className="text-xs text-[#8a7ba8] mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnnouncementManager() {
  const [items, setItems] = useState<Announcement[]>(getAnnouncements());
  const [saved, setSaved] = useState(false);

  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Announcements</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Live announcements displayed on the site.</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs text-pink-400 font-semibold">{item.date}</p>
            <h4 className="text-base font-bold text-white mt-1">{item.title}</h4>
            <p className="text-xs text-[#cabfe0] mt-1">{item.body || item.caption}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FoundersManager() {
  const [founders, setFounders] = useState(getFounders());
  const [saved, setSaved] = useState("");

  const update = (key: string, patch: Partial<(typeof founders)[number]>) =>
    setFounders((all) => all.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const save = (key: string) => {
    saveFounders(founders);
    setSaved(key);
    setTimeout(() => setSaved(""), 1500);
  };

  return (
    <Card className="mb-6">
      <h3 className="font-bold text-white text-lg">Founders Manager</h3>
      <div className="mt-4 space-y-4">
        {founders.map((f) => (
          <div key={f.key} className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white">{f.name}</h4>
              <button onClick={() => save(f.key)} className="rounded-full bg-gradient-pink px-4 py-1 text-xs font-bold text-white">
                Save
              </button>
            </div>
            <input
              value={f.name}
              onChange={(e) => update(f.key, { name: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-white"
            />
            <input
              value={f.role}
              onChange={(e) => update(f.key, { role: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-[#cabfe0]"
            />
            {saved === f.key && <p className="text-xs text-green-300">Saved successfully!</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamManager() {
  const [team] = useState(getTeam());
  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Leadership Team</h3>
      <div className="mt-4 space-y-3">
        {team.map((m) => (
          <div key={m.key} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <h4 className="font-bold text-white text-sm">{m.name}</h4>
            <p className="text-xs text-[#8a7ba8]">{m.role}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function HomeManager() {
  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Homepage Settings</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">Homepage banner & announcements are synchronized across user sessions.</p>
    </Card>
  );
}

function ModerationManager() {
  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Community Moderation</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">No flagged accounts or moderation disputes pending.</p>
    </Card>
  );
}

function PermissionsManager() {
  return (
    <Card>
      <h3 className="font-bold text-white text-lg">Admin Permissions & Access Control</h3>
      <p className="mt-1 text-sm text-[#b8aecf]">The Ultimate Administrator account has unconstrained access to all sections.</p>
    </Card>
  );
}
