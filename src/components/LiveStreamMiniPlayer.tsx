import { useState } from "react";
import { useLiveStream } from "../context/LiveStreamContext";
import Icon from "./Icon";

export default function LiveStreamMiniPlayer() {
  const { activeStream, isLive, isMiniPlayerOpen, openStage, closeMiniPlayer } = useLiveStream();
  const [muted, setMuted] = useState(true);

  if (!isLive || !activeStream || !isMiniPlayerOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 sm:w-80 overflow-hidden rounded-2xl border border-pink-500/40 bg-[#150a24] shadow-2xl backdrop-blur-xl ring-2 ring-pink-500/20 transition-all animate-rise">
      {/* Video Preview Box */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <video
          src={activeStream.videoUrl || "/videos/testimonial_grant_gideon.mp4"}
          poster={activeStream.posterUrl || "/founder_timfire_wide.jpg"}
          autoPlay
          playsInline
          loop
          muted={muted}
          className="h-full w-full object-cover"
        />

        {/* Live overlay badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2 py-0.5 text-[9px] font-bold text-white shadow">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* Viewer count */}
        <div className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-mono text-white/90">
          👥 {activeStream.viewerCount}
        </div>

        {/* Controls Overlay on hover */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          <button
            onClick={() => setMuted(!muted)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-all text-xs"
            title={muted ? "Unmute" : "Mute"}
          >
            <Icon name={muted ? "volumeX" : "volume"} size={13} />
          </button>
          <button
            onClick={() => openStage()}
            className="flex items-center gap-1 rounded-full bg-gradient-pink px-2.5 py-1 text-[10px] font-bold text-white shadow hover:brightness-110 transition-all"
          >
            <span>Expand</span>
            <span>⛶</span>
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between p-2.5 bg-black/40">
        <div className="overflow-hidden pr-2">
          <h4 className="text-xs font-bold text-white truncate">{activeStream.title}</h4>
          <p className="text-[10px] text-pink-300 truncate">Host: {activeStream.hostName}</p>
        </div>
        <button
          onClick={closeMiniPlayer}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
