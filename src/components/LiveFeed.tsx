import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeed, feedAction, timeAgo, type FeedItem, type LiveStream, type StreamReplay, getActiveLiveStream, getLastEndedStream, getLiveChatMessages } from "../data/store";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import { Avatar } from "./ui";

export default function LiveFeed({ compact }: { compact?: boolean }) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const { student } = useAuth();
  const { activeStream, isLive, lastEndedStream, openStage } = useLiveStream();
  const nav = useNavigate();

  useEffect(() => {
    setFeed(getFeed());
    const t = setInterval(() => setFeed(getFeed()), 4000);
    return () => clearInterval(t);
  }, []);

  const items = compact ? feed.slice(0, 4) : feed.slice(0, 7);

  // Get recent live chat messages to show activities inside feed
  const activeChat = activeStream ? getLiveChatMessages(activeStream.id).slice(-3) : [];

  return (
    <div className="space-y-4">
      {/* 1. ACTIVE LIVE STREAM BROADCAST HUB (SHOWS WHEN A STREAM IS LIVE) */}
      {isLive && activeStream && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-pink-500/60 bg-gradient-to-br from-[#24083d] via-[#160628] to-[#0a0014] p-5 shadow-2xl shadow-pink-500/20 transition-all">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-pink-500/25 blur-2xl pointer-events-none" />

          {/* Header Row: Live Status + Visibility */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-red-500/50 animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>LIVE NOW</span>
              </span>

              {activeStream.visibility === "private" ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  <span>🔒 Private Session</span>
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  🌐 Open to All
                </span>
              )}
            </div>

            {/* Real Viewers Badge */}
            <div className="flex items-center gap-1.5 text-xs text-[#cabfe0] font-semibold bg-black/40 px-3 py-1 rounded-full border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{activeStream.viewers?.length || activeStream.viewerCount || 1} Connected</span>
            </div>
          </div>

          {/* Host & Title Info */}
          <div className="mt-4 flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-pink text-white font-bold text-lg shadow-md ring-2 ring-pink-400/40">
              {activeStream.hostAvatar ? (
                <img
                  src={activeStream.hostAvatar}
                  alt={activeStream.hostName}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                activeStream.hostName.charAt(0)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-pink-400 font-bold">
                Host: {activeStream.hostName}
              </p>
              <h4 className="font-display text-base sm:text-lg font-bold text-white truncate">
                {activeStream.title}
              </h4>
              <p className="text-xs text-[#b8aecf] truncate">{activeStream.category}</p>
            </div>
          </div>

          {/* Notice for Private Stream */}
          {activeStream.visibility === "private" && (
            <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
              🔒 <strong>Private live stream:</strong> Access is only by invitation link or access key.
            </div>
          )}

          {/* Real-time Live Activities Ticker & Engagers Leaderboard */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-3.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#a594c7] mb-2.5">
              <span>Live Activities & Engagers</span>
              <span className="text-emerald-400 font-mono">● Real-time Sync</span>
            </div>

            {/* Chat ticker */}
            <div className="space-y-1.5 pb-2 border-b border-white/10">
              {activeChat.length === 0 ? (
                <p className="text-xs text-[#8a7ba8] italic">Broadcasting live. Type in chat to engage!</p>
              ) : (
                activeChat.map((msg) => (
                  <div key={msg.id} className="flex items-center gap-2 text-xs truncate">
                    <span className="font-semibold text-pink-300 shrink-0">{msg.senderName}:</span>
                    <span className="text-[#cabfe0] truncate">{msg.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Engagers Leaderboard for this stream */}
            <div className="mt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                🏆 Active Session Leaderboard:
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(activeStream.viewers || []).slice(0, 4).map((viewer, i) => (
                  <span
                    key={viewer.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-white"
                  >
                    <span className="text-amber-400 font-bold">#{i + 1}</span>
                    <span>{viewer.name}</span>
                    <span className="text-pink-300 text-[9px]">({viewer.role})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => openStage()}
              className="flex-1 rounded-xl bg-gradient-pink py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {activeStream.visibility === "private"
                ? "Enter Invitation Key / Join Stage 🔒"
                : "Join Live Stream Stage →"}
            </button>
          </div>
        </div>
      )}

      {/* 2. RECENT BROADCAST ENDED ANNOUNCEMENT & RESTREAM CARD */}
      {!isLive && lastEndedStream && (
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/40 bg-gradient-to-br from-[#1d0d33] to-[#0e041a] p-5 shadow-xl transition-all">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <span>↺</span>
              <span>BROADCAST RECAP & RESTREAM</span>
            </span>
            <span className="text-[11px] text-[#a594c7] font-mono">
              {lastEndedStream.durationMinutes} mins · {lastEndedStream.date}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <div className="relative h-14 w-20 shrink-0 rounded-xl overflow-hidden bg-black/50 border border-white/10">
              <img
                src={lastEndedStream.thumbnail}
                alt={lastEndedStream.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-pink text-white text-[10px]">
                  ▶
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-sm line-clamp-1">{lastEndedStream.title}</h4>
              <p className="text-xs text-[#b8aecf]">Host: {lastEndedStream.hostName}</p>
              <p className="text-[11px] text-[#a594c7] mt-0.5">
                {lastEndedStream.realViewersCount || lastEndedStream.peakViewers} participants · {lastEndedStream.messagesCount} comments
              </p>
            </div>
          </div>

          {/* Recognized Engagers in this session */}
          {(lastEndedStream.recognizedEngagers || []).length > 0 && (
            <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/10 p-2.5 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400 mb-1">
                ⭐ Recognized Participants:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {lastEndedStream.recognizedEngagers.slice(0, 4).map((engager, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 text-[10px] text-pink-200"
                  >
                    {engager.name} ({engager.badge})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA to Watch Restream */}
          <div className="mt-3.5">
            <button
              onClick={() => openStage(lastEndedStream)}
              className="w-full rounded-xl border border-pink-500/40 bg-pink-500/10 py-2 text-xs font-bold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Watch Restream Recording</span>
              <span>↺</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. STANDARD TRIBE COMMUNITY FEED ITEMS */}
      <div className="space-y-3">
        {items.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              if (f.kind === "stream_live") {
                openStage();
              } else if (f.kind === "stream_ended" && lastEndedStream) {
                openStage(lastEndedStream);
              } else {
                nav(student ? "/leaderboard" : "/academy");
              }
            }}
            className="flex min-w-0 w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-pink-400/40 sm:p-3.5"
          >
            <span className="relative">
              <Avatar src={f.avatar} name={f.name} size={40} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0015] bg-green-400" />
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="break-words text-xs leading-relaxed text-white sm:text-sm">
                <span className="font-semibold">{f.name}</span>{" "}
                <span className="text-[#b8aecf]">{feedAction(f.kind)}</span>
              </p>
              <p className="truncate text-[11px] text-[#8a7ba8] sm:text-xs">
                {f.skill} · {timeAgo(f.ts)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
