import { useEffect, useState } from "react";
import { getStudents, SKILLS } from "../data/store";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";
import Icon from "./Icon";

export default function LeaderboardList({ limit }: { limit?: number }) {
  const { student } = useAuth();
  const [, refresh] = useState(0);

  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener("kr8:accounts-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("kr8:accounts-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const all = getStudents();
  const real = all.filter((s) => !s.isPlaceholder).sort((a, b) => b.points - a.points);
  const placeholders = all.filter((s) => s.isPlaceholder).sort((a, b) => b.points - a.points);
  const max = limit ?? 50;
  // Real registrants always occupy the first slots; placeholders only backfill the remainder.
  const rows = [...real.slice(0, max), ...placeholders.slice(0, Math.max(0, max - real.length))];

  return (
    <div className="w-full max-w-full space-y-2 overflow-x-hidden">
      {rows.map((s, i) => {
        const skill = SKILLS.find((k) => k.key === s.skill)?.name ?? s.skill;
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
              <p className="truncate text-[10px] sm:text-xs text-[#8a7ba8] mt-0.5">{skill}</p>
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
