import { Pill, Card } from "../components/ui";
import LeaderboardList from "../components/LeaderboardList";
import { SCORING } from "../data/store";
import Icon from "../components/Icon";

const badges = [
  { icon: "heart" as const, t: "Life Changer", d: "5+ successful student referrals" },
  { icon: "certificate" as const, t: "Graduate", d: "Certificate of Completion earned" },
  { icon: "trophy" as const, t: "Pro Specialist", d: "Verified Industry Professional" },
  { icon: "bolt" as const, t: "Dual Track", d: "Unlocked a second creative discipline" },
  { icon: "spark" as const, t: "Top Contributor", d: "Top 10 leaderboard rank this season" },
];

export default function Leaderboard() {
  return (
    <div className="section-bg min-h-screen overflow-x-hidden w-full max-w-full">
      <div className="mx-auto max-w-6xl px-3.5 sm:px-5 py-10 sm:py-14 w-full max-w-full min-w-0">
        <div className="text-center max-w-2xl mx-auto">
          <Pill>Season 1 · Live Rankings</Pill>
          <h1 className="font-display mt-4 text-3xl sm:text-5xl lg:text-6xl text-white font-bold tracking-tight">
            The KR8 <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="mt-3 text-xs sm:text-base text-[#b8aecf] leading-relaxed">
            Ranked by total points earned through class attendance, project submissions, referrals, and graduation.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-10 lg:grid-cols-[1.6fr_1fr] w-full max-w-full min-w-0">
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">Full Ranking</h2>
            <div className="mt-4 sm:mt-6 w-full max-w-full min-w-0 overflow-hidden">
              <LeaderboardList />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
            {/* Badges Section */}
            <Card className="w-full max-w-full min-w-0 p-4 sm:p-6 overflow-hidden">
              <h3 className="font-bold text-white text-base sm:text-lg">Achievement Badges</h3>
              <p className="text-xs text-[#8a7ba8] mt-1 mb-4">Badges earned through consistency and community impact.</p>
              <div className="space-y-3 w-full max-w-full min-w-0">
                {badges.map((b) => (
                  <div key={b.t} className="flex items-center gap-3 w-full max-w-full min-w-0">
                    <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-pink text-white shadow-md">
                      <Icon name={b.icon} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{b.t}</p>
                      <p className="text-[11px] sm:text-xs text-[#8a7ba8] leading-tight break-words">{b.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* How Points Work */}
            <Card className="w-full max-w-full min-w-0 p-4 sm:p-6 overflow-hidden">
              <h3 className="font-bold text-white text-base sm:text-lg">How Points Work</h3>
              <p className="text-xs text-[#8a7ba8] mt-1 mb-3">Earn XP daily and unlock verified career milestones.</p>
              <div className="space-y-2 w-full max-w-full min-w-0">
                {SCORING.map((s) => (
                  <div key={s.action} className="flex items-center justify-between gap-2 text-xs sm:text-sm border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-[#cabfe0] truncate min-w-0 flex-1">{s.action}</span>
                    <span className="font-bold text-gradient shrink-0 font-mono">+{s.pts} XP</span>
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
