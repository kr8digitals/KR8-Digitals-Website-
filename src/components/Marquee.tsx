export default function Marquee({
  items = [
    "NO STATUS BARRIERS",
    "LEARN BY DOING",
    "SHIP YOUR CRAFT",
    "FREE TRAINING",
    "REAL COMMUNITY",
    "REAL WORK",
  ],
}: {
  items?: string[];
}) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#12001f] py-4">
      <div className="animate-marquee">
        {row.map((t, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-6 text-sm font-semibold uppercase tracking-[0.25em] text-[#9d8bc0]">
            {t}
            <span className="text-gradient text-lg">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
