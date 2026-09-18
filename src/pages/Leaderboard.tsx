import { Pill, Card } from "../components/ui";
import LeaderboardList from "../components/LeaderboardList";
import { SCORING } from "../data/store";
import Icon from "../components/Icon";

const badges = [
  { icon: "heart" as const, t: "Life Changer", d: "5+ successful referrals" },
  { icon: "certificate" as const, t: "Graduate", d: "Certificate of Completion" },
  { icon: "trophy" as const, t: "Pro", d: "Certificate of Professionalism" },
  { icon: "bolt" as const, t: "Dual Skill", d: "Unlocked a second track" },
  { icon: "spark" as const, t: "Top Contributor", d: "Top 10 this season" },
];

export default function Leaderboard() {
  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="text-center">
          <Pill>Season 1 · Live</Pill>
          <h1 className="font-display mt-5 text-5xl uppercase text-white sm:text-6xl">
            The KR8 <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[#b8aecf]">
            Ranked by total points earned through attendance, submissions, referrals and graduation.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-display text-2xl uppercase text-white">Full ranking</h2>
            <div className="mt-6"><LeaderboardList /></div>
          </div>
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-white">Badges</h3>
              <div className="mt-4 space-y-3">
                {badges.map((b) => (
                  <div key={b.t} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-pink text-white"><Icon name={b.icon} size={19} /></span>
                    <div><p className="text-sm font-semibold text-white">{b.t}</p><p className="text-xs text-[#8a7ba8]">{b.d}</p></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <h3 className="font-bold text-white">How points work</h3>
              <div className="mt-4 space-y-2">
                {SCORING.map((s) => (
                  <div key={s.action} className="flex items-center justify-between text-sm">
                    <span className="text-[#cabfe0]">{s.action}</span>
                    <span className="font-bold text-gradient">{s.pts}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
