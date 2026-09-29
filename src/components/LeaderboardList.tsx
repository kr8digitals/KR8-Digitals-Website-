import { useEffect, useState } from "react";
import { getStudents, getSkillName } from "../data/store";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";
import Icon from "./Icon";

export default function LeaderboardList({ limit }: { limit?: number }) {
  const { student } = useAuth();
  const [, refresh] = useState(0);

  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener("kr8:accounts-updated", update);
    window.addEventListener("kr8:points-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("kr8:accounts-updated", update);
      window.removeEventListener("kr8:points-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const all = getStudents();
  // Rank all students by real points earned descending, factoring multi-track milestones
  const sorted = [...all].sort((a, b) => {
    const bonusA = (a.multiSkillCount && a.multiSkillCount > 1) ? (a.multiSkillCount - 1) * 50 : 0;
    const bonusB = (b.multiSkillCount && b.multiSkillCount > 1) ? (b.multiSkillCount - 1) * 50 : 0;
    const pA = (a.points || 0) + bonusA;
    const pB = (b.points || 0) + bonusB;
    if (pB !== pA) return pB - pA;
    // Tie-break: real students before placeholders
    if (!a.isPlaceholder && b.isPlaceholder) return -1;
    if (a.isPlaceholder && !b.isPlaceholder) return 1;
    return a.name.localeCompare(b.name);
  });
  const max = limit ?? 50;
  const rows = sorted.slice(0, max);

  return (
    <div className="w-full max-w-full space-y-2 overflow-x-hidden">
      {rows.map((s, i) => {
        const skillLabel = s.skills && s.skills.length > 1
          ? s.skills.map((k) => getSkillName(k)).join(" · ")
          : getSkillName(s.skill);
        const multiCount = s.multiSkillCount || (s.skills ? s.skills.length : 1);
        const isMe = student?.id === s.id;
        return (
          <div
            key={s.id}
            className={`flex items-center gap-2.5 sm:gap-3.5 rounded-2xl border p-2.5 sm:p-3.5 w-full max-w-full min-w-0 transition-colors ${
              isMe
                ? "border-pink-400/60 bg-pink-500/10"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {/* Rank Position */}
            <div className="w-6 sm:w-8 shrink-0 text-center text-sm sm:text-base font-bold text-[#b8aecf]">
              {i < 3 ? <Icon name="trophy" size={16} className="text-pink-400 mx-auto" /> : i + 1}
            </div>

            {/* Avatar */}
            <div className="shrink-0">
              <Avatar src={s.avatar} name={s.name} size={36} />
            </div>

            {/* Student Info & Badges */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 leading-snug">
                <span className="truncate text-xs sm:text-sm font-semibold text-white max-w-[110px] xs:max-w-[140px] sm:max-w-xs">
                  {s.isPlaceholder ? "KR8 Creator" : s.name}
                </span>
                {isMe && (
                  <span className="text-[10px] sm:text-xs text-pink-400 font-bold shrink-0">(You)</span>
                )}
                {multiCount > 1 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[9px] text-amber-300 shrink-0 font-bold">
                    <Icon name="bolt" size={10} /> Multi-Track ({multiCount})
                  </span>
                )}
                {s.graduated && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] text-[#cabfe0] shrink-0 font-medium">
                    <Icon name="certificate" size={10} /> Grad
                  </span>
                )}
                {s.referrals >= 5 && (
                  <span className="rounded-full bg-gradient-pink px-1.5 py-0.5 text-[9px] text-white font-bold shrink-0">
                    Life Changer
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] sm:text-xs text-[#8a7ba8] mt-0.5">{skillLabel}</p>
            </div>

            {/* Points Column */}
            <div className="shrink-0 text-right pl-1">
              <p className="text-sm sm:text-base font-bold text-gradient leading-tight">{s.points}</p>
              <p className="text-[9px] uppercase tracking-wider text-[#8a7ba8]">pts</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
