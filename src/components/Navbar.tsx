import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import { Avatar } from "./ui";
import Icon from "./Icon";
import SignInModal from "./SignInModal";

const links = [
  { to: "/academy", label: "Academy" },
  { to: "/tribe", label: "Tribe" },
  { to: "/agency", label: "Agency" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About Us" },
  { to: "/ai", label: "KR8 AI" },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const { student, signOut, notifications, clearNotifications } = useAuth();
  const { isLive, activeStream, openStage, canHost } = useLiveStream();
  const nav = useNavigate();

  // Listen to open signin event
  useEffect(() => {
    const handleOpen = () => setSignInOpen(true);
    window.addEventListener("kr8:open-signin", handleOpen);
    return () => window.removeEventListener("kr8:open-signin", handleOpen);
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0d0015]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-1 font-display text-2xl tracking-tight transition-transform hover:scale-[1.02]"
            onClick={closeDrawer}
            aria-label="KR8 Digitals home"
          >
            <span className="text-gradient">KR8</span>
            <span className="text-white">Digitals</span>
          </Link>

          {/* Desktop Links (Kept visible on laptop/desktop) */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white font-semibold shadow-sm"
                      : "text-[#b8aecf] hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Section: Desktop actions + Hamburger icon button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Broadcast Indicator or Studio Launcher */}
            {isLive ? (
              <button
                onClick={() => openStage()}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-lg glow-pink-sm transition-all active:scale-95 ${
                  activeStream?.visibility === "private"
                    ? "bg-gradient-to-r from-amber-600 to-purple-700 border border-amber-400/40"
                    : "bg-red-600 hover:bg-red-500 animate-pulse"
                }`}
                title={
                  activeStream?.visibility === "private"
                    ? "Active Private Live Broadcast (By Invitation Only)"
                    : "Live Broadcast Active — Click to Join"
                }
              >
                <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                <span>LIVE NOW</span>
                {activeStream?.visibility === "private" && (
                  <span className="hidden md:inline rounded bg-black/40 px-1.5 py-0.2 text-[10px] font-bold text-amber-200">
                    By Invitation Only
                  </span>
                )}
                <span className="font-mono text-[11px] opacity-90">
                  ({activeStream?.viewers?.length || activeStream?.viewerCount || 1})
                </span>
              </button>
            ) : canHost ? (
              <button
                onClick={() => openStage()}
                className="flex items-center gap-1.5 rounded-full border border-pink-500/50 bg-pink-500/10 px-3 py-1.5 text-xs font-bold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all shadow-sm"
                title="Open Live Broadcast Studio"
              >
                <Icon name="video" size={13} />
                <span className="hidden sm:inline">Studio</span>
                <span>Go Live</span>
              </button>
            ) : (
              <button
                onClick={() => openStage()}
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#b8aecf] hover:text-white hover:border-white/20 transition-all"
                title="Stream Replays & Masterclasses"
              >
                <Icon name="video" size={13} />
                <span>Replays</span>
              </button>
            )}

            {student ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setBell((b) => !b)}
                    className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#cabfe0] hover:text-white hover:border-pink-400/50 transition-colors"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Icon name="bell" size={17} />
                    {notifications.length > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-pink text-[9px] font-bold text-white ring-2 ring-[#0d0015]">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {bell && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-white/10 bg-[#160026] p-3 shadow-2xl z-50">
                      <div className="mb-2 flex items-center justify-between px-1 border-b border-white/10 pb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">
                          Notifications
                        </span>
                        <button
                          onClick={clearNotifications}
                          className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold"
                        >
                          Clear all
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-1 py-4 text-center text-xs text-[#8a7ba8]">You're all caught up.</p>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              className="rounded-xl px-2.5 py-2 text-xs text-[#cabfe0] hover:bg-white/5 transition-colors"
                            >
                              {n.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dashboard Pill */}
                <Link
                  to="/dashboard"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-[#cabfe0] hover:text-white hover:border-pink-400/60 transition-colors"
                >
                  <Icon name="bolt" size={12} />
                  <span>Dashboard</span>
                </Link>

                {/* User Avatar */}
                <Link
                  to={student.type === "tribe" ? "/tribe" : "/academy"}
                  title={`My Profile (${student.name})`}
                  className="transition-transform hover:scale-105"
                >
                  <Avatar src={student.avatar} name={student.name} size={34} />
                </Link>

                {/* Desktop Sign Out */}
                <button
                  onClick={() => {
                    signOut();
                    nav("/");
                  }}
                  className="hidden md:block text-xs font-medium text-[#b8aecf] hover:text-white px-2 py-1 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSignInOpen(true)}
                  className="hidden sm:inline-block rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white hover:border-pink-400/60 transition-colors"
                >
                  Login
                </button>
                <Link
                  to="/register"
                  className="hidden sm:inline-block rounded-full bg-gradient-pink px-4 py-1.5 text-xs font-bold text-white glow-pink-sm transition-transform hover:scale-[1.02]"
                >
                  Join for Free
                </Link>
              </>
            )}

            {/* Desktop & Mobile Hamburger Button:
                Visible on laptops/desktops as well as mobile devices!
                Opens the full navigation drawer without hiding top menus on desktop. */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-pink-400/50 transition-colors"
              aria-label="Open comprehensive navigation menu"
              title="More menu and quick links"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Comprehensive Slide-over Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <aside className="w-screen max-w-md bg-[#120022] border-l border-white/10 shadow-2xl flex flex-col overflow-y-auto">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <Link to="/" onClick={closeDrawer} className="font-display text-xl tracking-tight">
                  <span className="text-gradient">KR8</span>
                  <span className="text-white">Digitals</span>
                </Link>
                <button
                  onClick={closeDrawer}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#b8aecf] hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              {/* User Profile Card inside Drawer (if logged in) */}
              {student ? (
                <div className="mx-6 mt-5 rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/10 via-[#1b002c] to-black/30 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={student.avatar} name={student.name} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm truncate">{student.name}</p>
                        {student.vip && (
                          <span className="rounded-full bg-gradient-pink px-2 py-0.5 text-[10px] font-bold text-white">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-pink-300 truncate">{student.id}</p>
                      {student.type === "founder" ? (
                        <span className="inline-block mt-0.5 rounded-full bg-gradient-pink px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          👑 Founder & CEO
                        </span>
                      ) : student.type === "co-founder" ? (
                        <span className="inline-block mt-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 px-2 py-0.5 text-[10px] font-bold text-purple-200 shadow-sm">
                          ⭐ Co-Founder
                        </span>
                      ) : student.type === "tribe" ? (
                        <span className="inline-block mt-0.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#cabfe0]">
                          Tribe Member
                        </span>
                      ) : (
                        <span className="inline-block mt-0.5 rounded-full bg-pink-500/10 px-2 py-0.5 text-[10px] text-pink-300">
                          Student Account
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-center">
                    <Link
                      to={student.type === "tribe" ? "/tribe" : "/academy"}
                      onClick={closeDrawer}
                      className="rounded-lg bg-white/5 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={closeDrawer}
                      className="rounded-lg bg-pink-500/20 py-1.5 text-xs font-semibold text-pink-200 hover:bg-pink-500/30"
                    >
                      Settings & Security
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mx-6 mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                  <p className="text-sm font-semibold text-white">Join the KR8 Creative Movement</p>
                  <p className="mt-1 text-xs text-[#b8aecf]">Free digital skills, real community & verified ID.</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        closeDrawer();
                        setSignInOpen(true);
                      }}
                      className="flex-1 rounded-xl border border-white/20 py-2 text-xs font-semibold text-white hover:border-pink-400/60 transition-colors"
                    >
                      Login
                    </button>
                    <Link
                      to="/register"
                      onClick={closeDrawer}
                      className="flex-1 rounded-xl bg-gradient-pink py-2 text-xs font-bold text-white glow-pink-sm text-center"
                    >
                      Register Free
                    </Link>
                  </div>
                </div>
              )}

              {/* Comprehensive Navigation Sections */}
              <div className="flex-1 px-6 py-6 space-y-6">
                {/* Live Stream Feature Section */}
                <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                      {isLive ? <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> : null}
                      <span>{isLive ? "Live Broadcast In Progress" : "KR8 Live Streaming"}</span>
                    </span>
                    {isLive && (
                      <span className="text-[10px] font-mono font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                        {activeStream?.viewerCount} VIEWERS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#b8aecf] mb-3">
                    {isLive
                      ? `"${activeStream?.title}" is live now. Join the interactive broadcast!`
                      : "Host live streams, join Q&As, and watch recorded masterclass replays."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        closeDrawer();
                        openStage();
                      }}
                      className="flex-1 rounded-xl bg-gradient-pink py-2 text-xs font-bold text-white shadow hover:brightness-110 active:scale-95 transition-all text-center"
                    >
                      {isLive ? "Join Live Stream →" : canHost ? "Host Studio (Go Live) →" : "Open Stream Stage →"}
                    </button>
                  </div>
                </div>

                {/* Main Pages */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7ba8] mb-2 px-2">
                    Main Pages & Tracks
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/"
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-pink-400">❖</span> Home
                      </span>
                    </NavLink>
                    {links.map((l) => (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        onClick={closeDrawer}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-pink-400">❖</span> {l.label}
                        </span>
                      </NavLink>
                    ))}
                    <NavLink
                      to="/blog"
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-pink-400">❖</span> Blog & Articles
                      </span>
                    </NavLink>
                  </nav>
                </div>

                {/* Academy & Student Tools */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a7ba8] mb-2 px-2">
                    Tools & Verification
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/dashboard"
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon name="bolt" size={15} className="text-pink-400" /> Dashboard
                      </span>
                    </NavLink>
                    <NavLink
                      to="/leaderboard"
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon name="trophy" size={15} className="text-pink-400" /> Leaderboard & XP
                      </span>
                    </NavLink>
                    <NavLink
                      to="/verify"
                      onClick={closeDrawer}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon name="check" size={15} className="text-pink-400" /> Verify KR8 ID
                      </span>
                    </NavLink>

                    {/* Settings & Biometrics: strictly for registered users */}
                    {student && (
                      <NavLink
                        to="/settings"
                        onClick={closeDrawer}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                            isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                          }`
                        }
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon name="fingerprint" size={15} className="text-pink-400" /> Settings & Biometrics
                        </span>
                      </NavLink>
                    )}

                    {/* Admin & Attendance Review: strictly for authorized leadership / faculty */}
                    {student && (student.admin || student.type === "founder" || student.type === "co-founder") && (
                      <>
                        <NavLink
                          to="/attendance-review"
                          onClick={closeDrawer}
                          className={({ isActive }) =>
                            `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                              isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon name="calendar" size={15} className="text-pink-400" /> Attendance Review
                          </span>
                        </NavLink>
                        <NavLink
                          to="/admin"
                          onClick={closeDrawer}
                          className={({ isActive }) =>
                            `flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                              isActive ? "bg-white/10 text-white font-semibold" : "text-[#b8aecf] hover:bg-white/5 hover:text-white"
                            }`
                          }
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon name="lock" size={15} className="text-pink-400" /> Admin Portal
                          </span>
                        </NavLink>
                      </>
                    )}
                  </nav>
                </div>

                {/* Community Link */}
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold text-white mb-1">Creative Community</p>
                  <p className="text-xs text-[#8a7ba8] leading-relaxed">
                    Connect, collaborate, and grow with thousands of African creators in the KR8 Tribe.
                  </p>
                  <Link
                    to="/tribe"
                    onClick={closeDrawer}
                    className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-pink px-3 py-2 text-xs font-bold text-white hover:opacity-95 transition-opacity"
                  >
                    <span>✦ Explore the Tribe</span>
                  </Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-white/10 px-6 py-4 bg-black/20">
                {student ? (
                  <button
                    onClick={() => {
                      signOut();
                      closeDrawer();
                      nav("/");
                    }}
                    className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors"
                  >
                    Sign Out of Account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        closeDrawer();
                        setSignInOpen(true);
                      }}
                      className="w-full rounded-xl bg-gradient-pink py-2.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
                    >
                      Sign In to KR8 🔑
                    </button>
                    <p className="text-center text-[10px] text-[#8a7ba8]">
                      KR8 Digitals &copy; 2026. <span className="font-semibold text-pink-300">Think It. KR8 It.</span>
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Global Sign In & Password Recovery Modal */}
      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
      />
    </>
  );
}
