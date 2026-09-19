import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getBlogPosts,
  createBlogPost,
  toggleLikePost,
  addPostComment,
  toggleFollowUser,
  type BlogPost,
} from "../data/store";
import { useAuth } from "../context/AuthContext";
import { Pill, GradientButton, GhostButton } from "../components/ui";
import Icon from "../components/Icon";

const cats = ["All", "Digital Skills", "AI", "Community", "Announcements", "Company News", "Creative Showcase"];

export default function Blog() {
  const { user, addNotification } = useAuth();
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>(getBlogPosts);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [targetCreator, setTargetCreator] = useState<string>("");
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // New Story Form State
  const [storyTitle, setStoryTitle] = useState("");
  const [storyCategory, setStoryCategory] = useState("Community");
  const [storyMediaType, setStoryMediaType] = useState<"text" | "image" | "video">("image");
  const [storyMediaUrl, setStoryMediaUrl] = useState("");
  const [storyExcerpt, setStoryExcerpt] = useState("");
  const [storyContent, setStoryContent] = useState("");

  // Comment input state for active post
  const [commentName, setCommentName] = useState(user?.name || "");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const refresh = () => setAllPosts(getBlogPosts());
    window.addEventListener("kr8:blog-updated", refresh);
    return () => window.removeEventListener("kr8:blog-updated", refresh);
  }, []);

  useEffect(() => {
    if (user?.name) {
      setCommentName(user.name);
    }
  }, [user]);

  // Handle URL query for direct story linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get("post");
    if (storyId) {
      setOpen(storyId);
    }
  }, []);

  // Filter posts
  const ordered = useMemo(() => {
    const pinned = allPosts.filter((b) => b.pinned);
    const rest = allPosts.filter((b) => !b.pinned);
    return [...pinned, ...rest];
  }, [allPosts]);

  const posts = cat === "All" ? ordered : ordered.filter((b) => b.category === cat);
  const active = allPosts.find((b) => b.id === open);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setStoryMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePublishStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setWriteModalOpen(false);
      setTargetCreator("Creators");
      setAuthPromptOpen(true);
      return;
    }

    if (!storyTitle.trim() || !storyContent.trim()) {
      addNotification("Please provide a title and story content.");
      return;
    }

    const isFounder = user.type === "founder";
    const authorName = isFounder ? "Timfire" : user.name;
    const source = isFounder || user.admin ? "admin" : user.type === "student" ? "student" : "tribe";

    createBlogPost({
      title: storyTitle,
      excerpt: storyExcerpt || storyContent.slice(0, 150) + "...",
      content: storyContent,
      author: authorName,
      authorId: user.id,
      authorAvatar: user.avatar,
      category: storyCategory,
      mediaType: storyMediaType,
      img: storyMediaType === "image" ? storyMediaUrl : undefined,
      videoUrl: storyMediaType === "video" ? storyMediaUrl : undefined,
      source,
      isPublic: true,
    });

    setAllPosts(getBlogPosts());
    setWriteModalOpen(false);
    setStoryTitle("");
    setStoryExcerpt("");
    setStoryContent("");
    setStoryMediaUrl("");
    addNotification("Story published successfully to the KR8 Community Blog!");
  };

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const userKey = user?.id || `guest-${window.navigator.userAgent.slice(0, 15)}`;
    toggleLikePost(postId, userKey);
    setAllPosts(getBlogPosts());
  };

  const handleShare = (e: React.MouseEvent, postId: string, title: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/blog?post=${postId}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedPostId(postId);
    addNotification(`Copied share link for "${title}"!`);
    setTimeout(() => setCopiedPostId(null), 3000);
  };

  const handleFollow = (e: React.MouseEvent, creatorName: string, creatorId?: string) => {
    e.stopPropagation();
    if (!user) {
      setTargetCreator(creatorName);
      setAuthPromptOpen(true);
      return;
    }

    const target = creatorId || creatorName;
    const followed = toggleFollowUser(user.id, target);
    addNotification(followed ? `You are now following ${creatorName}!` : `Unfollowed ${creatorName}.`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !commentText.trim()) return;

    const author = commentName.trim() || "Creative Guest";
    addPostComment(active.id, {
      author,
      authorId: user?.id,
      avatar: user?.avatar,
      text: commentText.trim(),
    });

    setAllPosts(getBlogPosts());
    setCommentText("");
    addNotification("Comment posted!");
  };

  const isUserFollowing = (authorName: string, authorId?: string) => {
    if (!user || !user.following) return false;
    const key = authorId || authorName;
    return user.following.includes(key);
  };

  // DETAIL VIEW
  if (active) {
    const isLiked = user && active.likedBy?.includes(user.id);
    const following = isUserFollowing(active.author, active.authorId);

    return (
      <div className="section-bg min-h-screen py-14">
        <div className="mx-auto max-w-4xl px-5">
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <button
              onClick={() => setOpen(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300"
            >
              ← Back to all stories
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleShare(e, active.id, active.title)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
              >
                <Icon name="share" size={14} />
                <span>{copiedPostId === active.id ? "Link Copied!" : "Share"}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span className="rounded-full bg-pink-500/15 border border-pink-500/30 px-3 py-1 text-xs font-bold text-pink-400">
              {active.category}
            </span>
            {active.pinned && (
              <span className="rounded-full bg-gradient-pink px-2.5 py-0.5 text-xs font-bold text-white">
                Pinned Official
              </span>
            )}
            {active.source === "student" && (
              <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-xs text-purple-300">
                Academy Student Story
              </span>
            )}
            {active.source === "tribe" && (
              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-0.5 text-xs text-cyan-300">
                Tribe Member Story
              </span>
            )}
          </div>

          <h1 className="font-display mt-4 text-3xl sm:text-5xl uppercase leading-tight text-white font-black">
            {active.title}
          </h1>

          {/* Author bar with Follow Button */}
          <div className="mt-6 flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-pink font-bold text-white shadow-md">
                {active.authorAvatar ? (
                  <img src={active.authorAvatar} alt={active.author} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <span>{active.author.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{active.author}</h4>
                  {active.author.toLowerCase().includes("timfire") && (
                    <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.2">
                      Founder
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8a7ba8]">{active.date} · {active.readTime} read</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleFollow(e, active.author, active.authorId)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-md active:scale-95 ${
                  following
                    ? "bg-white/10 border border-white/20 text-[#b8aecf]"
                    : "bg-gradient-pink text-white hover:brightness-110"
                }`}
              >
                <Icon name={following ? "check" : "users"} size={14} />
                <span>{following ? "Following" : `Follow ${active.author}`}</span>
              </button>
            </div>
          </div>

          {/* Media Player or Hero Image */}
          {active.mediaType === "video" && active.videoUrl ? (
            <div className="mt-8 aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <video src={active.videoUrl} controls className="h-full w-full object-cover" />
            </div>
          ) : active.img ? (
            <div className="mt-8 aspect-video w-full rounded-3xl overflow-hidden bg-black/50 border border-white/10 shadow-2xl">
              <img src={active.img} alt={active.title} className="h-full w-full object-cover" />
            </div>
          ) : null}

          {/* Story Body */}
          <div className="mt-8 rounded-3xl border border-white/5 bg-black/20 p-6 sm:p-8 space-y-5 text-[#d8cde8] text-base leading-relaxed whitespace-pre-line">
            <p className="font-semibold text-lg text-white leading-normal">{active.excerpt}</p>
            <div>{active.content || active.excerpt}</div>
            
            <div className="mt-8 rounded-2xl border border-pink-500/20 bg-pink-500/5 p-5 text-sm text-[#cabfe0]">
              <p className="font-bold text-white mb-1">Think It. KR8 It</p>
              <p className="text-xs text-[#b8aecf]">
                KR8 Digitals is an open African creative ecosystem empowering creators with high-demand digital skills,
                agency pipelines, and global community. Learn free or hire our creative talent today.
              </p>
            </div>
          </div>

          {/* Interaction Bar (Like, Share, Comment Count) */}
          <div className="mt-6 flex items-center justify-between border-y border-white/10 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => handleLike(e, active.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-90 ${
                  isLiked
                    ? "bg-pink-500/20 border border-pink-500/40 text-pink-300 shadow-lg glow-pink-sm"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                <Icon name="heart" size={16} className={isLiked ? "fill-pink-400 text-pink-400" : ""} />
                <span>{active.likes} Likes</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs text-[#8a7ba8]">
                <Icon name="message" size={16} />
                <span>{active.comments?.length || 0} Comments</span>
              </div>
            </div>

            <button
              onClick={(e) => handleShare(e, active.id, active.title)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-[#b8aecf] hover:text-white"
            >
              <Icon name="share" size={14} />
              <span>Share Story</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="mt-10">
            <h3 className="text-lg font-bold text-white mb-4">
              Discussion & Thoughts ({active.comments?.length || 0})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3 mb-6">
              {!user && (
                <div>
                  <label className="block text-xs font-semibold text-[#8a7ba8] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chidera or Guest Creator"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#8a7ba8] mb-1">Join the conversation</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share your perspective, feedback or encouragement..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  Post Comment
                </button>
              </div>
            </form>

            {/* Comment list */}
            <div className="space-y-3">
              {!active.comments || active.comments.length === 0 ? (
                <p className="text-center py-6 text-xs text-[#8a7ba8]">
                  No comments yet. Be the first to start the discussion!
                </p>
              ) : (
                active.comments.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-white/5 bg-black/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-pink-300">
                          {c.author.charAt(0).toUpperCase()}
                        </span>
                        <h5 className="font-bold text-white text-xs">{c.author}</h5>
                        {c.author.toLowerCase().includes("timfire") && (
                          <span className="rounded bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2">
                            Founder
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#7d6f96]">{c.date}</span>
                    </div>
                    <p className="text-xs text-[#d8cde8] mt-2 leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN BLOG FEED VIEW
  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6">
          <div>
            <Pill>Open Community Blog</Pill>
            <h1 className="font-display mt-4 text-4xl sm:text-6xl text-white uppercase font-black">
              Insights, stories & <span className="text-gradient">skills.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-[#b8aecf]">
              An open platform for African creators and learners. Publicly readable by all. Registered members can
              publish stories, case studies, videos, and tutorials.
            </p>
          </div>

          <div className="shrink-0">
            {user ? (
              <button
                onClick={() => setWriteModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-pink px-5 py-3 text-xs font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition-all glow-pink-sm"
              >
                <Icon name="pen" size={16} />
                <span>Write a Story →</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setTargetCreator("Creators");
                  setAuthPromptOpen(true);
                }}
                className="flex items-center gap-2 rounded-2xl border border-pink-500/40 bg-pink-500/10 px-5 py-3 text-xs font-bold text-pink-300 hover:bg-pink-500/20 active:scale-95 transition-all"
              >
                <Icon name="pen" size={16} />
                <span>Join & Write Stories →</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-6 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                cat === c ? "bg-gradient-pink text-white shadow-md" : "border border-white/15 text-[#b8aecf] hover:border-white/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((b) => {
            const following = isUserFollowing(b.author, b.authorId);
            return (
              <div
                key={b.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] hover:border-pink-500/40 transition-all shadow-xl"
              >
                <div>
                  {/* Media container */}
                  <div
                    onClick={() => setOpen(b.id)}
                    className="relative aspect-video overflow-hidden bg-black/40 cursor-pointer"
                  >
                    {b.mediaType === "video" && b.videoUrl ? (
                      <div className="relative h-full w-full">
                        <video src={b.videoUrl} className="h-full w-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg">
                            ▶
                          </span>
                        </span>
                      </div>
                    ) : b.img ? (
                      <img
                        src={b.img}
                        alt={b.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-900/30 to-purple-900/30 text-white">
                        <Icon name="book" size={32} className="text-pink-400/60" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-pink-300 border border-white/10">
                      {b.category}
                    </span>
                    {b.pinned && (
                      <span className="absolute top-3 right-3 rounded-full bg-gradient-pink px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                        Pinned
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-[#8a7ba8] mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{b.author}</span>
                        {b.source === "student" && (
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-pink-300">
                            Student
                          </span>
                        )}
                        {b.source === "tribe" && (
                          <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] text-cyan-300">
                            Tribe
                          </span>
                        )}
                      </div>
                      <span>{b.readTime}</span>
                    </div>

                    <h3
                      onClick={() => setOpen(b.id)}
                      className="cursor-pointer font-bold text-white text-base leading-snug group-hover:text-pink-300 transition-colors line-clamp-2"
                    >
                      {b.title}
                    </h3>
                    <p
                      onClick={() => setOpen(b.id)}
                      className="cursor-pointer mt-2 line-clamp-2 text-xs text-[#b8aecf] leading-relaxed"
                    >
                      {b.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 border-t border-white/5 flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => handleLike(e, b.id)}
                      className="flex items-center gap-1.5 text-[#b8aecf] hover:text-pink-400 transition-colors"
                      title="Like Story"
                    >
                      <Icon name="heart" size={14} />
                      <span>{b.likes || 0}</span>
                    </button>
                    <button
                      onClick={() => setOpen(b.id)}
                      className="flex items-center gap-1.5 text-[#b8aecf] hover:text-white transition-colors"
                      title="Comments"
                    >
                      <Icon name="message" size={14} />
                      <span>{b.comments?.length || 0}</span>
                    </button>
                    <button
                      onClick={(e) => handleShare(e, b.id, b.title)}
                      className="text-[#8a7ba8] hover:text-white transition-colors"
                      title="Share link"
                    >
                      <Icon name="share" size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleFollow(e, b.author, b.authorId)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                        following
                          ? "bg-white/10 text-[#b8aecf]"
                          : "bg-pink-500/10 text-pink-300 border border-pink-500/30 hover:bg-pink-500/20"
                      }`}
                    >
                      {following ? "Following" : "Follow"}
                    </button>
                    <button
                      onClick={() => setOpen(b.id)}
                      className="font-bold text-pink-400 hover:text-pink-300 text-xs"
                    >
                      Read →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {posts.length === 0 && (
          <div className="mt-16 text-center py-12 rounded-3xl border border-white/10 bg-black/20">
            <p className="text-[#8a7ba8] text-sm">No stories in "{cat}" yet.</p>
            {user && (
              <button
                onClick={() => setWriteModalOpen(true)}
                className="mt-4 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white"
              >
                Be the first to write in this category →
              </button>
            )}
          </div>
        )}
      </div>

      {/* CREATE STORY MODAL (REGISTERED USERS) */}
      {writeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-[#160d2b] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Icon name="pen" size={18} className="text-pink-400" />
                <h4 className="font-bold text-white text-base">Write a Community Story</h4>
              </div>
              <button
                onClick={() => setWriteModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishStory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Story Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How I Built My First Brand Identity in 2 Weeks"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Category *</label>
                  <select
                    value={storyCategory}
                    onChange={(e) => setStoryCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    {cats
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Media Type</label>
                  <select
                    value={storyMediaType}
                    onChange={(e) => setStoryMediaType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    <option value="image">Image (Cover)</option>
                    <option value="video">Video</option>
                    <option value="text">Text Only</option>
                  </select>
                </div>
              </div>

              {storyMediaType !== "text" && (
                <div>
                  <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">
                    Upload or paste media URL ({storyMediaType})
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept={storyMediaType === "image" ? "image/*" : "video/*"}
                      onChange={handleMediaUpload}
                      className="w-full text-xs text-[#8a7ba8] file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20"
                    />
                    <input
                      type="text"
                      placeholder={`Or paste ${storyMediaType} URL`}
                      value={storyMediaUrl}
                      onChange={(e) => setStoryMediaUrl(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Summary / Excerpt</label>
                <input
                  type="text"
                  placeholder="One sentence hook for the feed card"
                  value={storyExcerpt}
                  onChange={(e) => setStoryExcerpt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">Story Content *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Share your creative breakdown, learnings, steps, and tips..."
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setWriteModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-[#b8aecf]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  Publish Story →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT PROMPT MODAL (FOR FOLLOWING CREATORS OR WRITING STORIES) */}
      {authPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-pink-500/30 bg-[#160d2b] p-6 shadow-2xl text-center">
            <button
              onClick={() => setAuthPromptOpen(false)}
              className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              ✕
            </button>

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-pink text-white shadow-lg">
              <Icon name="users" size={24} />
            </div>

            <h3 className="text-xl font-bold text-white">
              Create an Account to Follow {targetCreator || "Creators"}
            </h3>
            <p className="mt-2 text-xs text-[#b8aecf] leading-relaxed">
              Join the KR8 community to follow your favorite creators, write community stories, participate in
              challenges, and master high-demand digital skills.
            </p>

            <div className="mt-6 space-y-2.5">
              <GradientButton to="/tribe#join" className="w-full">
                Join KR8 Tribe (Free, No ID) →
              </GradientButton>
              <GhostButton to="/academy" className="w-full">
                Register as Academy Student →
              </GhostButton>
            </div>

            <p className="mt-4 text-[11px] text-[#8a7ba8]">
              Already have an account?{" "}
              <Link to="/academy" className="text-pink-400 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
