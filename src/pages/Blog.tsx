import { useMemo, useState, useEffect } from "react";
import { getBlogPosts, type BLOG } from "../data/store";
import { Pill } from "../components/ui";

const cats = ["All", "Digital Skills", "AI", "Community", "Announcements", "Company News"];

export default function Blog() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<string | null>(null);
  const [allPosts, setAllPosts] = useState(getBlogPosts);

  useEffect(() => {
    const refresh = () => setAllPosts(getBlogPosts());
    window.addEventListener("kr8:blog-updated", refresh);
    return () => window.removeEventListener("kr8:blog-updated", refresh);
  }, []);

  // Reshuffle non-pinned posts per visit; the pinned admin post always stays on top.
  const ordered = useMemo(() => {
    const pinned = allPosts.filter((b) => b.pinned);
    const rest = allPosts.filter((b) => !b.pinned);
    return [...pinned, ...rest];
  }, [allPosts]);
  const posts = cat === "All" ? ordered : ordered.filter((b) => b.category === cat);
  const active = allPosts.find((b) => b.id === open);

  if (active) {
    return (
      <div className="section-bg min-h-screen">
        <div className="mx-auto max-w-3xl px-5 py-14">
          <button onClick={() => setOpen(null)} className="text-sm text-pink-400">← Back to Blog</button>
          <span className="mt-6 inline-block rounded-full bg-pink-500/10 px-3 py-1 text-[11px] font-semibold text-pink-400">{active.category}</span>
          <h1 className="font-display mt-4 text-4xl uppercase leading-tight text-white sm:text-5xl">{active.title}</h1>
          <p className="mt-4 text-sm text-[#8a7ba8]">By {active.author} · {active.date} · {active.readTime} read</p>
          <img src={active.img} alt={active.title} className="mt-8 aspect-video w-full rounded-3xl object-cover" />
          <div className="mt-8 space-y-4 text-[#cabfe0] leading-relaxed">
            <p>{active.excerpt}</p>
            <p>At KR8 Digitals, we believe skills without opportunity go to waste — and opportunity without community rarely lasts. That's why everything we build connects learning, belonging and real work.</p>
            <p>Whether you're just starting or leveling up, the path is the same: learn consistently, show up in the Tribe, ship real work, and let your craft speak. This post breaks down exactly how to do that in practice.</p>
            <p>Ready to put this into action? Pick a skill track, get your KR8 ID, and start today — completely free.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <Pill>The Blog</Pill>
        <h1 className="font-display mt-5 text-5xl text-white sm:text-6xl">
          Insights, stories & <span className="text-gradient">skills.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#b8aecf]">Anyone can read. To post, comment, react or follow, create a Student or Tribe Member account.</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${cat === c ? "bg-gradient-pink text-white" : "border border-white/15 text-[#b8aecf]"}`}>{c}</button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((b) => (
            <button key={b.id} onClick={() => setOpen(b.id)} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left">
              <div className="aspect-video overflow-hidden">
                <img src={b.img} alt={b.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <span className="rounded-full bg-pink-500/10 px-3 py-1 text-[11px] font-semibold text-pink-400">{b.category}</span>
                {b.pinned && <span className="ml-2 rounded-full bg-gradient-pink px-2 py-1 text-[10px] font-bold text-white">Pinned</span>}
                {b.source === "student" && <span className="ml-2 rounded-full bg-white/5 px-2 py-1 text-[10px] text-[#8a7ba8]">Member post</span>}
                <h3 className="mt-3 font-bold text-white">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-[#b8aecf]">{b.excerpt}</p>
                <p className="mt-3 text-xs text-[#8a7ba8]">{b.author} · {b.date} · {b.readTime}</p>
                <p className="mt-3 text-sm font-semibold text-pink-400">Read More →</p>
              </div>
            </button>
          ))}
        </div>
        {posts.length === 0 && <p className="mt-16 text-center text-[#8a7ba8]">No posts in this category yet.</p>}
      </div>
    </div>
  );
}
