import { useEffect, useState } from "react";
import { getSocialLinks } from "../data/store";
import Icon, { type IconName } from "./Icon";
import { GhostButton, GradientButton } from "./ui";

export default function FollowPopup() {
  const [visible, setVisible] = useState(false);
  const [social, setSocial] = useState<ReturnType<typeof getSocialLinks>[number] | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("kr8_follow_prompt_seen")) return;
      const links = getSocialLinks().filter((link) => link.enabled !== false && link.href);
      const index = Number(sessionStorage.getItem("kr8_follow_platform")) || Math.floor(Math.random() * links.length);
      const selected = links[index % Math.max(links.length, 1)];
      if (!selected) return;
      sessionStorage.setItem("kr8_follow_platform", String((index + 1) % links.length));
      const timer = window.setTimeout(() => {
        setSocial(selected);
        setVisible(true);
      }, 180000);
      return () => window.clearTimeout(timer);
    } catch {
      return;
    }
  }, []);

  const dismiss = () => {
    try { sessionStorage.setItem("kr8_follow_prompt_seen", "1"); } catch { /* ignore */ }
    setVisible(false);
  };
  if (!visible || !social) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[70] sm:left-auto sm:w-[360px]">
      <div className="rounded-3xl border border-pink-400/30 bg-[#180026]/95 p-5 shadow-2xl shadow-pink-950/50 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name={social.icon as IconName} size={18} /></span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-pink-300">Stay close to KR8</p>
            <p className="mt-1 text-sm leading-relaxed text-[#cabfe0]">If our work has helped you today, follow along for more free learning, creator stories and opportunities.</p>
          </div>
          <button onClick={dismiss} aria-label="Dismiss" className="text-[#8a7ba8] hover:text-white">×</button>
        </div>
        <div className="mt-4 flex gap-2">
          <GradientButton href={social.href} className="flex-1 !px-4 !py-2.5">Follow on {social.label}</GradientButton>
          <GhostButton onClick={dismiss} className="!px-4 !py-2.5">Not now</GhostButton>
        </div>
      </div>
    </div>
  );
}