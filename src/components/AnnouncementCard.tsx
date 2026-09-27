import { useState } from "react";
import type { Announcement } from "../data/store";
import { Card } from "./ui";
import Icon from "./Icon";

export default function AnnouncementCard({
  announcement,
  className = "",
}: {
  announcement: Announcement;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isVideo = announcement.type === "video" || !!announcement.videoUrl;
  const isImage = (announcement.type === "image" || announcement.type === "flyer" || !!announcement.image) && !isVideo;
  const content = announcement.body || announcement.caption || "";

  return (
    <Card className={`overflow-hidden !p-0 border border-white/10 bg-white/[0.03] transition-all hover:border-pink-500/30 flex flex-col justify-between ${className}`}>
      <div>
        {/* Video Announcement Header */}
        {isVideo && announcement.videoUrl && (
          <div className="relative aspect-video w-full overflow-hidden bg-black/60">
            <video
              src={announcement.videoUrl}
              poster={announcement.videoPoster || announcement.image}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="h-12 w-12 rounded-full bg-gradient-pink flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                  <Icon name="video" className="h-6 w-6 ml-0.5" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Announcement Header */}
        {isImage && announcement.image && (
          <div className="relative aspect-video w-full overflow-hidden bg-black/40">
            <img
              src={announcement.image}
              alt={announcement.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                {announcement.author || "KR8 Admin"}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[11px] text-[#8a7ba8]">{announcement.date}</span>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.05] text-[#b8aecf] border border-white/10">
              {isVideo ? "Video Broadcast" : isImage ? "Visual Notice" : "Official Notice"}
            </span>
          </div>

          <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-snug">
            {announcement.title}
          </h3>

          {content && (
            <p className="mt-3 text-xs sm:text-sm text-[#b8aecf] leading-relaxed whitespace-pre-line">
              {content}
            </p>
          )}

          {announcement.speaker && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/20 px-3 py-2 text-xs text-purple-300">
              <Icon name="user" className="h-4 w-4 shrink-0 text-purple-400" />
              <span>Special Guest / Speaker: <strong>{announcement.speaker}</strong></span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
