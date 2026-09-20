import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import { type StreamReplay, type LiveStreamTask } from "../data/store";
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
    localStream,
    cameraActive,
    micActive,
    isScreenSharing,
    isPrivateAuthorized,
    closeStage,
    openMiniPlayer,
    startCameraStream,
    startScreenShare,
    toggleCamera,
    toggleMic,
    startStream,
    endStream,
    sendMessage,
    pinMessage,
    deleteMessage,
    promoteMod,
    promoteSpeaker,
    demote,
    assignTask,
    markTaskDone,
    awardPoints,
    muteListener,
    muteAll,
    sendReaction,
    unlockPrivateStream,
    closeReplay,
    openStage,
  } = useLiveStream();

  // Host Pre-flight Form State
  const [streamTitle, setStreamTitle] = useState("");
  const [streamCategory, setStreamCategory] = useState("Creative Tech & Strategy");
  const [streamDesc, setStreamDesc] = useState("");
  const [streamQuality, setStreamQuality] = useState<"1080p60" | "720p" | "audio-only">("1080p60");
  const [streamVisibility, setStreamVisibility] = useState<"public" | "private">("public");
  const [customAccessKey, setCustomAccessKey] = useState("");

  // Private Access Input State
  const [enteredKey, setEnteredKey] = useState("");

  // Viewer State
  const [chatInput, setChatInput] = useState("");
  const [guestName, setGuestName] = useState(student?.name || "");
  const [activeTab, setActiveTab] = useState<"chat" | "audience" | "replays">("chat");
  const [copiedLink, setCopiedLink] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  // Task assignment form modal
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [taskAssigneeName, setTaskAssigneeName] = useState("");
  const [taskText, setTaskText] = useState("");
  const [taskPoints, setTaskPoints] = useState(50);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Award XP modal
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardeeId, setAwardeeId] = useState("");
  const [awardeeName, setAwardeeName] = useState("");
  const [awardReason, setAwardReason] = useState("");
  const [awardPointsVal, setAwardPointsVal] = useState(50);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Attach MediaStream or Replay to Video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeReplay) {
      if (video.srcObject) {
        video.srcObject = null;
      }
      if (video.src !== activeReplay.videoUrl) {
        video.src = activeReplay.videoUrl;
        video.load();
        video.play().catch(() => {});
      }
    } else if (localStream) {
      // Live stage: host or presenter camera / screen / virtual studio
      if (video.src) {
        video.pause();
        video.removeAttribute("src");
        video.src = "";
        video.load();
      }
      if (video.srcObject !== localStream) {
        video.srcObject = localStream;
        video.play().catch(() => {});
      }
    } else {
      // Live stage without localStream yet
      if (video.src) {
        video.pause();
        video.removeAttribute("src");
        video.src = "";
        video.load();
      }
      video.srcObject = null;

      // Automatically launch camera for host if not active
      if (isHost && isLive && isStageOpen) {
        startCameraStream();
      }
    }
  }, [localStream, activeReplay, isLive, isStageOpen, isHost, startCameraStream]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!isStageOpen) {
    return null;
  }

  const isHost =
    activeStream &&
    (student?.id === activeStream.hostId ||
      canHost ||
      student?.type === "founder" ||
      student?.type === "co-founder");

  const canEndStream =
    isHost ||
    canHost ||
    student?.admin ||
    student?.type === "founder" ||
    student?.type === "co-founder" ||
    (activeStream && !student);

  const isPrivateLocked =
    activeStream &&
    activeStream.visibility === "private" &&
    !isPrivateAuthorized &&
    !isHost;

  const handleStartStreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamTitle.trim()) return;
    await startStream({
      title: streamTitle,
      category: streamCategory,
      description: streamDesc,
      quality: streamQuality,
      visibility: streamVisibility,
      accessKey: streamVisibility === "private" ? customAccessKey : undefined,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput, guestName);
    setChatInput("");
  };

  const handleCopyInvite = () => {
    if (!activeStream) return;
    const keyQuery = activeStream.visibility === "private" ? `&key=${activeStream.accessKey}` : "";
    const inviteUrl = `${window.location.origin}/?live=${activeStream.id}${keyQuery}`;
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleUnlockPrivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredKey.trim()) return;
    unlockPrivateStream(enteredKey);
  };

  const openTaskModalForUser = (userId: string, userName: string) => {
    setTaskAssigneeId(userId);
    setTaskAssigneeName(userName);
    setTaskText("");
    setTaskPoints(50);
    setShowTaskModal(true);
  };

  const handleAssignTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim() || !taskAssigneeId) return;
    assignTask(taskAssigneeId, taskAssigneeName, taskText, taskPoints);
    setShowTaskModal(false);
  };

  const openAwardModalForUser = (userId: string, userName: string) => {
    setAwardeeId(userId);
    setAwardeeName(userName);
    setAwardReason("Brilliant contribution in live Q&A");
    setAwardPointsVal(50);
    setShowAwardModal(true);
  };

  const handleAwardPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardReason.trim() || !awardeeId) return;
    awardPoints(awardeeId, awardeeName, awardPointsVal, awardReason);
    setShowAwardModal(false);
  };

  // Find tasks assigned to current viewer
  const myPendingTask = activeStream?.assignedTasks?.find(
    (t) => t.targetUserId === (student?.id || guestName) && t.status === "pending"
  );

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

            {activeStream?.visibility === "private" && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                <span>🔒 Private Session</span>
                {isHost && activeStream.accessKey && (
                  <span className="font-mono text-white/90">({activeStream.accessKey})</span>
                )}
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
                  ? `Recorded masterclass · Hosted by ${activeReplay.hostName}`
                  : activeStream
                  ? `Broadcasting with ${activeStream.hostName} · ${activeStream.category}`
                  : "Start a live broadcast with camera & mic or watch replays"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Tab switch between Live & Replays */}
            <div className="hidden md:flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
              <button
                onClick={() => {
                  setActiveTab("chat");
                  closeReplay();
                }}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  activeTab === "chat" && !activeReplay
                    ? "bg-gradient-pink text-white shadow"
                    : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Live Chat
              </button>
              <button
                onClick={() => setActiveTab("audience")}
                className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                  activeTab === "audience"
                    ? "bg-gradient-pink text-white shadow"
                    : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Audience & Tasks ({activeStream?.viewers?.length || 1})
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
            {isLive && activeStream && (
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20 transition-all shadow-sm"
                title="Copy stream invite link"
              >
                <Icon name="share" size={13} />
                <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
              </button>
            )}

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

            {/* End Broadcast CTA in top bar */}
            {isLive && canEndStream && !activeReplay && (
              <button
                onClick={endStream}
                className="rounded-xl border border-red-500/50 bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg hover:bg-red-700 active:scale-95 transition-all flex items-center gap-1.5"
                title="Stop and terminate the live broadcast"
              >
                <span>🛑</span>
                <span className="hidden sm:inline">End Broadcast</span>
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

            {/* PRIVATE LOCKED ACCESS OVERLAY */}
            {isPrivateLocked ? (
              <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#180a2c] to-[#090314] p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-3xl mb-4 shadow-xl">
                  🔒
                </div>
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  Private Broadcast Session
                </h3>
                <p className="mt-2 text-sm text-[#cabfe0] max-w-md leading-relaxed">
                  This live stream is locked to invited participants only. If you received an invitation key from the host, enter it below to join the stage.
                </p>

                <form onSubmit={handleUnlockPrivate} className="mt-6 flex w-full max-w-sm gap-2">
                  <input
                    value={enteredKey}
                    onChange={(e) => setEnteredKey(e.target.value)}
                    placeholder="Enter Invitation Key (e.g. KR8-XXXX)"
                    className="flex-1 rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-lg"
                  >
                    Unlock →
                  </button>
                </form>
              </div>
            ) : activeReplay ? (
              /* ACTIVE REPLAY PLAYBACK MODE */
              <div className="relative h-full w-full flex items-center justify-center bg-black">
                <video
                  ref={videoRef}
                  src={activeReplay.videoUrl}
                  poster={activeReplay.thumbnail}
                  controls
                  autoPlay
                  className="h-full w-full object-contain"
                />
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <button
                    onClick={closeReplay}
                    className="flex items-center gap-1.5 rounded-xl bg-black/80 px-3 py-1.5 text-xs font-bold text-white border border-white/20 hover:bg-black backdrop-blur-md"
                  >
                    ← Exit Replay
                  </button>
                  <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs font-bold text-purple-200 border border-purple-400/30 backdrop-blur-md">
                    ↺ Session Restream
                  </span>
                </div>
              </div>
            ) : isLive && activeStream ? (
              /* LIVE BROADCAST STAGE */
              <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
                {/* VIDEO ELEMENT (ATTACHED TO REAL CAMERA OR SCREEN SHARE OR VIEWER FEED) */}
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el) {
                      if (localStream && el.srcObject !== localStream) {
                        if (el.src) {
                          el.pause();
                          el.removeAttribute("src");
                          el.src = "";
                          el.load();
                        }
                        el.srcObject = localStream;
                        el.play().catch(() => {});
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  muted={isHost}
                  className="h-full w-full object-contain block"
                />

                {/* If no localStream yet, show connecting studio overlay */}
                {!localStream && (
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1d0b36] via-[#100320] to-black p-8 text-center z-10">
                    <div className="relative mb-6">
                      <div className="absolute -inset-4 rounded-full bg-gradient-pink opacity-40 blur-xl animate-pulse" />
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-pink-400 bg-black/60 shadow-2xl">
                        {activeStream.hostAvatar ? (
                          <img
                            src={activeStream.hostAvatar}
                            alt={activeStream.hostName}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-4xl font-bold text-white">
                            {activeStream.hostName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black text-xs text-white">
                        🎙️
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-red-600/30 border border-red-500/50 px-3.5 py-1 text-xs font-bold text-red-300 mb-3">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      LIVE ON AIR
                    </div>

                    <h3 className="text-xl font-bold text-white">{activeStream.hostName}</h3>
                    <p className="mt-1 text-xs text-pink-300 font-semibold">{activeStream.category}</p>
                    <p className="mt-3 text-xs text-[#a594c7]">
                      {isHost ? "Connecting Live Camera / Studio Feed..." : "Live broadcast active • Audio on air"}
                    </p>

                    {isHost && (
                      <button
                        onClick={() => startCameraStream()}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                      >
                        <span>🎥</span>
                        <span>Start Camera / Virtual Studio Feed</span>
                      </button>
                    )}
                  </div>
                )}

                {/* AUDIO-ONLY / CAMERA OFF VISUALIZER FOR HOST ONLY */}
                {isHost && !cameraActive && !isScreenSharing && (
                  <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1d0b36] via-[#100320] to-black p-8 text-center z-10">
                    <div className="relative mb-6">
                      <div className="absolute -inset-4 rounded-full bg-gradient-pink opacity-40 blur-xl animate-pulse" />
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-pink-400 bg-black/60 shadow-2xl">
                        {activeStream.hostAvatar ? (
                          <img
                            src={activeStream.hostAvatar}
                            alt={activeStream.hostName}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-4xl font-bold text-white">
                            {activeStream.hostName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-black text-xs text-white">
                        🎙️
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">{activeStream.hostName}</h3>
                    <p className="mt-1 text-xs text-pink-300 font-semibold">{activeStream.category}</p>
                    <p className="mt-3 text-xs text-[#a594c7]">Studio Audio Broadcast Active (Camera Muted)</p>
                  </div>
                )}

                {/* Ambient dynamic vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Quality & Live Indicators Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10 flex-wrap">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-mono font-bold text-pink-300 border border-white/10 backdrop-blur-md">
                    <span>{isScreenSharing ? "Screen Share" : activeStream.quality}</span>
                    <span className="text-[10px] text-emerald-400">● Live Audio</span>
                  </div>

                  {activeStream.visibility === "private" && (
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/40 backdrop-blur-md">
                      <span>🔒 Private</span>
                      {activeStream.accessKey && <span>· Key: {activeStream.accessKey}</span>}
                    </div>
                  )}
                </div>

                {/* Real Viewer Counter Overlay (NO FAKE VIEWS) */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                  <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white border border-white/10 backdrop-blur-md shadow">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeStream.viewers?.length || activeStream.viewerCount || 1} Connected</span>
                  </div>
                </div>

                {/* MY PENDING TASK FLOATING PROMPT (IF ASSIGNED TO CURRENT VIEWER) */}
                {myPendingTask && (
                  <div className="absolute bottom-20 left-4 right-4 z-20 sm:left-6 sm:right-auto sm:max-w-md rounded-2xl border border-yellow-400/50 bg-yellow-500/20 p-4 backdrop-blur-xl shadow-2xl animate-bounce">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                          ⚡ Task Assigned to You by Host
                        </span>
                        <h4 className="mt-1 text-sm font-bold text-white">{myPendingTask.task}</h4>
                        <p className="mt-1 text-xs text-yellow-200">
                          Reward: +{myPendingTask.points} Community XP
                        </p>
                      </div>
                      <button
                        onClick={() => markTaskDone(myPendingTask.id)}
                        className="rounded-xl bg-gradient-pink px-3.5 py-1.5 text-xs font-bold text-white shadow hover:scale-105 active:scale-95 transition-all shrink-0"
                      >
                        Mark Done ✓
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* PRE-BROADCAST HOST SETUP STAGE */
              <div className="relative flex-1 w-full bg-gradient-to-br from-[#1a0c30] to-[#0c0418] flex items-center justify-center p-6 sm:p-10">
                {canHost ? (
                  <form
                    onSubmit={handleStartStreamSubmit}
                    className="w-full max-w-lg rounded-3xl border border-white/15 bg-black/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-pink text-white text-xl">
                        🎥
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold text-white">Go Live on KR8 Stage</h3>
                        <p className="text-xs text-[#a594c7]">Real camera, microphone & task management</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                          Stream Title *
                        </label>
                        <input
                          value={streamTitle}
                          onChange={(e) => setStreamTitle(e.target.value)}
                          placeholder="e.g. Live Client Design Critique & Speed Drill"
                          className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                            Category
                          </label>
                          <select
                            value={streamCategory}
                            onChange={(e) => setStreamCategory(e.target.value)}
                            className="w-full rounded-xl border border-white/15 bg-[#1a0e30] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                          >
                            <option>Graphic Design</option>
                            <option>Video Editing & Motion</option>
                            <option>Web Development</option>
                            <option>Creative Tech & Strategy</option>
                            <option>Mindset Shift & Q&A</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#cabfe0] mb-1">
                            Visibility
                          </label>
                          <select
                            value={streamVisibility}
                            onChange={(e) => setStreamVisibility(e.target.value as "public" | "private")}
                            className="w-full rounded-xl border border-white/15 bg-[#1a0e30] px-3 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                          >
                            <option value="public">🌐 Public (All Visitors)</option>
                            <option value="private">🔒 Private (Invite Only)</option>
                          </select>
                        </div>
                      </div>

                      {streamVisibility === "private" && (
                        <div>
                          <label className="block text-xs font-semibold text-amber-300 mb-1">
                            Custom Access Key (Optional)
                          </label>
                          <input
                            value={customAccessKey}
                            onChange={(e) => setCustomAccessKey(e.target.value)}
                            placeholder="Leave empty for auto-generated key (e.g. KR8-4921)"
                            className="w-full rounded-xl border border-amber-500/30 bg-black/30 px-4 py-2 text-xs text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-xs text-[#b8aecf] space-y-1">
                        <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <span>✓</span> Camera & Microphone will be requested on launch
                        </p>
                        <p className="flex items-center gap-1.5 text-pink-300 font-semibold">
                          <span>✓</span> Automatically recorded for Restream Vault
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-pink py-3 text-sm font-bold text-white shadow-xl shadow-pink-500/25 hover:brightness-110 active:scale-95 transition-all"
                      >
                        Launch Live Broadcast 🚀
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center max-w-md">
                    <span className="text-4xl">🎙️</span>
                    <h3 className="font-display text-2xl font-bold text-white mt-4">
                      No Active Broadcast Right Now
                    </h3>
                    <p className="mt-2 text-sm text-[#cabfe0] leading-relaxed">
                      Check out past recorded masterclasses in the Replay Vault below, or stay tuned for our next bi-weekly Mindset Shift broadcast!
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                      <button
                        onClick={() => setActiveTab("replays")}
                        className="rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-lg"
                      >
                        Explore Replay Vault ({replays.length}) →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BROADCAST CONTROL DECK BAR (BOTTOM OF VIDEO) */}
            <div className="border-t border-white/10 bg-black/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 backdrop-blur-md z-10">
              {/* Media Controls for Host, Speaker & Viewers */}
              <div className="flex items-center gap-2">
                {isLive && (
                  <>
                    {(isHost || canHost) && (
                      <button
                        onClick={toggleCamera}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all ${
                          cameraActive
                            ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                            : "border-red-500/50 bg-red-500/20 text-red-300"
                        }`}
                        title={cameraActive ? "Turn Camera Off" : "Turn Camera On"}
                      >
                        {cameraActive ? "📹" : "🚫"}
                      </button>
                    )}

                    {/* Microphone Mute/Unmute Toggle for All Participants */}
                    <button
                      onClick={toggleMic}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        micActive
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm"
                          : "border-red-500/50 bg-red-500/20 text-red-300 shadow-sm"
                      }`}
                      title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      <span>{micActive ? "🎙️" : "🔇"}</span>
                      <span>{micActive ? "Mic On" : "Muted (Tap to speak)"}</span>
                    </button>

                    {(isHost || canHost) && (
                      <button
                        onClick={isScreenSharing ? startCameraStream : startScreenShare}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                          isScreenSharing
                            ? "border-pink-500/50 bg-gradient-pink text-white shadow"
                            : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        <span>💻</span>
                        <span className="hidden sm:inline">
                          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Floating Reaction Emojis for Viewers */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {["🔥", "❤️", "👏", "💡", "🚀"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sm hover:scale-125 hover:bg-white/15 active:scale-95 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* End Stream CTA for Host / Staff / Presenter */}
              {canEndStream && isLive && (
                <button
                  onClick={endStream}
                  className="rounded-xl border border-red-500/40 bg-red-600/80 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-600 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>🛑</span>
                  <span>End Broadcast</span>
                </button>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: CHAT, AUDIENCE & TASKS, OR REPLAYS */}
          <div className="flex w-full flex-col border-t lg:border-t-0 lg:border-l border-white/10 bg-[#160d2b] lg:w-96 shrink-0 h-80 lg:h-auto">
            {/* Panel Tab Switcher */}
            <div className="flex border-b border-white/10 bg-black/30 p-2 gap-1 text-xs">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
                  activeTab === "chat"
                    ? "bg-gradient-pink text-white shadow"
                    : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Chat ({chatMessages.length})
              </button>
              <button
                onClick={() => setActiveTab("audience")}
                className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
                  activeTab === "audience"
                    ? "bg-gradient-pink text-white shadow"
                    : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Audience ({activeStream?.viewers?.length || 1})
              </button>
              <button
                onClick={() => setActiveTab("replays")}
                className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
                  activeTab === "replays"
                    ? "bg-gradient-pink text-white shadow"
                    : "text-[#b8aecf] hover:text-white"
                }`}
              >
                Vault ({replays.length})
              </button>
            </div>

            {/* TAB 1: LIVE CHAT */}
            {activeTab === "chat" && (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Chat Message Stream */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-10 text-xs text-[#8a7ba8]">
                      No chat messages yet. Be the first to say hello!
                    </div>
                  ) : (
                    chatMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-2xl p-3 text-xs ${
                          m.isPinned
                            ? "border border-yellow-500/50 bg-yellow-500/10"
                            : m.senderId === "system"
                            ? "border border-pink-500/40 bg-pink-500/10"
                            : "border border-white/5 bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white">{m.senderName}</span>
                            {m.senderBadge && (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-pink-300 font-semibold">
                                {m.senderBadge}
                              </span>
                            )}
                          </div>
                          {isHost && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => pinMessage(m.id)}
                                className="text-[10px] text-[#8a7ba8] hover:text-white"
                                title="Pin message"
                              >
                                📌
                              </button>
                              <button
                                onClick={() => deleteMessage(m.id)}
                                className="text-[10px] text-[#8a7ba8] hover:text-red-400"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-[#cabfe0] break-words">{m.text}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-white/10 bg-black/40 p-3 flex gap-2 items-center"
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a question or comment..."
                    className="flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-pink px-3.5 py-2 text-xs font-bold text-white shadow hover:scale-105 active:scale-95 transition-all"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: AUDIENCE & TASK PROMOTION */}
            {activeTab === "audience" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
                      Connected Viewers ({activeStream?.viewers?.length || 1})
                    </h4>
                    <p className="text-[11px] text-[#a594c7] mt-0.5">
                      Real community members on stage.
                    </p>
                  </div>

                  {/* Mute All Listeners Button (Host, Speakers & Admins) */}
                  {(isHost || student?.admin || student?.type === "founder" || student?.type === "co-founder") && (
                    <button
                      onClick={muteAll}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all shadow-sm flex items-center gap-1"
                      title="Mute all listeners"
                    >
                      <span>🔇</span>
                      <span>Mute All</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {(activeStream?.viewers || []).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-pink text-white font-bold text-xs shrink-0">
                          {v.avatar ? (
                            <img src={v.avatar} alt={v.name} className="h-full w-full rounded-lg object-cover" />
                          ) : (
                            v.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="overflow-hidden truncate">
                          <p className="font-semibold text-white truncate flex items-center gap-1.5">
                            <span>{v.name}</span>
                            <span className={`text-[10px] ${v.isMuted ? "text-red-400" : "text-emerald-400"}`}>
                              {v.isMuted ? "🔇" : "🎙️"}
                            </span>
                          </p>
                          <span className="text-[10px] text-pink-300 capitalize">{v.role}</span>
                        </div>
                      </div>

                      {/* Host / Speaker / Admin Actions on Viewers */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Mute / Unmute Listener Toggle */}
                        {(isHost || student?.admin || student?.type === "founder" || student?.type === "co-founder") && v.id !== student?.id && (
                          <button
                            onClick={() => muteListener(v.id)}
                            className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition-all ${
                              v.isMuted
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                : "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                            }`}
                            title={v.isMuted ? "Unmute Listener" : "Mute Listener"}
                          >
                            {v.isMuted ? "Unmute" : "Mute"}
                          </button>
                        )}

                        {isHost && v.id !== student?.id && (
                          <>
                            <button
                              onClick={() => openTaskModalForUser(v.id, v.name)}
                              className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-[10px] font-bold text-yellow-300 hover:bg-yellow-500/20"
                              title="Assign a speed task / drill"
                            >
                              ⚡ Task
                            </button>
                            <button
                              onClick={() => openAwardModalForUser(v.id, v.name)}
                              className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-2 py-1 text-[10px] font-bold text-pink-300 hover:bg-pink-500/20"
                              title="Award XP Points"
                            >
                              ⭐ XP
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Tasks In Room */}
                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-300">
                    Live Stream Drills & Tasks ({activeStream?.assignedTasks?.length || 0})
                  </h4>
                  <div className="mt-2 space-y-2">
                    {(activeStream?.assignedTasks || []).length === 0 ? (
                      <p className="text-[11px] text-[#8a7ba8]">No tasks assigned in this session yet.</p>
                    ) : (
                      activeStream?.assignedTasks?.map((t) => (
                        <div
                          key={t.id}
                          className={`rounded-xl p-2.5 text-xs border ${
                            t.status === "completed"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                              : "border-yellow-500/40 bg-yellow-500/10 text-yellow-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{t.targetUserName}</span>
                            <span className="text-[10px] font-semibold">
                              {t.status === "completed" ? "✓ Done" : "⏳ In Progress"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#cabfe0]">{t.task}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px]">
                            <span>Reward: +{t.points} XP</span>
                            {isHost && t.status === "pending" && (
                              <button
                                onClick={() => markTaskDone(t.id)}
                                className="text-emerald-400 font-bold underline"
                              >
                                Approve as Done ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REPLAY VAULT */}
            {activeTab === "replays" && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">
                    Recorded Sessions
                  </h4>
                  <p className="text-[11px] text-[#a594c7] mt-0.5">
                    Watch past live masterclasses with full community discussion.
                  </p>
                </div>

                {replays.map((r) => (
                  <div
                    key={r.id}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-pink-500/40 transition-all cursor-pointer"
                    onClick={() => openStage(r)}
                  >
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40 mb-2">
                      <img src={r.thumbnail} alt={r.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-pink text-white text-xs shadow-lg">
                          ▶
                        </span>
                      </div>
                      <span className="absolute bottom-1 right-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] text-white font-mono">
                        {r.durationMinutes}m
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-xs line-clamp-1">{r.title}</h5>
                    <p className="text-[10px] text-[#a594c7] mt-1">{r.hostName} · {r.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TASK ASSIGNMENT MODAL (HOST ONLY) */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleAssignTaskSubmit}
            className="w-full max-w-md rounded-2xl border border-yellow-500/40 bg-[#1e0e38] p-6 shadow-2xl"
          >
            <h4 className="font-bold text-white text-base">
              Assign Live Drill to {taskAssigneeName}
            </h4>
            <p className="text-xs text-[#a594c7] mt-1">
              Give this creator a prompt or assignment to complete during the broadcast.
            </p>

            <textarea
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="e.g. Design a high-contrast typography poster in 15 mins..."
              rows={3}
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/40 p-3 text-xs text-white placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none"
              required
            />

            <div className="mt-3 flex items-center justify-between">
              <label className="text-xs text-[#cabfe0]">Award Points on Completion:</label>
              <select
                value={taskPoints}
                onChange={(e) => setTaskPoints(Number(e.target.value))}
                className="rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-xs text-white"
              >
                <option value={25}>+25 XP</option>
                <option value={50}>+50 XP</option>
                <option value={100}>+100 XP</option>
              </select>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-[#b8aecf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-pink py-2 text-xs font-bold text-white shadow"
              >
                Assign Task ⚡
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AWARD XP POINTS MODAL (HOST ONLY) */}
      {showAwardModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleAwardPointsSubmit}
            className="w-full max-w-md rounded-2xl border border-pink-500/40 bg-[#1e0e38] p-6 shadow-2xl"
          >
            <h4 className="font-bold text-white text-base">
              Award XP Points to {awardeeName}
            </h4>
            <p className="text-xs text-[#a594c7] mt-1">
              Recognize active participation with instant points added to their student account.
            </p>

            <input
              value={awardReason}
              onChange={(e) => setAwardReason(e.target.value)}
              placeholder="Reason (e.g. Excellent critique in chat)"
              className="mt-4 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
              required
            />

            <div className="mt-3 flex items-center justify-between">
              <label className="text-xs text-[#cabfe0]">XP to Award:</label>
              <select
                value={awardPointsVal}
                onChange={(e) => setAwardPointsVal(Number(e.target.value))}
                className="rounded-lg border border-white/20 bg-black/50 px-3 py-1.5 text-xs text-white"
              >
                <option value={25}>+25 XP</option>
                <option value={50}>+50 XP</option>
                <option value={100}>+100 XP</option>
                <option value={200}>+200 XP (Star Contributor)</option>
              </select>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAwardModal(false)}
                className="flex-1 rounded-xl border border-white/10 py-2 text-xs text-[#b8aecf]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-pink py-2 text-xs font-bold text-white shadow"
              >
                Award Points ⭐
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
