import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CONTACT, getSocialLinks } from "../data/store";
import { getSiteContent, type SiteContent } from "../data/cmsStore";
import Icon, { type IconName } from "./Icon";

export default function Footer() {
  const [cms, setCms] = useState<SiteContent>(getSiteContent());

  useEffect(() => {
    const sync = () => setCms(getSiteContent());
    window.addEventListener("kr8:cms-updated", sync);
    return () => window.removeEventListener("kr8:cms-updated", sync);
  }, []);

  const socials = getSocialLinks().filter((s) => s.enabled !== false && s.href);
  return (
    <footer className="border-t border-white/10 bg-[#0a0011]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 font-display text-3xl">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-transparent p-1 border border-pink-500/30 shadow-md shadow-pink-500/20">
              <img
                src="/branding/kr8_logo.png"
                alt="KR8 Digitals Logo"
                className="h-full w-full object-contain filter drop-shadow"
              />
            </div>
            <div className="flex items-center leading-none">
              <span className="text-gradient font-black text-3xl">KR8</span>
              <span className="text-white font-bold text-3xl ml-1">Digitals</span>
            </div>
          </div>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-pink-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300">
            <span>✦</span>
            <span>{cms.global.tagline}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#b8aecf]">
            {cms.global.footerText}
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-[#cabfe0] transition-colors hover:border-pink-400/60 hover:bg-pink-500/10 hover:text-white"
              >
                <Icon name={s.icon as IconName} size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-[#b8aecf]">
            <li><Link to="/register" className="hover:text-pink-300 font-semibold text-pink-400">Start Learning Free →</Link></li>
            <li><Link to="/signin" className="hover:text-pink-300 font-semibold text-pink-400">Sign In to Portal →</Link></li>
            <li><Link to="/partner" className="hover:text-pink-300 font-semibold text-pink-300">Partner With Us →</Link></li>
            <li><Link to="/academy" className="hover:text-white">Academy Tracks</Link></li>
            <li><Link to="/tribe#join" className="hover:text-white">KR8 Tribe</Link></li>
            <li><Link to="/agency" className="hover:text-white">KR8 Agency</Link></li>
            <li><Link to="/gallery" className="hover:text-white">Public Gallery Archive</Link></li>
            <li><Link to="/verify" className="hover:text-white">Verify a KR8 ID</Link></li>
            <li><Link to="/ai" className="hover:text-white">KR8 AI</Link></li>
            <li><Link to="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Get in touch</h4>
          <ul className="mt-4 space-y-2 text-sm text-[#b8aecf]">
            <li>{cms.global.supportPhone || CONTACT.phone}</li>
            <li className="break-all">{cms.global.supportEmail || CONTACT.email}</li>
            <li><a href={`https://wa.me/${(cms.global.whatsappNumber || CONTACT.phone).replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-white">Chat on WhatsApp →</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-[#8a7ba8]">
        {cms.global.copyrightText}
      </div>
    </footer>
  );
}
