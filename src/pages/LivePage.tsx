import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLiveStream } from "../context/LiveStreamContext";
import LiveFeed from "../components/LiveFeed";
import { Pill, GradientButton, GhostButton, Card } from "../components/ui";

export default function LivePage() {
  const { isLive, activeStream, openStage, canHost } = useLiveStream();

  useEffect(() => {
    // Open stage immediately when landing on /live
    openStage();
  }, []);

  return (
    <div className="section-bg min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-5">
        <div className="text-center">
          <Pill>Official Broadcast Hall</Pill>
          <h1 className="font-display mt-4 text-4xl uppercase text-white sm:text-6xl font-bold">
            KR8 Live <span className="text-gradient">Studio & Stage</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#cabfe0] leading-relaxed">
            Real-time masterclasses, live client project breakdowns, community critiques, and fast-paced creative drills.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <GradientButton onClick={() => openStage()} className="shadow-xl shadow-pink-500/25">
              {isLive ? "Open Live Stage Now 🔴" : canHost ? "Launch Broadcast Studio 🎥" : "Explore Replays & Masterclasses →"}
            </GradientButton>
            <GhostButton to="/tribe">Visit Tribe Room</GhostButton>
          </div>
        </div>

        <div className="mt-14">
          <LiveFeed />
        </div>
      </div>
    </div>
  );
}
