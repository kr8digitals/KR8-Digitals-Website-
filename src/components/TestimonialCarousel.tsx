import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Icon from "./Icon";
import {
  type Testimonial,
  type VideoComment,
  getVideoComments,
  addVideoComment,
  likeVideoComment,
  getStudents,
  generateDefaultAvatar,
} from "../data/store";
import { useAuth } from "../context/AuthContext";

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

  // TRUE SHUFFLE ON INITIAL MOUNT (Session-based, does not reshuffle on every re-render)
  const [ordered, setOrdered] = useState<Testimonial[]>(() => {
    if (!items || !items.length) return [];
    try {
      const stored = sessionStorage.getItem("kr8_shuffled_testimonials_v12");
      if (stored) {
        const parsedIds: string[] = JSON.parse(stored);
        const map = new Map(items.map((it) => [it.id, it]));
        const rehydrated = parsedIds.map((id) => map.get(id)).filter(Boolean) as Testimonial[];
        if (rehydrated.length === items.length) {
          return rehydrated;
        }
      }
    } catch {
      // ignore
    }
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    try {
      sessionStorage.setItem("kr8_shuffled_testimonials_v12", JSON.stringify(shuffled.map((i) => i.id)));
    } catch {}
    return shuffled;
  });

  const total = ordered.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | "none">("none");

  // Touch Swipe Handlers for mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Comments state
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const currentItem = ordered[currentIndex] || items[0];
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;
  const prevItem = ordered[prevIndex];
  const nextItem = ordered[nextIndex];

  // Deep linking: read ?video=[id] on mount
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
    } catch {}
  }, [ordered]);

  // Link to real student profile if kr8Id exists and matches a registered student
  const linkedStudent = useMemo(() => {
    if (!currentItem?.kr8Id) return null;
    const allStudents = getStudents();
    return allStudents.find((s) => s.id.toLowerCase() === currentItem.kr8Id?.trim().toLowerCase()) || null;
  }, [currentItem?.kr8Id]);

  // Load comments for current video
  useEffect(() => {
    if (currentItem?.id) {
      setComments(getVideoComments(currentItem.id));
    }
  }, [currentItem?.id]);

  // Set initial duration from current item if available
  useEffect(() => {
    if (currentItem?.duration) {
      setDuration(currentItem.duration);
    }
    setCurrentTime(0);
  }, [currentIndex, currentItem]);

  // Sync video source change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Load new source
    video.load();

    // Reset elapsed
    setCurrentTime(0);

    // If already playing or user initiated next/prev, autoplay muted
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

  const handleNext = () => {
    setSlideDirection("next");
    setCurrentIndex((prev) => (prev + 1) % total);
    setTimeout(() => setSlideDirection("none"), 450);
  };

  const handlePrev = () => {
    setSlideDirection("prev");
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setTimeout(() => setSlideDirection("none"), 450);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn("Playback error:", err);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted) {
      setShowUnmuteHint(false);
    }
  };

  const handleUnmutePrompt = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
    e.stopPropagation();
    const video = videoRef.current;
    const effectiveDuration = duration || video?.duration || currentItem?.duration || 0;
    if (!video || !effectiveDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * effectiveDuration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe threshold: > 35px and more horizontal than vertical
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // General shareable link (landing on full testimonial library)
  const handleShareGeneral = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/#student-stories`;
    const shareTitle = "KR8 Digitals Student Stories & Reviews";
    const shareText = "Come see what our students say! Real stories from African youth mastering high-income tech and creative skills for free at KR8 Digitals.";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        showToast("General student stories shared!");
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("General testimonial library link copied to clipboard!");
    } catch {
      showToast(shareUrl);
    }
  };

  // Individual active story share link
  const handleShareActive = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/?video=${currentItem.id}#student-stories`;
    const shareTitle = `Watch ${currentItem.name}'s Story at KR8 Digitals`;
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
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Story link copied to clipboard!");
    } catch {
      showToast(shareUrl);
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

  if (!total) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-sm text-[#8a7ba8]">
        Student testimonial videos will appear here as they are published.
      </div>
    );
  }

  const effectiveDuration = duration || currentItem.duration || 0;

  return (
    <div id="student-stories" className="relative w-full max-w-6xl mx-auto px-2 sm:px-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-pink-500/40 bg-[#160d2b]/95 px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl animate-fade-in">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500/20 text-pink-300">
            ✓
          </span>
          {toastMessage}
        </div>
      )}

      {/* Top Controls Bar: General Library Share & Shuffle indicator */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-3 py-1 text-xs font-bold text-pink-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
            Live Student Testimonials ({total})
          </span>
          <span className="text-xs text-[#8a7ba8] hidden sm:inline">
            Freshly shuffled for each visit
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareGeneral}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/15 active:scale-95 transition-all shadow-sm"
            title="Share full testimonial library link"
          >
            <Icon name="share" size={13} />
            <span>Share All Student Stories</span>
          </button>
        </div>
      </div>

      {/* REAL SLIDING CAROUSEL STAGE — CENTER ACTIVE + LEFT/RIGHT DIMMED PREVIEWS */}
      <div
        className="relative w-full overflow-hidden py-4 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop Left / Previous Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous story"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-black/75 text-white backdrop-blur-md hover:bg-pink-600 hover:border-pink-500 hover:scale-110 active:scale-95 transition-all shadow-2xl"
        >
          <span className="text-2xl font-bold leading-none -ml-0.5">‹</span>
        </button>

        {/* Desktop Right / Next Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next story"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/30 bg-black/75 text-white backdrop-blur-md hover:bg-pink-600 hover:border-pink-500 hover:scale-110 active:scale-95 transition-all shadow-2xl"
        >
          <span className="text-2xl font-bold leading-none -mr-0.5">›</span>
        </button>

        {/* Three-Card Sliding Carousel Row */}
        <div className="relative flex items-center justify-center gap-2 sm:gap-6 w-full max-w-full">
          {/* PREVIOUS VIDEO PREVIEW (Partially visible & dimmed on left edge on mobile and desktop) */}
          {prevItem && (
            <div
              onClick={handlePrev}
              className="relative flex flex-col items-center opacity-30 hover:opacity-75 scale-80 sm:scale-90 -mr-12 sm:-mr-8 z-10 cursor-pointer transition-all duration-500 shrink-0 select-none group"
              title={`Previous: ${prevItem.name}`}
            >
              <div className="relative w-[130px] sm:w-[220px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-lg">
                <img
                  src={prevItem.img}
                  alt={prevItem.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/30 group-hover:bg-pink-600 transition-colors">
                    ‹
                  </span>
                </div>
                <div className="absolute bottom-3 left-2.5 right-2.5 text-left">
                  <p className="text-[11px] sm:text-xs font-bold text-white truncate">{prevItem.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-pink-300 truncate">{prevItem.skill}</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE CENTER VIDEO PLAYER (Prominent, Centered, Fully Functional) */}
          <div
            className={`group/player relative w-[80vw] max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-pink-500/60 bg-black shadow-2xl glow-pink-sm z-20 shrink-0 select-none transition-all duration-500 ${
              slideDirection === "next" ? "animate-pulse" : slideDirection === "prev" ? "animate-pulse" : ""
            }`}
          >
            {/* Ambient Back Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-pink-500/30 via-purple-600/20 to-blue-500/20 blur-xl pointer-events-none" />

            {/* Video Element */}
            <video
              ref={videoRef}
              src={currentItem.video}
              poster={currentItem.img}
              playsInline
              preload="metadata"
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setCurrentTime(v.currentTime);
                if (v.duration && !isNaN(v.duration)) {
                  setDuration(v.duration);
                }
              }}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.duration && !isNaN(v.duration)) {
                  setDuration(v.duration);
                }
              }}
              onDurationChange={(e) => {
                const v = e.currentTarget;
                if (v.duration && !isNaN(v.duration)) {
                  setDuration(v.duration);
                }
              }}
              onEnded={handleNext}
              onClick={togglePlay}
              className="h-full w-full object-cover cursor-pointer bg-black"
            />

            {/* BIG PROMINENT CENTER PLAY BUTTON OVERLAY (When Paused) */}
            {!isPlaying && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-all hover:bg-black/30"
              >
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play testimonial video"
                  className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-pink text-white shadow-2xl shadow-pink-500/60 glow-pink hover:scale-110 active:scale-95 transition-all ring-4 ring-white/30 animate-pulse"
                >
                  <span className="text-2xl sm:text-3xl ml-1">▶</span>
                </button>
              </div>
            )}

            {/* Tap to Unmute Overlay Hint */}
            {isMuted && showUnmuteHint && (
              <button
                type="button"
                onClick={handleUnmutePrompt}
                className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-full border border-pink-400/50 bg-black/80 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md animate-pulse hover:bg-pink-600"
              >
                <span>🔊</span>
                <span>Tap to Unmute Audio</span>
              </button>
            )}

            {/* Verified Student Badge on Video */}
            {linkedStudent && (
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-950/80 px-3 py-1 text-[11px] font-bold text-emerald-300 shadow-xl backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Verified Student</span>
              </div>
            )}

            {/* Subtitles & Captions Overlay */}
            {captionsEnabled && currentCaption && (
              <div className="pointer-events-none absolute bottom-24 left-3 right-3 z-20 flex justify-center text-center">
                <p className="max-w-[92%] rounded-2xl bg-black/85 px-3.5 py-2 text-xs sm:text-sm font-semibold leading-relaxed text-white shadow-2xl backdrop-blur-md border border-white/15">
                  {highlightKeywords(currentCaption)}
                </p>
              </div>
            )}

            {/* Video Gradient Shadow at Bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/70 to-transparent z-10" />

            {/* Bottom Controls & Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-4 space-y-2">
              {/* Progress Scrubber */}
              <div
                onClick={handleSeek}
                className="group/seek relative h-2.5 w-full cursor-pointer rounded-full bg-white/20 overflow-hidden"
                title="Click or drag to seek"
              >
                <div
                  className="h-full bg-gradient-pink transition-all duration-100"
                  style={{
                    width: `${effectiveDuration ? (currentTime / effectiveDuration) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Student Name & Controls Row */}
              <div className="flex items-end justify-between gap-2 pt-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base truncate">
                      {currentItem.name}
                    </h3>
                  </div>
                  <p className="text-xs text-pink-300 font-semibold truncate">
                    {currentItem.skill} {currentItem.schoolOrRole ? `· ${currentItem.schoolOrRole}` : ""}
                  </p>
                  <p className="text-[11px] text-gray-300 font-mono mt-0.5">
                    {formatTime(currentTime)} / {formatTime(effectiveDuration)}
                  </p>
                </div>

                {/* Right Action Icons: Play, Mute, CC, Share */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 active:scale-90 backdrop-blur-sm transition-all"
                  >
                    <span className="text-xs">{isPlaying ? "❚❚" : "▶"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 active:scale-90 backdrop-blur-sm transition-all"
                  >
                    <span className="text-xs">{isMuted ? "🔇" : "🔊"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    aria-label="Toggle subtitles"
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      captionsEnabled
                        ? "bg-gradient-pink text-white"
                        : "bg-white/20 text-white/50"
                    }`}
                  >
                    CC
                  </button>
                  <button
                    type="button"
                    onClick={handleShareActive}
                    aria-label="Share story"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 active:scale-90 backdrop-blur-sm transition-all"
                    title="Share this specific story"
                  >
                    <Icon name="share" size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NEXT VIDEO PREVIEW (Partially visible & dimmed on right edge on mobile and desktop) */}
          {nextItem && (
            <div
              onClick={handleNext}
              className="relative flex flex-col items-center opacity-30 hover:opacity-75 scale-80 sm:scale-90 -ml-12 sm:-ml-8 z-10 cursor-pointer transition-all duration-500 shrink-0 select-none group"
              title={`Next: ${nextItem.name}`}
            >
              <div className="relative w-[130px] sm:w-[220px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/15 bg-black shadow-lg">
                <img
                  src={nextItem.img}
                  alt={nextItem.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/30 group-hover:bg-pink-600 transition-colors">
                    ›
                  </span>
                </div>
                <div className="absolute bottom-3 left-2.5 right-2.5 text-left">
                  <p className="text-[11px] sm:text-xs font-bold text-white truncate">{nextItem.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-pink-300 truncate">{nextItem.skill}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SWIPE HINT FOR MOBILE USERS */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 mt-1 text-[11px] text-[#8a7ba8]">
        <span>←</span>
        <span>Swipe left/right or tap side preview to slide</span>
        <span>→</span>
      </div>

      {/* COMMUNITY COMMENTS & APPRECIATION */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-pink-400">💬</span>
              <h4 className="text-sm font-bold text-white">
                Community Cheers ({comments.length})
              </h4>
            </div>
            <span className="text-xs text-[#8a7ba8]">
              Cheer for {currentItem.name.split(" ")[0]}
            </span>
          </div>

          {/* Comment input form */}
          <form onSubmit={handlePostComment} className="mt-4 flex flex-col gap-2">
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

          {/* Comments Feed */}
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
                      type="button"
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
  );
}
