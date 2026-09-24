import { useState, useEffect, type ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import {
  getSkills, getSkill, saveCustomSkill, deleteCustomSkill,
  getWaitlistWhatsAppUrl, saveWaitlistWhatsAppUrl, areAllRegistrationsClosed,
  type Skill, ATTENDANCE_TYPES, PORTFOLIO,
  getAnnouncements, saveAnnouncements, getSocialLinks, saveSocialLinks,
  getPaymentSettings, savePaymentSettings, getSkillRegistration, getSkillWhatsApp,
  saveSkillSetting, getFounders, saveFounders, getTeam,
  getTestimonials, addTestimonial, deleteTestimonial, updateTestimonial,
  getVideoComments, deleteVideoComment,
  getAccounts, getStudents, updateAccount,
  adminRegisterStudent, saveVerifyRemark, getBlogPosts, saveBlogPosts,
  addFeed, MAIN_ADMIN_PASSWORD, buildPhone, COUNTRIES,
  getStreamReplays, saveStreamReplays,
  canUserHostStream, deleteStreamRecording,
  getGalleryItems, addGalleryItem, approveGalleryItem, rejectGalleryItem, archiveAnnouncementToGallery,
  getHomepageSettings, saveHomepageSettings, DEFAULT_DOUBT_TO_BELIEF, DEFAULT_NARRATIVE_LINES,
  revokeStudentRegistration, suspendStudentAccount, getSuspendedAccounts, restoreSuspendedAccount, upholdSuspendedAccount,
  getClientRequests, updateClientRequestStatus, deleteClientRequest,
  type Account, type Announcement, type Testimonial, type VideoComment, type BlogPost, type StreamReplay, type GalleryItem, type DoubtToBeliefStep, type SuspendedAccount, type ClientRequest,
} from "../data/store";
import { Card, Pill, GradientButton, GhostButton } from "../components/ui";
import Icon from "../components/Icon";
import {
  processGraduationCertificate,
  saveCertificateData,
  type CertPosition,
} from "../utils/certificate";

const ATTENDANCE_PW = "KR8@Atd2026";

const sections = [
  "Overview", "Client Requests", "Home", "Academy", "Testimonial Videos", "Live Streams & Replays", "Agency", "Gallery Archive", "Student Management", "Blog",
  "Announcements", "Graduation & Certificates", "Leaderboard & XP", "Links Manager",
  "Verify Remarks", "Payment Settings", "Founders & Partners", "Attendance Review", "Moderation", "Admin Permissions", "Supabase Database",
];

export default function Admin() {
  const { student: currentUser } = useAuth();
  const [pw, setPw] = useState("");
  const [auth, setAuth] = useState(false);
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [students, setStudents] = useState<Account[]>(() => getAccounts().filter((a) => a.type !== "tribe"));

  const isAuthorized = !!(currentUser?.admin || currentUser?.type === "founder" || currentUser?.type === "co-founder");
  const isUltimate = currentUser?.admin?.role === "ultimate" || currentUser?.type === "founder" || pw === MAIN_ADMIN_PASSWORD;

  // Real-time synchronization whenever student data or accounts update
  useEffect(() => {
    const refresh = () => setStudents(getAccounts().filter((a) => a.type !== "tribe"));
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

  // If user is not logged in or not authorized, block public view completely
  if (!currentUser || !isAuthorized) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-md text-center py-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <Icon name="lock" size={28} />
          </div>
          <Pill>Authorized Personnel Only</Pill>
          <h1 className="font-display mt-4 text-2xl text-white sm:text-3xl">Restricted Access</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">
            The Admin Portal is strictly reserved for verified KR8 Digitals faculty and executive leadership.
            Access is managed directly through authorized member profiles.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <GradientButton to="/academy">Go to Member Portal</GradientButton>
            <GhostButton to="/">Return to Homepage</GhostButton>
          </div>
        </Card>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white">
            <Icon name="lock" size={23} />
          </div>
          <h1 className="font-display text-2xl text-white">Admin Access</h1>
          <p className="mt-2 text-sm text-[#b8aecf]">
            Welcome, {currentUser?.name || "Administrator"}. Please enter your administrative password.
          </p>
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

          {tab === "Client Requests" && <ClientRequestsManager />}
          {tab === "Home" && <HomeManager onOpenVideos={() => setTab("Testimonial Videos")} />}
          {tab === "Academy" && <AcademyManager onOpenVideos={() => setTab("Testimonial Videos")} />}
          {tab === "Testimonial Videos" && <TestimonialVideosManager />}
          {tab === "Live Streams & Replays" && <LiveStreamsManager />}
          {tab === "Agency" && <AgencyManager />}
          {tab === "Gallery Archive" && <GalleryManager />}
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
          {tab === "Supabase Database" && <SupabaseManager />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Student Management ---------------- */

function StudentManager({ students }: { students: Account[] }) {
  const { student: currentUser, addNotification } = useAuth();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"active" | "suspended">("active");
  const [graduatingStudent, setGraduatingStudent] = useState<Account | null>(null);
  const [manualRegisterOpen, setManualRegisterOpen] = useState(false);
  const [assigningRoleStudent, setAssigningRoleStudent] = useState<Account | null>(null);
  const [suspendingStudent, setSuspendingStudent] = useState<Account | null>(null);
  const [revokeConfirmStudent, setRevokeConfirmStudent] = useState<Account | null>(null);
  const [suspendedList, setSuspendedList] = useState<SuspendedAccount[]>(getSuspendedAccounts());

  const refreshSuspended = () => {
    setSuspendedList(getSuspendedAccounts());
  };

  useEffect(() => {
    window.addEventListener("kr8:suspended-updated", refreshSuspended);
    return () => window.removeEventListener("kr8:suspended-updated", refreshSuspended);
  }, []);

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

  const handleConfirmRevoke = () => {
    if (!revokeConfirmStudent) return;
    const sName = revokeConfirmStudent.name;
    const ok = revokeStudentRegistration(revokeConfirmStudent.id);
    if (ok) {
      addNotification(`Revoked registration for ${sName}. They can register again cleanly from scratch.`);
    }
    setRevokeConfirmStudent(null);
  };

  const handleRestoreAccount = (suspendedId: string, name: string) => {
    const ok = restoreSuspendedAccount(suspendedId);
    if (ok) {
      refreshSuspended();
      addNotification(`Restored account for ${name}. Deletion reversed and access granted.`);
    }
  };

  const handleUpholdSuspension = (suspendedId: string, name: string) => {
    const ok = upholdSuspendedAccount(suspendedId);
    if (ok) {
      refreshSuspended();
      addNotification(`Upheld suspension for ${name}. Credentials permanently blocked.`);
    }
  };

  return (
    <>
      <Card className="!p-0 overflow-hidden">
        {/* Header Tabs: Active vs. Suspended */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white text-base">Student Management</h3>
            <div className="flex rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
              <button
                onClick={() => setTab("active")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  tab === "active" ? "bg-gradient-pink text-white" : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Active Students ({students.length})
              </button>
              <button
                onClick={() => setTab("suspended")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-all ${
                  tab === "suspended" ? "bg-gradient-pink text-white" : "text-[#b8aecf] hover:text-white"
                }`}
              >
                <span>Suspended / Appeals</span>
                <span className="rounded-full bg-black/30 px-1.5 py-0.2 text-[10px] font-mono">
                  {suspendedList.length}
                </span>
              </button>
            </div>
          </div>

          {tab === "active" && (
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
          )}
        </div>

        {tab === "active" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[#8a7ba8]">
                <tr>
                  <th className="p-3">KR8 ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Skill Track</th>
                  <th className="p-3">Role / Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#8a7ba8]">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => {
                    const skill = getSkill(s.skill);
                    return (
                      <tr key={s.id} className="border-t border-white/5 text-[#cabfe0] hover:bg-white/[0.02]">
                        <td className="p-3 font-mono text-xs font-semibold text-pink-400">{s.id}</td>
                        <td className="p-3">
                          <div className="font-medium text-white">{s.name}</div>
                          <div className="text-xs text-[#8a7ba8]">{s.email} · {s.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#cabfe0]">
                            {skill?.name ?? s.skill ?? "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          {s.type === "founder" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-pink px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                              👑 Founder & CEO
                            </span>
                          ) : s.type === "co-founder" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/30 border border-purple-400/40 px-2.5 py-1 text-xs font-bold text-purple-200 shadow-sm">
                              ⭐ Co-Founder
                            </span>
                          ) : s.admin ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-400/30 px-2.5 py-0.5 text-xs font-bold text-purple-200">
                              {s.admin.title || s.admin.role}
                            </span>
                          ) : s.pendingRoleOffer ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-xs font-bold text-amber-300 animate-pulse">
                              Pending Password Setup ({s.pendingRoleOffer.title})
                            </span>
                          ) : s.restricted ? (
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
                          {s.type === "founder" || s.type === "co-founder" ? (
                            <span className="mr-2 rounded-full border border-pink-400/50 bg-pink-500/10 px-3 py-1 text-xs font-bold text-pink-300">
                              Executive
                            </span>
                          ) : (
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {/* ASSIGN ROLE (Phase 7) */}
                              <button
                                onClick={() => setAssigningRoleStudent(s)}
                                className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-200 hover:bg-purple-500/20"
                                title="Assign custom title and granular permissions"
                              >
                                {s.admin ? "Manage Role" : "Assign Role"}
                              </button>

                              {/* GRADUATE */}
                              <button
                                onClick={() => setGraduatingStudent(s)}
                                className="rounded-lg bg-gradient-pink px-2.5 py-1 font-bold text-white hover:opacity-90"
                              >
                                {s.graduated ? "Cert" : "Graduate"}
                              </button>

                              {/* EDIT */}
                              <button
                                onClick={() => editName(s)}
                                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-pink-300 hover:bg-white/5"
                              >
                                Edit
                              </button>

                              {/* RESTRICT / UNRESTRICT */}
                              <button
                                onClick={() => toggleRestrict(s)}
                                className={`rounded-lg border border-white/10 px-2 py-1 text-xs ${
                                  s.restricted ? "text-emerald-300" : "text-yellow-400"
                                } hover:bg-white/5`}
                              >
                                {s.restricted ? "Unrestrict" : "Restrict"}
                              </button>

                              {/* RESET ID */}
                              <button
                                onClick={() => resetId(s)}
                                className="rounded-lg border border-white/10 px-2 py-1 text-xs text-[#8a7ba8] hover:text-white hover:bg-white/5"
                              >
                                ID
                              </button>

                              {/* REVOKE REGISTRATION (Phase 8: Clean reset) */}
                              <button
                                onClick={() => setRevokeConfirmStudent(s)}
                                className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
                                title="Clean reset — cancels registration but allows them to re-register"
                              >
                                Revoke
                              </button>

                              {/* DELETE / SUSPEND ACCOUNT (Phase 8: Blocks credentials, 30-day appeal) */}
                              <button
                                onClick={() => setSuspendingStudent(s)}
                                className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                                title="Requires reason, blocks email/phone/ID, gives 30-day appeal"
                              >
                                Suspend
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* SUSPENDED ACCOUNTS & APPEALS QUEUE (Phase 8) */
          <div className="p-4 space-y-4">
            <p className="text-xs text-[#cabfe0]">
              Suspended accounts have their credentials (email, phone, and KR8 ID) permanently blocked from re-registering, subject to a 30-day appeal review window.
            </p>

            {suspendedList.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-12 text-center text-xs text-[#8a7ba8]">
                No suspended accounts. All active credentials are in good standing.
              </div>
            ) : (
              <div className="space-y-3">
                {suspendedList.map((item) => {
                  const daysRemaining = Math.max(0, Math.ceil((item.appealDeadline - Date.now()) / (1000 * 60 * 60 * 24)));
                  const isExpired = Date.now() > item.appealDeadline;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-red-500/30 bg-black/40 p-4 text-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">{item.name}</span>
                          <span className="font-mono text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            {item.id}
                          </span>
                          <span className="text-[#8a7ba8]">· {item.email} · {item.phone}</span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            item.appealStatus === "restored"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : item.appealStatus === "pending"
                              ? "bg-amber-500/20 text-amber-300 animate-pulse"
                              : item.appealStatus === "upheld"
                              ? "bg-red-500/20 text-red-300"
                              : isExpired
                              ? "bg-gray-500/20 text-gray-400"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {item.appealStatus === "pending"
                            ? "Appeal Pending Review"
                            : item.appealStatus === "restored"
                            ? "Restored"
                            : item.appealStatus === "upheld"
                            ? "Deletion Permanent"
                            : isExpired
                            ? "Appeal Window Expired (Permanent)"
                            : `${daysRemaining} Days Left to Appeal`}
                        </span>
                      </div>

                      <div>
                        <strong className="text-red-300">Admin Suspension Reason: </strong>
                        <span className="text-[#cabfe0]">{item.reason}</span>
                      </div>

                      {/* Display appeal statement if student submitted one */}
                      {item.appealText && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-[#e8ddf5]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-1">
                            <span>Student Appeal Statement:</span>
                            <span>{item.appealSubmittedAt ? new Date(item.appealSubmittedAt).toLocaleString() : ""}</span>
                          </div>
                          <p className="italic leading-relaxed">"{item.appealText}"</p>
                        </div>
                      )}

                      {/* Admin Appeal Decision Actions */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#8a7ba8]">
                          Suspended on {new Date(item.suspendedAt).toLocaleDateString()} · 30-Day Deadline: {new Date(item.appealDeadline).toLocaleDateString()}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreAccount(item.id, item.name)}
                            className="rounded-xl bg-emerald-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                          >
                            Restore Account
                          </button>
                          <button
                            onClick={() => handleUpholdSuspension(item.id, item.name)}
                            className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-colors"
                          >
                            Uphold Deletion
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
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

      {/* ASSIGN ROLE MODAL (Phase 7) */}
      {assigningRoleStudent && (
        <AssignRoleModal
          student={assigningRoleStudent}
          adminUser={currentUser}
          onClose={() => setAssigningRoleStudent(null)}
          onAssigned={() => {
            setAssigningRoleStudent(null);
            addNotification(`Role offer created for ${assigningRoleStudent.name}. They will be prompted to set their password on their profile.`);
          }}
        />
      )}

      {/* REVOKE REGISTRATION CONFIRMATION MODAL (Phase 8) */}
      {revokeConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-[#160d2b] p-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Revoke Student Registration?</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#cabfe0]">
              This will cancel <strong className="text-white">{revokeConfirmStudent.name}</strong>'s current registration and KR8 ID ({revokeConfirmStudent.id}).
            </p>
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">
              ✓ <strong>Clean Reset:</strong> This is NOT a punishment. Their email ({revokeConfirmStudent.email}) and phone number remain completely unblocked and free to register again at any time.
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokeConfirmStudent(null)}
                className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND / DELETE ACCOUNT MODAL (Phase 8: Requires Reason) */}
      {suspendingStudent && (
        <SuspendStudentModal
          student={suspendingStudent}
          onClose={() => setSuspendingStudent(null)}
          onSuspended={() => {
            const name = suspendingStudent.name;
            setSuspendingStudent(null);
            refreshSuspended();
            addNotification(`Account for ${name} has been suspended. A 30-day appeal notice is active.`);
          }}
        />
      )}
    </>
  );
}

/* ---------------- Phase 7: Assign Role Modal ---------------- */

function AssignRoleModal({
  student,
  adminUser,
  onClose,
  onAssigned,
}: {
  student: Account;
  adminUser: Account | null;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [title, setTitle] = useState(student.admin?.title || student.pendingRoleOffer?.title || "Coach");
  const [grantAdminAccess, setGrantAdminAccess] = useState(
    student.pendingRoleOffer?.grantAdminAccess !== undefined ? student.pendingRoleOffer.grantAdminAccess : true
  );
  const [permissions, setPermissions] = useState<string[]>(
    student.admin?.permissions || student.pendingRoleOffer?.permissions || [
      "Academy",
      "Attendance Review",
      "Announcements",
      "Graduation & Certificates",
    ]
  );
  const [error, setError] = useState("");

  const availableSections = [
    "Overview",
    "Home",
    "Academy",
    "Testimonial Videos",
    "Live Streams & Replays",
    "Agency",
    "Gallery Archive",
    "Student Management",
    "Blog",
    "Announcements",
    "Graduation & Certificates",
    "Leaderboard & XP",
    "Links Manager",
    "Verify Remarks",
    "Payment Settings",
    "Attendance Review",
    "Moderation",
  ];

  const toggleSection = (section: string) => {
    if (permissions.includes(section)) {
      setPermissions(permissions.filter((p) => p !== section));
    } else {
      setPermissions([...permissions, section]);
    }
  };

  const selectAll = () => setPermissions(availableSections);
  const deselectAll = () => setPermissions([]);

  const applyPreset = (presetName: string) => {
    if (presetName === "Coach") {
      setTitle("Faculty Coach");
      setPermissions(["Academy", "Attendance Review", "Announcements", "Graduation & Certificates"]);
    } else if (presetName === "Attendance Reviewer") {
      setTitle("Attendance Reviewer");
      setPermissions(["Attendance Review", "Academy"]);
    } else if (presetName === "Content & Media") {
      setTitle("Content & Media Lead");
      setPermissions(["Home", "Blog", "Announcements", "Testimonial Videos", "Gallery Archive"]);
    } else if (presetName === "Full Admin") {
      setTitle("Administrator");
      setPermissions(availableSections);
    }
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a role title.");
      return;
    }
    if (grantAdminAccess && permissions.length === 0) {
      setError("Please select at least one permission section.");
      return;
    }

    updateAccount(student.id, {
      pendingRoleOffer: {
        title: title.trim(),
        role: grantAdminAccess ? "admin" : "assistant",
        permissions,
        grantAdminAccess,
        offeredAt: Date.now(),
        offeredBy: adminUser?.name || "KR8 Administration",
      },
    });

    onAssigned();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-[#160d2b] p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-bold text-white text-base">Assign Role & Permissions</h3>
            <p className="text-xs text-[#cabfe0]">
              Assigning to: <strong className="text-white">{student.name}</strong> ({student.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleAssign} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">
              Custom Role Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Faculty Coach, Attendance Reviewer, Community Manager..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#e8ddf5] mb-1.5">Quick Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {["Coach", "Attendance Reviewer", "Content & Media", "Full Admin"].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#cabfe0] hover:bg-white/10 hover:text-white"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={grantAdminAccess}
                onChange={(e) => setGrantAdminAccess(e.target.checked)}
                className="rounded accent-pink-500"
              />
              <span className="text-xs font-semibold text-white">
                Grant Admin Dashboard Access
              </span>
            </label>
            <p className="mt-1 text-[11px] text-[#8a7ba8] pl-5">
              If enabled, the student can log into the Admin portal to manage their assigned sections.
            </p>
          </div>

          {grantAdminAccess && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#e8ddf5]">
                  Granular Permissions ({permissions.length} selected):
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[11px] text-pink-300 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[#8a7ba8]">·</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-[11px] text-[#8a7ba8] hover:text-white"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-white/10 bg-black/40">
                {availableSections.map((sec) => (
                  <label
                    key={sec}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(sec)}
                      onChange={() => toggleSection(sec)}
                      className="rounded accent-pink-500"
                    />
                    <span className={permissions.includes(sec) ? "text-white font-medium" : "text-[#8a7ba8]"}>
                      {sec}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

          <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3 text-[11px] text-amber-200/90 leading-relaxed">
            ℹ <strong>Activation Process:</strong> When assigned, a promotion offer will immediately appear on <strong>{student.name}</strong>'s profile. They must set their role security password immediately upon viewing; if dismissed without setting up a password, the offer expires automatically.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Assign Role Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Phase 8: Suspend Student Modal (Requires Reason) ---------------- */

function SuspendStudentModal({
  student,
  onClose,
  onSuspended,
}: {
  student: Account;
  onClose: () => void;
  onSuspended: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("A stated reason is strictly required to suspend/delete an account.");
      return;
    }
    const ok = suspendStudentAccount(student.id, reason.trim());
    if (!ok) {
      setError("Cannot suspend this account (executive accounts cannot be suspended).");
      return;
    }
    onSuspended();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-red-500/40 bg-[#160d2b] p-6 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="text-xl">⚠️</span>
          <h3 className="font-bold text-white text-lg">Delete / Suspend Student Account</h3>
        </div>

        <p className="mt-3 text-xs text-[#cabfe0] leading-relaxed">
          You are about to delete and suspend the account of <strong className="text-white">{student.name}</strong> ({student.id}).
        </p>

        <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-200/90 leading-relaxed">
          🚫 <strong>Permanent Credential Block:</strong> This permanently blocks their email (<span className="text-white">{student.email}</span>), phone (<span className="text-white">{student.phone}</span>), and KR8 ID from ever registering again on KR8 Digitals — UNLESS they successfully appeal within 30 days.
        </div>

        <form onSubmit={handleConfirm} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-red-300 mb-1">
              Reason for Suspension (Required — visible to student) *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="e.g. Repeated violation of community guidelines, fake attendance submission, or commercial spam..."
              className="w-full rounded-xl border border-red-500/40 bg-black/50 p-3 text-xs text-white placeholder:text-gray-500 focus:border-red-400 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-lg"
            >
              Confirm Account Suspension
            </button>
          </div>
        </form>
      </div>
    </div>
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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i);
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
                {getSkills().map((s) => (
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

  const skill = getSkill(student.skill);
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
    const newPost: BlogPost = {
      id: `b-${Date.now()}`,
      title: title.trim(),
      category,
      author: author.trim() || "KR8 Team",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      excerpt: excerpt.trim(),
      content: excerpt.trim(),
      readTime: "4 min",
      img: "https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=900",
      source: "admin",
      pinned: false,
      isPublic: true,
      mediaType: "image",
      likes: 0,
      likedBy: [],
      comments: [],
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
    Object.fromEntries(getSkills().filter((s) => s.available).map((s) => [s.key, getSkillWhatsApp(s.key)]))
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
        {getSkills().filter((s) => s.available).map((s) => (
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

function AcademyManager({ onOpenVideos }: { onOpenVideos?: () => void }) {
  const [skillsList, setSkillsList] = useState<Skill[]>(() => getSkills());
  const [waitlistUrl, setWaitlistUrl] = useState(() => getWaitlistWhatsAppUrl());
  const [waitlistSaved, setWaitlistSaved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [globalNotice, setGlobalNotice] = useState<string | null>(null);

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillKey, setNewSkillKey] = useState("");
  const [newSkillCode, setNewSkillCode] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [newSkillIcon, setNewSkillIcon] = useState("spark");
  const [newSkillWhatsapp, setNewSkillWhatsapp] = useState("");
  const [newSkillInstructorName, setNewSkillInstructorName] = useState("");
  const [newSkillInstructorBio, setNewSkillInstructorBio] = useState("");
  const [newSkillCriteria, setNewSkillCriteria] = useState("");
  const [newSkillVisible, setNewSkillVisible] = useState(true);
  const [newSkillRegOpen, setNewSkillRegOpen] = useState(true);

  const refresh = () => {
    setSkillsList(getSkills());
    setWaitlistUrl(getWaitlistWhatsAppUrl());
  };

  useEffect(() => {
    window.addEventListener("kr8:skills-updated", refresh);
    window.addEventListener("kr8:waitlist-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:skills-updated", refresh);
      window.removeEventListener("kr8:waitlist-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleSaveWaitlist = () => {
    if (!waitlistUrl.trim()) return;
    saveWaitlistWhatsAppUrl(waitlistUrl.trim());
    setWaitlistSaved(true);
    setTimeout(() => setWaitlistSaved(false), 2000);
  };

  const handleCloseAllRegistrations = () => {
    if (!window.confirm("Are you sure you want to close registrations for ALL skills? Visitors navigating to register will be redirected to the waitlist.")) return;
    skillsList.forEach((s) => {
      saveSkillSetting(s.key, { regOpen: false });
    });
    refresh();
    setGlobalNotice("All skill registrations have been closed. Visitors are now redirected to the waitlist.");
    setTimeout(() => setGlobalNotice(null), 3500);
  };

  const handleOpenAllRegistrations = () => {
    if (!window.confirm("Are you sure you want to open registrations for all visible skills?")) return;
    skillsList.filter((s) => s.available).forEach((s) => {
      saveSkillSetting(s.key, { regOpen: true });
    });
    refresh();
    setGlobalNotice("All available skill registrations are now OPEN.");
    setTimeout(() => setGlobalNotice(null), 3500);
  };

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      alert("Skill name is required.");
      return;
    }

    const rawKey = newSkillKey.trim() || newSkillName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const rawCode = (newSkillCode.trim() || newSkillName.replace(/[^A-Z0-9]/gi, "").slice(0, 3)).toUpperCase();
    const suffix = rawCode.endsWith("VFD") ? rawCode : `${rawCode}VFD`;

    const newSkillObj: Skill = {
      key: rawKey,
      name: newSkillName.trim(),
      suffix,
      whatsapp: newSkillWhatsapp.trim() || "https://chat.whatsapp.com/G5mSP8JeelfELvnljpgSJ8",
      available: newSkillVisible,
      regOpen: newSkillRegOpen,
      snippet: newSkillDesc.trim() || `An intensive 8-week professional ${newSkillName} track with live mentorship and real deliverables.`,
      icon: newSkillIcon,
      instructor: newSkillInstructorName.trim()
        ? { name: newSkillInstructorName.trim(), photo: "", bio: newSkillInstructorBio.trim() }
        : null,
      criteria: newSkillCriteria.trim() || "≥80% live session attendance · all core projects submitted · passing review sessions · Mindset Shift & Monthly Hangout attendance.",
      curriculum: [
        { week: "Week 1", title: `${newSkillName} Fundamentals`, points: ["Core principles & terminology", "Tools & environment setup", "Industry workflow overview"] },
        { week: "Week 2", title: "Core Techniques & Foundations", points: ["Fundamental skills practice", "Working with standard briefs", "Weekly assignment review"] },
        { week: "Week 3", title: "Intermediate Execution", points: ["Deep-dive into tools", "Efficiency & speed techniques", "Peer review & feedback"] },
        { week: "Week 4", title: "Client Brief Simulation", points: ["Working on real-world scenarios", "Solving common client challenges", "Mid-cohort milestone project"] },
        { week: "Week 5", title: "Advanced Mastery & AI Collaboration", points: ["Advanced workflows", "Ethical AI tooling integration", "Quality refinement"] },
        { week: "Week 6", title: "Professional Standards & Optimization", points: ["Polishing outputs for production", "Performance benchmarking", "Deliverable packaging"] },
        { week: "Week 7", title: "Portfolio Development & Positioning", points: ["Selecting your best work", "Case study documentation", "Client communication & pricing"] },
        { week: "Week 8", title: "Capstone Project & Graduation", points: ["Project 1 — Collaborative production deliverable.", "Project 2 — Individual professional portfolio showcase.", "Certificate verification and graduation showcase."] },
      ],
    };

    saveCustomSkill(newSkillObj);
    refresh();
    setShowAddModal(false);

    // Reset form
    setNewSkillName("");
    setNewSkillKey("");
    setNewSkillCode("");
    setNewSkillDesc("");
    setNewSkillWhatsapp("");
    setNewSkillInstructorName("");
    setNewSkillInstructorBio("");
    setNewSkillCriteria("");
    setGlobalNotice(`Skill "${newSkillObj.name}" added successfully with ID suffix ${suffix}!`);
    setTimeout(() => setGlobalNotice(null), 3500);
  };

  const allClosed = areAllRegistrationsClosed();
  const openCount = skillsList.filter((s) => s.available && getSkillRegistration(s.key)).length;
  const visibleCount = skillsList.filter((s) => s.available).length;

  return (
    <div className="space-y-6">
      {/* GLOBAL NOTICE */}
      {globalNotice && (
        <div className="rounded-2xl border border-pink-500/40 bg-pink-500/10 p-4 text-sm font-semibold text-pink-300">
          {globalNotice}
        </div>
      )}

      {/* TOP HEADER & CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-5">
        <div>
          <h4 className="font-bold text-white text-base">Academy Tracks & Admissions Control</h4>
          <p className="text-xs text-[#b8aecf] mt-0.5">
            Manage visible skills, open/close registrations, customize ID suffixes, and update the global waitlist.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-lg glow-pink-sm active:scale-95 transition-all"
          >
            <span>+ Add New Skill Track</span>
          </button>
          {onOpenVideos && (
            <button
              onClick={onOpenVideos}
              className="flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-500/10 px-3.5 py-2 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all"
            >
              <Icon name="video" size={14} />
              <span>Video Reels</span>
            </button>
          )}
        </div>
      </div>

      {/* GLOBAL WAITLIST & REGISTRATION CARD */}
      <Card className="border-pink-500/20 bg-gradient-to-r from-purple-950/20 via-[#140624] to-pink-950/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className={`h-3 w-3 rounded-full ${allClosed ? "bg-red-500 animate-pulse" : "bg-green-400"}`} />
            <h5 className="font-bold text-white text-sm">
              {allClosed
                ? "🔴 ALL REGISTRATIONS CLOSED — Visitors Redirected to Waitlist"
                : `🟢 ADMISSIONS ACTIVE: ${openCount} of ${visibleCount} visible skills currently open`}
            </h5>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCloseAllRegistrations}
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              Close All Registrations
            </button>
            <button
              onClick={handleOpenAllRegistrations}
              className="rounded-xl border border-green-500/40 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/20 active:scale-95 transition-all"
            >
              Open All Available
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#cabfe0] mb-1.5">
            VIP WhatsApp Waitlist Group URL (Used when all tracks or a track is closed)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={waitlistUrl}
              onChange={(e) => setWaitlistUrl(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none"
            />
            <button
              onClick={handleSaveWaitlist}
              className="rounded-xl bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shrink-0 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Save Waitlist URL
            </button>
            <a
              href={waitlistUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 px-3 py-2.5 text-xs font-semibold text-[#b8aecf] hover:text-white shrink-0"
            >
              <Icon name="spark" size={12} /> Test Link
            </a>
          </div>
          {waitlistSaved && <p className="mt-2 text-xs text-green-300 font-semibold">✓ Waitlist WhatsApp link saved successfully!</p>}
        </div>
      </Card>

      {/* SKILL TRACKS LIST */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-[#8a7ba8]">
          Configured Skills ({skillsList.length})
        </h5>
        {skillsList.map((s) => (
          <AcademySkillManager
            key={s.key}
            skill={s}
            onUpdate={refresh}
            onDelete={() => {
              if (window.confirm(`Delete custom skill "${s.name}"? Existing students will keep their record.`)) {
                deleteCustomSkill(s.key);
                refresh();
              }
            }}
          />
        ))}
      </div>

      {/* ADD NEW SKILL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#12001f] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Add New Skill Track</h3>
                <p className="text-xs text-[#b8aecf]">
                  This new skill will follow the standard KR8 ID format and be immediately recognized across registration, academy, verification, and leaderboard.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-2 text-[#8a7ba8] hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSkill} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Skill Track Name *
                  </label>
                  <input
                    required
                    value={newSkillName}
                    onChange={(e) => {
                      setNewSkillName(e.target.value);
                      if (!newSkillKey) {
                        setNewSkillKey(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
                      }
                      if (!newSkillCode) {
                        setNewSkillCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase());
                      }
                    }}
                    placeholder="e.g. Product Management"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    System Key / Slug *
                  </label>
                  <input
                    required
                    value={newSkillKey}
                    onChange={(e) => setNewSkillKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="e.g. product_management"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    ID Suffix Code * (e.g. PM {"->"} PMVFD)
                  </label>
                  <input
                    required
                    value={newSkillCode}
                    onChange={(e) => setNewSkillCode(e.target.value.toUpperCase())}
                    placeholder="e.g. PM or PMVFD"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-[#8a7ba8]">
                    Student IDs will be generated as: <code className="text-pink-300">KR826JD0001{(newSkillCode || "PM").endsWith("VFD") ? newSkillCode : `${newSkillCode || "PM"}VFD`}</code>
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Track Icon
                  </label>
                  <select
                    value={newSkillIcon}
                    onChange={(e) => setNewSkillIcon(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                  >
                    <option value="spark">Spark / Innovation</option>
                    <option value="code">Code / Development</option>
                    <option value="palette">Palette / Design</option>
                    <option value="video">Video / Production</option>
                    <option value="mobile">Mobile / Social</option>
                    <option value="chart">Chart / Growth</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                  Track Description & Snippet
                </label>
                <textarea
                  rows={2}
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  placeholder="Overview of the 8-week curriculum and learning outcomes…"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                  WhatsApp Class Group URL
                </label>
                <input
                  value={newSkillWhatsapp}
                  onChange={(e) => setNewSkillWhatsapp(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Instructor Name (Optional)
                  </label>
                  <input
                    value={newSkillInstructorName}
                    onChange={(e) => setNewSkillInstructorName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Instructor Bio (Optional)
                  </label>
                  <input
                    value={newSkillInstructorBio}
                    onChange={(e) => setNewSkillInstructorBio(e.target.value)}
                    placeholder="e.g. Senior Practitioner at KR8 Studio"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                  Certification Criteria (Optional)
                </label>
                <input
                  value={newSkillCriteria}
                  onChange={(e) => setNewSkillCriteria(e.target.value)}
                  placeholder="≥80% attendance, coursework completion, final project submission…"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-400/60 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#cabfe0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSkillVisible}
                    onChange={(e) => setNewSkillVisible(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                  <span>Make Visible to Visitors</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#cabfe0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSkillRegOpen}
                    onChange={(e) => setNewSkillRegOpen(e.target.checked)}
                    className="accent-pink-500 h-4 w-4"
                  />
                  <span>Open for Registration</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg glow-pink-sm active:scale-95 transition-all"
                >
                  Save & Publish Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AcademySkillManager({
  skill,
  onUpdate,
  onDelete,
}: {
  skill: Skill;
  onUpdate: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(skill.regOpen);
  const [visible, setVisible] = useState(skill.available);
  const [whatsapp, setWhatsapp] = useState(skill.whatsapp || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOpen(skill.regOpen);
    setVisible(skill.available);
    setWhatsapp(skill.whatsapp || "");
  }, [skill]);

  const save = () => {
    saveSkillSetting(skill.key, { regOpen: open, available: visible, whatsapp: whatsapp.trim() });
    setSaved(true);
    onUpdate();
    setTimeout(() => setSaved(false), 1600);
  };

  const studentCount = getStudents().filter(
    (x) => x.skill === skill.key || (x.skills && x.skills.includes(skill.key))
  ).length;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">{skill.name}</h3>
            <span className="rounded-full bg-pink-500/10 px-2 py-0.5 font-mono text-[10px] text-pink-400">
              {skill.suffix}
            </span>
            {!visible && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                Hidden from Visitors
              </span>
            )}
            {!open && (
              <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[9px] font-bold text-red-300">
                Registration Closed
              </span>
            )}
          </div>
          <p className="text-xs text-[#8a7ba8] mt-1">
            {studentCount} enrolled student{studentCount === 1 ? "" : "s"} · Key: <code className="text-pink-300">{skill.key}</code> · Instructor: {skill.instructor?.name ?? "KR8 Master Practitioner"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* VISIBILITY TOGGLE */}
          <label className="flex items-center gap-1.5 text-xs text-[#cabfe0] cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="accent-pink-500"
            />
            <span>Visible to Visitors</span>
          </label>

          {/* REGISTRATION TOGGLE */}
          <label className="flex items-center gap-1.5 text-xs text-[#cabfe0] cursor-pointer">
            <input
              type="checkbox"
              checked={open}
              onChange={(e) => setOpen(e.target.checked)}
              className="accent-pink-500"
            />
            <span>Registration {open ? "Open" : "Closed"}</span>
          </label>

          <button
            onClick={save}
            className="rounded-full bg-gradient-pink px-4 py-1.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
          >
            Save Settings
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              title="Delete custom track"
              className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-300 hover:bg-red-500/25 transition-all"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none"
          placeholder="Skill WhatsApp group link"
        />
        <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#8a7ba8] self-center">
          Curriculum: {skill.curriculum?.length ? `${skill.curriculum.length} weeks` : "8 weeks"}
        </span>
      </div>

      {saved && (
        <p className="mt-2 text-xs text-green-300 font-semibold">
          ✓ Track settings saved and updated across the site.
        </p>
      )}
    </Card>
  );
}

/* ---------------- Client Requests Manager (Agency Inquiries & Coaching) ---------------- */

function ClientRequestsManager() {
  const [requests, setRequests] = useState<ClientRequest[]>(() => getClientRequests());
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setRequests(getClientRequests());
    window.addEventListener("kr8:client-requests-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:client-requests-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const filtered = requests.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchEmail = r.email.toLowerCase().includes(q);
      const matchPhone = r.phone.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchTitle) return false;
    }
    return true;
  });

  const countNew = requests.filter((r) => r.status === "new").length;
  const countContacted = requests.filter((r) => r.status === "contacted").length;
  const countClosed = requests.filter((r) => r.status === "closed").length;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "brand_audit":
        return <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 text-[10px] font-bold text-pink-300">✦ Free Brand Audit</span>;
      case "structured":
        return <span className="rounded-full bg-blue-500/20 border border-blue-500/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-300">💼 Project Brief</span>;
      case "custom_quote":
        return <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">💬 Custom Quote</span>;
      case "coaching":
        return <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">🎯 Coaching Request</span>;
      case "partnership":
        return <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">🤝 Partnership</span>;
      default:
        return <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white">{type}</span>;
    }
  };

  const getStatusBadge = (status: "new" | "contacted" | "closed") => {
    switch (status) {
      case "new":
        return <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-[10px] font-bold text-yellow-300">New</span>;
      case "contacted":
        return <span className="rounded-full bg-sky-500/20 border border-sky-500/40 px-2 py-0.5 text-[10px] font-bold text-sky-300">Contacted</span>;
      case "closed":
        return <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Closed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wider text-[#a594c7]">Total Inquiries</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{requests.length}</p>
        </Card>
        <Card className="p-4 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-yellow-300 font-bold">New & Actionable</p>
            {countNew > 0 && <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />}
          </div>
          <p className="font-display text-2xl font-bold text-yellow-200 mt-1">{countNew}</p>
        </Card>
        <Card className="p-4 border-sky-500/30">
          <p className="text-xs uppercase tracking-wider text-sky-300">Contacted / Active</p>
          <p className="font-display text-2xl font-bold text-sky-200 mt-1">{countContacted}</p>
        </Card>
        <Card className="p-4 border-emerald-500/30">
          <p className="text-xs uppercase tracking-wider text-emerald-300">Closed / Completed</p>
          <p className="font-display text-2xl font-bold text-emerald-200 mt-1">{countClosed}</p>
        </Card>
      </div>

      {/* Main Inbox Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <span>Client Requests & Inbound Inquiries</span>
              {countNew > 0 && (
                <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  {countNew} new
                </span>
              )}
            </h3>
            <p className="text-xs text-[#b8aecf] mt-1">
              All inbound submissions from the Agency page, 1-on-1 Coaching bookings, and Partnership proposals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none w-44"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Types" },
              { id: "brand_audit", label: "Brand Audits" },
              { id: "structured", label: "Structured Projects" },
              { id: "custom_quote", label: "Custom Quotes" },
              { id: "coaching", label: "1-on-1 Coaching" },
              { id: "partnership", label: "Partnerships" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`rounded-full px-3 py-1 font-semibold transition-all ${
                  filterType === f.id
                    ? "bg-gradient-pink text-white shadow-md"
                    : "border border-white/10 bg-white/5 text-[#b8aecf] hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#8a7ba8]">Status:</span>
            {(["all", "new", "contacted", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition-all ${
                  filterStatus === s
                    ? "bg-white/20 text-white"
                    : "text-[#8a7ba8] hover:text-[#cabfe0]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Request List */}
        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-black/20 p-8 text-center text-xs text-[#8a7ba8]">
              No client requests found matching the current filters. When a visitor submits an Agency project, Free Brand Audit, or 1-on-1 Coaching request, it will appear here instantly.
            </div>
          ) : (
            filtered.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-pink-500/30 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getTypeBadge(req.type)}
                    <h4 className="font-bold text-white text-sm">{req.name}</h4>
                    <span className="text-xs text-[#8a7ba8]">·</span>
                    <span className="text-[11px] text-[#8a7ba8]">
                      {new Date(req.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(req.status)}
                    <select
                      value={req.status}
                      onChange={(e) => updateClientRequestStatus(req.id, e.target.value as any)}
                      className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-[11px] font-semibold text-white focus:outline-none cursor-pointer"
                    >
                      <option value="new">Mark New</option>
                      <option value="contacted">Mark Contacted</option>
                      <option value="closed">Mark Closed</option>
                    </select>
                    <button
                      onClick={() => {
                        if (confirm(`Delete request from ${req.name}?`)) {
                          deleteClientRequest(req.id);
                        }
                      }}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/20 transition-all"
                      title="Delete request"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Contact links & summary */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="space-y-1">
                    {req.email && (
                      <p className="flex items-center gap-2 text-[#cabfe0]">
                        <span className="text-pink-400">✉️</span>
                        <a href={`mailto:${req.email}`} className="text-white hover:underline">
                          {req.email}
                        </a>
                      </p>
                    )}
                    {req.phone && (
                      <p className="flex items-center gap-2 text-[#cabfe0]">
                        <span className="text-pink-400">📞</span>
                        <a href={`tel:${req.phone}`} className="text-white hover:underline">
                          {req.phone}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 text-left sm:text-right">
                    <p className="text-xs font-semibold text-pink-300">{req.title}</p>
                  </div>
                </div>

                {/* Details Breakdown */}
                {req.details && Object.keys(req.details).length > 0 && (
                  <div className="rounded-xl border border-white/5 bg-black/30 p-3 text-xs space-y-1.5">
                    {Object.entries(req.details).map(([k, v]) => (
                      <div key={k} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                        <span className="font-semibold text-[#8a7ba8] capitalize">
                          {k.replace(/([A-Z])/g, " $1")}:
                        </span>
                        <span className="text-white font-medium break-all max-w-lg text-left sm:text-right">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
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
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const newA: Announcement = {
      id: "a-" + Date.now(),
      title: title.trim(),
      body: body.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      author: "Admin Desk",
      type: "text",
    };
    const updated = [newA, ...items];
    saveAnnouncements(updated);
    setItems(updated);
    setTitle("");
    setBody("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((a) => a.id !== id);
    saveAnnouncements(updated);
    setItems(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleArchive = (id: string) => {
    archiveAnnouncementToGallery(id);
    const updated = items.filter((a) => a.id !== id);
    saveAnnouncements(updated);
    setItems(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-bold text-white text-lg">Post New Announcement</h3>
        {saved && <p className="mt-2 text-xs text-pink-300 font-semibold">Announcements updated successfully!</p>}
        <form onSubmit={handleAdd} className="mt-4 space-y-3">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement Title"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
          />
          <textarea
            required
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Announcement details..."
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            Publish Announcement
          </button>
        </form>
      </Card>

      <Card>
        <h3 className="font-bold text-white text-lg">Active Announcements ({items.length})</h3>
        <p className="mt-1 text-sm text-[#b8aecf]">
          Live announcements displayed on the site. Instead of deleting past milestones, click "Archive to Gallery" to permanently preserve them with their dates.
        </p>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div>
                <p className="text-xs text-pink-400 font-semibold">{item.date} · {item.author}</p>
                <h4 className="text-base font-bold text-white mt-1">{item.title}</h4>
                <p className="text-xs text-[#cabfe0] mt-1">{item.body || item.caption}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleArchive(item.id)}
                  className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all flex items-center gap-1"
                  title="Preserve in Gallery rather than deleting"
                >
                  <span>📦</span>
                  <span>Archive to Gallery</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Gallery Archive & Approval Manager ---------------- */

function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>(() => getGalleryItems());
  const [activeSubTab, setActiveSubTab] = useState<"pending" | "approved" | "new">("pending");
  const [msg, setMsg] = useState("");

  // New item form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<GalleryItem["category"]>("Flyers & Posters");
  const [newMediaType, setNewMediaType] = useState<"image" | "video">("image");
  const [newUrl, setNewUrl] = useState("");
  const [newDate, setNewDate] = useState(
    new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
  );
  const [newAuthor, setNewAuthor] = useState("KR8 Admin Studio");
  const [newLink, setNewLink] = useState("");

  const pendingItems = items.filter((i) => i.status === "pending");
  const approvedItems = items.filter((i) => i.status === "approved");

  const reload = () => {
    setItems(getGalleryItems());
  };

  const handleApprove = (id: string) => {
    approveGalleryItem(id);
    reload();
    setMsg("Media piece approved and published to public Gallery!");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleReject = (id: string) => {
    rejectGalleryItem(id);
    reload();
    setMsg("Media piece removed from queue.");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDirectAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    addGalleryItem({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      mediaType: newMediaType,
      url: newUrl.trim(),
      date: newDate.trim(),
      author: newAuthor.trim(),
      link: newLink.trim() || undefined,
      status: "approved",
      featured: true,
    });

    reload();
    setNewTitle("");
    setNewDesc("");
    setNewUrl("");
    setNewLink("");
    setMsg("Direct item added to Gallery archive successfully!");
    setActiveSubTab("approved");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-white text-xl">Living Gallery & Media Archive</h3>
            <p className="text-xs text-[#a594c7] mt-1">
              Archived campaigns, client work, student milestones, and viewer suggestions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveSubTab("pending")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all relative ${
                activeSubTab === "pending"
                  ? "bg-gradient-pink text-white shadow"
                  : "border border-white/15 bg-white/5 text-[#cabfe0] hover:text-white"
              }`}
            >
              Pending Approvals
              {pendingItems.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] text-white font-bold">
                  {pendingItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab("approved")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeSubTab === "approved"
                  ? "bg-gradient-pink text-white shadow"
                  : "border border-white/15 bg-white/5 text-[#cabfe0] hover:text-white"
              }`}
            >
              Public Archive ({approvedItems.length})
            </button>
            <button
              onClick={() => setActiveSubTab("new")}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeSubTab === "new"
                  ? "bg-gradient-pink text-white shadow"
                  : "border border-white/15 bg-white/5 text-[#cabfe0] hover:text-white"
              }`}
            >
              + Direct Upload
            </button>
          </div>
        </div>

        {msg && <p className="mt-3 text-xs text-emerald-400 font-bold">{msg}</p>}

        {/* SUBTAB 1: PENDING APPROVALS */}
        {activeSubTab === "pending" && (
          <div className="mt-6 space-y-4">
            <h4 className="font-bold text-white text-sm">
              Viewer Suggestions Awaiting Review ({pendingItems.length})
            </h4>

            {pendingItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                <span className="text-3xl">✨</span>
                <p className="text-sm font-semibold text-white mt-2">No pending suggestions</p>
                <p className="text-xs text-[#8a7ba8] mt-1">
                  When visitors or students suggest media via the Gallery page, they appear here for your approval.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-yellow-500/30 bg-yellow-500/[0.03] p-4 text-xs"
                  >
                    <div>
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/60 mb-3 border border-white/10">
                        {item.mediaType === "video" ? (
                          <video src={item.url} controls className="h-full w-full object-cover" />
                        ) : (
                          <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                        {item.category}
                      </span>
                      <h5 className="font-bold text-white text-sm mt-1">{item.title}</h5>
                      <p className="text-[#b8aecf] mt-1">{item.description}</p>
                      <p className="text-[#8a7ba8] text-[10px] mt-2">
                        Submitted by: <strong className="text-white">{item.author}</strong> ({item.date})
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 rounded-xl bg-gradient-pink py-2 text-xs font-bold text-white shadow hover:brightness-110 active:scale-95 transition-all"
                      >
                        Approve & Publish ✅
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all"
                      >
                        Reject ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: APPROVED PUBLIC ARCHIVE */}
        {activeSubTab === "approved" && (
          <div className="mt-6 space-y-3">
            <h4 className="font-bold text-white text-sm">
              Live in Public Gallery ({approvedItems.length})
            </h4>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {approvedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/30 p-3 text-xs"
                >
                  <div>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/60 mb-2 border border-white/10">
                      {item.mediaType === "video" ? (
                        <video src={item.url} controls className="h-full w-full object-cover" />
                      ) : (
                        <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-pink-300 font-semibold">
                      <span>{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                    <h5 className="font-bold text-white text-xs mt-1 truncate">{item.title}</h5>
                    <p className="text-[#8a7ba8] text-[11px] truncate">By {item.author}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px]">
                    <a
                      href="/gallery"
                      target="_blank"
                      className="text-pink-400 font-bold hover:underline"
                    >
                      View on site ↗
                    </a>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: DIRECT UPLOAD */}
        {activeSubTab === "new" && (
          <form onSubmit={handleDirectAdd} className="mt-6 space-y-4 max-w-xl">
            <h4 className="font-bold text-white text-sm">Direct Archival Upload</h4>
            <p className="text-xs text-[#a594c7]">
              Directly upload flyers, banners, brand guides, or project showreels to the public Gallery archive.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Title *</label>
              <input
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. AfriSTEM Robotics Portal Launch Flyer"
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as GalleryItem["category"])}
                  className="w-full rounded-xl border border-white/15 bg-[#140824] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                >
                  <option>Flyers & Posters</option>
                  <option>Brand Identity</option>
                  <option>Student Showcases</option>
                  <option>Video Clips</option>
                  <option>Event Moments</option>
                  <option>Community Archives</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Media Type</label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as "image" | "video")}
                  className="w-full rounded-xl border border-white/15 bg-[#140824] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                >
                  <option value="image">Image / Graphic</option>
                  <option value="video">Video Clip</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                Media URL or Local Asset Path *
              </label>
              <input
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="e.g. /portfolio/afristem_hero.jpg or https://..."
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Description</label>
              <textarea
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Context, design rationale, or event story..."
                className="w-full rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Date</label>
                <input
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="Sep 2026"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Author / Studio</label>
                <input
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="KR8 Studio Team"
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cabfe0] mb-1">Project Link (Opt)</label>
                <input
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Add to Gallery Archive
            </button>
          </form>
        )}
      </Card>
    </div>
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

function timeAgo(timestamp: number): string {
  const elapsed = Math.floor((Date.now() - timestamp) / 1000);
  if (elapsed < 60) return "just now";
  const minutes = Math.floor(elapsed / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function TestimonialVideosManager() {
  const [items, setItems] = useState<Testimonial[]>(getTestimonials());
  const [comments, setComments] = useState<VideoComment[]>(getVideoComments());
  const [name, setName] = useState("");
  const [kr8Id, setKr8Id] = useState("");
  const [skill, setSkill] = useState("Graphic Design");
  const [schoolOrRole, setSchoolOrRole] = useState("");
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [captionsInput, setCaptionsInput] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [previewingVideo, setPreviewingVideo] = useState<Testimonial | null>(null);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [uploading, setUploading] = useState(false);

  const matchedStudent = kr8Id
    ? getStudents().find((s) => s.id.toLowerCase() === kr8Id.trim().toLowerCase())
    : null;

  const handleVideoFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setVideoUrl(reader.result as string);
      setUploading(false);
      setStatusMsg(`Video "${file.name}" loaded ready for upload!`);
    };
    reader.onerror = () => {
      setUploading(false);
      setStatusMsg("Failed to read video file");
    };
    reader.readAsDataURL(file);
  };

  const handlePosterFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPosterUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !caption.trim()) {
      setStatusMsg("Student name and caption quote are required.");
      return;
    }

    const effectiveVideo = videoUrl.trim() || "/videos/testimonial_bio_nicz.mp4";
    const effectivePoster = posterUrl.trim() || "/videos/testimonial1_poster.jpg";

    let parsedCaptions = undefined;
    if (captionsInput.trim()) {
      const lines = captionsInput.split("\n").filter((l) => l.trim().length > 0);
      parsedCaptions = lines.map((line, idx) => ({
        start: idx * 5,
        end: (idx + 1) * 5,
        text: line.trim(),
      }));
    }

    const created = addTestimonial({
      name: name.trim(),
      kr8Id: kr8Id.trim() || undefined,
      skill: skill.trim(),
      schoolOrRole: schoolOrRole.trim() || undefined,
      caption: caption.trim(),
      video: effectiveVideo,
      img: effectivePoster,
      duration: 60,
      captions: parsedCaptions,
    });

    const refreshed = getTestimonials();
    setItems(refreshed);
    setName("");
    setKr8Id("");
    setSchoolOrRole("");
    setCaption("");
    setVideoUrl("");
    setPosterUrl("");
    setCaptionsInput("");
    setStatusMsg(`Published "${created.name}"! This video is now the latest upload and will lead playback.`);
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.name.trim() || !editingItem.caption.trim()) {
      setStatusMsg("Student name and caption quote are required.");
      return;
    }
    updateTestimonial(editingItem);
    setItems(getTestimonials());
    setStatusMsg(`Testimonial for "${editingItem.name}" updated successfully!`);
    setEditingItem(null);
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove the testimonial for "${title}"?`)) return;
    deleteTestimonial(id);
    setItems(getTestimonials());
    setStatusMsg(`Removed "${title}" from testimonials.`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    deleteVideoComment(commentId);
    setComments(getVideoComments());
    setStatusMsg("Comment deleted.");
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-xs text-[#8a7ba8] uppercase tracking-wider font-semibold">Total Video Stories</p>
          <p className="mt-1 text-2xl font-bold text-white">{items.length}</p>
          <p className="text-xs text-pink-400 mt-1">Continuous Loop Active</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[#8a7ba8] uppercase tracking-wider font-semibold">Community Comments</p>
          <p className="mt-1 text-2xl font-bold text-white">{comments.length}</p>
          <p className="text-xs text-[#b8aecf] mt-1">Across all videos</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-[#8a7ba8] uppercase tracking-wider font-semibold">Playback Sequence</p>
          <p className="mt-1 text-sm font-bold text-pink-300">Latest Leads, Rest Shuffled</p>
          <p className="text-xs text-[#8a7ba8] mt-1">Auto-advances on video end</p>
        </Card>
      </div>

      {statusMsg && (
        <div className="rounded-2xl border border-pink-500/40 bg-pink-500/10 p-4 text-xs font-semibold text-pink-300 animate-fade-in flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg(null)} className="text-white hover:text-pink-300">✕</button>
        </div>
      )}

      {/* UPLOAD / ADD NEW TESTIMONIAL VIDEO FORM */}
      <Card>
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Icon name="video" size={20} className="text-pink-400" />
          <h3 className="font-bold text-white text-lg">Upload New Student Testimonial Video</h3>
        </div>
        <p className="mt-2 text-xs text-[#b8aecf]">
          Newly uploaded videos automatically lead playback as the premier video on both Home and Academy pages, followed by the rest in continuous shuffle.
        </p>

        <form onSubmit={handleCreateTestimonial} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ebuka Emmanuel"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Skill Learned *</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              >
                <option value="Graphic Design">Graphic Design</option>
                <option value="Web Development">Web Development</option>
                <option value="Video Editing">Video Editing</option>
                <option value="Content Creation">Content Creation</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Tech & Design">Tech & Design</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">University / Role (Optional)</label>
              <input
                type="text"
                value={schoolOrRole}
                onChange={(e) => setSchoolOrRole(e.target.value)}
                placeholder="e.g. Federal University Dutse or Cohort Graduate"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Attach Student KR8 ID (Optional — Auto-links profile)</label>
              <input
                type="text"
                value={kr8Id}
                onChange={(e) => setKr8Id(e.target.value.toUpperCase())}
                placeholder="e.g. KR82026KT0001GDVFD"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 font-mono text-xs text-white focus:border-pink-500 focus:outline-none"
              />
              {matchedStudent && (
                <p className="mt-1 text-[11px] text-emerald-400 font-semibold">
                  ✓ Matched: {matchedStudent.name} ({matchedStudent.skill})
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Video File / URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="/videos/testimonial_bio_nicz.mp4 or URL"
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
                <label className="cursor-pointer shrink-0 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition-all">
                  {uploading ? "Reading..." : "Browse File"}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Poster Thumbnail (Image File / URL)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="/videos/testimonial1_poster.jpg or URL"
                  className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
                <label className="cursor-pointer shrink-0 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition-all">
                  Browse Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Auto-Captions / Transcript (One line per cue)</label>
              <textarea
                rows={2}
                value={captionsInput}
                onChange={(e) => setCaptionsInput(e.target.value)}
                placeholder="Optional: Enter spoken sentences. Each line creates a subtitle segment."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Key Student Quote / Caption *</label>
            <textarea
              required
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. KR8 Digitals taught me graphic design for free. Now I handle client brand identities!"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition-all glow-pink-sm"
          >
            <Icon name="video" size={16} />
            <span>Publish Testimonial Video (Leads Playback)</span>
          </button>
        </form>
      </Card>

      {/* ACTIVE TESTIMONIALS LIST */}
      <Card>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-bold text-white text-lg">Published Video Stories ({items.length})</h3>
          <span className="text-xs text-[#8a7ba8]">First card plays first; remainder auto-shuffle</span>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition-all hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-12 shrink-0 rounded-xl overflow-hidden bg-black ring-1 ring-white/20">
                  <img src={item.img} alt={item.name} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white text-[10px]">▶</span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{item.name}</h4>
                    {item.kr8Id && (
                      <span className="font-mono rounded bg-pink-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-pink-300">
                        {item.kr8Id}
                      </span>
                    )}
                    {index === 0 && (
                      <span className="rounded-full bg-pink-500/30 border border-pink-400/40 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                        🔥 Leads Reel (Latest)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-pink-300">{item.skill} {item.schoolOrRole ? `· ${item.schoolOrRole}` : ""}</p>
                  <p className="text-xs text-[#cabfe0] line-clamp-1 mt-0.5 italic">"{item.caption}"</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setPreviewingVideo(item)}
                  className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 active:scale-95 transition-all"
                >
                  Preview
                </button>
                <button
                  onClick={() => setEditingItem({ ...item })}
                  className="rounded-xl border border-pink-500/40 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?video=${item.id}`;
                    navigator.clipboard?.writeText(url);
                    setStatusMsg(`Copied share link for ${item.name}!`);
                    setTimeout(() => setStatusMsg(null), 3000);
                  }}
                  className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 active:scale-95 transition-all"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* COMMENTS MODERATION PANEL */}
      <Card>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Icon name="message" size={18} className="text-pink-400" />
            <h3 className="font-bold text-white text-lg">Community Comments & Moderation ({comments.length})</h3>
          </div>
          <span className="text-xs text-[#8a7ba8]">Delete spam or inappropriate user comments</span>
        </div>

        <div className="mt-4 space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#8a7ba8]">No comments yet.</p>
          ) : (
            comments.map((c) => {
              const video = items.find((v) => v.id === c.videoId);
              return (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/5 bg-black/25 p-3.5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{c.authorName}</span>
                      {c.authorId && (
                        <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[10px] text-pink-300">
                          {c.authorId}
                        </span>
                      )}
                      <span className="text-[10px] text-[#7d6f96]">
                        on {video?.name || "Testimonial"} ({timeAgo(c.createdAt)})
                      </span>
                    </div>
                    <p className="text-xs text-[#d8cde8] mt-1">{c.comment}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* VIDEO EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-[#160d2b] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Icon name="video" size={18} className="text-pink-400" />
                <h4 className="font-bold text-white text-base">Edit Testimonial: {editingItem.name}</h4>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditedItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Skill / Track *</label>
                  <input
                    type="text"
                    value={editingItem.skill}
                    onChange={(e) => setEditingItem({ ...editingItem, skill: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">University / Role</label>
                  <input
                    type="text"
                    value={editingItem.schoolOrRole || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, schoolOrRole: e.target.value })}
                    placeholder="e.g. Federal University Dutse or Cohort Graduate"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Attached KR8 ID</label>
                  <input
                    type="text"
                    value={editingItem.kr8Id || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, kr8Id: e.target.value.toUpperCase() })}
                    placeholder="e.g. KR82026KT0001GDVFD"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Caption / Quote *</label>
                <textarea
                  value={editingItem.caption}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  rows={2}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Video Path / URL</label>
                  <input
                    type="text"
                    value={editingItem.video || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, video: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Poster Thumbnail Path / URL</label>
                  <input
                    type="text"
                    value={editingItem.img || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, img: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[#b8aecf] hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {previewingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-[#160d2b] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-bold text-white text-sm">{previewingVideo.name}</h4>
              <button
                onClick={() => setPreviewingVideo(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 aspect-[9/16] overflow-hidden rounded-2xl bg-black">
              <video
                src={previewingVideo.video}
                poster={previewingVideo.img}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeManager({ onOpenVideos }: { onOpenVideos?: () => void }) {
  const [settings, setSettings] = useState(getHomepageSettings());
  const [headline, setHeadline] = useState(settings.heroHeadline || "We Make It Happen.");
  const [projectsDone, setProjectsDone] = useState(settings.projectsDone || 120);
  const [narrativeLines, setNarrativeLines] = useState<string[]>(
    settings.narrativeLines && settings.narrativeLines.length ? settings.narrativeLines : DEFAULT_NARRATIVE_LINES
  );
  const [steps, setSteps] = useState<DoubtToBeliefStep[]>(
    settings.doubtToBelief && settings.doubtToBelief.length ? settings.doubtToBelief : DEFAULT_DOUBT_TO_BELIEF
  );
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSave = () => {
    const updated = {
      ...settings,
      heroHeadline: headline.trim() || "We Make It Happen.",
      projectsDone: Number(projectsDone) || 0,
      narrativeLines: narrativeLines.filter((l) => l.trim()),
      doubtToBelief: steps,
    };
    saveHomepageSettings(updated);
    setSettings(updated);
    setSavedMsg("Homepage hero and narrative settings saved successfully!");
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const handleAddNarrativeLine = () => {
    setNarrativeLines([...narrativeLines, "They doubted that our students could build real products."]);
  };

  const handleUpdateNarrativeLine = (idx: number, val: string) => {
    const next = [...narrativeLines];
    next[idx] = val;
    setNarrativeLines(next);
  };

  const handleDeleteNarrativeLine = (idx: number) => {
    setNarrativeLines(narrativeLines.filter((_, i) => i !== idx));
  };

  const handleAddStep = () => {
    const newStep: DoubtToBeliefStep = {
      id: `dtb-${Date.now()}`,
      doubt: "Is it really true that beginners can succeed?",
      belief: "Our structured mentors and peers guide you every day.",
    };
    setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (index: number, field: "doubt" | "belief", value: string) => {
    const next = [...steps];
    next[index] = { ...next[index], [field]: value };
    setSteps(next);
  };

  const handleDeleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleResetDefaults = () => {
    setNarrativeLines(DEFAULT_NARRATIVE_LINES);
    setSteps(DEFAULT_DOUBT_TO_BELIEF);
  };

  return (
    <div className="space-y-6">
      {savedMsg && (
        <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/80 p-4 text-xs font-bold text-emerald-200">
          ✓ {savedMsg}
        </div>
      )}

      <Card>
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-white text-lg">Hero Section & Narrative Sequence</h3>
            <p className="mt-1 text-xs text-[#b8aecf]">
              Configure hero headline, projects completed counter, and the animated "Doubt to Belief" story sequence.
            </p>
          </div>
          {onOpenVideos && (
            <button
              onClick={onOpenVideos}
              className="flex items-center gap-2 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              <Icon name="video" size={16} />
              <span>Manage Testimonial Videos →</span>
            </button>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Hero Main Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="We Make It Happen."
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Projects Done Counter</label>
              <input
                type="number"
                value={projectsDone}
                onChange={(e) => setProjectsDone(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Animated Skepticism Hook Lines */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-white text-sm">
                  Animated Skepticism Lines (Pre-Headline Narrative)
                </h4>
                <p className="text-[11px] text-[#8a7ba8]">
                  These lines drop in one at a time before "We Make It Happen.", capturing real skepticism before resolving into proof.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddNarrativeLine}
                className="rounded-xl bg-pink-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-500"
              >
                + Add Skepticism Line
              </button>
            </div>

            <div className="space-y-2">
              {narrativeLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="font-mono text-xs text-pink-300 w-14 shrink-0">Line #{idx + 1}:</span>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => handleUpdateNarrativeLine(idx, e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                  {narrativeLines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNarrativeLine(idx)}
                      className="text-xs text-red-400 hover:text-red-300 px-2"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Animated Doubt to Belief Narrative Sequence */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <span>Animated "Doubt to Belief" Narrative Sequence</span>
                  <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-mono text-pink-300">
                    {steps.length} Steps
                  </span>
                </h4>
                <p className="text-[11px] text-[#8a7ba8]">
                  These phrases animate sequentially in the hero section, showing how student doubts transform into confidence and real results.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs text-[#cabfe0] hover:text-white hover:bg-white/5"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="rounded-xl bg-pink-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-pink-500"
                >
                  + Add Narrative Step
                </button>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {steps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-pink-400">Step #{idx + 1} Narrative</span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStep(idx)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remove Step
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                        Student Doubt (Initial Question / Fear):
                      </label>
                      <input
                        type="text"
                        value={step.doubt}
                        onChange={(e) => handleUpdateStep(idx, "doubt", e.target.value)}
                        placeholder="e.g. Can you really master high-income skills completely free?"
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                        Transformative Belief (The KR8 Reality):
                      </label>
                      <input
                        type="text"
                        value={step.belief}
                        onChange={(e) => handleUpdateStep(idx, "belief", e.target.value)}
                        placeholder="e.g. Zero tuition, live masterclasses, and verified certificates. 100% free."
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="rounded-xl bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition-all glow-pink-sm"
            >
              Save Hero & Narrative Settings
            </button>
          </div>
        </div>
      </Card>
      <TestimonialVideosManager />
    </div>
  );
}

function LiveStreamsManager() {
  const {
    isLive,
    activeStream,
    openStage,
    endStream,
    recordings,
  } = useLiveStream();
  const accounts: Account[] = getAccounts();
  const [replays, setReplays] = useState<StreamReplay[]>(getStreamReplays());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Eligible Broadcasters list
  const eligibleUsers = accounts.filter((acc: Account) => canUserHostStream(acc));

  const handleDeleteReplay = (id: string, title: string) => {
    if (!confirm(`Delete replay "${title}" from the archives?`)) return;
    const next = replays.filter((r) => r.id !== id);
    setReplays(next);
    saveStreamReplays(next);
    setStatusMsg(`Deleted replay "${title}".`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDeleteRecording = (id: string, title: string) => {
    if (!confirm(`Delete cloud recording "${title}"?`)) return;
    deleteStreamRecording(id);
    setStatusMsg(`Deleted recording "${title}".`);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Active Broadcasts Control & Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Icon name="video" size={20} className="text-pink-400" />
              <h3 className="font-bold text-white text-lg">Active Live Broadcasts & WebRTC Stage</h3>
            </div>
            <p className="mt-1 text-xs text-[#b8aecf]">
              Monitor running broadcasts, viewer counts, real-time relay state, and enforce broadcast termination.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openStage()}
              className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {isLive ? "Open Live Stage →" : "Launch Studio (Go Live) →"}
            </button>
          </div>
        </div>

        {isLive && activeStream ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-[#cabfe0]">
              <thead className="border-b border-white/10 bg-white/5 uppercase tracking-wider text-[10px] text-pink-300">
                <tr>
                  <th className="py-2.5 px-3">Title & Host</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Visibility</th>
                  <th className="py-2.5 px-3">Started</th>
                  <th className="py-2.5 px-3">Viewers</th>
                  <th className="py-2.5 px-3">Broadcast Room</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white block">{activeStream.title}</span>
                    <span className="text-[11px] text-pink-400">Host: {activeStream.hostName}</span>
                  </td>
                  <td className="py-3 px-3">{activeStream.category}</td>
                  <td className="py-3 px-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      activeStream.visibility === "private"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}>
                      {activeStream.visibility === "private" ? "🔒 Private" : "Public"}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {new Date(activeStream.startedAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                    👥 {activeStream.viewers?.length || activeStream.viewerCount || 1}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-gray-400">
                    {activeStream.livekitRoomName || activeStream.id}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => openStage()}
                      className="rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20"
                    >
                      Stage
                    </button>
                    <button
                      onClick={endStream}
                      className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700"
                    >
                      Force End
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/5 bg-black/25 p-4 text-xs text-[#b8aecf]">
            Status: <span className="font-semibold text-white">Studio Idle</span>. No live streams currently running.
          </div>
        )}
      </Card>

      {/* Cloud Recordings Manager */}
      <Card>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-lg">KR8 Broadcast Recordings Library</h3>
            <p className="text-xs text-[#8a7ba8]">
              Manage cloud-recorded broadcast sessions, duration, storage footprint, and playback visibility.
            </p>
          </div>
          {statusMsg && <span className="text-xs text-pink-300 font-semibold">{statusMsg}</span>}
        </div>

        <div className="mt-4 space-y-3">
          {recordings.length === 0 ? (
            <p className="text-xs text-[#8a7ba8] py-4 text-center">No cloud recordings generated yet.</p>
          ) : (
            recordings.map((rec) => (
              <div
                key={rec.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-20 shrink-0 rounded-xl overflow-hidden bg-black ring-1 ring-white/15">
                    <img src={rec.thumbnail || "/founder_timfire_wide.jpg"} alt={rec.title} className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[9px] font-mono text-white">
                      {rec.durationMinutes}m
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                    <p className="text-xs text-pink-300">{rec.category} · Host: {rec.hostName}</p>
                    <p className="text-xs text-[#8a7ba8] mt-0.5">
                      {rec.recordedAt} · {rec.sizeMb ? `${rec.sizeMb} MB` : "48 MB"} · {rec.isPublic ? "🌐 Public" : "🔒 Private"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openStage(rec as any)}
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    Play
                  </button>
                  <a
                    href={rec.videoUrl}
                    download
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDeleteRecording(rec.id, rec.title)}
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Stream Eligibility Manager */}
      <Card>
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-bold text-white text-lg">Live Streaming Eligibility Directory ({eligibleUsers.length})</h3>
          <p className="text-xs text-[#8a7ba8]">
            Only Founders, Co-Founders, Admins with permissions, and Coaches can launch live streams. Unregistered visitors, students, and tribe members cannot stream.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {eligibleUsers.map((user: Account) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-pink flex items-center justify-center text-white font-bold text-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-white text-xs truncate">{user.name}</p>
                <p className="text-[11px] text-[#cabfe0] truncate">{user.email}</p>
                <span className="mt-1 inline-block rounded bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase text-pink-300">
                  {user.type === "founder" || user.type === "co-founder"
                    ? user.type
                    : user.admin
                    ? "Admin"
                    : "Coach"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recorded Replays Vault */}
      <Card>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold text-white text-lg">Stream Replay Vault & Archives ({replays.length})</h3>
            <p className="text-xs text-[#8a7ba8]">
              Past recorded streams saved to site data. Guests are prompted to create a free account to watch.
            </p>
          </div>
          {statusMsg && <span className="text-xs text-pink-300 font-semibold">{statusMsg}</span>}
        </div>

        <div className="mt-4 space-y-3">
          {replays.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition-all hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-20 shrink-0 rounded-xl overflow-hidden bg-black ring-1 ring-white/15">
                  <img src={r.thumbnail} alt={r.title} className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.2 text-[9px] font-mono text-white">
                    {r.durationMinutes}m
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{r.title}</h4>
                  <p className="text-xs text-pink-300">{r.category} · Host: {r.hostName}</p>
                  <p className="text-xs text-[#8a7ba8] mt-0.5">
                    {r.date} · 👥 {r.peakViewers} peak viewers · {r.messagesCount} chat messages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openStage(r)}
                  className="rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 active:scale-95 transition-all"
                >
                  Preview Replay
                </button>
                <button
                  onClick={() => handleDeleteReplay(r.id, r.title)}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
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

function SupabaseManager() {
  const [url, setUrl] = useState(() => localStorage.getItem("kr8_supabase_url") || "");
  const [anonKey, setAnonKey] = useState(() => localStorage.getItem("kr8_supabase_anon_key") || "");
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const isConnected = !!url.trim() && !!anonKey.trim();

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setStatus("error");
      setStatusMsg("Please provide both your Supabase Project URL and Anon Public Key.");
      return;
    }

    setStatus("testing");
    setStatusMsg("Validating connection to Supabase...");

    localStorage.setItem("kr8_supabase_url", url.trim());
    localStorage.setItem("kr8_supabase_anon_key", anonKey.trim());

    try {
      const res = await fetch(`${url.trim().replace(/\/$/, "")}/rest/v1/`, {
        headers: {
          apikey: anonKey.trim(),
          Authorization: `Bearer ${anonKey.trim()}`,
        },
      });

      if (res.ok || res.status === 200 || res.status === 404) {
        setStatus("success");
        setStatusMsg("Connected successfully to Supabase! All platform data and live streaming will sync to your database.");
        window.dispatchEvent(new Event("kr8:supabase-configured"));
      } else {
        setStatus("error");
        setStatusMsg(`Supabase rejected request (HTTP ${res.status}). Please check your API key.`);
      }
    } catch (err: any) {
      setStatus("error");
      setStatusMsg(`Connection error: ${err.message || "Failed to reach Supabase project"}`);
    }
  };

  const handleCopySql = () => {
    const sql = `-- KR8 DIGITALS SUPABASE SCHEMA
create table if not exists public.accounts (
  id text primary key,
  type text not null default 'student',
  executive_role text,
  name text not null,
  email text unique not null,
  phone text not null,
  country text default 'NG',
  skill text,
  dob text,
  password text not null,
  vip boolean default false,
  points integer default 0,
  attendance_accepted integer default 0,
  submissions integer default 0,
  referrals integer default 0,
  graduated boolean default false,
  cert_tier text,
  cert_recognition text,
  avatar text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.live_streams (
  id text primary key,
  title text not null,
  category text not null,
  description text,
  host_id text,
  host_name text not null,
  host_avatar text,
  visibility text default 'public',
  access_key text,
  is_live boolean default true,
  started_at bigint not null,
  viewer_count integer default 1,
  quality text default '1080p60',
  viewers jsonb default '[]'::jsonb,
  assigned_tasks jsonb default '[]'::jsonb,
  recognized_participants jsonb default '[]'::jsonb
);

create table if not exists public.live_chat (
  id text primary key,
  stream_id text not null,
  sender_id text not null,
  sender_name text not null,
  sender_role text default 'viewer',
  sender_badge text,
  text text not null,
  created_at bigint not null
);

alter publication supabase_realtime add table public.live_streams;
alter publication supabase_realtime add table public.live_chat;
`;
    navigator.clipboard?.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              Cloud Database & Real-Time Sync
            </span>
            <h3 className="font-bold text-white text-xl mt-1">Supabase Database Integration</h3>
            <p className="mt-1 text-sm text-[#b8aecf]">
              Connect your Supabase project to synchronize student registrations, attendances, and live stream broadcasts across all devices.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            <span className="text-xs font-bold text-white">
              {isConnected ? "Configured & Active" : "Local Mode (No DB Connected)"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveAndTest} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
              Supabase Project URL *
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzabcdefghijklm.supabase.co"
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-xs font-mono text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
              required
            />
            <span className="text-[10px] text-[#8a7ba8] mt-1 block">
              Found in your Supabase Dashboard: Settings → API → Project URL
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
              Supabase Anon / Public API Key *
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-xs font-mono text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
              required
            />
            <span className="text-[10px] text-[#8a7ba8] mt-1 block">
              Found in your Supabase Dashboard: Settings → API → Project API keys (anon public)
            </span>
          </div>

          {statusMsg && (
            <div
              className={`rounded-xl p-3 text-xs ${
                status === "success"
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200"
                  : status === "error"
                  ? "bg-red-500/20 border border-red-500/40 text-red-200"
                  : "bg-blue-500/20 border border-blue-500/40 text-blue-200"
              }`}
            >
              {statusMsg}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={status === "testing"}
              className="rounded-xl bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {status === "testing" ? "Testing Connection..." : "Save & Connect Supabase →"}
            </button>
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
            >
              {showSql ? "Hide SQL Setup" : "View 1-Click SQL Schema"}
            </button>
          </div>
        </form>

        {showSql && (
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-pink-300">
                Supabase SQL Editor Setup (Copy & Run in Supabase)
              </span>
              <button
                onClick={handleCopySql}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
              >
                {copiedSql ? "Copied to Clipboard!" : "Copy SQL Script"}
              </button>
            </div>
            <pre className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-4 text-[11px] font-mono text-emerald-300">
{`-- 1. Create Accounts Table
create table if not exists public.accounts (
  id text primary key,
  type text not null default 'student',
  name text not null,
  email text unique not null,
  phone text not null,
  skill text,
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Live Streams Table
create table if not exists public.live_streams (
  id text primary key,
  title text not null,
  category text not null,
  host_name text not null,
  visibility text default 'public',
  access_key text,
  is_live boolean default true,
  viewers jsonb default '[]'::jsonb,
  assigned_tasks jsonb default '[]'::jsonb
);

-- 3. Enable Realtime
alter publication supabase_realtime add table public.live_streams;`}
            </pre>
          </div>
        )}
      </Card>
    </div>
  );
}
