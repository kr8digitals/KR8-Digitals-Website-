import { useState, useEffect } from "react";
import {
  getAccounts,
  updateAccount,
  type Account,
} from "../../data/store";
import { Card, Pill } from "../ui";
import Icon from "../Icon";

export const ALL_ADMIN_SECTIONS = [
  { id: "Overview", label: "Overview & Analytics", group: "Core" },
  { id: "Website Content (CMS)", label: "Website Content (Dynamic CMS)", group: "Content" },
  { id: "Announcements", label: "Announcements (Media & Broadcast)", group: "Content" },
  { id: "Blog", label: "Blog & Insights", group: "Content" },
  { id: "Gallery Archive", label: "Gallery Archive", group: "Content" },
  { id: "Links Manager", label: "Links & Redirects", group: "Content" },
  { id: "Student Management", label: "Student Management & Registry", group: "Academy" },
  { id: "Attendance Review", label: "Attendance Review & Approvals", group: "Academy" },
  { id: "Graduation & Certificates", label: "Graduation & Certificates", group: "Academy" },
  { id: "Coach & Admin Signatures", label: "Coach & Admin Signatures", group: "Academy" },
  { id: "Verify Remarks", label: "Verify Remarks & Public Records", group: "Academy" },
  { id: "Leaderboard & XP", label: "Leaderboard & Gamification", group: "Academy" },
  { id: "Academy", label: "Academy Courses & Curriculum", group: "Academy" },
  { id: "Home", label: "Home Page Settings", group: "Content" },
  { id: "Testimonial Videos", label: "Testimonial Videos", group: "Media" },
  { id: "Live Streams & Replays", label: "Live Streams & Replays", group: "Media" },
  { id: "Client Requests", label: "Client Inquiries & Briefs", group: "Media" },
  { id: "Agency", label: "Agency Portfolio & Services", group: "Media" },
  { id: "Founders & Partners", label: "Founders & Executive Team", group: "System" },
  { id: "Payment Settings", label: "Payment & Account Details", group: "System" },
  { id: "Moderation", label: "Community Moderation", group: "Operations" },
  { id: "Admin Permissions", label: "Staff & Granular Permissions", group: "System", ultimateOnly: true },
  { id: "Supabase Database", label: "Supabase Cloud Database Sync", group: "System", ultimateOnly: true },
];

export const ROLE_PRESETS: Record<string, { label: string; description: string; permissions: string[] }> = {
  attendance_reviewer: {
    label: "Attendance Reviewer",
    description: "Strictly limited to attendance review, approval, rejection, and submission logs. Zero access to student records, certificates, or system settings.",
    permissions: ["Attendance Review"],
  },
  admin: {
    label: "Standard Admin",
    description: "Operational management of students, certificates, attendance, announcements, and content.",
    permissions: [
      "Overview",
      "Website Content (CMS)",
      "Announcements",
      "Blog",
      "Gallery Archive",
      "Links Manager",
      "Student Management",
      "Attendance Review",
      "Graduation & Certificates",
      "Coach & Admin Signatures",
      "Verify Remarks",
      "Leaderboard & XP",
      "Academy",
      "Home",
      "Testimonial Videos",
      "Client Requests",
      "Agency",
      "Moderation",
    ],
  },
  coach: {
    label: "Academy Coach",
    description: "Access to student coursework, academy curriculum, leaderboard, and community moderation.",
    permissions: ["Academy", "Student Management", "Leaderboard & XP", "Moderation"],
  },
  editor: {
    label: "Content Editor",
    description: "Manages website content, announcements, blog articles, and gallery showcases.",
    permissions: ["Website Content (CMS)", "Announcements", "Blog", "Gallery Archive", "Links Manager"],
  },
  moderator: {
    label: "Community Moderator",
    description: "Dedicated to student discussion safety, community guidelines enforcement, comment moderation, and user restrictions.",
    permissions: ["Moderation"],
  },
  ultimate: {
    label: "Ultimate Administrator",
    description: "Full unconstrained administrative access across the entire platform and security systems.",
    permissions: ALL_ADMIN_SECTIONS.map((s) => s.id),
  },
};

export default function GranularPermissionsManager({ isUltimate }: { isUltimate: boolean }) {
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts());
  const [activeView, setActiveView] = useState<"roster" | "promote">("roster");
  const [search, setSearch] = useState("");
  const [promoteSearch, setPromoteSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [assignedRole, setAssignedRole] = useState<string>("attendance_reviewer");
  const [customPermissions, setCustomPermissions] = useState<string[]>(["Attendance Review"]);
  const [adminPassword, setAdminPassword] = useState("KR8@Staff2026");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    const handleUpdate = () => setAccounts(getAccounts());
    window.addEventListener("kr8:accounts-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("kr8:accounts-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const staffMembers = accounts.filter(
    (a) => !!a.admin || a.type === "founder" || a.type === "co-founder"
  );

  const nonStaffMembers = accounts.filter(
    (a) => !a.admin && a.type !== "founder" && a.type !== "co-founder"
  );

  const filteredStaff = staffMembers.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      (a.admin?.role || "").toLowerCase().includes(q)
    );
  });

  const filteredCandidates = nonStaffMembers.filter((a) => {
    const q = promoteSearch.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  });

  const handleSelectAccount = (acc: Account) => {
    setSelectedAccount(acc);
    setFeedback(null);
    if (acc.admin) {
      setAssignedRole(acc.admin.role || "admin");
      setCustomPermissions(acc.admin.permissions || []);
      setAdminPassword(acc.admin.adminPassword || "");
    } else {
      setAssignedRole("attendance_reviewer");
      setCustomPermissions(["Attendance Review"]);
      setAdminPassword("KR8@Staff2026");
    }
  };

  const handleRolePresetChange = (role: string) => {
    setAssignedRole(role);
    if (ROLE_PRESETS[role]) {
      setCustomPermissions([...ROLE_PRESETS[role].permissions]);
      if (role === "attendance_reviewer") {
        setAdminPassword("KR8@Atd2026");
      }
    }
  };

  const togglePermission = (sectionId: string) => {
    if (assignedRole === "attendance_reviewer") return; // locked to attendance review only
    setCustomPermissions((prev) =>
      prev.includes(sectionId) ? prev.filter((p) => p !== sectionId) : [...prev, sectionId]
    );
  };

  const handleSavePermissions = () => {
    if (!selectedAccount) return;
    if (!isUltimate) {
      setFeedback({ type: "error", msg: "Only the Ultimate Administrator can configure staff permissions." });
      return;
    }

    if (selectedAccount.type === "founder" && selectedAccount.admin?.role === "ultimate" && assignedRole !== "ultimate") {
      setFeedback({ type: "error", msg: "Security Protection: Cannot demote the Founder/Ultimate Administrator." });
      return;
    }

    const permsToSave = assignedRole === "attendance_reviewer" ? ["Attendance Review"] : customPermissions;

    const updatedAdmin = {
      role: assignedRole as any,
      title: ROLE_PRESETS[assignedRole]?.label || assignedRole,
      permissions: permsToSave,
      adminPassword: adminPassword.trim() || undefined,
      passwordNotice: `Role updated to ${ROLE_PRESETS[assignedRole]?.label || assignedRole}.`,
      promotedBy: "Ultimate Administrator",
    };

    updateAccount(selectedAccount.id, { admin: updatedAdmin });
    setFeedback({
      type: "success",
      msg: `Permissions updated successfully for ${selectedAccount.name} (${ROLE_PRESETS[assignedRole]?.label || assignedRole})!`,
    });
  };

  const handleRevokeStaffAccess = (acc: Account) => {
    if (!isUltimate) {
      setFeedback({ type: "error", msg: "Only the Ultimate Administrator can revoke staff permissions." });
      return;
    }
    if (acc.type === "founder") {
      setFeedback({ type: "error", msg: "Security Protection: Cannot revoke Founder administrative access." });
      return;
    }

    if (window.confirm(`Are you sure you want to revoke staff access from ${acc.name}? They will revert to a standard user account.`)) {
      updateAccount(acc.id, { admin: undefined });
      setSelectedAccount(null);
      setFeedback({ type: "success", msg: `Staff access revoked for ${acc.name}.` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <Icon name="users" className="h-4 w-4" />
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Granular Role & Permission <span className="text-gradient">Control System</span>
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#b8aecf]">
            Strict separation of operational powers. Attendance Reviewers are strictly quarantined to attendance review with zero academy or system modification rights.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Pill className="text-xs">
            {staffMembers.length} Staff Accounts Active
          </Pill>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 text-xs font-semibold ${
            feedback.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <Icon name="check" className="h-4 w-4 shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Two Column Layout: Staff List & Permissions Configurator */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Staff Accounts List & Candidate Promotion */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5">
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 mb-4">
              <button
                onClick={() => setActiveView("roster")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  activeView === "roster"
                    ? "bg-pink-600/30 text-pink-300 border border-pink-500/40"
                    : "text-[#a594c7] hover:text-white"
                }`}
              >
                Staff Roster ({staffMembers.length})
              </button>
              <button
                onClick={() => setActiveView("promote")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  activeView === "promote"
                    ? "bg-gradient-pink text-white shadow-md shadow-pink-500/20"
                    : "text-[#a594c7] hover:text-white"
                }`}
              >
                + Promote User
              </button>
            </div>

            {activeView === "roster" ? (
              <>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                    Current Staff Members
                  </h3>
                  <span className="text-[11px] text-[#8a7ba8]">{filteredStaff.length} found</span>
                </div>

                {/* Search Box */}
                <div className="relative mb-4">
                  <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a7ba8]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, ID, or role..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2 text-xs text-white placeholder-[#8a7ba8] focus:border-pink-500 focus:outline-none"
                  />
                </div>

                {/* Staff List */}
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredStaff.map((staff) => {
                    const isSelected = selectedAccount?.id === staff.id;
                    const isReviewer = staff.admin?.role === "attendance_reviewer";
                    const isUlt = staff.admin?.role === "ultimate" || staff.type === "founder";

                    return (
                      <button
                        key={staff.id}
                        onClick={() => handleSelectAccount(staff)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-pink-500/60 bg-pink-500/15 shadow-md shadow-pink-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative h-10 w-10 shrink-0 rounded-full border border-white/20 bg-black/40 overflow-hidden">
                            {staff.avatar ? (
                              <img src={staff.avatar} alt={staff.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center font-bold text-xs text-pink-400">
                                {staff.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-white truncate">{staff.name}</div>
                            <div className="text-[11px] text-[#8a7ba8] truncate">{staff.email}</div>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                  isUlt
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    : isReviewer
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                }`}
                              >
                                {staff.admin?.title || staff.admin?.role || staff.type}
                              </span>
                              <span className="text-[10px] text-[#6b5d84] font-mono">{staff.id}</span>
                            </div>
                          </div>
                        </div>

                        <Icon
                          name="arrowRight"
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isSelected ? "text-pink-400 translate-x-1" : "text-[#6b5d84]"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                    Select User or Student to Promote
                  </h3>
                  <span className="text-[11px] text-[#8a7ba8]">{filteredCandidates.length} eligible</span>
                </div>

                {/* Candidate Search Box */}
                <div className="relative mb-4">
                  <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a7ba8]" />
                  <input
                    type="text"
                    value={promoteSearch}
                    onChange={(e) => setPromoteSearch(e.target.value)}
                    placeholder="Search candidate by name, ID, or email..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2 text-xs text-white placeholder-[#8a7ba8] focus:border-pink-500 focus:outline-none"
                  />
                </div>

                {/* Candidate List */}
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredCandidates.slice(0, 30).map((cand) => {
                    const isSelected = selectedAccount?.id === cand.id;

                    return (
                      <button
                        key={cand.id}
                        onClick={() => handleSelectAccount(cand)}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-pink-500/60 bg-pink-500/15 shadow-md shadow-pink-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-gradient-pink flex items-center justify-center font-bold text-xs text-white shrink-0">
                            {cand.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-white truncate">{cand.name}</div>
                            <div className="text-[10px] text-[#8a7ba8] truncate">{cand.id} · {cand.type}</div>
                          </div>
                        </div>

                        <span className="text-[11px] text-pink-300 font-semibold px-2 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 shrink-0">
                          Select →
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right Column: Role Configurator & Granular Toggles */}
        <div className="lg:col-span-7">
          {selectedAccount ? (
            <Card className="p-6 space-y-6">
              {/* Account Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full border border-pink-500/40 bg-pink-500/10 flex items-center justify-center font-display font-bold text-base text-pink-400 overflow-hidden">
                    {selectedAccount.avatar ? (
                      <img src={selectedAccount.avatar} alt={selectedAccount.name} className="h-full w-full object-cover" />
                    ) : (
                      selectedAccount.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base sm:text-lg">
                      {selectedAccount.name}
                    </h3>
                    <p className="text-xs text-[#8a7ba8]">
                      {selectedAccount.email} · ID: <span className="font-mono text-purple-300">{selectedAccount.id}</span>
                    </p>
                  </div>
                </div>

                {selectedAccount.type !== "founder" && (
                  <button
                    onClick={() => handleRevokeStaffAccess(selectedAccount)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 transition-colors"
                  >
                    Revoke Staff Access
                  </button>
                )}
              </div>

              {/* Role Preset Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-2">
                  Select Administrative Role
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(ROLE_PRESETS).map(([key, preset]) => {
                    if (key === "ultimate" && !isUltimate) return null;
                    const isCurrent = assignedRole === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleRolePresetChange(key)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isCurrent
                            ? "border-pink-500/70 bg-pink-500/20 text-white shadow-sm shadow-pink-500/20"
                            : "border-white/10 bg-white/[0.02] text-[#8a7ba8] hover:text-white hover:border-white/20"
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{preset.label}</span>
                          {isCurrent && <span className="text-pink-400">✓</span>}
                        </div>
                        <p className="mt-1 text-[10px] leading-relaxed text-[#b8aecf]">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Password for this Role */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">
                  Dedicated Staff Password / Pin
                </label>
                <input
                  type="text"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="e.g. KR8@Atd2026 for Reviewer"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white font-mono placeholder-[#6b5d84] focus:border-pink-500 focus:outline-none"
                />
                <p className="text-[11px] text-[#8a7ba8]">
                  {assignedRole === "attendance_reviewer"
                    ? "Attendance Reviewers log in with this dedicated password and will be restricted strictly to Attendance Review."
                    : "The user uses this password or their account credentials to access the assigned management panels."}
                </p>
              </div>

              {/* Granular Section Permissions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">
                    Active Section Permissions
                  </label>
                  {assignedRole === "attendance_reviewer" ? (
                    <span className="text-[11px] text-amber-400 font-semibold">
                      🔒 Enforced Attendance Only (Quarantined)
                    </span>
                  ) : (
                    <span className="text-[11px] text-purple-300 font-semibold">
                      {customPermissions.length} sections permitted
                    </span>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
                  {ALL_ADMIN_SECTIONS.map((sec) => {
                    const isPermitted =
                      assignedRole === "attendance_reviewer"
                        ? sec.id === "Attendance Review"
                        : customPermissions.includes(sec.id);
                    const isLocked = assignedRole === "attendance_reviewer" || (sec.ultimateOnly && !isUltimate);

                    return (
                      <div
                        key={sec.id}
                        onClick={() => !isLocked && togglePermission(sec.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                          isPermitted
                            ? "border-pink-500/40 bg-pink-500/10 text-white"
                            : "border-white/5 bg-white/[0.01] text-[#6b5d84]"
                        } ${isLocked ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-white/20"}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isPermitted}
                            disabled={isLocked}
                            onChange={() => !isLocked && togglePermission(sec.id)}
                            className="rounded border-white/20 bg-black/40 text-pink-500 focus:ring-0 cursor-pointer"
                          />
                          <span className="truncate">{sec.label}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-[#8a7ba8] shrink-0 font-mono">
                          {sec.group}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="px-4 py-2 rounded-full border border-white/15 text-xs text-[#b8aecf] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="px-6 py-2 rounded-full bg-gradient-pink text-xs font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-90"
                >
                  {selectedAccount.admin ? "Save Role & Permissions" : "Activate & Promote to Staff"}
                </button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-pink-400 mb-4">
                <Icon name="shield" className="h-8 w-8" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Select a Staff Member</h3>
              <p className="mt-1 text-xs text-[#8a7ba8] max-w-sm">
                Choose an administrator or staff member from the left panel to configure their granular access level, attendance quarantine, or operational permissions.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
