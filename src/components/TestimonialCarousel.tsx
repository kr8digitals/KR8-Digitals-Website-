import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Icon from "./Icon";
import {
  type Testimonial,
  type VideoComment,
  getVideoComments,
  addVideoComment,
  likeVideoComment,
} from "../data/store";
import { useAuth } from "../context/AuthContext";

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function timeAgo(timestamp: number): string {
  const elapsed = Math.floor((Date.now() - timestamp) / 1000);
  if (elapsed < 60) return "just now";
  const minutes = Math.floor(elapsed / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Highlight keywords for enhanced subtitle readability
function highlightKeywords(text: string) {
  const keywords = [
    "KR8 Digitals",
    "KR8",
    "free",
    "skills",
    "graphic design",
    "community",
    "assignments",
    "mentorship",
    "graduate",
    "graduation",
    "beginner",
    "professional",
    "zero cost",
    "certificates",
    "certificate",
  ];
  const pattern = new RegExp(`(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (keywords.some((k) => k.toLowerCase() === part.toLowerCase())) {
      return (
        <span key={index} className="text-yellow-300 font-extrabold text-shadow-sm">
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const { student: currentUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 1. Order videos: latest first, then shuffle the rest
  const ordered = useMemo(() => {
    if (!items.length) return [];
    const sorted = [...items].sort((a, b) => b.createdAt - a.createdAt);
    if (sorted.length <= 1) return sorted;
    const [latest, ...rest] = sorted;
    return [latest, ...shuffle(rest)];
  }, [items]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const currentItem = ordered[currentIndex] || items[0];

  // Deep linking: read ?video=[id] or hash on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const videoParam = urlParams.get("video");
      if (videoParam && ordered.length) {
        const found = ordered.findIndex((v) => v.id === videoParam);
        if (found !== -1) {
          setCurrentIndex(found);
        }
      }
    } catch {
      // ignore
    }
  }, [ordered]);

  // Load comments for current video
  useEffect(() => {
    if (currentItem?.id) {
      setComments(getVideoComments(currentItem.id));
    }
  }, [currentItem?.id]);

  // Play current video whenever currentIndex changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [currentIndex]);

  // Active caption lookup
  const currentCaption = useMemo(() => {
    if (!currentItem?.captions?.length) return null;
    const active = currentItem.captions.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    return active ? active.text : null;
  }, [currentItem?.captions, currentTime]);

  // Continuous auto-playback: on ended, go to next
  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % ordered.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ordered.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ordered.length) % ordered.length);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted) {
      setShowUnmuteHint(false);
    }
  };

  const handleUnmutePrompt = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsMuted(false);
    setShowUnmuteHint(false);
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, pos * duration));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleShare = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?video=${currentItem.id}#student-stories`;
    const shareTitle = `Watch ${currentItem.name}'s Journey at KR8 Digitals`;
    const shareText = `Check out how ${currentItem.name} learned ${currentItem.skill} for free at KR8 Digitals Academy!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showToast("Story shared successfully!");
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard! Share with friends 🚀");
    } catch {
      showToast("Share URL: " + shareUrl);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handlePostComment = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const author = currentUser?.name || authorName.trim() || "Visitor";
    const authorId = currentUser?.id;

    const newComment = addVideoComment({
      videoId: currentItem.id,
      authorName: author,
      authorId,
      comment: commentText.trim(),
    });

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
    if (!currentUser) setAuthorName("");
    showToast("Comment posted! Thanks for cheering them on 🎉");
  };

  const handleLike = (commentId: string) => {
    const updated = likeVideoComment(commentId);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: updated } : c))
    );
  };

  if (!ordered.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-[#8a7ba8]">
        Student testimonial videos will appear here as they are published.
      </div>
    );
  }

  return (
    <div id="student-stories" className="relative w-full max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-pink-500/40 bg-[#160d2b]/95 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl animate-fade-in">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
            ✓
          </span>
          {toastMessage}
        </div>
      )}

      {/* Main Experience Grid: Video Player + Interactive Story/Comments Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* VIDEO PLAYER COLUMN (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            ref={containerRef}
            className="group relative w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl glow-pink-sm select-none"
          >
            {/* Background Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-pink-500/20 via-purple-600/10 to-blue-500/20 blur-xl pointer-events-none" />

            {/* Video Element */}
            <video
              ref={videoRef}
              src={currentItem.video}
              poster={currentItem.img}
              playsInline
              muted={isMuted}
              autoPlay
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  setDuration(videoRef.current.duration || currentItem.duration || 0);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration || currentItem.duration || 0);
                }
              }}
              onEnded={handleEnded}
              onClick={togglePlay}
              className="relative z-0 h-full w-full object-cover cursor-pointer"
            />

            {/* Big Centered Play/Pause Button on Video */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                aria-label="Play video"
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-pink text-white shadow-2xl transform scale-100 hover:scale-110 active:scale-95 transition-transform glow-pink">
                  <Icon name="video" size={32} />
                </span>
              </button>
            )}

            {/* Top Bar Overlay: Badge, Audio & Share */}
            <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-pink-500/80 px-2.5 py-1 text-[11px] font-bold text-white tracking-wider uppercase backdrop-blur-md">
                  {currentIndex === 0 ? "🔥 Latest Upload" : "Student Reel"}
                </span>
                <span className="rounded-full bg-black/60 border border-white/20 px-2.5 py-1 text-[11px] font-medium text-[#e8ddf5] backdrop-blur-md">
                  {currentIndex + 1} of {ordered.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  aria-label="Share this story"
                  title="Share this student's story"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white hover:bg-pink-500/30 hover:border-pink-500/50 transition-all backdrop-blur-md active:scale-90"
                >
                  <Icon name="share" size={16} />
                </button>
                <button
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                  title={isMuted ? "Unmute sound" : "Mute sound"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-white/20 text-white hover:bg-white/20 transition-all backdrop-blur-md active:scale-90"
                >
                  <Icon name={isMuted ? "volumeX" : "volume"} size={16} />
                </button>
              </div>
            </div>

            {/* Unmute Prompt Banner if autoplaying muted */}
            {isMuted && showUnmuteHint && isPlaying && (
              <div className="absolute top-16 inset-x-0 z-20 flex justify-center px-4 animate-bounce">
                <button
                  onClick={handleUnmutePrompt}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition-all glow-pink-sm"
                >
                  <Icon name="volume" size={14} />
                  <span>Tap to Unmute Audio</span>
                </button>
              </div>
            )}

            {/* STYLED AUTO-CAPTIONS OVERLAY */}
            {captionsEnabled && currentCaption && (
              <div className="absolute bottom-20 inset-x-3 z-20 flex justify-center pointer-events-none transition-all duration-300">
                <div className="inline-block max-w-[95%] rounded-2xl border border-white/20 bg-black/85 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold text-white tracking-wide shadow-2xl backdrop-blur-md animate-fade-in">
                  <span className="leading-snug">{highlightKeywords(currentCaption)}</span>
                </div>
              </div>
            )}

            {/* BOTTOM CONTROLS & TIMELINE OVERLAY */}
            <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-12 pb-3 px-4 flex flex-col gap-2">
              {/* Interactive Scrub Bar */}
              <div
                onClick={handleSeek}
                className="group/bar relative h-2 w-full cursor-pointer rounded-full bg-white/25 hover:h-3 transition-all"
              >
                <div
                  className="h-full rounded-full bg-gradient-pink relative"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md ring-2 ring-pink-500 scale-0 group-hover/bar:scale-100 transition-transform" />
                </div>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous story"
                    title="Previous story"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 transition-all"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    title={isPlaying ? "Pause" : "Play"}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500 hover:bg-pink-600 active:scale-90 transition-all font-bold"
                  >
                    {isPlaying ? "❚❚" : "▶"}
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next story"
                    title="Next story"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 transition-all"
                  >
                    ⏭
                  </button>
                  <span className="font-mono text-[11px] text-[#cabfe0] ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* CC (Closed Captions) Toggle */}
                  <button
                    onClick={() => setCaptionsEnabled((prev) => !prev)}
                    aria-label={captionsEnabled ? "Disable Captions" : "Enable Captions"}
                    title={captionsEnabled ? "Captions On (Tap to Hide)" : "Captions Off (Tap to Show)"}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider transition-all border ${
                      captionsEnabled
                        ? "bg-pink-500/80 border-pink-400 text-white"
                        : "bg-white/10 border-white/20 text-[#8a7ba8] hover:text-white"
                    }`}
                  >
                    CC
                  </button>

                  {/* Unmute/Mute Toggle */}
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    title={isMuted ? "Unmute" : "Mute"}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 transition-all text-white"
                  >
                    <Icon name={isMuted ? "volumeX" : "volume"} size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR COLUMN: Student Profile, Key Quote & Community Comments (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Student Spotlight Card */}
          <div className="rounded-3xl border border-white/10 bg-[#160d2b]/80 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentItem.img}
                  alt={currentItem.name}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-pink-500/50 shadow-md"
                />
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                    {currentItem.name}
                    <span className="text-pink-400 text-xs">✓ Verified</span>
                  </h3>
                  <p className="text-xs text-pink-300 font-medium">
                    {currentItem.skill} {currentItem.schoolOrRole ? `· ${currentItem.schoolOrRole}` : ""}
                  </p>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-white hover:border-pink-500/40 hover:bg-pink-500/10 active:scale-95 transition-all"
              >
                <Icon name="share" size={13} />
                <span>Share</span>
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3.5">
              <p className="text-xs italic text-[#e8ddf5] leading-relaxed">
                "{currentItem.caption}"
              </p>
            </div>
          </div>

          {/* Interactive Community Comments & Encouragements Card */}
          <div className="rounded-3xl border border-white/10 bg-[#160d2b]/80 p-5 backdrop-blur-xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Icon name="message" size={17} className="text-pink-400" />
                <h4 className="font-bold text-white text-sm">Community Voices</h4>
                <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[11px] font-bold text-pink-300">
                  {comments.length}
                </span>
              </div>
              <span className="text-[11px] text-[#8a7ba8]">Cheer on {currentItem.name.split(" ")[0]}</span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="mt-3 flex flex-col gap-2">
              {!currentUser && (
                <input
                  type="text"
                  placeholder="Your Name (e.g. Ebuka, Sarah)"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder-[#7d6f96] focus:border-pink-500 focus:outline-none"
                />
              )}
              {currentUser && (
                <div className="flex items-center gap-2 text-[11px] text-[#b8aecf]">
                  <span>Posting as:</span>
                  <span className="font-bold text-pink-300">{currentUser.name}</span>
                  <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[10px] text-pink-200">
                    {currentUser.id}
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Leave a cheer or question for ${currentItem.name.split(" ")[0]}...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-[#7d6f96] focus:border-pink-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all"
                >
                  Post
                </button>
              </div>
            </form>

            {/* Comments Scrollable Feed */}
            <div className="mt-4 max-h-[220px] overflow-y-auto space-y-2.5 pr-1 text-xs">
              {comments.length === 0 ? (
                <p className="py-4 text-center text-xs text-[#8a7ba8]">
                  No comments yet. Be the first to congratulate {currentItem.name}!
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl border border-white/5 bg-black/30 p-3 flex flex-col gap-1 transition-all hover:border-white/15"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{c.authorName}</span>
                        {c.authorId && (
                          <span className="rounded bg-pink-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-pink-300">
                            {c.authorId.includes("FOUNDER") ? "Founder" : c.authorId}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#7d6f96]">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-[#d8cde8] leading-relaxed mt-0.5">{c.comment}</p>
                    <div className="mt-1 flex items-center justify-end">
                      <button
                        onClick={() => handleLike(c.id)}
                        className="flex items-center gap-1 text-[11px] text-[#8a7ba8] hover:text-pink-400 active:scale-90 transition-all"
                      >
                        <span>♥</span>
                        <span>{c.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NUMBERED STORIES PAGINATION ROW (Scalable up to 50k+ video uploads without clutter) */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Student Stories Library
            </h4>
            <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-pink-300">
              Story #{currentIndex + 1} of {ordered.length}
            </span>
          </div>
          <p className="text-xs text-[#a594c7]">
            Select any story number to play · Scalable archive
          </p>
        </div>

        {/* Numbered Row with Smart Windowing */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex h-9 items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <span>←</span>
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Smart Number Pills Windowing (Handles up to 50,000 videos seamlessly) */}
            {(() => {
              const total = ordered.length;
              const current = currentIndex + 1; // 1-based index
              const pages: (number | "dots-left" | "dots-right")[] = [];

              if (total <= 12) {
                // Show all if 12 or fewer
                for (let i = 1; i <= total; i++) pages.push(i);
              } else {
                pages.push(1);
                if (current > 4) {
                  pages.push("dots-left");
                }

                const start = Math.max(2, current - 2);
                const end = Math.min(total - 1, current + 2);

                for (let i = start; i <= end; i++) {
                  pages.push(i);
                }

                if (current < total - 3) {
                  pages.push("dots-right");
                }
                pages.push(total);
              }

              return pages.map((page, pIdx) => {
                if (page === "dots-left" || page === "dots-right") {
                  return (
                    <span
                      key={`dots-${pIdx}`}
                      className="flex h-9 w-7 items-center justify-center text-xs text-[#7d6f96]"
                    >
                      …
                    </span>
                  );
                }

                const isSelected = page === current;
                return (
                  <button
                    key={`story-btn-${page}`}
                    onClick={() => {
                      setCurrentIndex(page - 1);
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play().catch(() => {});
                        setIsPlaying(true);
                      }
                    }}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 font-mono text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-gradient-pink text-white shadow-lg shadow-pink-500/30 scale-105 glow-pink-sm ring-1 ring-white/30"
                        : "border border-white/10 bg-white/[0.04] text-[#cabfe0] hover:border-pink-500/40 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={currentIndex === ordered.length - 1}
              className="flex h-9 items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <span>→</span>
            </button>
          </div>

          {/* Direct Jump to Video Number Input for Big Archives */}
          {ordered.length > 5 && (
            <div className="mt-4 border-t border-white/10 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#b8aecf]">
                <span className="text-pink-400 font-bold">▶ Now Playing:</span>
                <span className="font-bold text-white">{currentItem.name}</span>
                <span className="text-pink-300">({currentItem.skill})</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#8a7ba8]">Jump to #:</span>
                <input
                  type="number"
                  min={1}
                  max={ordered.length}
                  placeholder={`1-${ordered.length}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = parseInt((e.target as HTMLInputElement).value, 10);
                      if (val >= 1 && val <= ordered.length) {
                        setCurrentIndex(val - 1);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  className="w-16 rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-center font-mono text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
