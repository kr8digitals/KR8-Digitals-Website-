import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import { type StreamReplay } from "../data/store";
import Icon from "./Icon";

export default function LiveStreamModal() {
  const { student } = useAuth();
  const {
    activeStream,
    isLive,
    isStageOpen,
    canHost,
    chatMessages,
    replays,
    reactions,
    activeReplay,
    closeStage,
    openMiniPlayer,
    startStream,
    endStream,
    sendMessage,
    pinMessage,
    deleteMessage,
    promoteMod,
    promoteSpeaker,
    demote,
    sendReaction,
    closeReplay,
    openStage,
  } = useLiveStream();

  // Host Pre-flight Form State
  const [streamTitle, setStreamTitle] = useState("");
  const [streamCategory, setStreamCategory] = useState("Digital Skills & Strategy");
  const [streamDesc, setStreamDesc] = useState("");
  const [streamQuality, setStreamQuality] = useState<"1080p60" | "720p" | "audio-only">("1080p60");

  // Media Device State
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(65);

  // Viewer State
  const [chatInput, setChatInput] = useState("");
  const [guestName, setGuestName] = useState(student?.name || "");
  const [activeTab, setActiveTab] = useState<"stream" | "replays">("stream");
  const [copiedLink, setCopiedLink] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to latest
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Audio Level Simulator for mic visualizer
  useEffect(() => {
    if (!micActive || (!isLive && !canHost)) return;
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 55) + 35);
    }, 180);
    return () => clearInterval(interval);
  }, [micActive, isLive, canHost]);

  if (!isStageOpen) {
    return null;
  }

  const handleStartStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamTitle.trim()) return;
    startStream({
      title: streamTitle,
      category: streamCategory,
      description: streamDesc,
      quality: streamQuality,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput, guestName);
    setChatInput("");
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/?join=live`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleWatchReplay = (replay: StreamReplay) => {
    if (!student) {
      setAuthPromptOpen(true);
      return;
    }
    openStage(replay);
  };

  const isHost = activeStream && student?.id === activeStream.hostId;
  const isMod =
    activeStream &&
    ((activeStream.promotedModerators || []).includes(student?.id || "") ||
      student?.type === "founder" ||
      student?.admin?.role === "coach");
  const isSpeaker =
    activeStream && (activeStream.promotedSpeakers || []).includes(student?.id || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-xl overflow-y-auto">
      <div className="relative flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#120824] shadow-2xl">
        {/* TOP BAR / STUDIO HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3 overflow-hidden">
            {isLive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow glow-pink-sm animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span>LIVE</span>
              </span>
            ) : (
              <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-xs font-bold text-purple-300">
                Broadcasting Studio
              </span>
            )}

            <div className="overflow-hidden truncate">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {activeReplay
                  ? `Replay: ${activeReplay.title}`
                  : activeStream
                  ? activeStream.title
                  : "KR8 Digitals Live Stream"}
              </h2>
              <p className="text-[11px] text-[#b8aecf] truncate">
                {activeReplay
                  ? `Recorded masterclass with ${activeReplay.hostName}`
                  : activeStream
                  ? `Broadcasting with ${activeStream.hostName} · ${activeStream.category}`
                  : "Start a broadcast or watch past recorded masterclasses"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tab switch between Live & Replays */}
            <div className="hidden md:flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
              <button
                onClick={() => {
                  setActiveTab("stream");
                  closeReplay();
                }}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  activeTab === "stream" && !activeReplay
                    ? "bg-gradient-pink text-white shadow"
                    : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Live Stage
              </button>
              <button
                onClick={() => setActiveTab("replays")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  activeTab === "replays" || activeReplay
                    ? "bg-gradient-pink text-white shadow"
                    : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Replay Vault ({replays.length})
              </button>
            </div>

            {/* Invite Button */}
            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
              title="Copy stream invite link"
            >
              <Icon name="share" size={13} />
              <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Invite Friends"}</span>
            </button>

            {/* Minimize to PIP */}
            {isLive && !activeReplay && (
              <button
                onClick={openMiniPlayer}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs"
                title="Minimize to Picture-in-Picture"
              >
                ⤓
              </button>
            )}

            {/* Close */}
            <button
              onClick={closeStage}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-sm font-bold"
              title="Close stage"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MAIN STAGE CONTENT */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* LEFT: VIDEO PLAYER / STUDIO CANVAS */}
          <div className="relative flex-1 flex flex-col bg-black overflow-hidden justify-between">
            {/* FLOATING REACTION BUBBLES */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
              {reactions.map((r) => (
                <div
                  key={r.id}
                  className="absolute bottom-8 text-3xl animate-float-up pointer-events-none transition-all"
                  style={{ left: `${r.left}%` }}
                >
                  {r.emoji}
                </div>
              ))}
            </div>

            {/* ACTIVE REPLAY PLAYBACK MODE */}
            {activeReplay ? (
              <div className="relative h-full w-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={activeReplay.videoUrl}
                  poster={activeReplay.thumbnail}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                />
                <button
                  onClick={closeReplay}
                  className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-xl bg-black/70 px-3 py-1.5 text-xs font-bold text-white border border-white/20 hover:bg-black"
                >
                  ← Exit Replay
                </button>
              </div>
            ) : isLive && activeStream ? (
              /* LIVE BROADCAST STAGE */
              <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  src={activeStream.videoUrl || "/videos/testimonial_grant_gideon.mp4"}
                  poster={activeStream.posterUrl || "/founder_timfire_wide.jpg"}
                  autoPlay
                  playsInline
                  loop
                  muted={false}
                  className="h-full w-full object-cover"
                />

                {/* Ambient dynamic vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                {/* Quality & Live Audio Visualizer Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-mono font-bold text-pink-300 border border-white/10 backdrop-blur-md">
                    <span>{activeStream.quality}</span>
                    <span className="text-[10px] text-emerald-400">● 60 FPS</span>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-mono text-white/90 border border-white/10 backdrop-blur-md">
                    <span className="text-pink-400">🎙️ Audio:</span>
                    <div className="flex items-center gap-0.5 h-3 w-10">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <span
                          key={bar}
                          className="w-1.5 rounded-full bg-emerald-400 transition-all duration-150"
                          style={{
                            height: `${Math.min(100, Math.max(20, (audioLevel / 5) * bar))}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Viewer Count & Peak Viewers */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white border border-white/10 backdrop-blur-md shadow">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeStream.viewerCount} Viewers</span>
                  </div>
                </div>

                {/* PROMOTED SPEAKERS SPLIT SCREEN (IF ANY) */}
                {(activeStream.promotedSpeakers || []).length > 0 && (
                  <div className="absolute bottom-20 left-4 z-10 flex gap-3">
                    {activeStream.promotedSpeakers.map((speakerKey) => (
                      <div
                        key={speakerKey}
                        className="relative h-28 w-24 sm:h-36 sm:w-32 rounded-2xl border border-pink-500/50 bg-[#160d2b] p-2 shadow-2xl flex flex-col items-center justify-between overflow-hidden"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-pink text-white font-bold text-lg mt-2">
                          {speakerKey.charAt(0).toUpperCase()}
                        </div>
                        <div className="w-full text-center">
                          <span className="block text-[10px] font-bold text-white truncate px-1">
                            {speakerKey}
                          </span>
                          <span className="block text-[8px] uppercase tracking-wider text-cyan-300">
                            🎙️ Speaker
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SPEAKER INVITATION BANNER FOR PROMOTED VIEWER */}
                {isSpeaker && !isHost && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-cyan-400/50 bg-[#120824]/95 p-3.5 shadow-2xl">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 font-bold">
                      🎙️
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">You've Been Promoted to Speaker!</h5>
                      <p className="text-[10px] text-[#b8aecf]">Your microphone is live on stage with Timfire.</p>
                    </div>
                    <button
                      onClick={() => setMicActive(!micActive)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        micActive ? "bg-red-500/20 text-red-300" : "bg-emerald-500 text-white"
                      }`}
                    >
                      {micActive ? "Mute Mic" : "Unmute Mic"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* HOST STUDIO PRE-FLIGHT LAUNCHPAD (FOR FOUNDER / ADMIN / COACH) */
              <div className="relative flex-1 w-full flex items-center justify-center p-6 overflow-y-auto">
                {canHost ? (
                  <div className="w-full max-w-lg rounded-3xl border border-pink-500/30 bg-[#190c33] p-6 sm:p-8 shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white shadow-lg">
                        <Icon name="video" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">KR8 Live Broadcast Studio</h3>
                        <p className="text-xs text-pink-300">Host access enabled for {student?.name}</p>
                      </div>
                    </div>

                    <form onSubmit={handleStartStreamSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">
                          Stream Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Creative Mastery Live: High-Income Portfolio Reviews"
                          value={streamTitle}
                          onChange={(e) => setStreamTitle(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">
                            Topic / Track
                          </label>
                          <select
                            value={streamCategory}
                            onChange={(e) => setStreamCategory(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                          >
                            <option value="Graphic Design">Graphic Design</option>
                            <option value="Video Editing">Video Editing</option>
                            <option value="Web Engineering">Web Engineering</option>
                            <option value="Digital Skills & Strategy">Digital Skills & Strategy</option>
                            <option value="Mindset Shift & Q&A">Mindset Shift & Q&A</option>
                            <option value="Live Client Review">Live Client Review</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">
                            Broadcast Quality
                          </label>
                          <select
                            value={streamQuality}
                            onChange={(e) => setStreamQuality(e.target.value as any)}
                            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                          >
                            <option value="1080p60">1080p 60fps (Studio HD)</option>
                            <option value="720p">720p (Fast Bandwidth)</option>
                            <option value="audio-only">Audio Stage Only</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#e8ddf5] mb-1">
                          Stream Description & Goal
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Tell students and tribe members what you'll be building or discussing live..."
                          value={streamDesc}
                          onChange={(e) => setStreamDesc(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-gradient-pink py-3 text-xs font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition-all glow-pink-sm flex items-center justify-center gap-2"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-white animate-ping" />
                        <span>Go Live to Entire Community →</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  /* NO STREAM CURRENTLY LIVE FOR GUEST VIEW */
                  <div className="text-center max-w-md p-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-pink-400">
                      <Icon name="video" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">No Live Stream In Progress</h3>
                    <p className="mt-2 text-xs text-[#b8aecf] leading-relaxed">
                      Timfire and the KR8 leadership team host scheduled live cohorts, portfolio reviews,
                      and mindset shifts. When live, the broadcast banner will illuminate across the entire
                      website!
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab("replays")}
                        className="rounded-xl bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110"
                      >
                        Watch Recorded Stream Replays ({replays.length}) →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE BOTTOM CONTROL TOOLBAR (FOR LIVE STREAM) */}
            {isLive && activeStream && (
              <div className="border-t border-white/10 bg-black/60 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                {/* Host Controls */}
                {isHost ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        cameraActive
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      <Icon name="video" size={14} />
                      <span>{cameraActive ? "Camera On" : "Camera Off"}</span>
                    </button>

                    <button
                      onClick={() => setMicActive(!micActive)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        micActive
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      <Icon name={micActive ? "volume" : "volumeX"} size={14} />
                      <span>{micActive ? "Mic Live" : "Mic Muted"}</span>
                    </button>

                    <button
                      onClick={() => setScreenSharing(!screenSharing)}
                      className={`hidden sm:flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        screenSharing
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <span>📺</span>
                      <span>{screenSharing ? "Stop Share" : "Share Screen"}</span>
                    </button>

                    <button
                      onClick={endStream}
                      className="rounded-xl border border-red-500/50 bg-red-600/80 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-600 active:scale-95 transition-all shadow-lg"
                    >
                      End Broadcast
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8a7ba8]">Enjoying the stream? Send reactions!</span>
                  </div>
                )}

                {/* Floating Reactions Bar (Available to everyone, viewer & host) */}
                <div className="flex items-center gap-1.5">
                  {["❤️", "🔥", "🚀", "👏", "💯", "⚡"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-lg hover:bg-white/15 hover:scale-125 active:scale-95 transition-all"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: LIVE CHAT / REPLAYS DRAWER */}
          <div className="w-full lg:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0e061c]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-3.5 bg-black/30">
              <div className="flex items-center gap-2">
                <Icon name="message" size={16} className="text-pink-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeTab === "replays" ? "Stream Replays & Vault" : "Community Live Chat"}
                </h4>
              </div>
              <button
                onClick={() => setActiveTab(activeTab === "stream" ? "replays" : "stream")}
                className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 underline"
              >
                {activeTab === "replays" ? "Open Chat" : "View Replays"}
              </button>
            </div>

            {/* TAB 1: LIVE CHAT */}
            {activeTab === "stream" && (
              <div className="flex-1 flex flex-col overflow-hidden justify-between">
                {/* Pinned Host Notice (if any) */}
                {activeStream?.pinnedNotice && (
                  <div className="flex items-start gap-2 border-b border-pink-500/20 bg-pink-500/10 p-3 text-xs text-pink-200">
                    <span className="text-pink-400">📌</span>
                    <p className="line-clamp-2 leading-relaxed">{activeStream.pinnedNotice}</p>
                  </div>
                )}

                {/* Chat Messages Scrollable Feed */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#8a7ba8]">
                      Welcome to the live chat! Be the first to say hello.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMsgHost = msg.senderRole === "host";
                      const isMsgMod = msg.senderRole === "moderator";
                      const isMsgSpeaker = msg.senderRole === "speaker";

                      return (
                        <div
                          key={msg.id}
                          className={`rounded-2xl p-2.5 transition-all text-xs ${
                            msg.isPinned
                              ? "border border-amber-500/40 bg-amber-500/10"
                              : isMsgHost
                              ? "border border-pink-500/30 bg-pink-500/10"
                              : "border border-white/5 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                onClick={() =>
                                  isHost && setSelectedUserForAction(selectedUserForAction === msg.senderName ? null : msg.senderName)
                                }
                                className={`font-bold text-white cursor-pointer hover:underline ${
                                  isMsgHost ? "text-pink-300" : isMsgMod ? "text-emerald-300" : ""
                                }`}
                              >
                                {msg.senderName}
                              </span>

                              {msg.senderBadge && (
                                <span
                                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                                    isMsgHost
                                      ? "bg-gradient-pink text-white"
                                      : isMsgMod
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : isMsgSpeaker
                                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                      : "bg-white/10 text-[#b8aecf]"
                                  }`}
                                >
                                  {msg.senderBadge}
                                </span>
                              )}
                            </div>

                            {/* Moderator / Host Quick Action Menu */}
                            {(isHost || isMod) && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => pinMessage(msg.id)}
                                  className="text-[10px] text-pink-400 hover:text-pink-300"
                                  title="Pin message"
                                >
                                  📌
                                </button>
                                <button
                                  onClick={() => deleteMessage(msg.id)}
                                  className="text-[10px] text-red-400 hover:text-red-300"
                                  title="Delete message"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="mt-1 text-[#d8cde8] leading-relaxed break-words">{msg.text}</p>

                          {/* HOST PROMOTION POPUP MENU FOR SELECTED USER */}
                          {isHost && selectedUserForAction === msg.senderName && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5 text-[10px]">
                              <button
                                onClick={() => {
                                  promoteMod(msg.senderName);
                                  setSelectedUserForAction(null);
                                }}
                                className="rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-emerald-300 hover:bg-emerald-500/30"
                              >
                                🛡️ Make Moderator
                              </button>
                              <button
                                onClick={() => {
                                  promoteSpeaker(msg.senderName);
                                  setSelectedUserForAction(null);
                                }}
                                className="rounded bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/30"
                              >
                                🎙️ Invite to Speak
                              </button>
                              <button
                                onClick={() => {
                                  demote(msg.senderName);
                                  setSelectedUserForAction(null);
                                }}
                                className="rounded bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-red-300 hover:bg-red-500/30"
                              >
                                Demote
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 space-y-2">
                  {!student && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Your guest name (e.g. David)"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message or question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-pink text-white shadow hover:brightness-110 active:scale-95 transition-all text-xs font-bold"
                    >
                      ➤
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: REPLAY VAULT & RESTREAM ARCHIVES */}
            {activeTab === "replays" && (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-200">
                  <p className="font-bold text-white mb-1">📼 Recorded Masterclasses & Replays</p>
                  <p className="text-[11px] text-[#b8aecf]">
                    Missed a broadcast? Registered students and Tribe citizens can restream any session
                    with full chat history and resources.
                  </p>
                </div>

                {replays.map((r) => (
                  <div
                    key={r.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition-all hover:border-pink-500/40"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                      <img src={r.thumbnail} alt={r.title} className="h-full w-full object-cover" />
                      <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-white">
                        {r.durationMinutes} mins
                      </span>
                      <span className="absolute top-2 left-2 rounded bg-pink-500/80 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                        {r.category}
                      </span>
                    </div>

                    <div className="p-3">
                      <h5 className="font-bold text-white text-xs line-clamp-1">{r.title}</h5>
                      <p className="text-[11px] text-[#b8aecf] line-clamp-2 mt-1">{r.description}</p>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-[#8a7ba8]">
                        <span>{r.date} · {r.hostName}</span>
                        <span>👥 {r.peakViewers} peak</span>
                      </div>

                      <button
                        onClick={() => handleWatchReplay(r)}
                        className="mt-3 w-full rounded-xl bg-gradient-pink py-1.5 text-xs font-bold text-white hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>▶</span>
                        <span>Watch Replay {student ? "" : "🔒"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACCOUNT REQUIREMENT MODAL FOR RESTREAMING / WATCHING REPLAYS */}
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
              <Icon name="lock" size={24} />
            </div>

            <h3 className="text-xl font-bold text-white">Sign In to Watch Stream Replays</h3>
            <p className="mt-2 text-xs text-[#b8aecf] leading-relaxed">
              Anyone can join live broadcasts for free without an account! However, watching recorded
              replays, transcripts, and downloadable materials requires a free Student or Tribe account.
            </p>

            <div className="mt-6 space-y-2.5">
              <Link
                to="/tribe#join"
                onClick={() => {
                  setAuthPromptOpen(false);
                  closeStage();
                }}
                className="block w-full rounded-2xl bg-gradient-pink py-3 text-xs font-bold text-white shadow-lg hover:brightness-110 text-center"
              >
                Join KR8 Tribe (Free, No ID Required) →
              </Link>
              <Link
                to="/academy"
                onClick={() => {
                  setAuthPromptOpen(false);
                  closeStage();
                }}
                className="block w-full rounded-2xl border border-white/20 bg-white/5 py-3 text-xs font-bold text-white hover:bg-white/10 text-center"
              >
                Sign In or Register as Student →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
