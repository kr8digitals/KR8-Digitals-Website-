import { useState } from "react";
import { useLiveStream } from "../context/LiveStreamContext";

export default function LiveStreamBanner() {
  const { activeStream, isLive, openStage } = useLiveStream();
  const [dismissed, setDismissed] = useState(false);

  if (!isLive || !activeStream || dismissed) {
    return null;
  }

  return (
    <div className="relative z-40 bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 px-4 py-2 text-white shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Pulsing Live Indicator + Stream Details */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-90" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>

          <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            {activeStream.visibility === "private" ? "🔒 PRIVATE STREAM" : "LIVE BROADCAST"}
          </span>

          <div className="flex items-center gap-2 overflow-hidden truncate">
            <span className="font-bold truncate text-white">{activeStream.title}</span>
            <span className="hidden md:inline text-white/80">· Host: {activeStream.hostName}</span>
          </div>
        </div>

        {/* Right: Viewers Count + Join CTA + Dismiss */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-bold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeStream.viewers?.length || activeStream.viewerCount || 1} watching</span>
          </div>

          <button
            onClick={() => openStage()}
            className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1 text-xs font-black text-pink-700 shadow-md hover:bg-white/90 active:scale-95 transition-all glow-pink-sm whitespace-nowrap"
          >
            <span>{activeStream.visibility === "private" ? "Enter Key" : "Join Stream"}</span>
            <span>→</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all text-xs"
            title="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
