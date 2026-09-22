import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getGalleryItems,
  addGalleryItem,
  type GalleryItem,
} from "../data/store";
import { Pill, GhostButton } from "../components/ui";

const CATEGORIES = [
  "All",
  "Flyers & Posters",
  "Brand Identity",
  "Student Showcases",
  "Video Clips",
  "Event Moments",
  "Community Archives",
] as const;

export default function Gallery() {
  const { student, addNotification } = useAuth();
  const [filter, setFilter] = useState<string>("All");
  const [items, setItems] = useState<GalleryItem[]>(() =>
    getGalleryItems({ status: "approved" })
  );
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Viewer Submission Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: "",
    description: "",
    category: "Student Showcases" as GalleryItem["category"],
    mediaType: "image" as "image" | "video",
    url: "",
    contributorName: student?.name || "",
    contributorEmail: student?.email || "",
  });
  const [filePreview, setFilePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getGalleryItems({ status: "approved", category: filter }));
    };
    window.addEventListener("kr8:gallery-updated", handleUpdate);
    return () => window.removeEventListener("kr8:gallery-updated", handleUpdate);
  }, [filter]);

  const filteredItems = items.filter((item) => {
    if (filter === "All") return true;
    return item.category === filter;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video/");
    setSubmitForm((prev) => ({
      ...prev,
      mediaType: isVid ? "video" : "image",
    }));

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      setFilePreview(result);
      setSubmitForm((prev) => ({ ...prev, url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.title.trim() || (!submitForm.url.trim() && !filePreview)) {
      addNotification("Please provide a title and upload an image or video.");
      return;
    }

    setSubmitting(true);

    const isStaff = student?.admin || student?.type === "founder" || student?.type === "co-founder";

    addGalleryItem({
      title: submitForm.title.trim(),
      description: submitForm.description.trim(),
      category: submitForm.category,
      mediaType: submitForm.mediaType,
      url: submitForm.url || filePreview,
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      author: submitForm.contributorName.trim() || "Community Creator",
      authorRole: isStaff ? "Staff Team" : "Viewer Submission",
      status: isStaff ? "approved" : "pending", // Staff items auto-approve, viewer submissions require admin approval
      featured: false,
    });

    setSubmitting(false);
    setSubmittedSuccess(true);
    addNotification(
      isStaff
        ? "Gallery post published immediately!"
        : "Submission received! Our directors will review it before publishing."
    );

    setTimeout(() => {
      setShowSubmitModal(false);
      setSubmittedSuccess(false);
      setSubmitForm({
        title: "",
        description: "",
        category: "Student Showcases",
        mediaType: "image",
        url: "",
        contributorName: student?.name || "",
        contributorEmail: student?.email || "",
      });
      setFilePreview("");
    }, 2000);
  };

  return (
    <div className="section-bg min-h-screen pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 border-b border-white/5">
        <div className="absolute top-0 right-1/4 h-80 w-80 rounded-full bg-gradient-to-bl from-pink-500/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-5 text-center">
          <Pill>Official Archive & Living Showcase</Pill>
          <h1 className="font-display mt-5 text-4xl text-white sm:text-6xl font-bold">
            The Living Gallery of <span className="text-gradient">African Craft.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-[#cabfe0] leading-relaxed">
            Every promotional campaign, brand identity sprint, video showreel, and creative milestone preserved forever. Nothing is ever lost — our collective history compounds with every cohort.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="rounded-full bg-gradient-pink px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-pink-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>+ Suggest / Submit Media</span>
            </button>
            <GhostButton to="/agency">View Agency Client Work →</GhostButton>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  filter === cat
                    ? "bg-gradient-pink text-white shadow-lg shadow-pink-500/20"
                    : "border border-white/10 bg-white/[0.03] text-[#b8aecf] hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY GRID */}
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-5">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <span className="text-4xl">🎨</span>
              <h3 className="font-bold text-white text-lg mt-3">No archived items in this category yet</h3>
              <p className="text-xs text-[#8a7ba8] mt-1">
                Be the first to suggest or submit a design, flyer, or video clip!
              </p>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="mt-4 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow"
              >
                Submit Media to Gallery +
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#160d2b]/60 transition-all duration-300 hover:border-pink-500/40 hover:shadow-2xl hover:shadow-pink-500/10 backdrop-blur-md"
                >
                  <div>
                    {/* Media Frame */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60">
                      {item.mediaType === "video" ? (
                        <div className="relative h-full w-full">
                          <video
                            src={item.url}
                            poster={item.thumbnail}
                            className="h-full w-full object-cover"
                            controls
                            playsInline
                          />
                          <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-pink-300 border border-white/10 backdrop-blur-md">
                            🎬 Video Clip
                          </span>
                        </div>
                      ) : (
                        <div
                          className="h-full w-full cursor-pointer relative"
                          onClick={() => setLightboxItem(item)}
                        >
                          <img
                            src={item.url}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="rounded-full bg-gradient-pink px-3.5 py-1.5 text-xs font-bold text-white shadow-xl">
                              Inspect Artwork 🔍
                            </span>
                          </div>
                          <span className="absolute top-3 left-3 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-pink-300 border border-white/10 backdrop-blur-md">
                            🖼️ {item.category}
                          </span>
                        </div>
                      )}

                      {/* Date Badge */}
                      <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-[#cabfe0] backdrop-blur-md">
                        {item.date}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-[11px] text-[#8a7ba8]">
                        <span className="text-pink-400 font-semibold">{item.category}</span>
                        <span>Archived: {item.date}</span>
                      </div>

                      <h4 className="mt-2 text-base font-bold text-white group-hover:text-pink-200 transition-colors">
                        {item.title}
                      </h4>

                      <p className="mt-2 text-xs leading-relaxed text-[#b8aecf] line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 px-5 py-3.5 flex items-center justify-between text-xs text-[#8a7ba8]">
                    <span className="font-semibold text-white">By: {item.author}</span>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-300 hover:text-white font-bold flex items-center gap-1"
                      >
                        <span>Project Link</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* VIEWER SUBMISSION MODAL */}
      {showSubmitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto"
          onClick={() => setShowSubmitModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#170a2a] p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submittedSuccess ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-3xl">
                  ✓
                </div>
                <h3 className="font-bold text-white text-xl">Submission Sent to Review Queue!</h3>
                <p className="mt-2 text-xs text-[#b8aecf] max-w-sm mx-auto">
                  Thank you for contributing to the KR8 Gallery. Our lead directors will review and approve your submission before it shows publicly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                <div className="flex items-start justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">Suggest Media to Gallery</h3>
                    <p className="text-xs text-[#a594c7]">
                      Submit past event flyers, branding mockups, or video clips to the archive.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="text-white/60 hover:text-white text-base"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Work Title *
                  </label>
                  <input
                    value={submitForm.title}
                    onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                    placeholder="e.g. KR8 Hackathon Flyer or Chi-Tom Logo Exploration"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                      Category
                    </label>
                    <select
                      value={submitForm.category}
                      onChange={(e) =>
                        setSubmitForm({
                          ...submitForm,
                          category: e.target.value as GalleryItem["category"],
                        })
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#140824] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    >
                      <option>Flyers & Posters</option>
                      <option>Brand Identity</option>
                      <option>Student Showcases</option>
                      <option>Video Clips</option>
                      <option>Event Moments</option>
                      <option>Community Archives</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                      Media Type
                    </label>
                    <select
                      value={submitForm.mediaType}
                      onChange={(e) =>
                        setSubmitForm({
                          ...submitForm,
                          mediaType: e.target.value as "image" | "video",
                        })
                      }
                      className="w-full rounded-xl border border-white/15 bg-[#140824] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    >
                      <option value="image">Image / Graphic</option>
                      <option value="video">Video Reel / Motion</option>
                    </select>
                  </div>
                </div>

                {/* File Upload or Media URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Upload File or Paste Direct Media URL *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept={submitForm.mediaType === "video" ? "video/*" : "image/*"}
                      onChange={handleFileUpload}
                      className="w-full text-xs text-[#a594c7] file:mr-3 file:rounded-xl file:border-0 file:bg-gradient-pink file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                    />
                    <input
                      value={submitForm.url}
                      onChange={(e) => setSubmitForm({ ...submitForm, url: e.target.value })}
                      placeholder="Or paste image/video URL (e.g. https://...)"
                      className="w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {filePreview && (
                    <div className="mt-2 h-24 w-32 rounded-xl overflow-hidden border border-white/20 bg-black/50">
                      {submitForm.mediaType === "video" ? (
                        <video src={filePreview} className="h-full w-full object-cover" />
                      ) : (
                        <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                    Description & Context (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={submitForm.description}
                    onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                    placeholder="Tell us what this piece represents, who worked on it, or the event..."
                    className="w-full rounded-xl border border-white/15 bg-black/30 p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                      Your Name *
                    </label>
                    <input
                      value={submitForm.contributorName}
                      onChange={(e) =>
                        setSubmitForm({ ...submitForm, contributorName: e.target.value })
                      }
                      placeholder="e.g. David Okon"
                      className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                      Your Email (for notification)
                    </label>
                    <input
                      type="email"
                      value={submitForm.contributorEmail}
                      onChange={(e) =>
                        setSubmitForm({ ...submitForm, contributorEmail: e.target.value })
                      }
                      placeholder="david@example.com"
                      className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-200">
                  🔒 <strong>Admin Review:</strong> To maintain high archival standards, all public submissions require admin approval before appearing in the gallery.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs text-[#cabfe0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-xl bg-gradient-pink py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                  >
                    {submitting ? "Sending..." : "Submit to Gallery →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* LIGHTBOX INSPECTION MODAL */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-black/90 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 hover:bg-black"
            >
              ✕
            </button>

            <img
              src={lightboxItem.url}
              alt={lightboxItem.title}
              className="max-h-[70vh] w-full object-contain"
            />

            <div className="p-6 bg-[#160d2b]">
              <span className="text-xs uppercase font-bold text-pink-400">
                {lightboxItem.category} · {lightboxItem.date}
              </span>
              <h3 className="font-bold text-white text-xl mt-1">{lightboxItem.title}</h3>
              <p className="text-sm text-[#cabfe0] mt-2 leading-relaxed">{lightboxItem.description}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-[#8a7ba8]">
                <span>Archived by {lightboxItem.author}</span>
                {lightboxItem.link && (
                  <a
                    href={lightboxItem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-300 font-bold underline"
                  >
                    Visit Live Destination ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
