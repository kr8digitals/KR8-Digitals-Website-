import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFeed, feedAction, timeAgo, type FeedItem } from "../data/store";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";

export default function LiveFeed({ compact }: { compact?: boolean }) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const { student } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    setFeed(getFeed());
    const t = setInterval(() => setFeed(getFeed()), 5000);
    return () => clearInterval(t);
  }, []);

  const items = compact ? feed.slice(0, 5) : feed.slice(0, 8);

  return (
    <div className="space-y-3">
      {items.map((f) => (
        <button
          key={f.id}
          onClick={() => nav(student ? "/leaderboard" : "/academy")}
          className="flex min-w-0 w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-left transition-colors hover:border-pink-400/40 sm:p-3.5"
        >
          <span className="relative">
            <Avatar src={f.avatar} name={f.name} size={40} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d0015] bg-green-400" />
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="break-words text-xs leading-relaxed text-white sm:text-sm">
              <span className="font-semibold">{f.name}</span>{" "}
              <span className="text-[#b8aecf]">{feedAction(f.kind)}</span>
            </p>
            <p className="truncate text-[11px] text-[#8a7ba8] sm:text-xs">
              {f.skill} · {timeAgo(f.ts)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
