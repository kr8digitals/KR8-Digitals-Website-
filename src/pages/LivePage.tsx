import { useState } from "react";
import { useLiveStream } from "../context/LiveStreamContext";
import LiveFeed from "../components/LiveFeed";
import { Pill, GradientButton, GhostButton } from "../components/ui";

export default function LivePage() {
  const {
    isLive,
    activeStream,
    openStage,
    canHost,
    recordings,
    replays,
    unlockPrivateStream,
  } = useLiveStream();

  const [enteredKey, setEnteredKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredKey.trim()) return;
    const ok = unlockPrivateStream(enteredKey.trim());
    if (ok) {
      setKeyError("");
      openStage();
    } else {
      setKeyError("Invalid access key or invite code.");
    }
  };

  const allReplays = [...recordings, ...replays];
  const filteredReplays = selectedCategory === "all"
    ? allReplays
    : allReplays.filter((r) => r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="section-bg min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-5">
        {/* HERO SECTION */}
        <div className="text-center">
          <Pill>KR8 Real-Time Broadcast Stage</Pill>
          <h1 className="font-display mt-4 text-4xl text-white sm:text-6xl font-bold">
            KR8 Live <span className="text-gradient">Studio & Hall</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#cabfe0] leading-relaxed">
            SFU-relayed low-latency interactive masterclasses, live client breakdowns, community design reviews, and private coaching sessions.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <GradientButton onClick={() => openStage()} className="shadow-xl shadow-pink-500/25">
              {isLive
                ? activeStream?.visibility === "private"
                  ? "🔒 View Private Stream (Invite Only)"
                  : "Join Active Live Stream Now 🔴"
                : canHost
                ? "Launch Broadcaster Studio 🎥"
                : "Open Replays & Studio Stage →"}
            </GradientButton>
            <GhostButton to="/tribe">Visit Tribe Room</GhostButton>
          </div>
        </div>

        {/* ACTIVE LIVE STREAM CALLOUT (IF LIVE) */}
        {isLive && activeStream && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-pink-500/40 bg-gradient-to-r from-purple-950/60 to-pink-950/40 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    LIVE NOW
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    activeStream.visibility === "private"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}>
                    {activeStream.visibility === "private" ? "🔒 By Invitation Only" : "Public Broadcast"}
                  </span>
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-mono text-[#cabfe0]">
                    👥 {activeStream.viewers?.length || activeStream.viewerCount || 1} online
                  </span>
                </div>

                <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {activeStream.title}
                </h2>
                <p className="text-sm text-[#cabfe0]">
                  Presented by <strong className="text-pink-300">{activeStream.hostName}</strong> · Category: {activeStream.category}
                </p>
                {activeStream.description && (
                  <p className="text-xs text-[#8e82a8] max-w-xl line-clamp-2">
                    {activeStream.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => openStage()}
                  className="rounded-xl bg-gradient-pink px-6 py-3 text-sm font-black text-white shadow-xl glow-pink-sm hover:opacity-90 active:scale-95 transition-all"
                >
                  {activeStream.visibility === "private" ? "Enter Private Stage →" : "Join Stage Now →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRIVATE STREAM KEY REDEMPTION FORM */}
        {isLive && activeStream?.visibility === "private" && (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-950/15 p-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-amber-300">Have an Invitation Key for this Private Broadcast?</h4>
                <p className="text-xs text-[#cabfe0]">
                  Enter your invite code below to unlock direct stage access.
                </p>
              </div>

              <form onSubmit={handleKeySubmit} className="flex w-full sm:w-auto gap-2">
                <input
                  value={enteredKey}
                  onChange={(e) => setEnteredKey(e.target.value)}
                  placeholder="Enter key (e.g. KR8-XXXX)"
                  className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 transition-all shrink-0"
                >
                  Verify Key
                </button>
              </form>
            </div>
            {keyError && <p className="mt-2 text-xs text-red-400 font-semibold">{keyError}</p>}
          </div>
        )}

        {/* RECORDINGS & REPLAYS VAULT */}
        <div className="mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">
                Stream Recordings Vault
              </h3>
              <p className="text-xs text-[#cabfe0] mt-1">
                Archived masterclasses, live critiques, and previous broadcasts.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              {["all", "strategy", "motion", "design", "production"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1 font-semibold uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? "bg-pink-600 text-white shadow-md"
                      : "bg-white/5 text-[#cabfe0] hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReplays.map((replay: any, idx) => (
              <div
                key={replay.id || idx}
                onClick={() => openStage(replay)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#160824] p-3 transition-all hover:border-pink-500/50 hover:shadow-xl hover:shadow-pink-500/10"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                  <img
                    src={replay.thumbnail || "/founder_timfire_wide.jpg"}
                    alt={replay.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600/90 text-white text-lg shadow-lg group-hover:scale-110 transition-transform">
                      ▶
                    </span>
                  </div>
                  {replay.durationMinutes && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white">
                      {replay.durationMinutes} mins
                    </span>
                  )}
                </div>

                <div className="mt-3 px-1">
                  <span className="rounded bg-pink-500/10 px-2 py-0.5 text-[10px] font-bold text-pink-300 uppercase tracking-wider">
                    {replay.category}
                  </span>
                  <h4 className="mt-1.5 font-bold text-white text-sm line-clamp-1 group-hover:text-pink-300 transition-colors">
                    {replay.title}
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8e82a8]">
                    <span>Host: {replay.hostName}</span>
                    <span>{replay.recordedAt || "Past Session"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE ACTIVITY FEED */}
        <div className="mt-16">
          <div className="mb-4">
            <h3 className="font-display text-xl font-bold text-white">
              Community Live Activity
            </h3>
            <p className="text-xs text-[#cabfe0]">
              Real-time events, project milestones, and student enrollments across KR8 Digitals.
            </p>
          </div>
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
