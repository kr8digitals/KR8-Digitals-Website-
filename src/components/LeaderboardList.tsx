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
    return () => { window.removeEventListener("kr8:accounts-updated", update); window.removeEventListener("storage", update); };
  }, []);
  const all = getStudents();
  const real = all.filter((s) => !s.isPlaceholder).sort((a, b) => b.points - a.points);
  const placeholders = all.filter((s) => s.isPlaceholder).sort((a, b) => b.points - a.points);
  const max = limit ?? 50;
  // Real registrants always occupy the first slots; placeholders only backfill the remainder.
  const rows = [...real.slice(0, max), ...placeholders.slice(0, Math.max(0, max - real.length))];

  return (
    <div className="space-y-2.5">
      {rows.map((s, i) => {
        const skill = SKILLS.find((k) => k.key === s.skill)?.name ?? s.skill;
        const isMe = student?.id === s.id;
        return (
          <div
            key={s.id}
            className={`flex items-center gap-4 rounded-2xl border p-3.5 ${
              isMe
                ? "border-pink-400/60 bg-pink-500/10"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <div className="w-8 text-center text-lg font-bold text-[#b8aecf]">
              {i < 3 ? <Icon name="trophy" size={18} className="text-pink-400" /> : i + 1}
            </div>
            <Avatar src={s.avatar} name={s.name} size={42} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {s.isPlaceholder ? "KR8 Creator" : s.name} {isMe && <span className="text-pink-400">(You)</span>}
                {s.isPlaceholder && <span className="ml-2 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#8a7ba8]">Season marker</span>}
                {s.graduated && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-[#cabfe0]"><Icon name="certificate" size={11} /> Graduate</span>}
                {s.referrals >= 5 && <span className="ml-1 rounded-full bg-gradient-pink px-2 py-0.5 text-[10px] text-white">Life Changer</span>}
              </p>
              <p className="truncate text-xs text-[#8a7ba8]">{skill}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gradient">{s.points}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#8a7ba8]">pts</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
