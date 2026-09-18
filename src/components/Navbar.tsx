import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";
import { getAnnouncementBar } from "../data/store";
import Icon from "./Icon";

const links = [
  { to: "/academy", label: "Academy" },
  { to: "/tribe", label: "Tribe" },
  { to: "/agency", label: "Agency" },
  { to: "/about", label: "About Us" },
  { to: "/ai", label: "KR8 AI" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [announcement] = useState(getAnnouncementBar());
  const [barOn, setBarOn] = useState(announcement.on);
  const { student, signOut, notifications, clearNotifications } = useAuth();
  const nav = useNavigate();

  return (
    <>
      {barOn && announcement.on && !student && (
        <div className="relative bg-gradient-pink px-4 py-2.5 text-center text-sm text-white">
          <Link to={announcement.link} className="font-medium">
            <span className="mr-2 rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-bold uppercase">{announcement.status}</span>
            {announcement.emoji} {announcement.message}{" "}
            <span className="font-bold underline">{announcement.cta}</span>
          </Link>
          <button onClick={() => setBarOn(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white" aria-label="Dismiss">✕</button>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d0015]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-display text-2xl tracking-tight" onClick={() => setOpen(false)} aria-label="KR8 Digitals home">
            <span className="text-gradient">KR8</span><span className="text-white">Digitals</span>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${isActive ? "text-white" : "text-[#b8aecf] hover:text-white"}`
              }>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 xl:flex">
            {student ? (
              <>
                <div className="relative">
                  <button onClick={() => setBell((b) => !b)} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg">
                    <span className="text-[#cabfe0]"><Icon name="bell" size={18} /></span>
                    {notifications.length > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-pink text-[9px] font-bold">{notifications.length}</span>
                    )}
                  </button>
                  {bell && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#160026] p-3 shadow-xl">
                      <div className="mb-2 flex items-center justify-between px-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">Notifications</span>
                        <button onClick={clearNotifications} className="text-[10px] text-pink-400">Clear</button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-1 py-3 text-xs text-[#8a7ba8]">You're all caught up.</p>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div key={n.id} className="rounded-lg px-2 py-2 text-xs text-[#cabfe0] hover:bg-white/5">{n.text}</div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <Link to={student.type === "student" ? "/academy" : "/tribe"}><Avatar src={student.avatar} name={student.name} size={38} /></Link>
                <button onClick={() => { signOut(); nav("/"); }} className="text-sm text-[#b8aecf] hover:text-white">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/academy" className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:border-pink-400/60">Login</Link>
                <Link to="/academy" className="rounded-full bg-gradient-pink px-5 py-2 text-sm font-bold text-white glow-pink-sm">Join for Free</Link>
              </>
            )}
          </div>

          <button className="text-2xl xl:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">{open ? "✕" : "☰"}</button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-[#0d0015] px-5 py-4 xl:hidden">
            <nav className="flex flex-col gap-1">
              <NavLink to="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#b8aecf]">Home</NavLink>
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-white/5 text-white" : "text-[#b8aecf]"}`
                }>{l.label}</NavLink>
              ))}
              <NavLink to="/verify" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#b8aecf]">Verify</NavLink>
              {student && <>
                <NavLink to="/blog" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#b8aecf]">Blog</NavLink>
                <NavLink to="/settings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#b8aecf]">Settings</NavLink>
                <NavLink to="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#b8aecf]">Admin</NavLink>
              </>}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              {student ? (
                <button onClick={() => { signOut(); setOpen(false); nav("/"); }} className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold">Sign out</button>
              ) : (
                <>
                  <Link to="/academy" onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold">Login</Link>
                  <Link to="/academy" onClick={() => setOpen(false)} className="rounded-full bg-gradient-pink px-5 py-3 text-center text-sm font-bold">Join for Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
