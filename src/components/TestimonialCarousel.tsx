import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import type { Testimonial } from "../data/store";

const PLACEHOLDER_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
function shuffle<T>(items: T[]) { return [...items].sort(() => Math.random() - 0.5); }

export default function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const ordered = useMemo(() => {
    if (!items.length) return [];
    const [latest, ...rest] = [...items].sort((a, b) => b.createdAt - a.createdAt);
    return [latest, ...shuffle(rest)];
  }, [items]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => { setIndex(0); setPlaying(false); refs.current = []; }, [items.length]);
  useEffect(() => {
    if (playing || ordered.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % ordered.length), 4500);
    return () => window.clearInterval(timer);
  }, [ordered.length, playing]);
  useEffect(() => {
    if (!playing) return;
    const video = refs.current[index];
    if (video) { video.currentTime = 0; void video.play().catch(() => setPlaying(false)); }
  }, [index, playing]);

  if (!ordered.length) return <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-[#8a7ba8]">Testimonials will appear here as they are added by the KR8 team.</div>;
  const next = () => { setIndex((current) => (current + 1) % ordered.length); setPlaying(true); };
  return <div className="relative overflow-hidden">
    <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${index * 100}%)` }}>
      {ordered.map((item, position) => <div key={item.id} className="flex w-full shrink-0 justify-center px-3"><div className="w-full max-w-xs"><div className="relative"><div className="absolute -inset-2 rounded-3xl bg-gradient-pink opacity-20 blur-2xl" /><div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"><div className="relative aspect-[9/16] overflow-hidden bg-black"><video ref={(node) => { refs.current[position] = node; }} src={item.video || PLACEHOLDER_VIDEO} poster={item.img} muted playsInline controls onPlay={() => setPlaying(true)} onEnded={next} className="h-full w-full object-cover" />{!playing && index === position && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white glow-pink-sm"><Icon name="video" size={22} /></span></div>}<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4"><p className="text-xs text-[#e8ddf5]">"{item.caption}"</p><p className="mt-2 text-sm font-bold text-white">{item.name}</p><p className="text-[11px] text-pink-300">{item.skill}</p></div></div></div></div></div></div>)}
    </div>
    <div className="mt-5 flex items-center justify-center gap-2">{ordered.map((item, position) => <button key={item.id} onClick={() => { setIndex(position); setPlaying(false); }} aria-label={`Show testimonial ${position + 1}`} className={`h-2 rounded-full transition-all ${position === index ? "w-8 bg-gradient-pink" : "w-2 bg-white/20"}`} />)}</div>
    <p className="mt-3 text-center text-xs text-[#8a7ba8]">The latest upload leads each round, then the rest shuffle until every video has displayed.</p>
  </div>;
}