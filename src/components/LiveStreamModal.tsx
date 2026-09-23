import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLiveStream } from "../context/LiveStreamContext";
import { type StreamRole } from "../data/store";
import Icon from "./Icon";

export default function LiveStreamModal() {
  const { student } = useAuth();
  const {
    activeStream,
    isLive,
    isStageOpen,
    canHost,
    currentRole,
    isPrivateAuthorized,
    audioOnly,
    toggleAudioOnly,
    spotlightId,
    setSpotlight,
    pinnedParticipantId,
    setPinParticipant,
    chatMessages,
    chatPermission,
    updateChatPermission,
    reactions,
    sendReaction,
    raisedHands,
    raiseHand,
    lowerHand,
    questions,
    submitQuestion,
    upvoteQuestion,
    answerQuestion,
    dismissQuestion,
    polls,
    createPoll,
    votePoll,
    closePoll,
    requests,
    requestAccess,
    respondRequest,
    createInvite,
    recordings,
    isRecording,
    startRecording,
    stopRecording,
    isLocked,
    toggleLock,
    isSuspended,
    suspendActivities,
    replays,
    activeReplay,
    localStream,
    remoteStream,
    cameraActive,
    micActive,
    isScreenSharing,
    closeStage,
    openMiniPlayer,
    startCameraStream,
    startScreenShare,
    toggleCamera,
    toggleMic,
    startStream,
    endStream,
    sendMessage,
    promoteRole,
    muteListener,
    muteAll,
    unlockPrivateStream,
    openStage,
  } = useLiveStream();

  // Host Pre-flight Form State
  const [streamTitle, setStreamTitle] = useState("");
  const [streamCategory, setStreamCategory] = useState("Creative Tech & Strategy");
  const [streamDesc] = useState("");
  const [streamQuality] = useState<"1080p60" | "720p" | "audio-only">("1080p60");
  const [streamVisibility, setStreamVisibility] = useState<"public" | "private">("public");
  const [customAccessKey, setCustomAccessKey] = useState("");

  // Private Access Input State
  const [enteredKey, setEnteredKey] = useState("");
  const [accessRequested, setAccessRequested] = useState(false);

  // Viewer & Chat State
  const [chatInput, setChatInput] = useState("");
  const [dmRecipient, setDmRecipient] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "qa" | "polls" | "audience" | "invites" | "replays">("chat");
  const [copiedInviteKey, setCopiedInviteKey] = useState<string | null>(null);

  // Q&A Form State
  const [newQuestionText, setNewQuestionText] = useState("");
  const [askAnonymously, setAskAnonymously] = useState(false);
  const [answeringQId, setAnsweringQId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [answerVisibility, setAnswerVisibility] = useState<"public" | "private">("public");

  // Poll Creation Form State
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Option 1", "Option 2"]);
  const [pollIsAnon, setPollIsAnon] = useState(false);
  const [pollIsQuiz, setPollIsQuiz] = useState(false);
  const [quizCorrectOption] = useState(0);

  // New Invite Generator State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTargetUserId] = useState("");
  const [inviteTargetRole, setInviteTargetRole] = useState<"attendee" | "co-host" | "panelist" | "moderator">("attendee");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Role permissions
  const isHost = Boolean(
    activeStream &&
      (student?.id === activeStream.hostId ||
        student?.type === "founder" ||
        student?.type === "co-founder")
  );

  const activeMediaStream = isHost ? localStream : (remoteStream || localStream);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  const isCoHost = currentRole === "co-host";
  const isPresenter = isHost || isCoHost || currentRole === "panelist";
  const isModerator = isPresenter || currentRole === "moderator";

  const isPrivateLocked = Boolean(
    activeStream &&
      activeStream.visibility === "private" &&
      !isPrivateAuthorized &&
      !isHost
  );

  // Auto-mute listeners on join:
  // Live stream listener microphones must be automatically muted upon joining.
  // Listeners must be able to unmute their own microphone.
  useEffect(() => {
    if (isStageOpen && !isPresenter && !isHost && localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = false));
    }
  }, [isStageOpen, isPresenter, isHost, localStream]);

  // Video element attachment
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeReplay) {
      if (video.srcObject) video.srcObject = null;
      if (video.src !== activeReplay.videoUrl) {
        video.src = activeReplay.videoUrl;
        video.load();
        video.play().catch(() => {});
      }
      return;
    }

    if (activeMediaStream && !audioOnly) {
      if (video.src) {
        video.pause();
        video.removeAttribute("src");
        video.src = "";
        video.load();
      }
      if (video.srcObject !== activeMediaStream) {
        video.srcObject = activeMediaStream;
      }
      // Host muted locally to prevent acoustic feedback howl; audience is unmuted so they hear host
      video.muted = isHost;
      video.play().catch((err: any) => {
        // Handle browser autoplay policy blocking unmuted audio
        if (!isHost && video && !video.muted) {
          video.muted = true;
          video.play().catch(() => {});
          setIsAutoplayBlocked(true);
        }
      });
    } else {
      if (video.src) {
        video.pause();
        video.removeAttribute("src");
        video.src = "";
        video.load();
      }
      video.srcObject = null;

      if (isHost && isLive && isStageOpen && !audioOnly && !localStream) {
        void startCameraStream();
      }
    }
  }, [activeMediaStream, localStream, activeReplay, isLive, isStageOpen, isHost, audioOnly, startCameraStream]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, activeTab]);

  if (!isStageOpen) return null;

  // Handlers
  const handleStartBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamTitle.trim()) return;

    await startStream({
      title: streamTitle.trim(),
      category: streamCategory,
      description: streamDesc.trim(),
      quality: streamQuality,
      visibility: streamVisibility,
      accessKey: streamVisibility === "private" ? customAccessKey.trim() : undefined,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim(), dmRecipient?.id, dmRecipient?.name);
    setChatInput("");
  };

  const handleUnlockPrivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredKey.trim()) return;
    const ok = unlockPrivateStream(enteredKey.trim());
    if (!ok) {
      alert("Invalid invitation key. Please check the code or request access from the host.");
    }
  };

  const handleRequestAccess = () => {
    if (!activeStream) return;
    requestAccess(activeStream.id);
    setAccessRequested(true);
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    submitQuestion(newQuestionText.trim(), askAnonymously);
    setNewQuestionText("");
    setAskAnonymously(false);
  };

  const handleAnswerSubmit = (qId: string) => {
    if (!answerText.trim()) return;
    answerQuestion(qId, answerText.trim(), answerVisibility);
    setAnsweringQId(null);
    setAnswerText("");
  };

  const handleCreatePollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || cleanOptions.length < 2) return;
    createPoll(pollQuestion.trim(), cleanOptions, pollIsAnon, pollIsQuiz, quizCorrectOption);
    setShowPollModal(false);
    setPollQuestion("");
    setPollOptions(["Option 1", "Option 2"]);
    setPollIsQuiz(false);
  };

  const handleCreateInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = createInvite(inviteTargetUserId || undefined, undefined, inviteTargetRole);
    if (inv) {
      setCopiedInviteKey(inv.inviteKey);
      setShowInviteModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex h-full max-h-[96vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0e0419] shadow-2xl">
        {/* TOP BAR / HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#160824]/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 overflow-hidden">
            {isLive && (
              <span className="flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-lg animate-pulse">
                <span className="h-2 w-2 rounded-full bg-white" />
                LIVE
              </span>
            )}

            {isRecording && (
              <span className="flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/50 px-2 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
                🔴 REC
              </span>
            )}

            {activeStream?.visibility === "private" && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                🔒 By Invitation Only
              </span>
            )}

            {isLocked && (
              <span className="flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                🔒 Stage Locked
              </span>
            )}

            {isSuspended && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/30 border border-red-500 px-2 py-0.5 text-[10px] font-bold text-red-200">
                ⚠️ Activities Suspended
              </span>
            )}

            <div className="overflow-hidden truncate">
              <h2 className="truncate text-base font-bold text-white sm:text-lg">
                {activeReplay ? `[Replay] ${activeReplay.title}` : activeStream ? activeStream.title : "Live Studio Broadcast Stage"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#cabfe0]">
                <span>{activeStream?.category || "Live Production & Masterclasses"}</span>
                {activeStream && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-pink-400">Host: {activeStream.hostName}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-mono">
                      👥 {activeStream.viewers?.length || activeStream.viewerCount || 1} online
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Audio-only toggle */}
            <button
              onClick={toggleAudioOnly}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                audioOnly
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                  : "border-white/10 bg-white/5 text-[#cabfe0] hover:bg-white/10 hover:text-white"
              }`}
              title="Toggle Low-Bandwidth Audio Only mode"
            >
              <span>{audioOnly ? "🎧 Audio Only ON" : "📶 Low-Bandwidth Mode"}</span>
            </button>

            {/* Minimize / Floating mini-player */}
            <button
              onClick={openMiniPlayer}
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#cabfe0] hover:bg-white/10 hover:text-white transition-all"
              title="Minimize to Floating Mini Player"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            </button>

            {/* Close stage */}
            <button
              onClick={closeStage}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#cabfe0] hover:bg-white/10 hover:text-white transition-all"
              title="Close Broadcast Stage"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MAIN BODY: STAGE & SIDEBAR */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-3">
          {/* LEFT 2 COLUMNS: VIDEO STAGE & TOOLBAR */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-black lg:col-span-2">
            {/* FLOATING REACTIONS CONTAINER */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
              {reactions.map((r) => (
                <div
                  key={r.id}
                  style={{ left: `${r.left}%` }}
                  className="animate-float-reaction absolute bottom-16 text-3xl sm:text-4xl select-none"
                >
                  {r.emoji}
                </div>
              ))}
            </div>

            {/* STAGE SCREEN / VIDEO FEED */}
            {isPrivateLocked ? (
              /* PRIVATE STREAM ACCESS GATE */
              <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#180a2c] to-[#090314] p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-3xl mb-4 shadow-xl">
                  🔒
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30 uppercase tracking-wider mb-2">
                  By Invitation Only
                </span>
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {activeStream?.title || "Private Broadcast Session"}
                </h3>
                <p className="mt-2 text-sm text-[#cabfe0] max-w-md leading-relaxed">
                  This live stream is locked to invited participants. Registered Students and Tribe Members can unlock with an access key or send an immediate join request to the host.
                </p>

                {/* Key Entry Form */}
                <form onSubmit={handleUnlockPrivate} className="mt-6 flex w-full max-w-sm gap-2">
                  <input
                    value={enteredKey}
                    onChange={(e) => setEnteredKey(e.target.value)}
                    placeholder="Enter Invitation / Access Key"
                    className="flex-1 rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-90"
                  >
                    Unlock Stage →
                  </button>
                </form>

                {/* Request Access Button */}
                <div className="mt-4 flex flex-col items-center gap-2">
                  <span className="text-xs text-[#8e82a8]">Don't have a personal key?</span>
                  {accessRequested ? (
                    <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                      ✓ Request sent to host! You will be notified once accepted.
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestAccess}
                      className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all"
                    >
                      Request Access from Host
                    </button>
                  )}
                </div>

                {!student && (
                  <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 max-w-sm text-xs text-[#cabfe0]">
                    <p className="mb-2 font-semibold text-white">Join Choices for Visitors:</p>
                    <div className="flex justify-center gap-2">
                      <Link
                        to="/login"
                        onClick={closeStage}
                        className="rounded-lg bg-white/10 px-3 py-1.5 font-bold text-white hover:bg-white/20"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeStage}
                        className="rounded-lg bg-gradient-pink px-3 py-1.5 font-bold text-white hover:opacity-90"
                      >
                        Register Account
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : !isLive && !activeReplay ? (
              /* GO LIVE STUDIO PRE-FLIGHT (Only for Eligible Hosts!) */
              <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#180a2c] to-[#090314] p-6 text-center overflow-y-auto">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-pink text-white text-2xl shadow-xl shadow-pink-500/30 mb-4">
                  <Icon name="video" size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                  KR8 Live Studio
                </h3>
                <p className="mt-1 text-sm text-[#cabfe0] max-w-md">
                  Broadcast live masterclasses with ultra-low latency relay, interactive Q&A, and live audience participation.
                </p>

                {canHost ? (
                  <form onSubmit={handleStartBroadcast} className="mt-6 w-full max-w-md space-y-3.5 text-left">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#cabfe0] mb-1">
                        Broadcast Title *
                      </label>
                      <input
                        required
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="e.g. Creative AI Film Production Mastery"
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#cabfe0] mb-1">
                          Category
                        </label>
                        <select
                          value={streamCategory}
                          onChange={(e) => setStreamCategory(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-[#1a0c2e] px-3 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                        >
                          <option>Creative Tech & Strategy</option>
                          <option>AI Motion & Animation</option>
                          <option>Brand Identity & Design</option>
                          <option>WebRTC & Architecture</option>
                          <option>Live Workshop & Review</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#cabfe0] mb-1">
                          Visibility
                        </label>
                        <select
                          value={streamVisibility}
                          onChange={(e) => setStreamVisibility(e.target.value as any)}
                          className="w-full rounded-xl border border-white/15 bg-[#1a0c2e] px-3 py-2.5 text-xs text-white focus:border-pink-500 focus:outline-none"
                        >
                          <option value="public">Public (Open to All)</option>
                          <option value="private">Private (Invitation Only)</option>
                        </select>
                      </div>
                    </div>

                    {streamVisibility === "private" && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                          Private Access Key (Optional Custom Key)
                        </label>
                        <input
                          value={customAccessKey}
                          onChange={(e) => setCustomAccessKey(e.target.value)}
                          placeholder="Leave blank for auto-generated key"
                          className="w-full rounded-xl border border-amber-500/30 bg-black/40 px-4 py-2 text-xs text-white placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-gradient-pink py-3 text-sm font-black text-white shadow-lg glow-pink-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                        Go Live Now
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 max-w-md">
                    <p className="text-sm font-semibold text-white">No active live broadcast at the moment.</p>
                    <p className="mt-1 text-xs text-[#cabfe0]">
                      Broadcasting is reserved for Founders, Admins, and Coaches. Explore past recordings below!
                    </p>
                    <button
                      onClick={() => setActiveTab("replays")}
                      className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
                    >
                      Browse Recordings Replays →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ACTIVE LIVE STAGE FEED */
              <div className="relative h-full w-full flex items-center justify-center bg-black overflow-hidden">
                {audioOnly ? (
                  /* Audio-only Mode Visualizer */
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-900/40 border border-purple-500/50 shadow-2xl mb-4 animate-pulse">
                      <svg className="w-10 h-10 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-white">{activeStream?.title}</h4>
                    <p className="text-xs text-emerald-400 font-semibold mt-1">
                      🎧 Audio-Only Low-Bandwidth Mode Active
                    </p>
                    <p className="text-xs text-[#8e82a8] max-w-sm mt-2">
                      Conserving bandwidth and mobile data. Incoming video relays are paused.
                    </p>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted={isHost}
                      className="h-full w-full object-contain"
                    />

                    {/* Stage Monitor Card when media stream is still negotiating */}
                    {!activeMediaStream && !activeReplay && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#180a2b] via-black to-[#130722] z-10 pointer-events-none select-none">
                        <div className="relative mb-4">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-pink text-white font-bold text-2xl shadow-xl shadow-pink-500/20">
                            {activeStream?.hostName ? activeStream.hostName.charAt(0).toUpperCase() : "K"}
                          </div>
                          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black text-xs font-bold ring-2 ring-black">
                            🔴
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white max-w-md truncate">{activeStream?.title || "KR8 Live Broadcast"}</h4>
                        <p className="text-xs text-pink-300 font-medium mt-1">Host: {activeStream?.hostName || "KR8 Lead Presenter"}</p>
                        <div className="mt-4 flex items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 border border-pink-500/30">
                          <span className="h-2 w-2 rounded-full bg-pink-500 animate-ping" />
                          <span className="text-xs text-emerald-400 font-mono font-semibold">Broadcasting Live · Stage Audio Active</span>
                        </div>
                      </div>
                    )}

                    {/* Unmute prompt if browser autoplay policy muted audio */}
                    {isAutoplayBlocked && !isHost && (
                      <div className="absolute inset-x-0 bottom-16 z-30 flex justify-center px-4 pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => {
                            const video = videoRef.current;
                            if (video) {
                              video.muted = false;
                              video.volume = 1;
                              video.play().catch(() => {});
                              setIsAutoplayBlocked(false);
                            }
                          }}
                          className="flex items-center gap-2 rounded-full bg-pink-600 hover:bg-pink-500 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-2xl transition-all animate-bounce cursor-pointer"
                        >
                          <span>🔊 Tap to Unmute & Listen to Host</span>
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Spotlight / Pin Badges */}
                {spotlightId && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-bold text-black shadow-lg">
                    <span>⭐ Host Spotlight Active</span>
                  </div>
                )}

                {pinnedParticipantId && !spotlightId && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-blue-500/90 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    <span>📌 Locally Pinned</span>
                  </div>
                )}

                {/* Emergency Suspension Banner */}
                {isSuspended && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/30 border border-red-500 text-red-400 text-3xl mb-3">
                      ⚠️
                    </div>
                    <h3 className="text-xl font-bold text-white">Activities Suspended</h3>
                    <p className="text-xs text-red-200 mt-1 max-w-md">
                      The host has temporarily paused participant audio, video, and chat activities for moderation review.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STAGE BOTTOM TOOLBAR */}
            {isLive && !isPrivateLocked && (
              <div className="z-20 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#12071f]/95 px-4 py-2.5">
                {/* Media Toggles (Mic, Camera, Screen) */}
                <div className="flex items-center gap-2">
                  {/* Mic Toggle */}
                  <button
                    onClick={() => {
                      const enabled = toggleMic();
                      if (!enabled && isPresenter) toggleMic();
                    }}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                      micActive
                        ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                        : "border-red-500/40 bg-red-500/20 text-red-300"
                    }`}
                    title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                    <span>{micActive ? "Mic On" : "Muted"}</span>
                  </button>

                  {/* Camera Toggle (Presenters/Host only) */}
                  {isPresenter && (
                    <button
                      onClick={toggleCamera}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        cameraActive
                          ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                          : "border-red-500/40 bg-red-500/20 text-red-300"
                      }`}
                      title={cameraActive ? "Stop Camera" : "Start Camera"}
                    >
                      <Icon name="video" size={14} />
                      <span className="hidden sm:inline">{cameraActive ? "Camera On" : "Camera Off"}</span>
                    </button>
                  )}

                  {/* Screen Share (Presenters/Host only) */}
                  {isPresenter && (
                    <button
                      onClick={startScreenShare}
                      className={`hidden sm:flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        isScreenSharing
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                          : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                      }`}
                      title="Share Screen"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                      </svg>
                      <span>{isScreenSharing ? "Sharing Screen" : "Share Screen"}</span>
                    </button>
                  )}

                  {/* Raise Hand (for Audience) */}
                  {!isPresenter && (
                    <button
                      onClick={() => {
                        const isRaised = student ? raisedHands.includes(student.id) : false;
                        if (isRaised) lowerHand();
                        else raiseHand();
                      }}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                        student && raisedHands.includes(student.id)
                          ? "border-amber-500 bg-amber-500/30 text-amber-200 animate-pulse"
                          : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <span>✋</span>
                      <span>{student && raisedHands.includes(student.id) ? "Hand Raised" : "Raise Hand"}</span>
                    </button>
                  )}
                </div>

                {/* Quick Emoji Reactions */}
                <div className="flex items-center gap-1">
                  {["👍", "❤️", "🔥", "👏", "💡", "🚀"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="rounded-lg p-1.5 text-base hover:bg-white/15 active:scale-125 transition-all"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Host Moderation & Emergency Actions */}
                <div className="flex items-center gap-2">
                  {isModerator && (
                    <button
                      onClick={muteAll}
                      className="hidden sm:flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-[#cabfe0] hover:bg-white/10 hover:text-white"
                      title="Mute All Listeners"
                    >
                      Mute All
                    </button>
                  )}

                  {isHost && (
                    <>
                      {/* Record Toggle */}
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all ${
                          isRecording
                            ? "border-rose-500 bg-rose-500/30 text-rose-200"
                            : "border-white/10 bg-white/5 text-[#cabfe0] hover:bg-white/10"
                        }`}
                        title={isRecording ? "Stop Recording" : "Start Cloud Recording"}
                      >
                        <span className={`h-2 w-2 rounded-full ${isRecording ? "bg-rose-500 animate-pulse" : "bg-white/40"}`} />
                        <span className="hidden md:inline">{isRecording ? "Recording" : "Record"}</span>
                      </button>

                      {/* Lock Stream */}
                      <button
                        onClick={toggleLock}
                        className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all ${
                          isLocked
                            ? "border-blue-500 bg-blue-500/30 text-blue-200"
                            : "border-white/10 bg-white/5 text-[#cabfe0] hover:bg-white/10"
                        }`}
                        title={isLocked ? "Unlock Stage" : "Lock Stage"}
                      >
                        <span>{isLocked ? "🔒 Locked" : "🔓 Lock"}</span>
                      </button>

                      {/* EMERGENCY: Suspend Activities */}
                      <button
                        onClick={suspendActivities}
                        className="flex items-center gap-1 rounded-xl border border-red-500/60 bg-red-600/30 px-2.5 py-1.5 text-xs font-black text-red-200 hover:bg-red-600/50 transition-all shadow-sm"
                        title="EMERGENCY: Instantly pause all participant audio, video, chat"
                      >
                        ⚠️ Suspend
                      </button>

                      {/* End Stream */}
                      <button
                        onClick={endStream}
                        className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-black text-white hover:bg-red-700 shadow-md active:scale-95 transition-all"
                      >
                        End Stream
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: INTERACTIVE TABS & AUDIENCE */}
          <div className="flex flex-col border-t border-white/10 bg-[#130722] lg:border-t-0 lg:border-l lg:border-white/10">
            {/* TABS NAVIGATION */}
            <div className="flex overflow-x-auto border-b border-white/10 bg-[#170a29] px-2 text-xs font-bold text-[#cabfe0] scrollbar-none">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex shrink-0 items-center gap-1 px-3 py-3 border-b-2 transition-all ${
                  activeTab === "chat" ? "border-pink-500 text-white" : "border-transparent hover:text-white"
                }`}
              >
                💬 Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
              </button>

              <button
                onClick={() => setActiveTab("qa")}
                className={`flex shrink-0 items-center gap-1 px-3 py-3 border-b-2 transition-all ${
                  activeTab === "qa" ? "border-pink-500 text-white" : "border-transparent hover:text-white"
                }`}
              >
                ❓ Q&A {questions.length > 0 && `(${questions.length})`}
              </button>

              <button
                onClick={() => setActiveTab("polls")}
                className={`flex shrink-0 items-center gap-1 px-3 py-3 border-b-2 transition-all ${
                  activeTab === "polls" ? "border-pink-500 text-white" : "border-transparent hover:text-white"
                }`}
              >
                📊 Polls {polls.length > 0 && `(${polls.length})`}
              </button>

              <button
                onClick={() => setActiveTab("audience")}
                className={`flex shrink-0 items-center gap-1 px-3 py-3 border-b-2 transition-all ${
                  activeTab === "audience" ? "border-pink-500 text-white" : "border-transparent hover:text-white"
                }`}
              >
                👥 Roles {raisedHands.length > 0 && <span className="text-amber-400">✋({raisedHands.length})</span>}
              </button>

              {activeStream?.visibility === "private" && (
                <button
                  onClick={() => setActiveTab("invites")}
                  className={`flex shrink-0 items-center gap-1 px-3 py-3 border-b-2 transition-all ${
                    activeTab === "invites" ? "border-pink-500 text-white" : "border-transparent hover:text-white"
                  }`}
                >
                  🔑 Access {requests.length > 0 && `(${requests.length})`}
                </button>
              )}

              <button
                onClick={() => setActiveTab("replays")}
                className={`flex shrink-0 items-center gap-1 px-3 py-3 border-b-2 transition-all ${
                  activeTab === "replays" ? "border-pink-500 text-white" : "border-transparent hover:text-white"
                }`}
              >
                📼 Replays
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* TAB 1: LIVE CHAT */}
              {activeTab === "chat" && (
                <div className="flex flex-1 flex-col justify-between overflow-hidden">
                  {/* Chat Permission Notice / Host Selector */}
                  {isHost && (
                    <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-3 py-1.5 text-[11px] text-[#8e82a8]">
                      <span>Chat Mode:</span>
                      <select
                        value={chatPermission}
                        onChange={(e) => updateChatPermission(e.target.value as any)}
                        className="rounded border border-white/10 bg-[#160729] px-2 py-0.5 text-[11px] text-white"
                      >
                        <option value="everyone">Everyone</option>
                        <option value="presenters_only">Presenters Only</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                  )}

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                    {chatMessages.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#8e82a8]">
                        No messages yet. Say hello to the room!
                      </div>
                    ) : (
                      chatMessages
                        .filter((msg) => {
                          // Private DM filter: only show to sender and recipient
                          if (msg.recipientId) {
                            return student?.id === msg.senderId || student?.id === msg.recipientId;
                          }
                          return true;
                        })
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-xl p-2.5 text-xs transition-all ${
                              msg.recipientId
                                ? "border border-purple-500/40 bg-purple-900/30"
                                : msg.isPinned
                                ? "border border-amber-500/40 bg-amber-950/20"
                                : "bg-white/5 hover:bg-white/[0.08]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{msg.senderName}</span>
                                {msg.senderRole === "host" && (
                                  <span className="rounded bg-pink-500/20 px-1.5 py-0.2 text-[9px] font-bold text-pink-300">
                                    👑 Host
                                  </span>
                                )}
                                {msg.senderRole === "co-host" && (
                                  <span className="rounded bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-300">
                                    ⭐ Co-Host
                                  </span>
                                )}
                                {msg.senderRole === "panelist" && (
                                  <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-bold text-blue-300">
                                    🎙️ Speaker
                                  </span>
                                )}
                                {msg.senderRole === "moderator" && (
                                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                                    🛡️ Mod
                                  </span>
                                )}
                                {msg.recipientId && (
                                  <span className="rounded bg-purple-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-purple-200">
                                    🔒 DM to {msg.recipientName || "You"}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#8e82a8]">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[#cabfe0] break-words">{msg.text}</p>
                          </div>
                        ))
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Message Input & DM selector */}
                  <form onSubmit={handleSendMessage} className="border-t border-white/10 bg-[#160829] p-3">
                    {dmRecipient && (
                      <div className="flex items-center justify-between rounded bg-purple-900/40 px-2 py-1 text-[11px] text-purple-200 mb-2 border border-purple-500/40">
                        <span>🔒 Direct Message to: <strong>{dmRecipient.name}</strong></span>
                        <button type="button" onClick={() => setDmRecipient(null)} className="text-white hover:text-red-400">
                          ✕
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={dmRecipient ? `Send private message to ${dmRecipient.name}...` : "Send a message to everyone..."}
                        className="flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-pink-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-pink-500 transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: Q&A QUEUE */}
              {activeTab === "qa" && (
                <div className="flex flex-1 flex-col justify-between overflow-hidden p-3">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {questions.length === 0 ? (
                      <div className="py-12 text-center text-xs text-[#8e82a8]">
                        No questions in queue yet. Be the first to ask!
                      </div>
                    ) : (
                      questions.map((q) => (
                        <div key={q.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-bold text-white">
                                {q.isAnonymous ? "🎭 Anonymous" : q.submitterName}
                              </span>
                              <p className="mt-1 font-medium text-pink-200">{q.question}</p>
                            </div>
                            <button
                              onClick={() => upvoteQuestion(q.id)}
                              className="flex items-center gap-1 rounded-lg border border-pink-500/30 bg-pink-500/10 px-2 py-1 font-bold text-pink-300 hover:bg-pink-500/20"
                            >
                              <span>▲</span>
                              <span>{q.upvotes}</span>
                            </button>
                          </div>

                          {/* Existing Answer */}
                          {q.answered && q.answerText && (
                            <div className="mt-2.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2 text-[11px] text-emerald-200">
                              <span className="font-bold text-emerald-300">Answered by {q.answeredBy}: </span>
                              {q.answerText}
                            </div>
                          )}

                          {/* Presenter / Host Controls to Answer or Dismiss */}
                          {isPresenter && !q.answered && (
                            <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                              {answeringQId === q.id ? (
                                <div className="w-full space-y-2">
                                  <textarea
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    placeholder="Type your answer..."
                                    className="w-full rounded-lg border border-white/15 bg-black/40 p-2 text-xs text-white"
                                    rows={2}
                                  />
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                      <label className="flex items-center gap-1 text-[11px] text-[#cabfe0]">
                                        <input
                                          type="radio"
                                          checked={answerVisibility === "public"}
                                          onChange={() => setAnswerVisibility("public")}
                                        />
                                        Public
                                      </label>
                                      <label className="flex items-center gap-1 text-[11px] text-[#cabfe0]">
                                        <input
                                          type="radio"
                                          checked={answerVisibility === "private"}
                                          onChange={() => setAnswerVisibility("private")}
                                        />
                                        Private DM
                                      </label>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => setAnsweringQId(null)}
                                        className="rounded px-2 py-1 text-[10px] text-gray-400"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleAnswerSubmit(q.id)}
                                        className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                                      >
                                        Submit Answer
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setAnsweringQId(q.id)}
                                    className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold text-white hover:bg-white/20"
                                  >
                                    Answer
                                  </button>
                                  <button
                                    onClick={() => dismissQuestion(q.id)}
                                    className="rounded bg-red-500/20 px-2 py-1 text-[10px] text-red-300 hover:bg-red-500/30"
                                  >
                                    Dismiss
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Ask Question Form */}
                  <form onSubmit={handleAskQuestion} className="mt-3 border-t border-white/10 pt-3">
                    <input
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Ask the speaker a question..."
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-pink-500 focus:outline-none mb-2"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs text-[#cabfe0] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={askAnonymously}
                          onChange={(e) => setAskAnonymously(e.target.checked)}
                          className="rounded text-pink-600 focus:ring-0"
                        />
                        Ask Anonymously
                      </label>
                      <button
                        type="submit"
                        className="rounded-xl bg-pink-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pink-500 transition-all"
                      >
                        Submit Question
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: POLLS & QUIZZES */}
              {activeTab === "polls" && (
                <div className="flex flex-1 flex-col overflow-y-auto p-3 space-y-4">
                  {isPresenter && (
                    <button
                      onClick={() => setShowPollModal(true)}
                      className="w-full rounded-xl border border-dashed border-pink-500/50 bg-pink-500/10 py-2 text-xs font-bold text-pink-300 hover:bg-pink-500/20 transition-all"
                    >
                      + Create New Poll or Quiz
                    </button>
                  )}

                  {polls.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#8e82a8]">
                      No polls active. The host will launch interactive polls during the session!
                    </div>
                  ) : (
                    polls.map((poll) => {
                      const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
                      return (
                        <div key={poll.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white">{poll.question}</span>
                            {poll.isQuiz && (
                              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                                🧠 Quiz
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 mt-3">
                            {poll.options.map((opt, idx) => {
                              const count = opt.votes || 0;
                              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => votePoll(poll.id, idx)}
                                  className="w-full relative overflow-hidden rounded-lg border border-white/10 bg-black/40 p-2 text-left hover:border-pink-500/50 transition-all"
                                >
                                  <div
                                    className="absolute inset-y-0 left-0 bg-pink-500/20 transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                  <div className="relative z-10 flex items-center justify-between text-xs">
                                    <span className="font-medium text-white">{opt.text}</span>
                                    <span className="font-bold text-pink-300 font-mono">
                                      {count} ({pct}%)
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {isPresenter && poll.isActive && (
                            <button
                              onClick={() => closePoll(poll.id)}
                              className="mt-3 rounded bg-red-500/20 px-2.5 py-1 text-[10px] font-bold text-red-300 hover:bg-red-500/30"
                            >
                              Close Poll
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 4: AUDIENCE & ROLE MANAGEMENT */}
              {activeTab === "audience" && (
                <div className="flex flex-1 flex-col overflow-y-auto p-3 space-y-4">
                  {/* Raised Hands Queue */}
                  {raisedHands.length > 0 && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3">
                      <h4 className="text-xs font-bold text-amber-300 mb-2">
                        ✋ Raised Hands Queue ({raisedHands.length})
                      </h4>
                      <div className="space-y-1.5">
                        {raisedHands.map((uid) => {
                          const viewer = (activeStream?.viewers || []).find((v) => v.id === uid);
                          const name = viewer?.name || "Participant";
                          return (
                            <div key={uid} className="flex items-center justify-between text-xs text-white">
                              <span>{name}</span>
                              <div className="flex gap-1.5">
                                {isPresenter && (
                                  <button
                                    onClick={() => promoteRole(uid, "panelist")}
                                    className="rounded bg-pink-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-pink-500"
                                  >
                                    Promote to Speaker
                                  </button>
                                )}
                                <button
                                  onClick={() => lowerHand(uid)}
                                  className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-gray-300 hover:bg-white/20"
                                >
                                  Lower Hand
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Connected Participants List */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#cabfe0] mb-2">
                      Connected Participants ({activeStream?.viewers?.length || 1})
                    </h4>
                    <div className="space-y-2">
                      {(activeStream?.viewers || []).map((viewer) => {
                        const isSelf = viewer.id === student?.id;
                        return (
                          <div
                            key={viewer.id}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">{viewer.name}</span>
                                {isSelf && <span className="text-[10px] text-pink-400 font-semibold">(You)</span>}
                                <span className="rounded bg-black/40 px-1.5 py-0.2 text-[9px] uppercase font-bold text-[#cabfe0]">
                                  {viewer.role}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Send DM button */}
                              {!isSelf && (
                                <button
                                  onClick={() => {
                                    setDmRecipient({ id: viewer.id, name: viewer.name });
                                    setActiveTab("chat");
                                  }}
                                  className="rounded bg-white/10 p-1 text-[10px] text-white hover:bg-white/20"
                                  title="Send Private Direct Message"
                                >
                                  ✉️ DM
                                </button>
                              )}

                              {/* Spotlight / Pin */}
                              {isHost ? (
                                <button
                                  onClick={() => setSpotlight(spotlightId === viewer.id ? null : viewer.id)}
                                  className={`rounded p-1 text-[10px] ${
                                    spotlightId === viewer.id ? "bg-amber-500 text-black font-bold" : "bg-white/10 text-white"
                                  }`}
                                  title="Spotlight participant to everyone"
                                >
                                  ⭐
                                </button>
                              ) : (
                                <button
                                  onClick={() => setPinParticipant(pinnedParticipantId === viewer.id ? null : viewer.id)}
                                  className={`rounded p-1 text-[10px] ${
                                    pinnedParticipantId === viewer.id ? "bg-blue-500 text-white font-bold" : "bg-white/10 text-white"
                                  }`}
                                  title="Pin locally"
                                >
                                  📌
                                </button>
                              )}

                              {/* Host / Co-host Moderation dropdown for this participant */}
                              {isHost && !isSelf && (
                                <select
                                  value={viewer.role}
                                  onChange={(e) => promoteRole(viewer.id, e.target.value as StreamRole)}
                                  className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px] text-white"
                                >
                                  <option value="attendee">Attendee</option>
                                  <option value="panelist">Panelist</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="co-host">Co-Host</option>
                                </select>
                              )}

                              {(isModerator || Boolean(student?.admin || student?.type === "founder" || student?.type === "co-founder")) && !isSelf && (
                                <button
                                  onClick={() => muteListener(viewer.id, !viewer.isMuted)}
                                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${
                                    viewer.isMuted
                                      ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                                  }`}
                                  title={viewer.isMuted ? "Unmute listener microphone" : "Mute listener microphone"}
                                >
                                  {viewer.isMuted ? "🔇 Muted (Click to Unmute)" : "🔊 Active (Click to Mute)"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ACCESS REQUESTS & INVITES (Private Streams) */}
              {activeTab === "invites" && (
                <div className="flex flex-1 flex-col overflow-y-auto p-3 space-y-4">
                  {isHost && (
                    <div>
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="w-full rounded-xl bg-gradient-pink py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
                      >
                        + Generate Elevated Role Invite Key
                      </button>
                    </div>
                  )}

                  {copiedInviteKey && (
                    <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-white">
                      <span className="font-bold text-emerald-400">Invite Key Generated: </span>
                      <code className="rounded bg-black/50 px-2 py-0.5 font-mono text-emerald-200">
                        {copiedInviteKey}
                      </code>
                      <p className="mt-1 text-[11px] text-[#cabfe0]">
                        Share this key with the guest. They can use it to join with elevated permissions!
                      </p>
                    </div>
                  )}

                  {/* Incoming Access Requests */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#cabfe0] mb-2">
                      Access Requests ({requests.length})
                    </h4>
                    {requests.length === 0 ? (
                      <p className="text-xs text-[#8e82a8]">No pending requests.</p>
                    ) : (
                      <div className="space-y-2">
                        {requests.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5 text-xs text-white"
                          >
                            <div>
                              <span className="font-bold">{req.requesterName}</span>
                              <span className="block text-[10px] text-[#8e82a8]">Status: {req.status}</span>
                            </div>

                            {isHost && req.status === "pending" && (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => respondRequest(req.id, "accepted")}
                                  className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => respondRequest(req.id, "rejected")}
                                  className="rounded bg-red-600 px-2 py-1 text-[10px] text-white hover:bg-red-500"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: REPLAYS & RECORDINGS */}
              {activeTab === "replays" && (
                <div className="flex flex-1 flex-col overflow-y-auto p-3 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#cabfe0]">
                    Stream Recordings & Replay Vault
                  </h4>
                  {recordings.length === 0 && replays.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#8e82a8]">
                      No recorded replays available yet.
                    </div>
                  ) : (
                    [...recordings, ...replays].map((item: any, idx) => (
                      <div
                        key={item.id || idx}
                        onClick={() => openStage(item)}
                        className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 hover:bg-white/10 transition-all"
                      >
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                          <img
                            src={item.thumbnail || "/founder_timfire_wide.jpg"}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="text-white text-base">▶</span>
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <h5 className="truncate text-xs font-bold text-white">{item.title}</h5>
                          <p className="text-[11px] text-pink-400 font-medium">Host: {item.hostName}</p>
                          <span className="text-[10px] text-[#8e82a8]">
                            {item.durationMinutes ? `${item.durationMinutes} mins · ` : ""}
                            {item.recordedAt || "Past Session"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE POLL MODAL */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#160829] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Create Real-Time Poll / Quiz</h3>
            <form onSubmit={handleCreatePollSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cabfe0] mb-1">
                  Question *
                </label>
                <input
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Which rendering engine is best for VR?"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
                />
              </div>

              {pollOptions.map((opt, idx) => (
                <div key={idx}>
                  <label className="block text-xs text-[#cabfe0] mb-1">Option {idx + 1}</label>
                  <input
                    required
                    value={opt}
                    onChange={(e) => {
                      const next = [...pollOptions];
                      next[idx] = e.target.value;
                      setPollOptions(next);
                    }}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              ))}

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-xs text-[#cabfe0]">
                  <input
                    type="checkbox"
                    checked={pollIsQuiz}
                    onChange={(e) => setPollIsQuiz(e.target.checked)}
                  />
                  Quiz Mode (One correct answer)
                </label>
                <label className="flex items-center gap-1.5 text-xs text-[#cabfe0]">
                  <input
                    type="checkbox"
                    checked={pollIsAnon}
                    onChange={(e) => setPollIsAnon(e.target.checked)}
                  />
                  Anonymous
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90"
                >
                  Launch to Audience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ELEVATED INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#160829] p-6 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-white">Generate Invite Key</h3>
            <p className="mt-1 text-xs text-[#cabfe0]">
              Create a personalized access key that grants elevated role access upon entry.
            </p>
            <form onSubmit={handleCreateInviteSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cabfe0] mb-1">
                  Elevated Role Granted
                </label>
                <select
                  value={inviteTargetRole}
                  onChange={(e) => setInviteTargetRole(e.target.value as any)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white"
                >
                  <option value="attendee">Attendee (Standard Viewer)</option>
                  <option value="panelist">Panelist / Speaker</option>
                  <option value="moderator">Moderator</option>
                  <option value="co-host">Co-Host</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
