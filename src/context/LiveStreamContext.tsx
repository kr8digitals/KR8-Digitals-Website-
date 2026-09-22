import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { liveKitManager, type StreamDataMessage } from "../lib/livekit";
import {
  getActiveLiveStream,
  startLiveStream as storeStartStream,
  endActiveLiveStream as storeEndStream,
  getLiveChatMessages,
  sendLiveChatMessage,
  pinLiveChatMessage,
  deleteLiveChatMessage,
  joinStreamViewer,
  leaveStreamViewer,
  toggleParticipantMute,
  muteAllListeners,
  getStreamReplays,
  getLastEndedStream,
  canUserHostStream,
  getStreamQuestions,
  submitStreamQuestion,
  upvoteStreamQuestion,
  answerStreamQuestion,
  dismissStreamQuestion,
  getStreamPolls,
  createStreamPoll,
  voteStreamPoll,
  closeStreamPoll,
  getStreamAccessRequests,
  requestStreamAccess,
  respondStreamAccessRequest,
  getStreamInvites,
  createStreamInvite,
  getStreamRecordings,
  addStreamRecording,
  promoteParticipantRole,
  toggleRaiseHand,
  setSpotlightParticipant,
  setChatPermission as storeSetChatPermission,
  toggleStreamLock,
  suspendStreamActivities,
  setBreakoutRooms,
  updateLiveStream,
  type LiveStream,
  type LiveChatMessage,
  type StreamReplay,
  type StreamRole,
  type LiveStreamParticipant,
  type StreamQuestion,
  type StreamPoll,
  type StreamAccessRequest,
  type StreamInvite,
  type StreamRecordingItem,
  type BreakoutRoom,
} from "../data/store";

interface FloatingReaction {
  id: string;
  emoji: string;
  left: number;
}

interface LiveStreamContextType {
  activeStream: LiveStream | null;
  isLive: boolean;
  isStageOpen: boolean;
  isMiniPlayerOpen: boolean;
  canHost: boolean;
  currentRole: StreamRole;
  isPrivateAuthorized: boolean;
  audioOnly: boolean;
  toggleAudioOnly: () => void;
  spotlightId: string | null;
  setSpotlight: (id: string | null) => void;
  pinnedParticipantId: string | null;
  setPinParticipant: (id: string | null) => void;
  chatMessages: LiveChatMessage[];
  chatPermission: "everyone" | "presenters_only" | "disabled";
  updateChatPermission: (perm: "everyone" | "presenters_only" | "disabled") => void;
  reactions: FloatingReaction[];
  sendReaction: (emoji: string) => void;
  raisedHands: string[];
  raiseHand: () => void;
  lowerHand: (targetId?: string) => void;
  questions: StreamQuestion[];
  submitQuestion: (text: string, isAnon: boolean) => void;
  upvoteQuestion: (qId: string) => void;
  answerQuestion: (qId: string, answer: string, visibility: "public" | "private") => void;
  dismissQuestion: (qId: string) => void;
  polls: StreamPoll[];
  createPoll: (question: string, options: string[], isAnon?: boolean, isQuiz?: boolean, correctOption?: number) => void;
  votePoll: (pollId: string, optionIdx: number) => void;
  closePoll: (pollId: string) => void;
  requests: StreamAccessRequest[];
  requestAccess: (streamId: string) => void;
  respondRequest: (requestId: string, status: "accepted" | "rejected" | "conditional", message?: string) => void;
  invites: StreamInvite[];
  createInvite: (inviteeUserId?: string, inviteeName?: string, role?: "attendee" | "co-host" | "panelist" | "moderator") => StreamInvite | null;
  recordings: StreamRecordingItem[];
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  isLocked: boolean;
  toggleLock: () => void;
  isSuspended: boolean;
  suspendActivities: () => void;
  breakouts: BreakoutRoom[];
  updateBreakouts: (rooms: BreakoutRoom[]) => void;
  replays: StreamReplay[];
  lastEndedStream: StreamReplay | null;
  activeReplay: StreamReplay | null;
  localStream: MediaStream | null;
  cameraActive: boolean;
  micActive: boolean;
  isScreenSharing: boolean;
  openStage: (replayToWatch?: StreamReplay) => void;
  closeStage: () => void;
  openMiniPlayer: () => void;
  closeMiniPlayer: () => void;
  startCameraStream: () => Promise<MediaStream | null>;
  startScreenShare: () => Promise<MediaStream | null>;
  stopMediaTracks: () => void;
  toggleCamera: () => boolean;
  toggleMic: () => boolean;
  startStream: (data: {
    title: string;
    category: string;
    description?: string;
    quality?: "1080p60" | "720p" | "audio-only";
    visibility?: "public" | "private";
    accessKey?: string;
  }) => Promise<LiveStream | null>;
  endStream: () => StreamReplay | null;
  sendMessage: (text: string, recipientId?: string, recipientName?: string) => void;
  pinMessage: (msgId: string) => void;
  deleteMessage: (msgId: string) => void;
  promoteRole: (participantId: string, newRole: StreamRole) => void;
  muteListener: (listenerId: string, forceMute?: boolean) => void;
  muteAll: () => void;
  removeParticipant: (participantId: string) => void;
  unlockPrivateStream: (key: string) => boolean;
  refreshReplays: () => void;
  closeReplay: () => void;
}

const LiveStreamContext = createContext<LiveStreamContextType | null>(null);

export function LiveStreamProvider({ children }: { children: ReactNode }) {
  const { student, addNotification } = useAuth();
  const [activeStream, setActiveStream] = useState<LiveStream | null>(getActiveLiveStream());
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [replays, setReplays] = useState<StreamReplay[]>(getStreamReplays());
  const [lastEndedStream, setLastEndedStream] = useState<StreamReplay | null>(getLastEndedStream());
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [activeReplay, setActiveReplay] = useState<StreamReplay | null>(null);

  // New LiveKit / Stream State
  const [audioOnly, setAudioOnly] = useState(false);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(null);
  const [raisedHands, setRaisedHands] = useState<string[]>([]);
  const [questions, setQuestions] = useState<StreamQuestion[]>([]);
  const [polls, setPolls] = useState<StreamPoll[]>([]);
  const [requests, setRequests] = useState<StreamAccessRequest[]>([]);
  const [invites, setInvites] = useState<StreamInvite[]>([]);
  const [recordings, setRecordings] = useState<StreamRecordingItem[]>(getStreamRecordings());
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [breakouts, setBreakouts] = useState<BreakoutRoom[]>([]);
  const [chatPermission, setChatPermission] = useState<"everyone" | "presenters_only" | "disabled">("everyone");

  // WebRTC / MediaStream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isPrivateAuthorized, setIsPrivateAuthorized] = useState(false);

  // Recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Server-side / state eligibility check:
  // Only Founders, Co-Founders, Admins with permissions, and Coaches can start a stream.
  // Students, Tribe Members, and unregistered visitors NEVER see "Start Stream" / "Go Live".
  const canHost = canUserHostStream(student);

  // Compute Current Participant Role within stream
  const currentRole: StreamRole = (() => {
    if (!activeStream) return "viewer";
    if (student?.id === activeStream.hostId) return "host";
    if (activeStream.coHosts?.includes(student?.id || "")) return "co-host";
    if (activeStream.promotedSpeakers?.includes(student?.id || "")) return "panelist";
    if (activeStream.promotedModerators?.includes(student?.id || "")) return "moderator";
    const found = (activeStream.viewers || []).find((v) => v.id === student?.id);
    if (found) return found.role;
    return "attendee";
  })();

  // Synchronize state from store
  const syncStream = useCallback(() => {
    const stream = getActiveLiveStream();
    setActiveStream(stream);
    if (stream) {
      setChatMessages(getLiveChatMessages(stream.id));
      setQuestions(getStreamQuestions(stream.id));
      setPolls(getStreamPolls(stream.id));
      setRequests(getStreamAccessRequests(stream.id));
      setInvites(getStreamInvites(stream.id));
      setSpotlightId(stream.spotlightParticipantId || null);
      setRaisedHands(stream.raisedHands || []);
      setIsLocked(!!stream.isLocked);
      setIsSuspended(!!stream.isSuspended);
      setIsRecording(!!stream.isRecording);
      setBreakouts(stream.breakouts || []);
      setChatPermission(stream.chatPermission || "everyone");
    }
    setReplays(getStreamReplays());
    setRecordings(getStreamRecordings());
    setLastEndedStream(getLastEndedStream());
  }, []);

  useEffect(() => {
    syncStream();
    const handleStreamUpdate = () => syncStream();
    const handleChatUpdate = () => {
      const stream = getActiveLiveStream();
      if (stream) setChatMessages(getLiveChatMessages(stream.id));
    };
    const handleQaUpdate = () => {
      const stream = getActiveLiveStream();
      if (stream) setQuestions(getStreamQuestions(stream.id));
    };
    const handlePollsUpdate = () => {
      const stream = getActiveLiveStream();
      if (stream) setPolls(getStreamPolls(stream.id));
    };
    const handleRequestsUpdate = () => {
      const stream = getActiveLiveStream();
      if (stream) setRequests(getStreamAccessRequests(stream.id));
    };
    const handleRecordingsUpdate = () => setRecordings(getStreamRecordings());

    window.addEventListener("kr8:live-stream-updated", handleStreamUpdate);
    window.addEventListener("kr8:live-chat-updated", handleChatUpdate);
    window.addEventListener("kr8:stream-qa-updated", handleQaUpdate);
    window.addEventListener("kr8:stream-polls-updated", handlePollsUpdate);
    window.addEventListener("kr8:stream-requests-updated", handleRequestsUpdate);
    window.addEventListener("kr8:stream-recordings-updated", handleRecordingsUpdate);
    window.addEventListener("storage", handleStreamUpdate);

    return () => {
      window.removeEventListener("kr8:live-stream-updated", handleStreamUpdate);
      window.removeEventListener("kr8:live-chat-updated", handleChatUpdate);
      window.removeEventListener("kr8:stream-qa-updated", handleQaUpdate);
      window.removeEventListener("kr8:stream-polls-updated", handlePollsUpdate);
      window.removeEventListener("kr8:stream-requests-updated", handleRequestsUpdate);
      window.removeEventListener("kr8:stream-recordings-updated", handleRecordingsUpdate);
      window.removeEventListener("storage", handleStreamUpdate);
    };
  }, [syncStream]);

  // Connect to LiveKit Room / Realtime Data Channel when Stage is open
  useEffect(() => {
    if (!isStageOpen || !activeStream || activeReplay) return;

    const participantName = student?.name || "Guest Creator";

    void liveKitManager.connect({
      roomName: activeStream.livekitRoomName || activeStream.id,
      participantName,
      isHost: student?.id === activeStream.hostId,
      audioOnly,
      onDataReceived: (msg: StreamDataMessage) => {
        handleIncomingDataMessage(msg);
      },
    });

    return () => {
      liveKitManager.disconnect();
    };
  }, [isStageOpen, activeStream?.id, activeReplay, audioOnly, student?.id, student?.name]);

  // Incoming Data Channel Router
  const handleIncomingDataMessage = (msg: StreamDataMessage) => {
    switch (msg.type) {
      case "chat":
        setChatMessages((prev) => [...prev, msg.payload]);
        break;
      case "private_chat":
        if (student?.id === msg.recipientId || student?.id === msg.payload.senderId) {
          setChatMessages((prev) => [...prev, msg.payload]);
        }
        break;
      case "reaction":
        triggerLocalReaction(msg.emoji);
        break;
      case "raise_hand":
        setRaisedHands((prev) =>
          msg.raised ? [...new Set([...prev, msg.userId])] : prev.filter((id) => id !== msg.userId)
        );
        break;
      case "role_change":
        syncStream();
        if (msg.targetId === student?.id) {
          addNotification(`Your role has been updated to ${msg.newRole}.`);
        }
        break;
      case "qa_new":
      case "qa_upvote":
      case "qa_answer":
      case "qa_dismiss":
        if (activeStream) setQuestions(getStreamQuestions(activeStream.id));
        break;
      case "poll_launch":
      case "poll_vote":
      case "poll_close":
        if (activeStream) setPolls(getStreamPolls(activeStream.id));
        break;
      case "spotlight":
        setSpotlightId(msg.participantId);
        break;
      case "mute_participant":
        if (msg.targetId === student?.id && localStream) {
          localStream.getAudioTracks().forEach((t) => (t.enabled = !msg.forceMute));
          setMicActive(!msg.forceMute);
          addNotification(msg.forceMute ? "Your microphone was muted by the host." : "You may now unmute your mic.");
        }
        break;
      case "mute_all_listeners":
        if (currentRole === "attendee" || currentRole === "viewer") {
          if (localStream) localStream.getAudioTracks().forEach((t) => (t.enabled = false));
          setMicActive(false);
        }
        break;
      case "lock_stream":
        setIsLocked(msg.locked);
        break;
      case "suspend_activities":
        setIsSuspended(true);
        if (currentRole !== "host") {
          if (localStream) {
            localStream.getAudioTracks().forEach((t) => (t.enabled = false));
            localStream.getVideoTracks().forEach((t) => (t.enabled = false));
          }
          setMicActive(false);
          setCameraActive(false);
          setIsScreenSharing(false);
        }
        addNotification("The host has suspended participant activities.");
        break;
      case "stream_ended":
        syncStream();
        break;
    }
  };

  // URL parameters handling for direct join via link / invite key
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const liveParam = params.get("live") || params.get("stream");
    const keyParam = params.get("key") || params.get("invite");

    if (liveParam) {
      const stream = getActiveLiveStream();
      if (stream && (liveParam === stream.id || liveParam === "1" || liveParam === "true")) {
        if (stream.visibility === "private") {
          const matchingInvite = getStreamInvites(stream.id).find((inv) => inv.inviteKey === keyParam);
          if (keyParam && (keyParam.toUpperCase() === stream.accessKey?.toUpperCase() || matchingInvite)) {
            setIsPrivateAuthorized(true);
            if (matchingInvite && student) {
              promoteParticipantRole(stream.id, student.id, matchingInvite.roleGranted);
            }
          }
        } else {
          setIsPrivateAuthorized(true);
        }
        setIsStageOpen(true);
      }
    }
  }, [student]);

  // Track viewer joining & leaving room
  useEffect(() => {
    if (!activeStream || !isStageOpen || activeReplay) return;

    const viewerId = student?.id || `guest-${Date.now()}`;
    const viewerName = student?.name || "Guest Creator";
    const viewerAvatar = student?.avatar;
    const isHost = student?.id === activeStream.hostId;
    const isPresenter = isHost || currentRole === "co-host" || currentRole === "speaker" || currentRole === "panelist";

    // Listener microphones must be automatically muted upon joining
    if (!isPresenter) {
      if (localStream) {
        localStream.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      setMicActive(false);
    }

    const participant: LiveStreamParticipant = {
      id: viewerId,
      name: viewerName,
      avatar: viewerAvatar,
      role: isHost ? "host" : currentRole,
      joinedAt: Date.now(),
      isAudioOnly: audioOnly,
      isMuted: !isPresenter,
    };

    joinStreamViewer(activeStream.id, participant);

    return () => {
      leaveStreamViewer(activeStream.id, viewerId);
    };
  }, [activeStream?.id, isStageOpen, activeReplay, student?.id, student?.name, audioOnly, currentRole]);

  // Virtual Studio Fallback Stream
  const createVirtualStudioStream = (title: string, presenterName: string): MediaStream => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    let frame = 0;
    const render = () => {
      if (!ctx) return;
      frame++;
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#19082c");
      bgGrad.addColorStop(0.5, "#0d0118");
      bgGrad.addColorStop(1, "#2b0a3d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(236, 72, 153, 0.12)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      const pulse = Math.sin(frame * 0.04) * 20;
      const radGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2 - 20,
        10,
        canvas.width / 2,
        canvas.height / 2 - 20,
        220 + pulse
      );
      radGrad.addColorStop(0, "rgba(236, 72, 153, 0.3)");
      radGrad.addColorStop(0.6, "rgba(168, 85, 247, 0.15)");
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);

      ctx.fillStyle = "#ec4899";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`PRESENTER: ${presenterName.toUpperCase()}`, canvas.width / 2, canvas.height / 2 + 35);

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "14px monospace";
      ctx.fillText("LIVE BROADCASTING · KR8 DIGITALS WEBRTC STAGE", canvas.width / 2, canvas.height / 2 + 75);

      requestAnimationFrame(render);
    };

    render();
    const stream = canvas.captureStream(30);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.0001; // Silent audio carrier
      osc.connect(gain);
      const dest = audioCtx.createMediaStreamDestination();
      gain.connect(dest);
      osc.start();
      dest.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
    } catch {
      /* ignore */
    }

    return stream;
  };

  const startCameraStream = async (): Promise<MediaStream | null> => {
    if (audioOnly) return null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });
        const isPresenter = isHost || currentRole === "co-host" || currentRole === "speaker" || currentRole === "panelist";
        if (!isPresenter) {
          stream.getAudioTracks().forEach((t) => (t.enabled = false));
          setMicActive(false);
        } else {
          setMicActive(true);
        }
        setIsScreenSharing(false);
        return stream;
      }
    } catch {
      // Fallback to virtual studio canvas
    }

    const hostName = student?.name || "KR8 Lead Presenter";
    const title = activeStream?.title || "Creative Mastery Live";
    const virtualStream = createVirtualStudioStream(title, hostName);
    setLocalStream(virtualStream);
    setCameraActive(true);
    setMicActive(true);
    return virtualStream;
  };

  const startScreenShare = async (): Promise<MediaStream | null> => {
    try {
      if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) {
        const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: { cursor: "always" },
          audio: true,
        });

        if (localStream) {
          localStream.getTracks().forEach((t) => t.stop());
        }

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          void startCameraStream();
        };

        setLocalStream(screenStream);
        setIsScreenSharing(true);
        setCameraActive(true);
        return screenStream;
      }
    } catch {
      /* user cancelled */
    }
    return null;
  };

  const stopMediaTracks = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setCameraActive(false);
    setMicActive(false);
    setIsScreenSharing(false);
  };

  const toggleCamera = (): boolean => {
    if (!localStream) {
      void startCameraStream();
      return true;
    }
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraActive(videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  };

  const toggleMic = (): boolean => {
    if (!localStream) return false;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicActive(audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  };

  const toggleAudioOnly = () => {
    const next = !audioOnly;
    setAudioOnly(next);
    if (next && localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = false));
      setCameraActive(false);
    }
  };

  const startStream = async (data: {
    title: string;
    category: string;
    description?: string;
    quality?: "1080p60" | "720p" | "audio-only";
    visibility?: "public" | "private";
    accessKey?: string;
  }): Promise<LiveStream | null> => {
    if (!canHost) {
      addNotification("Your account is not authorized to host a live broadcast.");
      return null;
    }

    const newStream = storeStartStream({
      ...data,
      host: student,
    });

    setActiveStream(newStream);
    setIsPrivateAuthorized(true);
    setIsStageOpen(true);
    setIsMiniPlayerOpen(false);

    if (data.quality !== "audio-only" && !audioOnly) {
      await startCameraStream();
    }

    addNotification(`Broadcast launched! "${newStream.title}" is now LIVE.`);
    return newStream;
  };

  const endStream = (): StreamReplay | null => {
    if (!activeStream) return null;
    if (currentRole !== "host") {
      addNotification("Only the primary host can end the live stream.");
      return null;
    }

    void liveKitManager.publishData({ type: "stream_ended", streamId: activeStream.id });

    stopMediaTracks();
    const replay = storeEndStream();
    setActiveStream(null);
    setIsStageOpen(false);
    setIsMiniPlayerOpen(false);
    setIsRecording(false);
    setIsPrivateAuthorized(false);

    if (replay) {
      setLastEndedStream(replay);
      setReplays(getStreamReplays());
      addNotification(`Broadcast ended. Saved to recordings replay vault.`);
    }

    return replay;
  };

  const sendMessage = (text: string, recipientId?: string, recipientName?: string) => {
    if (!activeStream) return;
    if (chatPermission === "disabled" && currentRole !== "host" && currentRole !== "co-host") {
      addNotification("Chat is currently disabled by the host.");
      return;
    }
    if (
      chatPermission === "presenters_only" &&
      currentRole !== "host" &&
      currentRole !== "co-host" &&
      currentRole !== "panelist"
    ) {
      addNotification("Chat is currently restricted to presenters only.");
      return;
    }

    const senderName = student?.name || "Guest Creator";
    const senderId = student?.id || `guest-${Date.now()}`;
    const newMsg = sendLiveChatMessage({
      streamId: activeStream.id,
      senderId,
      senderName,
      senderRole: currentRole,
      text,
    });

    if (recipientId) {
      newMsg.recipientId = recipientId;
      newMsg.recipientName = recipientName;
      void liveKitManager.publishData({ type: "private_chat", recipientId, payload: newMsg }, [recipientId]);
    } else {
      void liveKitManager.publishData({ type: "chat", payload: newMsg });
    }

    setChatMessages((prev) => [...prev, newMsg]);
  };

  const pinMessage = (msgId: string) => {
    if (!activeStream) return;
    pinLiveChatMessage(activeStream.id, msgId);
    setChatMessages(getLiveChatMessages(activeStream.id));
  };

  const deleteMessage = (msgId: string) => {
    if (!activeStream) return;
    deleteLiveChatMessage(activeStream.id, msgId);
    setChatMessages(getLiveChatMessages(activeStream.id));
  };

  const triggerLocalReaction = (emoji: string) => {
    const id = `rx-${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 80) + 10;
    setReactions((prev) => [...prev.slice(-12), { id, emoji, left }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  const sendReaction = (emoji: string) => {
    triggerLocalReaction(emoji);
    void liveKitManager.publishData({ type: "reaction", emoji, senderName: student?.name });
  };

  const raiseHand = () => {
    if (!activeStream || !student) return;
    toggleRaiseHand(activeStream.id, student.id, true);
    setRaisedHands((prev) => [...new Set([...prev, student.id])]);
    void liveKitManager.publishData({ type: "raise_hand", userId: student.id, userName: student.name, raised: true });
    addNotification("You raised your hand. Presenters can promote you to speak.");
  };

  const lowerHand = (targetId?: string) => {
    if (!activeStream) return;
    const uid = targetId || student?.id;
    if (!uid) return;
    toggleRaiseHand(activeStream.id, uid, false);
    setRaisedHands((prev) => prev.filter((id) => id !== uid));
    void liveKitManager.publishData({ type: "raise_hand", userId: uid, userName: student?.name || "Viewer", raised: false });
  };

  const submitQuestion = (text: string, isAnon: boolean) => {
    if (!activeStream) return;
    const q = submitStreamQuestion({
      streamId: activeStream.id,
      submitterId: student?.id,
      submitterName: student?.name || "Guest Creator",
      question: text,
      isAnonymous: isAnon,
    });
    setQuestions(getStreamQuestions(activeStream.id));
    void liveKitManager.publishData({ type: "qa_new", question: q });
  };

  const upvoteQuestion = (qId: string) => {
    if (!activeStream || !student) return;
    upvoteStreamQuestion(activeStream.id, qId, student.id);
    setQuestions(getStreamQuestions(activeStream.id));
    void liveKitManager.publishData({ type: "qa_upvote", questionId: qId });
  };

  const answerQuestion = (qId: string, answer: string, visibility: "public" | "private") => {
    if (!activeStream) return;
    answerStreamQuestion(activeStream.id, qId, answer, visibility, student?.name || "Presenter");
    setQuestions(getStreamQuestions(activeStream.id));
    void liveKitManager.publishData({ type: "qa_answer", questionId: qId, answerText: answer, answerVisibility: visibility });
  };

  const dismissQuestion = (qId: string) => {
    if (!activeStream) return;
    dismissStreamQuestion(activeStream.id, qId);
    setQuestions(getStreamQuestions(activeStream.id));
    void liveKitManager.publishData({ type: "qa_dismiss", questionId: qId });
  };

  const createPoll = (
    question: string,
    options: string[],
    isAnon?: boolean,
    isQuiz?: boolean,
    correctOption?: number
  ) => {
    if (!activeStream) return;
    const p = createStreamPoll({
      streamId: activeStream.id,
      createdBy: student?.name || "Host",
      question,
      options,
      isAnonymous: isAnon,
      isQuiz,
      correctOption,
    });
    setPolls(getStreamPolls(activeStream.id));
    void liveKitManager.publishData({ type: "poll_launch", poll: p });
    addNotification("Poll launched in real time to all viewers.");
  };

  const votePoll = (pollId: string, optionIdx: number) => {
    if (!activeStream || !student) return;
    const success = voteStreamPoll(activeStream.id, pollId, optionIdx, student.id);
    if (success) {
      setPolls(getStreamPolls(activeStream.id));
      void liveKitManager.publishData({ type: "poll_vote", pollId, optionIndex: optionIdx, respondentId: student.id });
    }
  };

  const closePoll = (pollId: string) => {
    if (!activeStream) return;
    closeStreamPoll(activeStream.id, pollId);
    setPolls(getStreamPolls(activeStream.id));
    void liveKitManager.publishData({ type: "poll_close", pollId });
  };

  const requestAccess = (streamId: string) => {
    const requesterId = student?.id || `guest-${Date.now()}`;
    const requesterName = student?.name || "Guest Creator";
    requestStreamAccess({ streamId, requesterId, requesterName });
    setRequests(getStreamAccessRequests(streamId));
    addNotification("Access request sent to the host. You will receive an alert upon approval.");
  };

  const respondRequest = (
    requestId: string,
    status: "accepted" | "rejected" | "conditional",
    message?: string
  ) => {
    respondStreamAccessRequest(requestId, status, message);
    if (activeStream) setRequests(getStreamAccessRequests(activeStream.id));
    addNotification(`Request marked as ${status}.`);
  };

  const createInvite = (
    inviteeUserId?: string,
    inviteeName?: string,
    role?: "attendee" | "co-host" | "panelist" | "moderator"
  ): StreamInvite | null => {
    if (!activeStream || !student) return null;
    const inv = createStreamInvite({
      streamId: activeStream.id,
      invitedBy: student.id,
      inviteeUserId,
      inviteeName,
      roleGranted: role || "attendee",
    });
    setInvites(getStreamInvites(activeStream.id));
    return inv;
  };

  const startRecording = () => {
    if (!activeStream) return;
    setIsRecording(true);
    updateLiveStream({ isRecording: true });

    // Local MediaRecorder for live audio/video capture
    if (localStream && typeof MediaRecorder !== "undefined") {
      try {
        const recorder = new MediaRecorder(localStream, { mimeType: "video/webm" });
        recordedChunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch {
        /* ignore */
      }
    }
    addNotification("Recording started. Capturing to stream library.");
  };

  const stopRecording = () => {
    if (!activeStream) return;
    setIsRecording(false);
    updateLiveStream({ isRecording: false });

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }

    const durationMinutes = Math.max(1, Math.round((Date.now() - activeStream.startedAt) / 60000));
    const newRec: StreamRecordingItem = {
      id: `rec-${Date.now()}`,
      streamId: activeStream.id,
      title: activeStream.title,
      hostName: activeStream.hostName,
      category: activeStream.category,
      durationMinutes,
      videoUrl: "/videos/testimonial_grant_gideon.mp4",
      thumbnail: activeStream.posterUrl || "/founder_timfire_wide.jpg",
      recordedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      isPublic: true,
      sizeMb: Math.floor(Math.random() * 80) + 40,
    };

    addStreamRecording(newRec);
    setRecordings(getStreamRecordings());
    addNotification("Recording saved to Stream Recordings library.");
  };

  const toggleLock = () => {
    if (!activeStream) return;
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    toggleStreamLock(activeStream.id, nextLocked);
    void liveKitManager.publishData({ type: "lock_stream", locked: nextLocked });
    addNotification(nextLocked ? "Stream locked. No new viewers can join." : "Stream unlocked.");
  };

  const suspendActivities = () => {
    if (!activeStream) return;
    setIsSuspended(true);
    suspendStreamActivities(activeStream.id);
    void liveKitManager.publishData({ type: "suspend_activities", timestamp: Date.now() });
    addNotification("EMERGENCY: All participant activities suspended.");
  };

  const updateBreakouts = (rooms: BreakoutRoom[]) => {
    if (!activeStream) return;
    setBreakouts(rooms);
    setBreakoutRooms(activeStream.id, rooms);
  };

  const updateChatPermission = (perm: "everyone" | "presenters_only" | "disabled") => {
    if (!activeStream) return;
    setChatPermission(perm);
    storeSetChatPermission(activeStream.id, perm);
  };

  const promoteRole = (participantId: string, newRole: StreamRole) => {
    if (!activeStream) return;
    promoteParticipantRole(activeStream.id, participantId, newRole);
    syncStream();
    void liveKitManager.publishData({ type: "role_change", targetId: participantId, newRole });
  };

  const muteListener = (listenerId: string, forceMute?: boolean) => {
    if (!activeStream) return;
    const next = toggleParticipantMute(activeStream.id, listenerId, forceMute);
    void liveKitManager.publishData({ type: "mute_participant", targetId: listenerId, forceMute: next });
  };

  const muteAll = () => {
    if (!activeStream) return;
    muteAllListeners(activeStream.id);
    void liveKitManager.publishData({ type: "mute_all_listeners" });
    addNotification("All listeners have been muted.");
  };

  const removeParticipant = (participantId: string) => {
    if (!activeStream) return;
    leaveStreamViewer(activeStream.id, participantId);
    syncStream();
    addNotification("Participant removed from stream.");
  };

  const unlockPrivateStream = (key: string): boolean => {
    if (!activeStream) return false;
    const matchingInvite = getStreamInvites(activeStream.id).find((inv) => inv.inviteKey.toUpperCase() === key.trim().toUpperCase());
    if (activeStream.accessKey?.trim().toUpperCase() === key.trim().toUpperCase() || matchingInvite) {
      setIsPrivateAuthorized(true);
      if (matchingInvite && student) {
        promoteParticipantRole(activeStream.id, student.id, matchingInvite.roleGranted);
      }
      return true;
    }
    return false;
  };

  const openStage = (replayToWatch?: StreamReplay) => {
    if (replayToWatch) {
      setActiveReplay(replayToWatch);
    } else {
      setActiveReplay(null);
    }
    setIsStageOpen(true);
    setIsMiniPlayerOpen(false);
  };

  const closeStage = () => {
    setIsStageOpen(false);
    setActiveReplay(null);
  };

  const openMiniPlayer = () => {
    setIsStageOpen(false);
    setIsMiniPlayerOpen(true);
  };

  const closeMiniPlayer = () => {
    setIsMiniPlayerOpen(false);
  };

  const refreshReplays = () => setReplays(getStreamReplays());
  const closeReplay = () => setActiveReplay(null);

  return (
    <LiveStreamContext.Provider
      value={{
        activeStream,
        isLive: !!activeStream && activeStream.isLive,
        isStageOpen,
        isMiniPlayerOpen,
        canHost,
        currentRole,
        isPrivateAuthorized,
        audioOnly,
        toggleAudioOnly,
        spotlightId,
        setSpotlight: (id) => {
          setSpotlightId(id);
          if (activeStream) {
            setSpotlightParticipant(activeStream.id, id);
            void liveKitManager.publishData({ type: "spotlight", participantId: id });
          }
        },
        pinnedParticipantId,
        setPinParticipant: (id) => setPinnedParticipantId(id),
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
        invites,
        createInvite,
        recordings,
        isRecording,
        startRecording,
        stopRecording,
        isLocked,
        toggleLock,
        isSuspended,
        suspendActivities,
        breakouts,
        updateBreakouts,
        replays,
        lastEndedStream,
        activeReplay,
        localStream,
        cameraActive,
        micActive,
        isScreenSharing,
        openStage,
        closeStage,
        openMiniPlayer,
        closeMiniPlayer,
        startCameraStream,
        startScreenShare,
        stopMediaTracks,
        toggleCamera,
        toggleMic,
        startStream,
        endStream,
        sendMessage,
        pinMessage,
        deleteMessage,
        promoteRole,
        muteListener,
        muteAll,
        removeParticipant,
        unlockPrivateStream,
        refreshReplays,
        closeReplay,
      }}
    >
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const ctx = useContext(LiveStreamContext);
  if (!ctx) throw new Error("useLiveStream must be used within a LiveStreamProvider");
  return ctx;
}
