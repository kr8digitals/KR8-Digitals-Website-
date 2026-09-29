import { useState, type ChangeEvent } from "react";
import {
  getAnnouncements,
  saveAnnouncements,
  archiveAnnouncementToGallery,
  type Announcement,
} from "../../data/store";
import { Card, Pill } from "../ui";
import Icon from "../Icon";
import AnnouncementCard from "../AnnouncementCard";
import { saveMediaAsset } from "../../utils/mediaStorage";

export default function AnnouncementManager() {
  const [items, setItems] = useState<Announcement[]>(() => getAnnouncements());
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState<"text" | "image" | "video">("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("Admin Desk");
  const [speaker, setSpeaker] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPoster, setVideoPoster] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setType("text");
    setTitle("");
    setBody("");
    setAuthor("Admin Desk");
    setSpeaker("");
    setImageUrl("");
    setVideoUrl("");
    setVideoPoster("");
    setUploadProgress(null);
  };

  // Populate form for editing
  const startEditing = (a: Announcement) => {
    setEditingId(a.id);
    setType(a.type === "video" || a.videoUrl ? "video" : a.image ? "image" : "text");
    setTitle(a.title);
    setBody(a.body || a.caption || "");
    setAuthor(a.author || "Admin Desk");
    setSpeaker(a.speaker || "");
    setImageUrl(a.image || "");
    setVideoUrl(a.videoUrl || "");
    setVideoPoster(a.videoPoster || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle local file upload for images (stored in IndexedDB to avoid quota errors)
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(`Processing image: ${file.name}...`);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const idbKey = `idb:img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await saveMediaAsset(idbKey, dataUrl);
      setImageUrl(idbKey);
      setUploadProgress(`✓ Image "${file.name}" uploaded to media vault!`);
      setTimeout(() => setUploadProgress(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Handle local file upload for videos (stored in IndexedDB to avoid quota errors)
  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(`Processing video: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const idbKey = `idb:vid-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await saveMediaAsset(idbKey, dataUrl);
      setVideoUrl(idbKey);
      setUploadProgress(`✓ Video "${file.name}" uploaded to media vault!`);
      setTimeout(() => setUploadProgress(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Save / Publish
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (editingId) {
      // Update existing
      const updated = items.map((a) => {
        if (a.id === editingId) {
          return {
            ...a,
            type,
            title: title.trim(),
            body: body.trim(),
            caption: body.trim(),
            author: author.trim() || "Admin Desk",
            speaker: speaker.trim() || undefined,
            image: type === "image" ? imageUrl.trim() : undefined,
            videoUrl: type === "video" ? videoUrl.trim() : undefined,
            videoPoster: type === "video" ? (videoPoster.trim() || imageUrl.trim() || undefined) : undefined,
          };
        }
        return a;
      });
      saveAnnouncements(updated);
      setItems(updated);
      setFeedback("Announcement updated successfully!");
    } else {
      // Create new
      const newAnnouncement: Announcement = {
        id: "a-" + Date.now(),
        type,
        title: title.trim(),
        body: body.trim(),
        caption: body.trim(),
        date: formattedDate,
        author: author.trim() || "Admin Desk",
        speaker: speaker.trim() || undefined,
        image: type === "image" ? imageUrl.trim() : undefined,
        videoUrl: type === "video" ? videoUrl.trim() : undefined,
        videoPoster: type === "video" ? (videoPoster.trim() || imageUrl.trim() || undefined) : undefined,
        active: true,
      };
      const updated = [newAnnouncement, ...items];
      saveAnnouncements(updated);
      setItems(updated);
      setFeedback("Announcement published successfully!");
    }

    resetForm();
    setTimeout(() => setFeedback(null), 3000);
  };

  // Delete
  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    const updated = items.filter((a) => a.id !== id);
    saveAnnouncements(updated);
    setItems(updated);
    if (editingId === id) resetForm();
    setFeedback("Announcement deleted.");
    setTimeout(() => setFeedback(null), 3000);
  };

  // Archive to gallery
  const handleArchive = (id: string) => {
    archiveAnnouncementToGallery(id);
    const updated = items.filter((a) => a.id !== id);
    saveAnnouncements(updated);
    setItems(updated);
    setFeedback("Announcement archived to Gallery!");
    setTimeout(() => setFeedback(null), 3000);
  };

  // Create preview announcement object
  const previewAnnouncement: Announcement = {
    id: "preview",
    type,
    title: title.trim() || "Announcement Title Preview",
    body: body.trim() || "Announcement details will appear here as you type...",
    date: "Today",
    author: author.trim() || "Admin Desk",
    speaker: speaker.trim() || undefined,
    image: imageUrl.trim() || undefined,
    videoUrl: videoUrl.trim() || undefined,
    videoPoster: videoPoster.trim() || undefined,
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <Icon name="bell" className="h-4 w-4" />
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Announcements & <span className="text-gradient">Media Broadcast</span>
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#b8aecf]">
            Create rich multi-format announcements. Supports text updates, image showcases, YouTube / Vimeo links, and direct video uploads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Pill className="text-xs">{items.length} Active Broadcasts</Pill>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-pink-500/40 bg-pink-500/10 p-4 text-xs font-semibold text-pink-300">
          ✓ {feedback}
        </div>
      )}

      {uploadProgress && (
        <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3.5 text-xs font-semibold text-blue-300 animate-pulse">
          ⏳ {uploadProgress}
        </div>
      )}

      {/* Grid: Creation / Edit Form + Live Preview */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display font-bold text-white text-base">
                {editingId ? "Edit Announcement" : "Compose New Announcement"}
              </h3>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-[#8a7ba8] hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-2">
                  Broadcast Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "text", label: "Text Notice", icon: "pen" },
                    { id: "image", label: "Visual Flyer", icon: "palette" },
                    { id: "video", label: "Video Broadcast", icon: "video" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as any)}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        type === t.id
                          ? "border-pink-500 bg-gradient-pink text-white shadow-md shadow-pink-500/20"
                          : "border-white/10 bg-black/40 text-[#b8aecf] hover:bg-white/5"
                      }`}
                    >
                      <Icon name={t.icon as any} className="h-3.5 w-3.5" />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Headline / Title <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mindset Shift Masterclass with Guest Director"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Author & Speaker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                    Broadcaster Name
                  </label>
                  <input
                    type="text"
                    placeholder="Admin Desk"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                    Guest Speaker (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stevenson (Motionverse)"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Body / Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Announcement Details & Information
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive details, instructions, or cohort notices..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Image Upload / URL (When Visual Flyer or Video Poster) */}
              {(type === "image" || type === "video") && (
                <div className="space-y-2 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">
                    {type === "image" ? "Flyer / Banner Image" : "Video Poster Image (Optional)"}
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Paste image URL (https://...)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                    />
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">
                      <Icon name="palette" className="h-3.5 w-3.5 text-pink-400" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Video Upload / URL (When Video Broadcast) */}
              {type === "video" && (
                <div className="space-y-2 p-4 rounded-2xl border border-pink-500/30 bg-pink-500/[0.02]">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-pink-300">
                    Video Stream / Source (YouTube, Vimeo, MP4 URL, or Upload)
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Paste YouTube, Vimeo, or MP4 URL..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                    />
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-500/10 px-4 py-2 text-xs font-semibold text-pink-200 hover:bg-pink-500/20">
                      <Icon name="video" className="h-3.5 w-3.5 text-pink-400" />
                      <span>Upload Video File</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-[#8a7ba8]">
                    Supports all direct video uploads (stored securely in local media vault) or live links from YouTube, Vimeo, and MP4 hosts.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all"
                >
                  {editingId ? "Update Broadcast" : "Publish Announcement Now →"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Real-time Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="px-1 text-xs font-bold uppercase tracking-wider text-[#8a7ba8]">
            Live Announcement Preview
          </div>
          <AnnouncementCard announcement={previewAnnouncement} />
        </div>
      </div>

      {/* Broadcast History & Archives */}
      <Card className="p-6">
        <h3 className="font-display font-bold text-white text-base mb-4">
          Active Announcements Roster ({items.length})
        </h3>

        {items.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#8a7ba8]">
            No announcements currently published. Use the composer above to broadcast an update.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30">
                    <Icon name={a.type === "video" || a.videoUrl ? "video" : a.image ? "palette" : "bell"} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{a.title}</h4>
                    <p className="text-[11px] text-[#8a7ba8]">
                      {a.date} · By {a.author || "KR8 Admin"}
                      {a.speaker && ` · Speaker: ${a.speaker}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => startEditing(a)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchive(a.id)}
                    className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20"
                    title="Archive to Public Gallery"
                  >
                    Archive to Gallery
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
