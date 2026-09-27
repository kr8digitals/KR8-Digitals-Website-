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

  // Handle local file upload for images
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle local file upload for videos
  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Check file size (warn if > 25MB for direct local storage)
    if (file.size > 25 * 1024 * 1024) {
      alert("Large video file detected (>25MB). We recommend hosting on Cloudinary/YouTube/Vimeo or Supabase and pasting the URL.");
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoUrl(event.target?.result as string);
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
            Create rich multi-format announcements. Supports text updates, image showcases, and embedded video announcements.
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
              {/* Type Selector: Text / Image / Video */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-2">
                  Announcement Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("text")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      type === "text"
                        ? "bg-gradient-pink text-white border-pink-500 shadow-sm"
                        : "border-white/10 bg-white/[0.02] text-[#8a7ba8] hover:text-white"
                    }`}
                  >
                    <span>📝</span>
                    <span>Text Notice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("image")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      type === "image"
                        ? "bg-gradient-pink text-white border-pink-500 shadow-sm"
                        : "border-white/10 bg-white/[0.02] text-[#8a7ba8] hover:text-white"
                    }`}
                  >
                    <span>🖼️</span>
                    <span>Image / Flyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("video")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      type === "video"
                        ? "bg-gradient-pink text-white border-pink-500 shadow-sm"
                        : "border-white/10 bg-white/[0.02] text-[#8a7ba8] hover:text-white"
                    }`}
                  >
                    <span>🎬</span>
                    <span>Video Clip</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cohort 5 Applications Are Officially Open"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Body / Description
                </label>
                <textarea
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write announcement details..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Image Media Controls */}
              {type === "image" && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">
                      Image / Flyer Media
                    </label>
                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="block text-[11px] text-[#8a7ba8] mb-1">Upload from Device:</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-xs text-[#8a7ba8] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-pink-500/20 file:text-pink-300 hover:file:bg-pink-500/30"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-[#8a7ba8] mb-1">Or Paste Image URL:</span>
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Video Media Controls */}
              {type === "video" && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">
                      Video Announcement Media
                    </label>
                    {videoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setVideoUrl("");
                          setVideoPoster("");
                        }}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Remove Video
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="block text-[11px] text-[#8a7ba8] mb-1">Upload MP4 / WebM:</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="text-xs text-[#8a7ba8] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-[#8a7ba8] mb-1">Or Paste Direct Video URL:</span>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-[#8a7ba8] mb-1">Optional Video Poster Frame URL:</span>
                    <input
                      type="url"
                      value={videoPoster}
                      onChange={(e) => setVideoPoster(e.target.value)}
                      placeholder="https://example.com/poster.jpg"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Author & Speaker */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                    Author / Desk
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. KR8 Executive Team"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf] mb-1">
                    Guest Speaker (Optional)
                  </label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="e.g. Timfire / Stevenson"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-full border border-white/15 text-xs text-[#b8aecf] hover:text-white"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-full bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:opacity-90 transition-all"
                >
                  {editingId ? "Update Announcement" : "Publish Announcement"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8a7ba8]">
              Live Preview
            </span>
            <span className="text-[10px] text-pink-400">Updates dynamically</span>
          </div>
          <AnnouncementCard announcement={previewAnnouncement} />
        </div>
      </div>

      {/* Published Announcements List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-white text-lg">
            Published Announcements ({items.length})
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((a) => (
            <div key={a.id} className="relative group">
              <AnnouncementCard announcement={a} />
              {/* Quick Action Toolbar */}
              <div className="mt-2 flex items-center justify-end gap-2 px-2">
                <button
                  onClick={() => startEditing(a)}
                  className="px-3 py-1 rounded-lg border border-white/15 bg-white/[0.04] text-[11px] text-[#cabfe0] hover:text-white hover:border-pink-500/40 transition-colors"
                >
                  Edit Media / Content
                </button>
                <button
                  onClick={() => handleArchive(a.id)}
                  className="px-3 py-1 rounded-lg border border-purple-500/30 bg-purple-500/10 text-[11px] text-purple-300 hover:bg-purple-500/20 transition-colors"
                >
                  Archive to Gallery
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="px-3 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 text-[11px] text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
