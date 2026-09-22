import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
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
import { Avatar } from "./ui";

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

  // TRUE SHUFFLE ON MOUNT:
  // Freshly shuffles all items each visit/session so repeat visitors see variety rather than the same video
  const [ordered, setOrdered] = useState<Testimonial[]>(() => {
    if (!items.length) return [];
    return [...items].sort(() => Math.random() - 0.5);
  });

  useEffect(() => {
    if (items.length) {
      setOrdered([...items].sort(() => Math.random() - 0.5));
    }
  }, [items]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showUnmuteHint, setShowUnmuteHint] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Comments state
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");

  const total = ordered.length;
  const currentItem = ordered[currentIndex] || items[0];
  const prevIndex = (currentIndex - 1 + total) % total;
  const nextIndex = (currentIndex + 1) % total;
  const prevItem = ordered[prevIndex];
  const nextItem = ordered[nextIndex];

  // Link to real student profile if kr8Id exists and matches a registered student
  const linkedStudent = useMemo(() => {
    if (!currentItem?.kr8Id) return null;
    const allStudents = getStudents();
    return allStudents.find((s) => s.id.toLowerCase() === currentItem.kr8Id?.trim().toLowerCase()) || null;
  }, [currentItem?.kr8Id]);

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
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
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

  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
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

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // General shareable link (landing on full testimonial library, not a single person's page)
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

  // Active student avatar: prefer real linked profile avatar if present
  const activeAvatar = linkedStudent?.avatar || currentItem.img || generateDefaultAvatar(currentItem.name, currentItem.id);

  return (
    <div id="student-stories" className="relative w-full max-w-6xl mx-auto">
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-pink-500/20 border border-pink-500/40 px-3 py-1 text-xs font-bold text-pink-300 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse" />
            Live Student Testimonials
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

      {/* SLIDING CAROUSEL STAGE */}
      <div
        className="relative flex items-center justify-center overflow-hidden py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop Left / Previous Arrow */}
        <button
          onClick={handlePrev}
          aria-label="Previous story"
          className="absolute left-2 sm:left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-pink-600 hover:border-pink-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
        >
          <span className="text-xl">‹</span>
        </button>

        {/* Carousel Visual Row */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-full">
          {/* PREVIOUS VIDEO PREVIEW (Faded & Dimmed on Left) */}
          {prevItem && (
            <div
              onClick={handlePrev}
              className="relative hidden md:flex flex-col items-center opacity-35 hover:opacity-75 scale-90 -mr-10 lg:-mr-8 z-10 cursor-pointer transition-all duration-500 shrink-0 select-none group"
            >
              <div className="relative w-[180px] lg:w-[220px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/10 bg-black shadow-lg">
                <img
                  src={prevItem.img}
                  alt={prevItem.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 group-hover:bg-pink-600 transition-colors">
                    ‹
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <p className="text-xs font-bold text-white truncate">{prevItem.name}</p>
                  <p className="text-[10px] text-pink-300 truncate">{prevItem.skill}</p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE CENTER VIDEO PLAYER */}
          <div
            ref={containerRef}
            className="group relative w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-pink-500/40 bg-black shadow-2xl glow-pink-sm z-20 shrink-0 select-none transition-all duration-500"
          >
            {/* Ambient Back Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-pink-500/30 via-purple-600/20 to-blue-500/20 blur-xl pointer-events-none" />

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
              className="h-full w-full object-cover cursor-pointer"
            />

            {/* Tap to Unmute Overlay Hint */}
            {isMuted && showUnmuteHint && (
              <button
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
                className="group/seek relative h-2 w-full cursor-pointer rounded-full bg-white/20 overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-pink transition-all duration-100"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
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
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>

                {/* Right Action Icons: Play, Mute, CC, Share */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
                  >
                    <span className="text-xs">{isPlaying ? "❚❚" : "▶"}</span>
                  </button>
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
                  >
                    <span className="text-xs">{isMuted ? "🔇" : "🔊"}</span>
                  </button>
                  <button
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    aria-label="Toggle subtitles"
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      captionsEnabled
                        ? "bg-gradient-pink text-white"
                        : "bg-white/15 text-white/50"
                    }`}
                  >
                    CC
                  </button>
                  <button
                    onClick={handleShareActive}
                    aria-label="Share story"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 backdrop-blur-sm transition-all"
                    title="Share this specific story"
                  >
                    <Icon name="share" size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NEXT VIDEO PREVIEW (Faded & Dimmed on Right) */}
          {nextItem && (
            <div
              onClick={handleNext}
              className="relative hidden md:flex flex-col items-center opacity-35 hover:opacity-75 scale-90 -ml-10 lg:-ml-8 z-10 cursor-pointer transition-all duration-500 shrink-0 select-none group"
            >
              <div className="relative w-[180px] lg:w-[220px] aspect-[9/16] rounded-3xl overflow-hidden border border-white/10 bg-black shadow-lg">
                <img
                  src={nextItem.img}
                  alt={nextItem.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 group-hover:bg-pink-600 transition-colors">
                    ›
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <p className="text-xs font-bold text-white truncate">{nextItem.name}</p>
                  <p className="text-[10px] text-pink-300 truncate">{nextItem.skill}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Right / Next Arrow */}
        <button
          onClick={handleNext}
          aria-label="Next story"
          className="absolute right-2 sm:right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md hover:bg-pink-600 hover:border-pink-500 hover:scale-110 active:scale-95 transition-all shadow-xl"
        >
          <span className="text-xl">›</span>
        </button>
      </div>

      {/* SWIPE HINT ON MOBILE */}
      <div className="mt-2 text-center text-xs text-[#8a7ba8] md:hidden">
        ← Swipe left / right or tap next to advance stories →
      </div>

      {/* DETAILS & COMMUNITY CHEERS SECTION */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* STUDENT BIO & VERIFICATION CARD (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Avatar src={activeAvatar} name={currentItem.name} size={48} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-base">{currentItem.name}</h4>
                {linkedStudent && (
                  <span className="flex items-center text-emerald-400" title="Verified KR8 Student">
                    <Icon name="check" size={14} />
                  </span>
                )}
              </div>
              <p className="text-xs text-pink-300 font-semibold">{currentItem.skill}</p>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-4 rounded-2xl bg-black/40 p-4 border border-white/5">
            <p className="text-xs text-[#d8cde8] leading-relaxed italic">
              "{currentItem.caption}"
            </p>
          </div>

          {/* VERIFIED STUDENT PROFILE CONNECTION */}
          {linkedStudent ? (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Verified KR8 Student Profile
                </span>
                <span className="font-mono text-[10px] text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded">
                  {linkedStudent.id}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#b8aecf]">
                Authenticity confirmed. This testimonial belongs to verified active student{" "}
                <strong className="text-white">{linkedStudent.name}</strong>.
              </p>
              <div className="mt-3 flex gap-2">
                <Link
                  to={`/verify?id=${linkedStudent.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  <span>Verify Student Credential ↗</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-3 text-[11px] text-[#8a7ba8]">
              Published graduate testimonial · KR8 Digitals Creative Community
            </div>
          )}

          {/* Share Option */}
          <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/5">
            <button
              onClick={handleShareActive}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-pink py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Icon name="share" size={13} />
              <span>Share {currentItem.name.split(" ")[0]}'s Story</span>
            </button>
            <button
              onClick={handleShareGeneral}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 active:scale-95 transition-all"
              title="Share full library"
            >
              <span>All Stories ↗</span>
            </button>
          </div>
        </div>

        {/* COMMUNITY CHEERS & COMMENTS (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
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

      {/* NUMBERED STORIES PAGINATION ROW (Scalable up to 50k+ videos) */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Student Stories Library
            </h4>
            <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-pink-300">
              Story #{currentIndex + 1} of {total}
            </span>
          </div>
          <p className="text-xs text-[#a594c7]">
            Select any story number to play · Click any number to jump
          </p>
        </div>

        {/* Numbered Row with Smart Windowing */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            {/* Previous Button */}
            <button
              onClick={handlePrev}
              className="flex h-9 items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/15 transition-all"
            >
              <span>←</span>
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Smart Windowing for Up to 50k videos */}
            {(() => {
              const current = currentIndex + 1;
              const pages: (number | "dots-left" | "dots-right")[] = [];

              if (total <= 12) {
                for (let i = 1; i <= total; i++) pages.push(i);
              } else {
                pages.push(1);
                if (current > 4) pages.push("dots-left");

                const start = Math.max(2, current - 2);
                const end = Math.min(total - 1, current + 2);

                for (let i = start; i <= end; i++) pages.push(i);

                if (current < total - 3) pages.push("dots-right");
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
              className="flex h-9 items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/15 transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <span>→</span>
            </button>
          </div>

          {/* Direct Jump to Video Number Input */}
          {total > 5 && (
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
                  max={total}
                  placeholder={`1-${total}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = parseInt((e.target as HTMLInputElement).value, 10);
                      if (val >= 1 && val <= total) {
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
