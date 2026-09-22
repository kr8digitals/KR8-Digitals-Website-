import { Link } from "react-router-dom";
import { CONTACT, getSocialLinks } from "../data/store";
import Icon, { type IconName } from "./Icon";

export default function Footer() {
  const socials = getSocialLinks().filter((s) => s.enabled !== false && s.href);
  return (
    <footer className="border-t border-white/10 bg-[#0a0011]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-3xl"><span className="text-gradient">KR8</span><span className="text-white">Digitals</span></div>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-pink-500/25 bg-pink-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-300">
            <span>✦</span>
            <span>Think It. KR8 It</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#b8aecf]">
            A school. A community. A studio. Turning curious minds into working creators — free training, real belonging, real work.
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
            <li>{CONTACT.phone}</li>
            <li className="break-all">{CONTACT.email}</li>
            <li><a href={CONTACT.whatsappTeam} target="_blank" rel="noreferrer" className="hover:text-white">Chat on WhatsApp →</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-[#8a7ba8]">
        © KR8 Digitals 2026 · <span className="font-semibold text-pink-300">Think It. KR8 It.</span>
      </div>
    </footer>
  );
}
