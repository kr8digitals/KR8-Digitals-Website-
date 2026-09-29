import { useState, useEffect, type ChangeEvent } from "react";
import { useSeo } from "../lib/useSeo";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import {
  getSkills, getSkill, getSkillName, saveCustomSkill, deleteCustomSkill,
  getWaitlistWhatsAppUrl, saveWaitlistWhatsAppUrl, areAllRegistrationsClosed,
  type Skill, ATTENDANCE_TYPES, PORTFOLIO,
  getAnnouncements, getSocialLinks, saveSocialLinks,
  getPaymentSettings, savePaymentSettings, getSkillRegistration, getSkillWhatsApp,
  saveSkillSetting, getFounders, saveFounders, getTeam, saveTeam, type FounderProfile, type TeamProfile,
  getPortfolio, savePortfolio,
  getXpRules, saveXpRules, type XpRule,
  getTestimonials, addTestimonial, deleteTestimonial, updateTestimonial,
  getVideoComments, deleteVideoComment,
  getAccounts, getStudents, updateAccount, findStudent,
  adminRegisterStudent, saveVerifyRemark, getBlogPosts, saveBlogPosts,
  addFeed, MAIN_ADMIN_PASSWORD, buildPhone, COUNTRIES,
  getStreamReplays, saveStreamReplays,
  canUserHostStream, deleteStreamRecording,
  getGalleryItems, addGalleryItem, approveGalleryItem, rejectGalleryItem,
  getHomepageSettings, saveHomepageSettings, DEFAULT_DOUBT_TO_BELIEF, DEFAULT_NARRATIVE_LINES,
  revokeStudentRegistration, suspendStudentAccount, getSuspendedAccounts, restoreSuspendedAccount, upholdSuspendedAccount,
  getClientRequests, updateClientRequestStatus, deleteClientRequest,
  saveDynamicCurriculum, type Week,
  type Account, type Testimonial, type VideoComment, type BlogPost, type StreamReplay, type GalleryItem, type DoubtToBeliefStep, type SuspendedAccount, type ClientRequest,
} from "../data/store";
import { Card, Pill, GradientButton, GhostButton } from "../components/ui";
import Icon from "../components/Icon";
import {
  generateAutomaticCertificate,
  formatCertificateStudentName,
  downloadCertificatePdf,
  saveCertificateData,
} from "../utils/certificate";
import CertificateDocumentView from "../components/CertificateDocumentView";
import {
  issueCertificate,
  withdrawCertificate,
  getStudentCertificates,
  type CertificateRecord,
  type CertificateTier,
} from "../data/store";
import { MS_SUPABASE_SQL } from "../data/mindsetShift";
import WebsiteContentManager from "../components/admin/WebsiteContentManager";
import { hydrateAccountsFromSupabase } from "../lib/supabaseSync";
import SignatureManager from "../components/admin/SignatureManager";
import GranularPermissionsManager from "../components/admin/GranularPermissionsManager";
import AnnouncementManager from "../components/admin/AnnouncementManager";
import MindsetShiftTab from "../components/admin/MindsetShiftTab";

const ATTENDANCE_PW = "KR8@Atd2026";

const sections = [
  "Overview", "Website Content (CMS)", "Announcements", "Blog", "Gallery Archive", "Links Manager",
  "Student Management", "Attendance Review", "Graduation & Certificates", "Coach & Admin Signatures",
  "Verify Remarks", "Leaderboard & XP", "Academy", "Home", "Testimonial Videos", "Live Streams & Replays",
  "Client Requests", "Agency", "Founders & Partners", "Payment Settings", "Moderation", "Admin Permissions", "Supabase Database",
  "Mindset Shift",
];

interface NavGroup {
  name: string;
  items: { id: string; label: string; icon: Parameters<typeof Icon>[0]["name"]; badge?: string }[];
}

const ADMIN_GROUPS: NavGroup[] = [
  {
    name: "Analytics & Overview",
    items: [{ id: "Overview", label: "Dashboard Overview", icon: "chart" }],
  },
  {
    name: "Website Content (CMS)",
    items: [
      { id: "Website Content (CMS)", label: "Website Content (CMS)", icon: "spark", badge: "Live" },
      { id: "Announcements", label: "Announcements & Media", icon: "bell" },
      { id: "Blog", label: "Blog & Insights", icon: "pen" },
      { id: "Gallery Archive", label: "Gallery Archive", icon: "palette" },
      { id: "Links Manager", label: "Links & Redirects", icon: "share" },
      { id: "Home", label: "Home Page Settings", icon: "spark" },
    ],
  },
  {
    name: "Academy & Students",
    items: [
      { id: "Student Management", label: "Student Registry", icon: "user" },
      { id: "Attendance Review", label: "Attendance Review", icon: "check", badge: "Atd" },
      { id: "Graduation & Certificates", label: "Graduation & Certificates", icon: "certificate" },
      { id: "Coach & Admin Signatures", label: "Coach & Admin Signatures", icon: "pen", badge: "Keys" },
      { id: "Verify Remarks", label: "Verify Remarks", icon: "lock" },
      { id: "Leaderboard & XP", label: "Leaderboard & XP", icon: "trophy" },
      { id: "Academy", label: "Courses & Curriculum", icon: "book" },
    ],
  },
  {
    name: "Media & Client Agency",
    items: [
      { id: "Agency", label: "Agency Portfolio", icon: "briefcase" },
      { id: "Client Requests", label: "Client Inquiries", icon: "message" },
      { id: "Testimonial Videos", label: "Testimonials", icon: "video" },
      { id: "Live Streams & Replays", label: "Live Streams & Replays", icon: "youtube" },
    ],
  },
  {
    name: "Events & Programs",
    items: [{ id: "Mindset Shift", label: "Mindset Shift", icon: "calendar", badge: "MS" }],
  },
  {
    name: "System & Governance",
    items: [
      { id: "Founders & Partners", label: "Founders & Team", icon: "users" },
      { id: "Payment Settings", label: "Payment & Accounts", icon: "bolt" },
      { id: "Moderation", label: "Moderation & Safety", icon: "shield" },
      { id: "Admin Permissions", label: "Staff Permissions", icon: "lock", badge: "Master" },
      { id: "Supabase Database", label: "Cloud Sync", icon: "code" },
    ],
  },
];

export default function Admin() {
  useSeo({ path: "/admin", noindex: true });
  const { student: currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [auth, setAuth] = useState(false);
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [students, setStudents] = useState<Account[]>(() => getAccounts());

  const isAuthorized = !!(currentUser?.admin || currentUser?.type === "founder" || currentUser?.type === "co-founder");
  const isUltimate = currentUser?.admin?.role === "ultimate" || currentUser?.type === "founder" || pw === MAIN_ADMIN_PASSWORD;

  // Real-time synchronization whenever student data or accounts update
  useEffect(() => {
    const refresh = () => setStudents(getAccounts());
    window.addEventListener("kr8:accounts-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:accounts-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Ensure non-ultimate staff default to their first permitted section if Overview is unpermitted
  useEffect(() => {
    if (!isUltimate && currentUser?.admin?.permissions?.length) {
      if (!currentUser.admin.permissions.includes(tab)) {
        setTab(currentUser.admin.permissions[0]);
      }
    }
  }, [currentUser, isUltimate, tab]);

  const [isAttendanceReviewerOnly, setIsAttendanceReviewerOnly] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileNavOpen) {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileNavOpen]);

  const unlock = () => {
    const isMainAdmin = pw === MAIN_ADMIN_PASSWORD;
    const isAttendancePw = pw === ATTENDANCE_PW;
    const isUserAdminPw = pw === currentUser?.admin?.adminPassword;

    if (!isMainAdmin && !isAttendancePw && !isUserAdminPw) {
      setErr(true);
      return;
    }

    setErr(false);
    setAuth(true);

    if (isAttendancePw || currentUser?.admin?.role === "attendance_reviewer") {
      setIsAttendanceReviewerOnly(true);
      setTab("Attendance Review");
    } else {
      setIsAttendanceReviewerOnly(false);
    }
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
            Welcome, {currentUser?.name || "Administrator"}. Please enter your administrative or reviewer credentials.
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            placeholder="Admin or Reviewer password"
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

  // ATTENDANCE REVIEWER QUARANTINE: Strict separation of powers
  if (isAttendanceReviewerOnly || currentUser?.admin?.role === "attendance_reviewer") {
    return (
      <div className="section-bg min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Quarantined Reviewer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 backdrop-blur-md mb-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                <Icon name="check" className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-white">
                    Attendance Review <span className="text-gradient">Portal</span>
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Quarantined Reviewer
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#b8aecf]">
                  Strict limited access: You are authorized exclusively to review, approve, or reject attendance submissions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuth(false);
                  setIsAttendanceReviewerOnly(false);
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-[#b8aecf] hover:text-white shrink-0"
              >
                Lock Reviewer
              </button>
              <button
                onClick={() => {
                  setAuth(false);
                  setIsAttendanceReviewerOnly(false);
                  signOut();
                  navigate("/");
                }}
                className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 shrink-0"
              >
                Sign Out of Account
              </button>
            </div>
          </div>

          <AttendancePanel initialUnlocked={true} />
        </div>
      </div>
    );
  }

  const allowedSections = isUltimate ? sections : sections.filter((s) => currentUser?.admin?.permissions?.includes(s));
  const stats = [
    { n: students.length, l: "Registered Students" },
    { n: students.filter((s) => s.graduated).length, l: "Certified Graduates" },
    { n: PORTFOLIO.length, l: "Agency Projects" },
    { n: getAccounts().filter((a) => a.type === "tribe").length, l: "Tribe Members" },
    { n: getAnnouncements().length, l: "Active Announcements" },
    { n: getBlogPosts().length, l: "Blog Articles" },
  ];

  // Active group detection for breadcrumbs and context
  const activeGroup = ADMIN_GROUPS.find((g) => g.items.some((i) => i.id === tab))?.name || "Dashboard";

  // Filter navigation groups by permissions and search
  const filteredGroups = ADMIN_GROUPS.map((grp) => {
    const validItems = grp.items.filter((item) => {
      if (!allowedSections.includes(item.id)) return false;
      if (navSearch.trim()) {
        return item.label.toLowerCase().includes(navSearch.toLowerCase()) || item.id.toLowerCase().includes(navSearch.toLowerCase());
      }
      return true;
    });
    return { ...grp, items: validItems };
  }).filter((grp) => grp.items.length > 0);

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-xl border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] active:scale-95 transition-all"
              title="Toggle Menu"
            >
              <Icon name={mobileNavOpen ? "close" : "menu"} className="h-5 w-5" />
            </button>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-transparent p-1 border border-pink-500/30 shadow-md shadow-pink-500/20 shrink-0">
              <img
                src="/branding/kr8_logo.png"
                alt="KR8 Digitals Logo"
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  KR8 Admin <span className="text-gradient">Control Center</span>
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {isUltimate ? "Ultimate Administrator" : currentUser?.admin?.title || "Administrator"}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-[#8a7ba8]">
                <span>Logged in as <strong className="text-white">{currentUser?.name}</strong></span>
                <span>•</span>
                <span className="text-[#a594c7]">{activeGroup}</span>
                <span>›</span>
                <span className="text-pink-400 font-semibold">{tab}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-2 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 transition-all inline-flex items-center gap-1.5"
            >
              <span>View Live Site</span>
              <span className="text-[10px]">↗</span>
            </a>
            <button
              onClick={() => setAuth(false)}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-[#b8aecf] hover:text-white hover:border-white/30 transition-colors"
            >
              Lock Dashboard
            </button>
            <button
              onClick={() => {
                setAuth(false);
                signOut();
                navigate("/");
              }}
              className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Responsive Dashboard Workspace */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop Sidebar Navigation */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 sticky top-6 space-y-4">
            <Card className="p-4 space-y-4">
              {/* Quick Filter Search */}
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7ba8]" />
                <input
                  type="text"
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Filter sections..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-8 py-1.5 text-xs text-white placeholder-[#8a7ba8] focus:border-pink-500 focus:outline-none transition-all"
                />
                {navSearch && (
                  <button
                    onClick={() => setNavSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8a7ba8] hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Categorized Menu */}
              <nav className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {filteredGroups.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#8a7ba8]">
                    No sections match "{navSearch}".
                    <br />
                    <button onClick={() => setNavSearch("")} className="mt-2 text-pink-400 underline font-semibold">
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  filteredGroups.map((grp) => (
                    <div key={grp.name} className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#7e6d97]">
                        {grp.name}
                      </div>
                      {grp.items.map((item) => {
                        const isActive = tab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                              isActive
                                ? "bg-gradient-pink text-white shadow-md shadow-pink-500/20 glow-pink-sm font-bold"
                                : "text-[#b8aecf] hover:text-white hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`shrink-0 ${isActive ? "text-white" : "text-pink-400/80"}`}>
                                <Icon name={item.icon} size={14} />
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                                  isActive ? "bg-white/20 text-white" : "bg-pink-500/20 text-pink-300"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </nav>
            </Card>
          </aside>

          {/* Mobile Drawer (Visible when toggled on small screens) */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex animate-fadeIn">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="relative w-80 max-w-[85vw] bg-[#12001f] border-r border-white/10 p-5 z-10 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2.5">
                    <img src="/branding/kr8_logo.png" alt="KR8" className="h-7 w-7 rounded-lg" />
                    <div>
                      <h3 className="font-display font-bold text-white text-sm">KR8 Admin</h3>
                      <p className="text-[10px] text-[#8a7ba8]">{currentUser?.admin?.title || "Control Center"}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="p-1.5 rounded-lg border border-white/15 bg-white/5 text-[#8a7ba8] hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="relative mb-4">
                  <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7ba8]" />
                  <input
                    type="text"
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    placeholder="Filter sections..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-8 py-1.5 text-xs text-white placeholder-[#8a7ba8] focus:border-pink-500 focus:outline-none"
                  />
                  {navSearch && (
                    <button
                      onClick={() => setNavSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8a7ba8] hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  {filteredGroups.map((grp) => (
                    <div key={grp.name} className="space-y-1">
                      <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#7e6d97]">
                        {grp.name}
                      </div>
                      {grp.items.map((item) => {
                        const isActive = tab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setTab(item.id);
                              setMobileNavOpen(false);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                              isActive
                                ? "bg-gradient-pink text-white shadow-md shadow-pink-500/20 font-bold"
                                : "text-[#b8aecf] hover:text-white hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`shrink-0 ${isActive ? "text-white" : "text-pink-400"}`}>
                                <Icon name={item.icon} size={15} />
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  isActive ? "bg-white/20 text-white" : "bg-pink-500/20 text-pink-300"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Mobile Drawer Footer Actions */}
                <div className="pt-4 border-t border-white/10 mt-4 space-y-2 shrink-0">
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-xl border border-pink-500/30 bg-pink-500/10 py-2 text-center text-xs font-semibold text-pink-300 block"
                  >
                    View Live Website ↗
                  </a>
                  <button
                    onClick={() => {
                      setAuth(false);
                      setMobileNavOpen(false);
                      signOut();
                      navigate("/");
                    }}
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-center text-xs font-semibold text-rose-300 block"
                  >
                    Sign Out of Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="lg:col-span-9 xl:col-span-9 space-y-6 min-w-0">
            {tab === "Overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {stats.map((s) => (
                    <Card key={s.l} className="!p-5">
                      <div className="font-display text-3xl text-gradient">{s.n}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-wider text-[#8a7ba8]">{s.l}</div>
                    </Card>
                  ))}
                </div>
                <div>
                  <StudentManager students={students} onRefreshStudents={(fresh) => setStudents(fresh)} />
                </div>
              </div>
            )}

            {tab === "Website Content (CMS)" && <WebsiteContentManager />}
            {tab === "Coach & Admin Signatures" && <SignatureManager />}
            {tab === "Admin Permissions" && isUltimate && <GranularPermissionsManager isUltimate={isUltimate} />}

            {tab === "Client Requests" && <ClientRequestsManager />}
            {tab === "Home" && <HomeManager onOpenVideos={() => setTab("Testimonial Videos")} />}
            {tab === "Academy" && <AcademyManager onOpenVideos={() => setTab("Testimonial Videos")} />}
            {tab === "Testimonial Videos" && <TestimonialVideosManager />}
            {tab === "Live Streams & Replays" && <LiveStreamsManager />}
            {tab === "Agency" && <AgencyManager />}
            {tab === "Gallery Archive" && <GalleryManager />}
            {tab === "Student Management" && <StudentManager students={students} onRefreshStudents={(fresh) => setStudents(fresh)} />}
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
            {tab === "Attendance Review" && <AttendancePanel initialUnlocked={isAttendanceReviewerOnly || isUltimate} />}
            {tab === "Moderation" && <ModerationManager />}
            {tab === "Supabase Database" && <SupabaseManager />}
            {tab === "Mindset Shift" && <MindsetShiftTab adminName={currentUser?.name || "Admin"} />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Student Management ---------------- */

function StudentManager({
  students,
  onRefreshStudents,
}: {
  students: Account[];
  onRefreshStudents?: (fresh: Account[]) => void;
}) {
  const { student: currentUser, addNotification } = useAuth();
  const [q, setQ] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const handleRefresh = async () => {
    try {
      await hydrateAccountsFromSupabase();
    } catch {
      /* ignore */
    }
    const fresh = getAccounts();
    if (onRefreshStudents) {
      onRefreshStudents(fresh);
    }
    window.dispatchEvent(new Event("kr8:accounts-updated"));
    addNotification(`Synchronized roster! Loaded ${fresh.length} verified records.`);
  };

  const handleQuickLookup = () => {
    const query = window.prompt("Enter Student ID, Email, or Phone to find and verify record:");
    if (!query?.trim()) return;
    const found = findStudent(query.trim());
    if (found) {
      setQ(found.id);
      setPage(1);
      addNotification(`Found record for ${found.name} (${found.id})! Loaded into table view.`);
    } else {
      addNotification(`No record found for "${query.trim()}". You can manually register them using "+ Manually Register Student".`);
    }
  };

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

  // Filter students by query, skill, and status
  const filtered = students.filter((s) => {
    const qLower = q.toLowerCase().trim();
    const qNorm = qLower.replace(/[\s-]/g, "");
    const sIdNorm = s.id.toLowerCase().replace(/[\s-]/g, "");
    const matchesQuery =
      !qLower ||
      s.name.toLowerCase().includes(qLower) ||
      s.id.toLowerCase().includes(qLower) ||
      sIdNorm.includes(qNorm) ||
      (s.email && s.email.toLowerCase().includes(qLower)) ||
      (s.phone && s.phone.replace(/\D/g, "").includes(qLower.replace(/\D/g, ""))) ||
      (s.skill && s.skill.toLowerCase().includes(qLower)) ||
      (s.type && s.type.toLowerCase().includes(qLower));

    const matchesSkill =
      skillFilter === "all" ||
      s.skill === skillFilter ||
      (s.skills && s.skills.includes(skillFilter));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "students" && s.type === "student") ||
      (statusFilter === "tribe" && s.type === "tribe") ||
      (statusFilter === "graduated" && s.graduated) ||
      (statusFilter === "training" && !s.graduated && s.type === "student") ||
      (statusFilter === "staff" && (!!s.admin || s.type === "founder" || s.type === "co-founder"));

    return matchesQuery && matchesSkill && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedStudents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3.5 py-2 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 flex items-center gap-1.5 transition-colors"
                title="Refresh student records from local storage & database"
              >
                <Icon name="cog" size={13} />
                <span>Sync Roster ({students.length})</span>
              </button>
              <button
                type="button"
                onClick={handleQuickLookup}
                className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 flex items-center gap-1.5 transition-colors"
                title="Quick identity search & verification across all database records"
              >
                <Icon name="search" size={13} />
                <span>Find / Verify</span>
              </button>
              <button
                onClick={() => setManualRegisterOpen(true)}
                className="rounded-full bg-gradient-pink px-4 py-2 text-xs font-bold text-white glow-pink-sm"
              >
                + Manually Register Student
              </button>
            </div>
          )}
        </div>

        {/* Search & Granular Filter Bar */}
        {tab === "active" && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border-b border-white/10 p-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7ba8]" />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search students by name, ID, email, or phone…"
                  className="w-full rounded-xl border border-white/15 bg-black/30 pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#6f6390] focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Status Filter - Modern Segmented Pills (Eliminates Dropdown Arrow) */}
              <div className="flex flex-wrap items-center rounded-xl border border-white/10 bg-black/40 p-1 gap-1">
                {[
                  { id: "all", label: "All Members" },
                  { id: "students", label: "Students" },
                  { id: "tribe", label: "Tribe" },
                  { id: "graduated", label: "Graduates" },
                  { id: "training", label: "In Training" },
                  { id: "staff", label: "Staff & Execs" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStatusFilter(st.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      statusFilter === st.id
                        ? "bg-pink-500/25 text-pink-300 border border-pink-500/40"
                        : "text-[#8a7ba8] hover:text-white"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Skill Filter - Clean Custom Filter (Eliminates Default Arrow) */}
              <div className="relative">
                <select
                  value={skillFilter}
                  onChange={(e) => {
                    setSkillFilter(e.target.value);
                    setPage(1);
                  }}
                  className="appearance-none rounded-xl border border-white/15 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">Track: All Skills ({students.length})</option>
                  {getSkills().map((s) => (
                    <option key={s.key} value={s.key}>
                      Track: {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-[#8a7ba8] shrink-0 font-medium">
              Showing <strong className="text-white">{filtered.length}</strong> matching students
            </div>
          </div>
        )}

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
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#8a7ba8]">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((s) => {
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 p-4 bg-white/[0.01]">
                <span className="text-xs text-[#8a7ba8]">
                  Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filtered.length} total students)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-white/15 bg-black/40 text-xs text-[#cabfe0] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = Math.min(totalPages - 4, currentPage - 2) + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-pink text-white font-bold"
                              : "border border-white/10 bg-black/20 text-[#8a7ba8] hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-white/15 bg-black/40 text-xs text-[#cabfe0] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
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
          onSuccess={(newStudent) => {
            const fresh = getAccounts();
            if (onRefreshStudents) onRefreshStudents(fresh);
            window.dispatchEvent(new Event("kr8:accounts-updated"));
            setManualRegisterOpen(false);
            if (newStudent) {
              addNotification(`Successfully registered ${newStudent.name} (${newStudent.id})! Account is active.`);
            }
          }}
        />
      )}

      {/* Graduation Flow Modal */}
      {graduatingStudent && (
        <GraduationModal
          student={graduatingStudent}
          onClose={() => setGraduatingStudent(null)}
          onGraduated={() => {
            window.dispatchEvent(new Event("kr8:accounts-updated"));
          }}
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
                  className="mt-1 w-full appearance-none rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
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
                className="mt-1 w-full appearance-none rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-pink-400/60 focus:outline-none"
              >
                {getSkills().map((s) => (
                  <option key={s.key} value={s.key}>{s.name} ({s.suffix})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8a7ba8]">Date of Birth *</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <select value={y} onChange={(e) => setY(e.target.value)} className="appearance-none rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white">
                  {years.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={m} onChange={(e) => setM(e.target.value)} className="appearance-none rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white">
                  {months.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={d} onChange={(e) => setD(e.target.value)} className="appearance-none rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-xs text-white">
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

/* ---------------- AUTOMATIC GRADUATION & CERTIFICATE ISSUANCE SYSTEM ---------------- */

function GraduationModal({
  student,
  onClose,
  onGraduated,
}: {
  student: Account;
  onClose: () => void;
  onGraduated: (updated: Account) => void;
}) {
  const [tier, setTier] = useState<CertificateTier>("Professionalism");
  const [selectedSkillKey, setSelectedSkillKey] = useState<string>(() => {
    return student.skill || (student.skills && student.skills[0]) || "graphic";
  });
  const [certStudentName, setCertStudentName] = useState(student.name);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [issuedCert, setIssuedCert] = useState<CertificateRecord | null>(null);
  const [generatedPdfBytes, setGeneratedPdfBytes] = useState<Uint8Array | null>(null);

  // Withdrawal Sub-Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawCertId, setWithdrawCertId] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  const existingCertificates = getStudentCertificates(student.id);
  const formattedPreviewName = formatCertificateStudentName(certStudentName);
  const selectedSkill = getSkill(selectedSkillKey);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");

  const allSkills = getSkills();
  const filteredSkills = allSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  const handleIssueCertificate = async () => {
    setProcessing(true);
    setError("");

    try {
      // 1. Generate Automatic Certificate with template, student name, and QR
      const result = await generateAutomaticCertificate({
        student,
        skillKey: selectedSkillKey,
        tier,
        courseName: selectedSkill?.name || getSkillName(selectedSkillKey),
        additionalNotes: additionalNotes.trim(),
        origin: window.location.origin,
        customStudentName: certStudentName.trim(),
      });

      // 2. Persist to durable IndexedDB
      await saveCertificateData(
        student.id,
        {
          fileType: "image",
          imageUrl: result.imageUrl,
          pdfBytes: result.pdfBytes,
        },
        result.certId
      );

      // 3. Create persistent CertificateRecord
      const certRecord: CertificateRecord = {
        id: result.certId,
        studentId: student.id,
        studentName: certStudentName.trim() || student.name,
        formattedName: result.formattedName,
        skill: selectedSkillKey,
        skillName: result.courseName,
        tier: result.tier,
        templateUrl: result.templateUrl,
        achievementText: result.achievementText,
        additionalNotes: additionalNotes.trim() || undefined,
        issuedAt: Date.now(),
        issuedBy: "KR8 Administrator",
        status: "active",
        certificateImageUrl: result.imageUrl,
      };

      // 4. Save into Store / Account database
      const saveRes = issueCertificate(student.id, certRecord);
      if (!saveRes.ok || !saveRes.account) {
        throw new Error(saveRes.error || "Failed to issue certificate.");
      }

      setIssuedCert(certRecord);
      setGeneratedPdfBytes(result.pdfBytes);
      onGraduated(saveRes.account);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to generate certificate. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmWithdraw = () => {
    if (!withdrawReason.trim()) {
      setWithdrawError("Please state the specific reason for certificate withdrawal.");
      return;
    }
    setWithdrawError("");

    const res = withdrawCertificate(student.id, withdrawCertId, withdrawReason.trim(), "KR8 Administrator");
    if (!res.ok || !res.account) {
      setWithdrawError(res.error || "Could not withdraw certificate.");
      return;
    }

    setShowWithdrawModal(false);
    setWithdrawReason("");
    setWithdrawCertId("");
    onGraduated(res.account);
  };

  // Portal to document.body: this modal can be mounted inside a <Card> (the
  // Graduation & Certification Center). Cards use backdrop-filter, which
  // creates a containing block for position:fixed descendants — without the
  // portal the "fixed inset-0" overlay is trapped inside the card, misplaced
  // and rendered under the page content (tier buttons unclickable).
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <Card className="my-8 w-full max-w-2xl border border-pink-500/40 shadow-2xl bg-[#0f0219]">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">Issue Official KR8 Certificate</h3>
            <p className="text-xs text-[#b8aecf] mt-0.5">
              {student.name} · <span className="font-mono text-pink-300">{student.id}</span>
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#8a7ba8] hover:bg-white/10 hover:text-white">✕</button>
        </div>

        {issuedCert ? (
          /* SUCCESS / ISSUED PREVIEW VIEW */
          <div className="mt-5 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-green-300">
              <Icon name="certificate" size={28} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Certificate Successfully Issued! 🎓</h4>
              <p className="text-xs text-[#b8aecf] mt-1">
                Certificate of <strong className="text-white">{issuedCert.tier}</strong> in <strong className="text-white">{issuedCert.skillName}</strong> has been generated and delivered to the student profile.
              </p>
            </div>

            {/* LIVE CERTIFICATE PREVIEW */}
            <CertificateDocumentView
              cert={issuedCert}
              student={student}
              maxHeight="280px"
            />

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  downloadCertificatePdf(student.name, generatedPdfBytes, issuedCert, student);
                }}
                className="flex items-center gap-2 rounded-full bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-lg glow-pink-sm hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Icon name="certificate" size={14} /> Download Certificate PDF
              </button>

              <a
                href={`/verify?id=${encodeURIComponent(student.id)}&cert=${encodeURIComponent(issuedCert.id)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-pink-400/50 bg-pink-500/10 px-5 py-2.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 transition-colors"
              >
                Test Public Verification ↗
              </a>

              <button
                onClick={() => {
                  setIssuedCert(null);
                }}
                className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10"
              >
                Issue Another
              </button>

              <button
                onClick={onClose}
                className="rounded-full border border-pink-500/30 px-5 py-2.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/10"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* CERTIFICATE CREATION FORM */
          <div className="mt-5 space-y-5">
            {/* 1. WHICH CERTIFICATE IS BEING ISSUED? */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-2">
                1. Which certificate is being issued? *
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Certificate of Professionalism */}
                <button
                  type="button"
                  onClick={() => setTier("Professionalism")}
                  className={`rounded-2xl p-4 text-left transition-all relative overflow-hidden border ${
                    tier === "Professionalism"
                      ? "border-pink-500 bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-black text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-500/50"
                      : "border-white/15 bg-black/30 text-[#cabfe0] hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Certificate of Professionalism</span>
                    {tier === "Professionalism" && <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#d4c6e6]">
                    "...demonstrating excellence and proficiency in turning client requests into client satisfaction."
                  </p>
                  <div className="mt-3 rounded-lg bg-pink-500/10 px-2 py-1 text-[10px] font-semibold text-pink-300">
                    ⭐ True professional KR8 vouches for anywhere
                  </div>
                </button>

                {/* Certificate of Completion */}
                <button
                  type="button"
                  onClick={() => setTier("Completion")}
                  className={`rounded-2xl p-4 text-left transition-all relative overflow-hidden border ${
                    tier === "Completion"
                      ? "border-pink-500 bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-black text-white shadow-lg shadow-pink-500/20 ring-1 ring-pink-500/50"
                      : "border-white/15 bg-black/30 text-[#cabfe0] hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Certificate of Completion</span>
                    {tier === "Completion" && <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#d4c6e6]">
                    "...gaining hands-on experience in turning client requests into finished designs."
                  </p>
                  <div className="mt-3 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-[#cabfe0]">
                    🌱 Finished process, gained real experience
                  </div>
                </button>
              </div>
            </div>

            {/* 2. SKILL SELECTION (MODERN SEARCHABLE GRID - NO DROPDOWNS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-pink-300">
                  2. Skill Track to Certify *
                </label>
                <span className="text-[11px] text-[#8a7ba8]">
                  Selected: <strong className="text-white">{selectedSkill?.name || selectedSkillKey}</strong>
                </span>
              </div>

              {/* Skill search filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search skill track (e.g. Graphic, Video, Web)..."
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-7 py-2 text-xs text-white placeholder:text-[#6f6390] focus:border-pink-500 focus:outline-none"
                />
                <span className="absolute left-2.5 top-2.5 text-[#8a7ba8]">
                  <Icon name="search" size={13} />
                </span>
                {skillSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSkillSearchQuery("")}
                    className="absolute right-2.5 top-2 text-xs text-[#8a7ba8] hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Grid of selectable skills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 rounded-xl border border-white/10 bg-black/30">
                {filteredSkills.map((s) => {
                  const isSelected = selectedSkillKey === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSelectedSkillKey(s.key)}
                      className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "border-pink-500 bg-pink-500/20 text-white ring-1 ring-pink-500/50 shadow-md shadow-pink-500/20"
                          : "border-white/10 bg-white/[0.02] text-[#b8aecf] hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold truncate">{s.name}</span>
                        {isSelected && <span className="text-pink-400 font-bold">✓</span>}
                      </div>
                      <span className="text-[10px] text-[#8a7ba8] font-mono mt-0.5">{s.key}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-[#8a7ba8]">
                Template mapped: <strong className="text-white">{selectedSkill?.name || selectedSkillKey} ({tier})</strong>
              </p>
            </div>

            {/* 3. STUDENT NAME ON CERTIFICATE (EDITABLE) */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-pink-300">
                  3. Certificate Student Name (Editable During Graduation) *
                </label>
                {certStudentName !== student.name && (
                  <button
                    type="button"
                    onClick={() => setCertStudentName(student.name)}
                    className="text-[10px] text-pink-400 hover:text-white underline underline-offset-2"
                  >
                    Reset to Account Name
                  </button>
                )}
              </div>
              <input
                type="text"
                value={certStudentName}
                onChange={(e) => setCertStudentName(e.target.value)}
                placeholder="Official student name to print on certificate"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white focus:border-pink-400 focus:outline-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                <p className="text-[#8a7ba8]">
                  Account Profile: <span className="text-white font-medium">{student.name}</span>
                </p>
                <p className="font-mono text-pink-300 font-bold">
                  Printed in ALL CAPS: {formattedPreviewName}
                </p>
              </div>
            </div>

            {/* 4. ADDITIONAL NOTES / ACHIEVEMENTS */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-300 mb-1">
                4. Additional Notes / Achievements (Optional)
              </label>
              <input
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Three-time Best Performer · Outstanding Performance · Best Student"
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white focus:border-pink-400 focus:outline-none placeholder:text-[#6a5b82]"
              />
              <p className="mt-1 text-[11px] text-[#8a7ba8]">
                These honors are recorded on the student's profile and certificate record.
              </p>
            </div>

            {/* ERROR NOTICE */}
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div>
                {existingCertificates.length > 0 && (
                  <span className="text-xs text-[#8a7ba8]">
                    {existingCertificates.length} certificate{existingCertificates.length === 1 ? "" : "s"} already on file
                  </span>
                )}
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processing}
                  onClick={handleIssueCertificate}
                  className="rounded-full bg-gradient-pink px-7 py-2.5 text-xs font-bold text-white shadow-lg glow-pink-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {processing ? "Generating Certificate…" : "Issue Certificate"}
                </button>
              </div>
            </div>

            {/* EXISTING CERTIFICATES & WITHDRAWAL CONTROLS */}
            {existingCertificates.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#b8aecf] mb-2.5">
                  Issued Certificates for this Student
                </h5>
                <div className="space-y-2">
                  {existingCertificates.map((cert) => {
                    const isWithdrawn = cert.status === "withdrawn";
                    return (
                      <div
                        key={cert.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/40 p-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{cert.skillName}</span>
                            <span className="font-mono text-[10px] text-pink-300">
                              Certificate of {cert.tier}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                isWithdrawn
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-green-500/20 text-green-300 border border-green-500/30"
                              }`}
                            >
                              {isWithdrawn ? "Withdrawn" : "Active ✓"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8a7ba8] mt-0.5">
                            ID: <code className="text-white">{cert.id}</code> · Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                          </p>
                          {cert.withdrawalReason && (
                            <p className="text-[10px] text-amber-300 mt-1 italic">
                              Withdrawn reason: "{cert.withdrawalReason}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/verify?id=${encodeURIComponent(student.id)}&cert=${encodeURIComponent(cert.id)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/10"
                          >
                            Verify Link
                          </a>
                          {!isWithdrawn && (
                            <button
                              type="button"
                              onClick={() => {
                                setWithdrawCertId(cert.id);
                                setShowWithdrawModal(true);
                              }}
                              className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/20"
                            >
                              Withdraw Certificate
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* WITHDRAWAL REASON MODAL (Section 13) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-500/50 bg-[#160000] p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-red-500/30 pb-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
                <Icon name="alert" size={20} />
              </span>
              <div>
                <h4 className="text-base font-bold text-white">Withdraw Student Certificate</h4>
                <p className="text-xs text-red-300/80">Accountability & Stated Reason Required</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#eed6d6] leading-relaxed">
                Why are you withdrawing this certificate? The stated reason will be permanently recorded and displayed when someone verifies or scans this certificate's QR code.
              </p>

              <div>
                <label className="block text-xs font-bold text-red-300 mb-1">
                  Reason for Withdrawal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={withdrawReason}
                  onChange={(e) => setWithdrawReason(e.target.value)}
                  placeholder="e.g. Failure to satisfy final project originality standards, plagiarism identified, or breach of code of conduct…"
                  className="w-full rounded-xl border border-red-500/40 bg-black/50 p-3 text-xs text-white focus:border-red-400 focus:outline-none placeholder:text-red-300/40"
                />
              </div>

              {withdrawError && (
                <p className="text-xs font-semibold text-red-400">{withdrawError}</p>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWithdraw}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-red-500 active:scale-95 transition-all"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}


/* ---------------- Graduation & Certificates Tab ---------------- */

function GraduationManager({ students }: { students: Account[] }) {
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<"All" | "graduated" | "enrolled">("All");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [selectedStudent, setSelectedStudent] = useState<Account | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q));

    const matchTrack = filterTrack === "All" || s.skill === filterTrack;
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "graduated" && s.graduated) ||
      (filterStatus === "enrolled" && !s.graduated);

    return matchSearch && matchTrack && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenGraduate = (student: Account) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-pink-400">🎓</span>
            <span>Graduation & Certification Center</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[#b8aecf]">
            Issue verified certificates (Professionalism or Completion), customize honors, and manage student credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-center">
            <div className="font-display text-lg text-emerald-400 font-bold">
              {students.filter((s) => s.graduated).length}
            </div>
            <div className="text-[10px] text-[#8a7ba8] uppercase tracking-wider">Certified</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-center">
            <div className="font-display text-lg text-pink-400 font-bold">
              {students.filter((s) => !s.graduated).length}
            </div>
            <div className="text-[10px] text-[#8a7ba8] uppercase tracking-wider">Enrolled</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar — Zero Dropdown Arrows */}
      <div className="mt-6 space-y-3">
        <div className="relative">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a7ba8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search students by name, KR8 ID, or email..."
            className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#8a7ba8] mr-1">Status:</span>
            {(["All", "enrolled", "graduated"] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setFilterStatus(st);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? "bg-pink-600/30 text-pink-300 border border-pink-500/40"
                    : "text-[#a594c7] hover:bg-white/5 border border-transparent"
                }`}
              >
                {st === "All" ? "All Students" : st === "graduated" ? "🎓 Certified Only" : "🌱 Active Enrolled"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#8a7ba8] mr-1">Track:</span>
            {["All", "graphic", "web", "video"].map((tr) => (
              <button
                key={tr}
                onClick={() => {
                  setFilterTrack(tr);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  filterTrack === tr
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                    : "text-[#a594c7] hover:bg-white/5 border border-transparent"
                }`}
              >
                {tr === "All" ? "All Tracks" : getSkillName(tr)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Student List View — Interactive Cards */}
      <div className="mt-6 space-y-2.5">
        {paginated.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-xs text-[#8a7ba8]">
            No students found matching your search and filter criteria.
          </div>
        ) : (
          paginated.map((s) => (
            <div
              key={s.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-3.5 sm:p-4 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-gradient-pink flex items-center justify-center font-display text-base font-bold text-white shrink-0">
                  {s.avatar ? (
                    <img src={s.avatar} alt={s.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    s.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm truncate">{s.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.graduated
                          ? "bg-em-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-pink-500/10 text-pink-300 border border-pink-500/20"
                      }`}
                    >
                      {s.graduated ? `🎓 Certified (${s.certTier ?? "Completion"})` : "🌱 Active"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#8a7ba8]">
                    <span className="font-mono text-pink-400 font-semibold">{s.id}</span>
                    <span>•</span>
                    <span>{getSkillName(s.skill)}</span>
                    <span>•</span>
                    <span>{s.points || 0} XP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={() => handleOpenGraduate(s)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    s.graduated
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      : "bg-gradient-pink text-white shadow-md shadow-pink-500/20 hover:opacity-90"
                  }`}
                >
                  <span>{s.graduated ? "Manage Certificate 📜" : "Graduate Student 🎓"}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#8a7ba8]">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} students
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
            >
              Previous
            </button>
            <span className="px-2 text-white font-semibold">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {modalOpen && selectedStudent && (
        <GraduationModal
          student={selectedStudent}
          onClose={() => setModalOpen(false)}
          onGraduated={() => {
            window.dispatchEvent(new Event("kr8:accounts-updated"));
          }}
        />
      )}
    </Card>
  );
}

/* ---------------- Verify Remarks Manager ---------------- */

function VerifyRemarksManager({ students }: { students: Account[] }) {
  const [selId, setSelId] = useState(students[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const selectedStudent = students.find((s) => s.id === selId) || students[0];
  const [remark, setRemark] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selectedStudent) {
      setRemark(selectedStudent.verifyRemark || "");
    }
  }, [selId, selectedStudent]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

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

      <div className="mt-5 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#b8aecf]">
          Select Student for Verification Remark
        </label>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search student by name or ID (e.g. KR8-2026)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-9 pr-7 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-[#8a7ba8]">
            <Icon name="search" size={14} />
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2 text-xs text-[#8a7ba8] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Scrollable Student Roster Picker - Scalable & No Native Arrows */}
        <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-white/10 bg-black/30 p-2">
          {filteredStudents.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#8a7ba8]">No matching students found</div>
          ) : (
            filteredStudents.slice(0, 40).map((s) => {
              const isSelected = s.id === selectedStudent?.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelId(s.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                    isSelected
                      ? "bg-pink-500/20 text-white border border-pink-500/40 font-bold"
                      : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-pink-300 shrink-0">{s.id}</span>
                    <span className="truncate">{s.name}</span>
                  </div>
                  {s.verifyRemark && (
                    <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full shrink-0">
                      Has Remark
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {selectedStudent && (
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="text-[#8a7ba8]">Active Student: </span>
              <strong className="text-white">{selectedStudent.name}</strong>{" "}
              <span className="text-pink-300 font-mono">({selectedStudent.id})</span>
            </div>
          </div>
        )}
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

function AttendancePanel({ initialUnlocked = false }: { initialUnlocked?: boolean }) {
  const [pw, setPw] = useState("");
  const [ok, setOk] = useState(initialUnlocked);
  const [err, setErr] = useState(false);
  const [students, setStudents] = useState<Account[]>(getStudents);
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setStudents(getStudents());
    window.addEventListener("kr8:accounts-updated", refresh);
    return () => window.removeEventListener("kr8:accounts-updated", refresh);
  }, []);

  if (!ok) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <h3 className="flex items-center gap-2 font-bold text-white text-base">
          <Icon name="lock" size={18} /> Attendance Review Access
        </h3>
        <p className="mt-1 text-xs text-[#b8aecf]">
          Quarantined Reviewer access. Enter your attendance review password.
        </p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (pw === ATTENDANCE_PW ? setOk(true) : setErr(true))}
          placeholder="Attendance review password"
          className="mt-4 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-xs text-white focus:border-pink-400/60 focus:outline-none"
        />
        {err && <p className="mt-2 text-xs text-rose-400">Incorrect password.</p>}
        <button
          onClick={() => (pw === ATTENDANCE_PW ? setOk(true) : setErr(true))}
          className="mt-3 w-full rounded-full bg-gradient-pink py-2.5 text-xs font-bold text-white"
        >
          Unlock Review Portal
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

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.skill || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] border border-white/10 rounded-2xl p-4">
        <div>
          <h2 className="font-display font-bold text-lg text-white">Attendance Queue & Verification</h2>
          <p className="text-xs text-[#8a7ba8]">
            Review class and hangout attendance logs. Approving awards verified XP to student profiles.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7ba8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students or track..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#8a7ba8] focus:border-pink-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {ATTENDANCE_TYPES.map((t) => (
          <Card key={t.key} className="p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">{t.name}</h3>
                <span className="text-[11px] text-[#8a7ba8]">Standard requirement: 80% attendance</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Open for Review
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {filteredStudents.slice(0, 10).map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/30 border border-white/5 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-[11px] text-[#8a7ba8]">
                        <span className="font-mono text-purple-300">{s.id}</span> · Track: <span className="text-[#cabfe0]">{s.skill || "General"}</span> · Verified: <strong className="text-emerald-400">{s.attendanceAccepted || 0} sessions</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {feedback[`${t.name}-${s.id}`] ? (
                      <span className="text-emerald-400 font-semibold text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        {feedback[`${t.name}-${s.id}`]}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => approve(s, t.name)}
                          className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                        >
                          Approve (+10 pts)
                        </button>
                        <button
                          onClick={() => setFeedback((p) => ({ ...p, [`${t.name}-${s.id}`]: "Rejected" }))}
                          className="rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-rose-300 hover:bg-rose-500/30 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-6 text-xs text-[#8a7ba8]">
                  No students found matching "{search}".
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
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
  const [rules, setRules] = useState<XpRule[]>(() => getXpRules());
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // New Rule Form State
  const [showAddRule, setShowAddRule] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [newPts, setNewPts] = useState<number>(20);
  const [newCategory, setNewCategory] = useState<XpRule["category"]>("community");
  const [newDesc, setNewDesc] = useState("");

  // Direct Student XP Awarding State
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [manualXpAmount, setManualXpAmount] = useState<number>(50);
  const [manualReason, setManualReason] = useState("");
  const [awardFeedback, setAwardFeedback] = useState<string | null>(null);

  const students = getStudents();
  const filteredStudents = studentSearch.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
          (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))
      )
    : [];

  const targetStudent = students.find((s) => s.id === selectedStudentId);

  const handleUpdateRulePts = (id: string, pts: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, pts } : r)));
  };

  const handleSaveRules = () => {
    saveXpRules(rules);
    setSavedMsg("XP Rules & Allocation values saved and activated across the platform!");
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAction.trim()) return;
    const rule: XpRule = {
      id: `xp-rule-${Date.now()}`,
      action: newAction.trim(),
      pts: Number(newPts) || 10,
      category: newCategory,
      description: newDesc.trim() || undefined,
    };
    const next = [...rules, rule];
    setRules(next);
    saveXpRules(next);
    setNewAction("");
    setNewPts(20);
    setNewDesc("");
    setShowAddRule(false);
    setSavedMsg("New XP Rule added successfully!");
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const handleDeleteRule = (id: string, action: string) => {
    if (confirm(`Are you sure you want to delete the rule "${action}"?`)) {
      const next = rules.filter((r) => r.id !== id);
      setRules(next);
      saveXpRules(next);
      setSavedMsg(`Rule "${action}" deleted.`);
      setTimeout(() => setSavedMsg(null), 3500);
    }
  };

  const handleAwardStudentXp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setAwardFeedback("Please search and select a student first.");
      return;
    }
    const amount = Number(manualXpAmount);
    if (isNaN(amount) || amount === 0) {
      setAwardFeedback("Please enter a non-zero XP amount.");
      return;
    }

    const currentPoints = targetStudent?.points || 0;
    const newTotal = Math.max(0, currentPoints + amount);

    updateAccount(selectedStudentId, { points: newTotal });
    setAwardFeedback(
      `✓ Successfully ${amount >= 0 ? "awarded" : "deducted"} ${Math.abs(amount)} XP ${
        amount >= 0 ? "to" : "from"
      } ${targetStudent?.name}! New balance: ${newTotal} XP.`
    );
    setTimeout(() => setAwardFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-pink-400">⚡</span>
              <span>Leaderboard & Gamification XP Rules</span>
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#b8aecf]">
              Configure system-wide XP weights awarded to students for verifiable academic and community achievements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddRule(!showAddRule)}
              className="rounded-xl border border-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-all"
            >
              {showAddRule ? "Cancel" : "+ Add XP Rule"}
            </button>
            <button
              onClick={handleSaveRules}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all"
            >
              <Icon name="check" size={14} />
              <span>Save & Publish XP Rules</span>
            </button>
          </div>
        </div>

        {savedMsg && (
          <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300">
            ✓ {savedMsg}
          </div>
        )}

        {/* Add New Rule Form */}
        {showAddRule && (
          <form onSubmit={handleAddRule} className="mt-6 rounded-2xl border border-pink-500/30 bg-black/40 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-300">Create New XP Milestone Rule</h4>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Action / Trigger Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass Participation"
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Points (+XP)</label>
                <input
                  type="number"
                  required
                  value={newPts}
                  onChange={(e) => setNewPts(parseInt(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  placeholder="community"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Description</label>
                <input
                  type="text"
                  placeholder="Brief criteria for awarding this XP..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20"
              >
                Save New Milestone
              </button>
            </div>
          </form>
        )}

        {/* List of Rules */}
        <div className="mt-6 space-y-2.5">
          {rules.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-3.5 sm:p-4 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{item.action}</h4>
                  <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-[10px] font-semibold text-pink-300 uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1 text-xs text-[#8a7ba8] leading-relaxed">{item.description}</p>
                )}
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#8a7ba8]">Points:</span>
                  <input
                    type="number"
                    value={item.pts}
                    onChange={(e) => handleUpdateRulePts(item.id, parseInt(e.target.value) || 0)}
                    className="w-20 rounded-lg border border-white/15 bg-black/50 px-2.5 py-1 text-xs font-mono font-bold text-pink-300 text-center focus:border-pink-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-pink-400">XP</span>
                </div>

                {item.id.startsWith("xp-rule-") && (
                  <button
                    onClick={() => handleDeleteRule(item.id, item.action)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-bold"
                    title="Delete custom rule"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MANUAL STUDENT XP ALLOCATION TOOL */}
      <Card>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span className="text-amber-400">🎖️</span>
          <span>Manual Student XP Award / Adjustment</span>
        </h3>
        <p className="mt-1 text-xs text-[#b8aecf]">
          Directly recognize high-achieving creators, community contributors, or adjust student XP balances on the official Leaderboard.
        </p>

        <form onSubmit={handleAwardStudentXp} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-[#8a7ba8]">1. Search Student (Name or KR8-ID)</label>
              <input
                type="text"
                placeholder="Type student name or ID..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
              />
              {filteredStudents.length > 0 && (
                <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-black/80 p-1.5 space-y-1">
                  {filteredStudents.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudentId(s.id);
                        setStudentSearch(`${s.name} (${s.id})`);
                      }}
                      className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        selectedStudentId === s.id
                          ? "bg-pink-600/30 text-white font-bold"
                          : "text-[#cabfe0] hover:bg-white/10"
                      }`}
                    >
                      <span>{s.name} <span className="font-mono text-pink-400">({s.id})</span></span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">{s.points || 0} XP</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8a7ba8]">2. Points to Award / Adjust</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  value={manualXpAmount}
                  onChange={(e) => setManualXpAmount(parseInt(e.target.value) || 0)}
                  placeholder="+50"
                  className="w-32 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-mono font-bold text-pink-300 focus:border-pink-500 focus:outline-none"
                />
                <div className="flex gap-1.5">
                  {[25, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setManualXpAmount(amt)}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-mono text-pink-300 hover:bg-white/10"
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Outstanding project presentation"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {targetStudent && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center justify-between text-xs">
              <span className="text-[#a594c7]">Selected Student: <strong className="text-white">{targetStudent.name}</strong></span>
              <span className="text-white">Current Balance: <strong className="font-mono text-pink-400">{targetStudent.points || 0} XP</strong></span>
            </div>
          )}

          {awardFeedback && (
            <div className="rounded-xl bg-pink-500/20 border border-pink-500/30 px-3.5 py-2 text-xs font-semibold text-pink-200">
              {awardFeedback}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!selectedStudentId}
              className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95"
            >
              Award Points Directly →
            </button>
          </div>
        </form>
      </Card>
    </div>
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
  const [managingCurriculum, setManagingCurriculum] = useState(false);

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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
        <div className="flex-1 min-w-[240px]">
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-xs text-[#cabfe0] focus:border-pink-400/60 focus:outline-none"
            placeholder="Skill WhatsApp group link"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#8a7ba8]">
            Curriculum: {skill.curriculum?.length ? `${skill.curriculum.length} weeks` : "None uploaded"}
          </span>
          <button
            type="button"
            onClick={() => setManagingCurriculum(true)}
            className="rounded-lg border border-pink-500/40 bg-pink-500/15 px-3 py-2 text-xs font-bold text-pink-300 hover:bg-pink-500/30 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>📖 Manage Curriculum</span>
          </button>
        </div>
      </div>

      {saved && (
        <p className="mt-2 text-xs text-green-300 font-semibold">
          ✓ Track settings saved and updated across the site.
        </p>
      )}

      {managingCurriculum && (
        <CurriculumManagerModal
          skill={skill}
          onClose={() => setManagingCurriculum(false)}
          onSave={() => {
            onUpdate();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        />
      )}
    </Card>
  );
}

function CurriculumManagerModal({
  skill,
  onClose,
  onSave,
}: {
  skill: Skill;
  onClose: () => void;
  onSave: () => void;
}) {
  const [weeks, setWeeks] = useState<Week[]>(() =>
    skill.curriculum && skill.curriculum.length > 0 ? JSON.parse(JSON.stringify(skill.curriculum)) : []
  );
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddWeek = () => {
    const nextNum = weeks.length + 1;
    setWeeks([
      ...weeks,
      {
        week: `Week ${nextNum}`,
        title: "",
        points: ["Key concepts & fundamentals", "Hands-on project work"],
      },
    ]);
  };

  const handleUpdateWeekTitle = (idx: number, title: string) => {
    const updated = [...weeks];
    updated[idx].title = title;
    setWeeks(updated);
  };

  const handleUpdateWeekLabel = (idx: number, label: string) => {
    const updated = [...weeks];
    updated[idx].week = label;
    setWeeks(updated);
  };

  const handleUpdatePointsText = (idx: number, text: string) => {
    const updated = [...weeks];
    updated[idx].points = text.split("\n").map((p) => p.trim()).filter(Boolean);
    setWeeks(updated);
  };

  const handleDeleteWeek = (idx: number) => {
    setWeeks(weeks.filter((_, i) => i !== idx));
  };

  const handleInitTemplate = () => {
    const template: Week[] = Array.from({ length: 8 }, (_, i) => ({
      week: `Week ${i + 1}`,
      title: i === 0 ? `${skill.name} Foundations & Tooling Setup` : i === 7 ? "Final Capstone Project & Portfolio Defense" : `Module ${i + 1}: Core Techniques`,
      points: [
        `Core concept ${i + 1}.1`,
        `Practical exercise ${i + 1}.2`,
        `Weekly real-world project deliverable`,
      ],
    }));
    setWeeks(template);
  };

  const handleApplyJson = () => {
    setJsonError("");
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error("Curriculum must be a JSON array of weeks");
      }
      for (const w of parsed) {
        if (!w.week || !w.title || !Array.isArray(w.points)) {
          throw new Error("Each week must have 'week', 'title', and an array of 'points'");
        }
      }
      setWeeks(parsed);
      setJsonMode(false);
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON format");
    }
  };

  const handleSave = () => {
    saveDynamicCurriculum(skill.key, weeks);
    setSaveSuccess(true);
    onSave();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-pink-500/40 bg-gradient-to-b from-[#180026] to-[#0a0012] p-6 sm:p-8 shadow-2xl my-6">
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-300">
              Curriculum Manager
            </span>
            <h3 className="font-display text-2xl font-bold text-white mt-1">
              Manage Curriculum: <span className="text-pink-400">{skill.name}</span>
            </h3>
            <p className="text-xs text-[#a594c7] mt-0.5">
              Add, update, replace, or restructure the weekly learning syllabus for this skill.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-xs"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!jsonMode) {
                  setJsonText(JSON.stringify(weeks, null, 2));
                }
                setJsonMode(!jsonMode);
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
            >
              {jsonMode ? "Switch to Visual Editor" : "Import / Export JSON"}
            </button>
            {weeks.length === 0 && !jsonMode && (
              <button
                type="button"
                onClick={handleInitTemplate}
                className="rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 transition-all"
              >
                + Initialize 8-Week Template
              </button>
            )}
          </div>
          <span className="text-xs text-[#8a7ba8] font-mono">
            {weeks.length} Week{weeks.length === 1 ? "" : "s"} Configured
          </span>
        </div>

        {jsonMode ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-[#cabfe0]">
              Paste a JSON array representing weeks, or copy the current curriculum below:
            </p>
            {jsonError && (
              <p className="text-xs text-red-400 font-semibold">{jsonError}</p>
            )}
            <textarea
              rows={12}
              className="w-full rounded-2xl border border-white/15 bg-black/60 p-4 font-mono text-xs text-pink-200 focus:border-pink-500 focus:outline-none resize-none"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJsonMode(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyJson}
                className="rounded-xl bg-pink-600 px-4 py-2 text-xs font-bold text-white hover:bg-pink-500 shadow-md"
              >
                Apply JSON to Curriculum
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {weeks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center space-y-2">
                <span className="text-3xl">📭</span>
                <p className="text-sm font-semibold text-white">No Curriculum Uploaded Yet</p>
                <p className="text-xs text-[#8a7ba8] max-w-sm mx-auto">
                  This skill currently has no active syllabus. You can build it week-by-week or initialize an 8-week starter outline.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddWeek}
                    className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110"
                  >
                    + Add Week 1
                  </button>
                </div>
              </div>
            ) : (
              weeks.map((w, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={w.week}
                        onChange={(e) => handleUpdateWeekLabel(idx, e.target.value)}
                        className="w-24 rounded-lg border border-pink-500/40 bg-pink-500/10 px-2.5 py-1 text-xs font-bold text-pink-300 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Week Topic / Title (e.g. Modern CSS & Tailwind Frameworks)"
                        value={w.title}
                        onChange={(e) => handleUpdateWeekTitle(idx, e.target.value)}
                        className="flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-1 text-xs font-semibold text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWeek(idx)}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-500/20"
                      title="Remove week"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#8a7ba8] mb-1">
                      Learning Outcomes & Practice Deliverables (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={w.points.join("\n")}
                      onChange={(e) => handleUpdatePointsText(idx, e.target.value)}
                      placeholder="Intro to semantic markup&#10;Flexbox and CSS Grid layout algorithms&#10;Hands-on landing page clone"
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-[#cabfe0] focus:border-pink-500 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>
              ))
            )}

            {weeks.length > 0 && (
              <button
                type="button"
                onClick={handleAddWeek}
                className="w-full rounded-2xl border border-dashed border-white/20 bg-white/[0.02] py-3 text-xs font-bold text-pink-300 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all text-center"
              >
                + Add Another Week
              </button>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-bold animate-pulse">
                ✓ Curriculum Saved!
              </span>
            )}
            <GradientButton onClick={handleSave} className="px-6 py-2 shadow-lg shadow-pink-500/25">
              <span>Save & Publish Curriculum →</span>
            </GradientButton>
          </div>
        </div>
      </div>
    </div>,
    document.body
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
  const [items, setItems] = useState(() => getPortfolio());
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<(typeof items)[number] | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formClient, setFormClient] = useState("");
  const [formService, setFormService] = useState("Graphic Design");
  const [formDescription, setFormDescription] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formShowPrice, setFormShowPrice] = useState(false);
  const [formImg, setFormImg] = useState("");

  const categories = ["All", "Graphic Design", "Web Development", "Video Editing", "Brand Identity", "Motion Graphics"];

  const filtered = items.filter((p) => {
    const matchCat = filterCategory === "All" || p.service === filterCategory;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.service.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormClient("");
    setFormService("Graphic Design");
    setFormDescription("");
    setFormLink("");
    setFormPrice("");
    setFormShowPrice(false);
    setFormImg("");
    setShowModal(true);
  };

  const handleOpenEdit = (item: (typeof items)[number]) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormClient(item.client);
    setFormService(item.service);
    setFormDescription(item.description);
    setFormLink(item.link || "");
    setFormPrice(item.price || "");
    setFormShowPrice(!!item.showPrice);
    setFormImg(item.img || "");
    setShowModal(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClient.trim()) return;

    if (editingItem) {
      const updated = items.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              title: formTitle.trim(),
              client: formClient.trim(),
              service: formService,
              description: formDescription.trim(),
              link: formLink.trim(),
              price: formPrice.trim(),
              showPrice: formShowPrice,
              img: formImg.trim() || p.img,
            }
          : p
      );
      setItems(updated);
      savePortfolio(updated);
      setStatusMsg(`Updated project "${formTitle}" successfully!`);
    } else {
      const newProj = {
        id: `port-${Date.now()}`,
        title: formTitle.trim(),
        client: formClient.trim(),
        service: formService,
        description: formDescription.trim(),
        link: formLink.trim(),
        price: formPrice.trim(),
        showPrice: formShowPrice,
        img: formImg.trim() || "/branding/kr8_logo.png",
        placeholder: false,
      };
      const updated = [newProj, ...items];
      setItems(updated);
      savePortfolio(updated);
      setStatusMsg(`Added new agency project "${formTitle}" successfully!`);
    }

    setShowModal(false);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}" from the agency portfolio?`)) {
      const updated = items.filter((p) => p.id !== id);
      setItems(updated);
      savePortfolio(updated);
      setStatusMsg(`Deleted project "${title}".`);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFormImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-pink-400">💼</span>
            <span>Agency Portfolio Manager</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-[#b8aecf]">
            Create, edit, showcase, and manage real commercial client deliverables shipped by KR8 graduate teams.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-pink px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-90 self-start sm:self-auto transition-all"
        >
          <span>+ Add New Project</span>
        </button>
      </div>

      {statusMsg && (
        <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300">
          ✓ {statusMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-6 space-y-3">
        <div className="relative">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a7ba8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by client, title, category, or keyword..."
            className="w-full rounded-xl border border-white/15 bg-black/40 pl-10 pr-4 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                filterCategory === c
                  ? "bg-pink-600/30 text-pink-300 border border-pink-500/40"
                  : "text-[#a594c7] hover:bg-white/5 border border-transparent"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] hover:border-pink-500/30 hover:bg-white/[0.04] p-4 transition-all"
          >
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/40 border border-white/10">
                <img
                  src={item.img || "/branding/kr8_logo.png"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-2 right-2 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-pink-300 border border-pink-500/30">
                  {item.service}
                </span>
              </div>

              <h4 className="mt-3 font-bold text-white text-sm">{item.title}</h4>
              <p className="text-xs text-pink-400 font-medium">{item.client}</p>
              <p className="mt-2 text-xs text-[#a594c7] line-clamp-3 leading-relaxed">{item.description}</p>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[11px] font-semibold text-emerald-400 hover:underline"
                >
                  View Live Asset ↗
                </a>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleOpenEdit(item)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id, item.title)}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-pink-500/30 bg-[#160d24] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">
                {editingItem ? `Edit Project: ${editingItem.title}` : "Add New Agency Deliverable"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-[#8a7ba8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Luxury Brand Identity & Packaging"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                    Client / Organization
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                    Service Category
                  </label>
                  <input
                    type="text"
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    placeholder="e.g. Graphic Design, Web Development"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Project Description & Deliverables
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain what the KR8 team executed, client results, and techniques..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Live Project / Case Study Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Featured Thumbnail Image (URL or Upload File)
                </label>
                <input
                  type="text"
                  placeholder="Paste image URL (https://...)"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="block w-full text-xs text-[#a594c7] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                />
              </div>

              {formImg && (
                <div className="aspect-video w-32 rounded-xl overflow-hidden border border-white/15 bg-black/50">
                  <img src={formImg} alt="Preview" className="h-full w-full object-cover" />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-[#cabfe0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-95"
                >
                  {editingItem ? "Save Project Changes" : "Publish to Agency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
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
  const [founders, setFounders] = useState<FounderProfile[]>(() => getFounders());
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFounder, setNewFounder] = useState({ name: "", role: "", bio: "", photo: "" });

  useEffect(() => {
    const sync = () => setFounders(getFounders());
    window.addEventListener("kr8:founders-updated", sync);
    return () => window.removeEventListener("kr8:founders-updated", sync);
  }, []);

  const update = (key: string, patch: Partial<FounderProfile>) => {
    setFounders((all) => all.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  };

  const handleSaveAll = () => {
    saveFounders(founders);
    setSavedMsg("Executive founders updated and published live!");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleAddFounder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFounder.name.trim() || !newFounder.role.trim()) return;
    const key = newFounder.name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
    const added: FounderProfile = {
      key,
      name: newFounder.name.trim(),
      role: newFounder.role.trim(),
      bio: newFounder.bio.trim() || "Executive Leader at KR8 Digitals.",
      photo: newFounder.photo.trim() || "/branding/kr8_logo.png",
    };
    const next = [...founders, added];
    setFounders(next);
    saveFounders(next);
    setNewFounder({ name: "", role: "", bio: "", photo: "" });
    setShowAddModal(false);
    setSavedMsg("New executive leader added successfully!");
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleDeleteFounder = (key: string, name: string) => {
    if (founders.length <= 1) {
      alert("Cannot delete the only executive founder.");
      return;
    }
    if (confirm(`Are you sure you want to remove ${name} from executive founders?`)) {
      const next = founders.filter((f) => f.key !== key);
      setFounders(next);
      saveFounders(next);
      setSavedMsg(`Removed ${name} from executive founders.`);
      setTimeout(() => setSavedMsg(null), 3000);
    }
  };

  const handlePhotoUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      update(key, { photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="text-amber-400">👑</span>
            <span>Founders & Executive Council</span>
          </h3>
          <p className="mt-1 text-xs text-[#b8aecf]">
            Directly edit names, executive roles, biographies, and portraits of the founding team.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-all"
          >
            + Add Executive
          </button>
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:opacity-90 transition-all"
          >
            <Icon name="check" size={14} />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-300">
          ✓ {savedMsg}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {founders.map((f) => (
          <div key={f.key} className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-black/50 border border-white/15 overflow-hidden shrink-0">
                  <img src={f.photo || "/branding/kr8_logo.png"} alt={f.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{f.name}</h4>
                  <p className="text-xs text-pink-400 font-semibold">{f.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleDeleteFounder(f.key, f.name)}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Full Name</label>
                <input
                  value={f.name}
                  onChange={(e) => update(f.key, { name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Role / Title</label>
                <input
                  value={f.role}
                  onChange={(e) => update(f.key, { role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Biography / Mission Statement</label>
                <textarea
                  rows={2}
                  value={f.bio}
                  onChange={(e) => update(f.key, { bio: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Photo URL or Upload</label>
                <div className="mt-1 flex flex-col sm:flex-row gap-2">
                  <input
                    value={f.photo}
                    onChange={(e) => update(f.key, { photo: e.target.value })}
                    placeholder="Photo URL (https://...)"
                    className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handlePhotoUpload(f.key, e.target.files[0])}
                    className="block text-xs text-[#a594c7] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-pink-500/30 bg-[#170e24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Add New Executive Council Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8a7ba8] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddFounder} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Full Name</label>
                <input
                  required
                  placeholder="e.g. Kenneth Timothy Iziogo"
                  value={newFounder.name}
                  onChange={(e) => setNewFounder({ ...newFounder, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Executive Role</label>
                <input
                  required
                  placeholder="e.g. Co-Founder · Head of Creative Technology"
                  value={newFounder.role}
                  onChange={(e) => setNewFounder({ ...newFounder, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Biography</label>
                <textarea
                  rows={2}
                  placeholder="Leadership background and focus..."
                  value={newFounder.bio}
                  onChange={(e) => setNewFounder({ ...newFounder, bio: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Photo URL</label>
                <input
                  placeholder="https://..."
                  value={newFounder.photo}
                  onChange={(e) => setNewFounder({ ...newFounder, photo: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-white/15 px-3.5 py-2 text-xs font-semibold text-[#cabfe0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20"
                >
                  Save Executive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

function TeamManager() {
  const [team, setTeam] = useState<TeamProfile[]>(() => getTeam());
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", bio: "", photo: "" });

  useEffect(() => {
    const sync = () => setTeam(getTeam());
    window.addEventListener("kr8:team-updated", sync);
    return () => window.removeEventListener("kr8:team-updated", sync);
  }, []);

  const update = (key: string, patch: Partial<TeamProfile>) => {
    setTeam((all) => all.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  };

  const handleSaveAll = () => {
    saveTeam(team);
    setSavedMsg("Leadership Team updated and published live across the site!");
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.role.trim()) return;
    const key = newMember.name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);
    const added: TeamProfile = {
      key,
      name: newMember.name.trim(),
      role: newMember.role.trim(),
      bio: newMember.bio.trim() || "Leadership member at KR8 Digitals.",
      photo: newMember.photo.trim() || "/branding/kr8_logo.png",
    };
    const next = [...team, added];
    setTeam(next);
    saveTeam(next);
    setNewMember({ name: "", role: "", bio: "", photo: "" });
    setShowAddModal(false);
    setSavedMsg(`Added ${added.name} to the Leadership Team!`);
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const handleDeleteMember = (key: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the leadership team?`)) {
      const next = team.filter((m) => m.key !== key);
      setTeam(next);
      saveTeam(next);
      setSavedMsg(`Removed ${name} from leadership team.`);
      setTimeout(() => setSavedMsg(null), 3500);
    }
  };

  const handlePhotoUpload = (key: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      update(key, { photo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleNewPhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setNewMember((prev) => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span className="text-purple-400">🛡️</span>
            <span>Core Leadership Team Manager</span>
          </h3>
          <p className="mt-1 text-xs text-[#b8aecf]">
            Fully editable leadership registry: add new leaders, update roles, edit bios, upload portraits, and expand your team.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-all"
          >
            <span>+ Add Team Member</span>
          </button>
          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 hover:opacity-90 transition-all"
          >
            <Icon name="check" size={14} />
            <span>Save & Publish Live</span>
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-300">
          ✓ {savedMsg}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {team.map((m) => (
          <div key={m.key} className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-black/50 border border-white/15 overflow-hidden shrink-0">
                  <img src={m.photo || "/branding/kr8_logo.png"} alt={m.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{m.name}</h4>
                  <p className="text-xs text-pink-400 font-semibold">{m.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleDeleteMember(m.key, m.name)}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-white/5">
              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Full Name</label>
                <input
                  value={m.name}
                  onChange={(e) => update(m.key, { name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Role / Strategic Title</label>
                <input
                  value={m.role}
                  onChange={(e) => update(m.key, { role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Biography / Responsibilities</label>
                <textarea
                  rows={2}
                  value={m.bio}
                  onChange={(e) => update(m.key, { bio: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Portrait (URL or Direct Upload)</label>
                <div className="mt-1 flex flex-col sm:flex-row gap-2">
                  <input
                    value={m.photo}
                    onChange={(e) => update(m.key, { photo: e.target.value })}
                    placeholder="Portrait URL (https://... or /team/...)"
                    className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handlePhotoUpload(m.key, e.target.files[0])}
                    className="block text-xs text-[#a594c7] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-pink-500/30 bg-[#170e24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-white text-base">Add New Leadership Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#8a7ba8] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Full Name</label>
                <input
                  required
                  placeholder="e.g. Chimnonyerem Mercy"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Strategic Role</label>
                <input
                  required
                  placeholder="e.g. Project Director & Frontend Coach"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Biography / Responsibilities</label>
                <textarea
                  rows={2}
                  placeholder="Responsibilities and contributions..."
                  value={newMember.bio}
                  onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8a7ba8]">Portrait Image (URL or File Upload)</label>
                <input
                  placeholder="https://... or /team/..."
                  value={newMember.photo}
                  onChange={(e) => setNewMember({ ...newMember, photo: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none mb-1.5"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleNewPhotoUpload(e.target.files[0])}
                  className="block w-full text-xs text-[#a594c7] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-white/10 file:text-white cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-white/15 px-3.5 py-2 text-xs font-semibold text-[#cabfe0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20"
                >
                  Save & Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts());
  const [activeTab, setActiveTab] = useState<"moderators" | "safety" | "restrictions">("moderators");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [moderatorRoleTitle, setModeratorRoleTitle] = useState("Community Moderator");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Safety settings stored in localStorage
  const [autoFilter, setAutoFilter] = useState(() => localStorage.getItem("kr8_mod_autofilter") !== "false");
  const [strictAntiSpam, setStrictAntiSpam] = useState(() => localStorage.getItem("kr8_mod_antispam") === "true");

  useEffect(() => {
    const sync = () => setAccounts(getAccounts());
    window.addEventListener("kr8:accounts-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kr8:accounts-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const moderators = accounts.filter((a) => !!a.isModerator || a.moderatorRole);
  const restrictedAccounts = accounts.filter((a) => !!a.restricted);
  const suspendedAccounts = getSuspendedAccounts();

  const studentsToPromote = studentSearch.trim()
    ? accounts.filter(
        (a) =>
          (a.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            a.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
            (a.email && a.email.toLowerCase().includes(studentSearch.toLowerCase()))) &&
          !a.isModerator
      )
    : [];

  const handlePromoteStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setStatusMsg("Please search and select a student to promote.");
      return;
    }
    const student = accounts.find((a) => a.id === selectedStudentId);
    if (!student) return;

    updateAccount(selectedStudentId, {
      isModerator: true,
      moderatorRole: moderatorRoleTitle.trim() || "Community Moderator",
      moderatorAssignedAt: Date.now(),
    });

    setStatusMsg(`✓ Successfully promoted ${student.name} (${student.id}) to ${moderatorRoleTitle}!`);
    setSelectedStudentId("");
    setStudentSearch("");
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleRevokeModerator = (student: Account) => {
    if (confirm(`Are you sure you want to revoke moderation privileges from ${student.name}?`)) {
      updateAccount(student.id, {
        isModerator: false,
        moderatorRole: undefined,
        moderatorAssignedAt: undefined,
      });
      setStatusMsg(`Moderator privileges revoked for ${student.name}.`);
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const handleUnrestrict = (student: Account) => {
    updateAccount(student.id, {
      restricted: false,
    });
    setStatusMsg(`Account restrictions removed for ${student.name}.`);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleRestoreSuspended = (id: string, name: string) => {
    restoreSuspendedAccount(id);
    setStatusMsg(`Restored deleted account for ${name} (${id})!`);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  const handleToggleAutoFilter = () => {
    const next = !autoFilter;
    setAutoFilter(next);
    localStorage.setItem("kr8_mod_autofilter", String(next));
  };

  const handleToggleAntiSpam = () => {
    const next = !strictAntiSpam;
    setStrictAntiSpam(next);
    localStorage.setItem("kr8_mod_antispam", String(next));
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-pink-400">🛡️</span>
              <span>Community Moderation & Safety Center</span>
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#b8aecf]">
              Appoint student moderators, manage community safety guidelines, and oversee account restrictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
              {moderators.length} Active Moderators
            </span>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs font-semibold text-emerald-300">
            {statusMsg}
          </div>
        )}

        {/* Tab Selection */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("moderators")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "moderators"
                ? "bg-pink-600/30 text-pink-300 border border-pink-500/40"
                : "text-[#a594c7] hover:bg-white/5 border border-transparent"
            }`}
          >
            Appointed Moderators ({moderators.length})
          </button>
          <button
            onClick={() => setActiveTab("restrictions")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "restrictions"
                ? "bg-pink-600/30 text-pink-300 border border-pink-500/40"
                : "text-[#a594c7] hover:bg-white/5 border border-transparent"
            }`}
          >
            Flagged & Restricted Accounts ({restrictedAccounts.length})
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "safety"
                ? "bg-pink-600/30 text-pink-300 border border-pink-500/40"
                : "text-[#a594c7] hover:bg-white/5 border border-transparent"
            }`}
          >
            Safety Protocols & Auto-Filters
          </button>
        </div>

        {/* TAB 1: APPOINTED MODERATORS */}
        {activeTab === "moderators" && (
          <div className="mt-6 space-y-6">
            {/* Promotion Form */}
            <div className="rounded-2xl border border-pink-500/30 bg-black/40 p-4 sm:p-5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-pink-400">✦</span>
                <span>Promote a Student to Community Moderator</span>
              </h4>
              <p className="mt-1 text-xs text-[#a594c7]">
                Empower trusted scholars to moderate community chat, forum discussions, live streams, and review reports.
              </p>

              <form onSubmit={handlePromoteStudent} className="mt-4 grid gap-3 sm:grid-cols-2 items-end">
                <div>
                  <label className="text-[11px] font-semibold text-[#8a7ba8]">1. Search Student to Promote</label>
                  <input
                    type="text"
                    placeholder="Search by student name, ID or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                  />
                  {studentsToPromote.length > 0 && (
                    <div className="mt-2 max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-black/90 p-1.5 space-y-1">
                      {studentsToPromote.slice(0, 6).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(s.id);
                            setStudentSearch(`${s.name} (${s.id})`);
                          }}
                          className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between ${
                            selectedStudentId === s.id
                              ? "bg-pink-600/30 text-white font-bold"
                              : "text-[#cabfe0] hover:bg-white/10"
                          }`}
                        >
                          <span>{s.name} <span className="font-mono text-pink-400">({s.id})</span></span>
                          <span className="text-[10px] text-[#8a7ba8]">{s.email || "Student"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#8a7ba8]">2. Moderator Title / Role</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="text"
                      value={moderatorRoleTitle}
                      onChange={(e) => setModeratorRoleTitle(e.target.value)}
                      placeholder="e.g. Community Moderator"
                      className="flex-1 rounded-xl border border-white/15 bg-black/50 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!selectedStudentId}
                      className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-md shadow-pink-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 shrink-0"
                    >
                      Promote to Moderator
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Current Moderator Roster */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#b8aecf] mb-3">
                Active Community Moderators Roster
              </h4>
              {moderators.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-xs text-[#8a7ba8]">
                  No appointed student moderators yet. Use the form above to promote your first moderator.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {moderators.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-pink flex items-center justify-center font-bold text-white text-sm shrink-0">
                          {mod.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="font-bold text-white text-sm">{mod.name}</h5>
                          <p className="text-xs text-pink-300 font-semibold">{mod.moderatorRole || "Community Moderator"}</p>
                          <p className="font-mono text-[10px] text-[#8a7ba8]">{mod.id}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRevokeModerator(mod)}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: RESTRICTED & SUSPENDED ACCOUNTS */}
        {activeTab === "restrictions" && (
          <div className="mt-6 space-y-4">
            {restrictedAccounts.length === 0 && suspendedAccounts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-8 text-center text-xs text-emerald-400">
                ✓ Great news! Zero accounts are currently restricted or suspended.
              </div>
            ) : (
              <div className="space-y-3">
                {restrictedAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
                  >
                    <div>
                      <h5 className="font-bold text-white text-sm">{acc.name} ({acc.id})</h5>
                      <p className="text-xs text-amber-300">Status: Restricted by Moderator</p>
                    </div>
                    <button
                      onClick={() => handleUnrestrict(acc)}
                      className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                    >
                      Unsuspend & Restore Access
                    </button>
                  </div>
                ))}

                {suspendedAccounts.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4"
                  >
                    <div>
                      <h5 className="font-bold text-white text-sm">{s.name} ({s.id})</h5>
                      <p className="text-xs text-rose-300">Reason: {s.reason || "Suspended"}</p>
                      {s.appealText && (
                        <p className="text-[11px] text-[#cabfe0] mt-1 bg-black/40 p-2 rounded-lg border border-white/10">
                          Appeal: "{s.appealText}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRestoreSuspended(s.id, s.name)}
                      className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                    >
                      Approve Appeal & Restore Account
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAFETY PROTOCOLS */}
        {activeTab === "safety" && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <h5 className="font-bold text-white text-sm">Automated Profanity & Harassment Filter</h5>
                <p className="text-xs text-[#8a7ba8]">
                  Automatically mask toxic, offensive, or harassing phrases across student chats and feedback.
                </p>
              </div>
              <button
                onClick={handleToggleAutoFilter}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  autoFilter ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-white/10 text-white"
                }`}
              >
                {autoFilter ? "Active (Shielded)" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <h5 className="font-bold text-white text-sm">Strict Anti-Spam Rate Limiter</h5>
                <p className="text-xs text-[#8a7ba8]">
                  Limit high-frequency duplicate messaging in live broadcast stages and chat forums.
                </p>
              </div>
              <button
                onClick={handleToggleAntiSpam}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  strictAntiSpam ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-white/10 text-white"
                }`}
              >
                {strictAntiSpam ? "Active (Rate Limited)" : "Standard"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
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
${MS_SUPABASE_SQL}
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
