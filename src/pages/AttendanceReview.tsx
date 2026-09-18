import { useState } from "react";
import { ATTENDANCE_TYPES, getStudents, SKILLS } from "../data/store";
import { Card, Pill } from "../components/ui";
import Icon from "../components/Icon";

// Intentionally separate from the main admin credential path.
const ATTENDANCE_PASSWORD = "KR8@Atd2026";

export default function AttendanceReview() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [openTypes, setOpenTypes] = useState<Record<string, boolean>>(
    Object.fromEntries(ATTENDANCE_TYPES.map((type) => [type.key, type.open]))
  );

  if (!unlocked) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="lock" size={23} /></div>
          <Pill>Coach-only area</Pill>
          <h1 className="font-display mt-5 text-3xl text-white">Attendance Review</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">Review submissions, surface duplicate flags, open or close attendance types, and approve or reject manually.</p>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && unlock()} placeholder="Coach password" className="mt-5 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none" />
          {error && <p className="mt-2 text-xs text-red-400">Incorrect attendance review password.</p>}
          <button onClick={unlock} className="mt-4 w-full rounded-full bg-gradient-pink py-3 text-sm font-bold text-white">Unlock Review</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><Pill>Manual review queue</Pill><h1 className="font-display mt-4 text-4xl text-white sm:text-5xl">Attendance <span className="text-gradient">Review</span></h1></div>
          <button onClick={() => setUnlocked(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-[#b8aecf]">Lock review</button>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8aecf]">All four types remain fully manual. Students see pending, accepted or rejected status only after coach action. Duplicate screenshots are flags for review, never automatic rejection.</p>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {ATTENDANCE_TYPES.map((type) => (
            <Card key={type.key}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h2 className="font-display text-2xl text-white">{type.name}</h2><p className="mt-1 text-xs text-[#8a7ba8]">{type.schedule}</p></div>
                <button onClick={() => setOpenTypes((current) => ({ ...current, [type.key]: !current[type.key] }))} className={`rounded-full px-4 py-2 text-xs font-semibold ${openTypes[type.key] ? "bg-green-500/15 text-green-300" : "bg-white/10 text-[#8a7ba8]"}`}>{openTypes[type.key] ? "Open" : "Closed"}</button>
              </div>
              <div className="mt-5 space-y-2">
                {[...getStudents()].sort((a, b) => (a.serial ?? 0) - (b.serial ?? 0)).slice(0, 5).map((student) => {
                  const skill = SKILLS.find((item) => item.key === student.skill)?.name ?? "Unknown track";
                  return <div key={student.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-mono text-pink-300">{student.id}</span><span className="text-[#8a7ba8]">{skill}</span><span className="text-[#8a7ba8]">Pending Review</span></div>
                    <div className="mt-3 flex flex-wrap gap-2"><button className="rounded-full bg-green-500/15 px-3 py-1.5 text-xs text-green-300">Approve</button><button className="rounded-full bg-red-500/15 px-3 py-1.5 text-xs text-red-300">Reject with feedback</button><button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#cabfe0]">View screenshot</button></div>
                  </div>;
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  function unlock() {
    setError(false);
    if (password === ATTENDANCE_PASSWORD) setUnlocked(true);
    else setError(true);
  }
}