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
import {
  getActiveLiveStream,
  startLiveStream as storeStartStream,
  endActiveLiveStream as storeEndStream,
  getLiveChatMessages,
  sendLiveChatMessage,
  pinLiveChatMessage,
  deleteLiveChatMessage,
  promoteViewerToMod,
  promoteViewerToSpeaker,
  demoteViewer,
  joinStreamViewer,
  leaveStreamViewer,
  assignTaskToViewer,
  completeStreamTask,
  awardPointsToStreamViewer,
  toggleParticipantMute,
  muteAllListeners,
  getStreamReplays,
  getLastEndedStream,
  canUserHostStream,
  markStreamTerminated,
  type LiveStream,
  type LiveChatMessage,
  type StreamReplay,
  type StreamRole,
  type LiveStreamParticipant,
  type LiveStreamTask,
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
  chatMessages: LiveChatMessage[];
  replays: StreamReplay[];
  lastEndedStream: StreamReplay | null;
  reactions: FloatingReaction[];
  activeReplay: StreamReplay | null;
  localStream: MediaStream | null;
  cameraActive: boolean;
  micActive: boolean;
  isScreenSharing: boolean;
  isPrivateAuthorized: boolean;
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
  sendMessage: (text: string, guestName?: string) => void;
  pinMessage: (msgId: string) => void;
  deleteMessage: (msgId: string) => void;
  promoteMod: (participantKey: string) => void;
  promoteSpeaker: (participantKey: string) => void;
  demote: (participantKey: string) => void;
  assignTask: (targetUserId: string, targetUserName: string, task: string, points?: number) => void;
  markTaskDone: (taskId: string) => void;
  awardPoints: (userId: string, userName: string, points: number, reason: string) => void;
  muteListener: (listenerId: string, forceMute?: boolean) => void;
  muteAll: () => void;
  sendReaction: (emoji: string) => void;
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

  // Real WebRTC / MediaStream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isPrivateAuthorized, setIsPrivateAuthorized] = useState(false);

  // Automatic media recorder chunks ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedBlobUrlRef = useRef<string | null>(null);

  const canHost = canUserHostStream(student);

  // Sync active live stream across tabs and components
  const syncStream = useCallback(() => {
    const stream = getActiveLiveStream();
    setActiveStream(stream);
    if (stream) {
      setChatMessages(getLiveChatMessages(stream.id));
    }
    setReplays(getStreamReplays());
    setLastEndedStream(getLastEndedStream());
  }, []);

  useEffect(() => {
    syncStream();
    const handleStreamUpdate = () => syncStream();
    const handleChatUpdate = () => {
      const stream = getActiveLiveStream();
      if (stream) {
        setChatMessages(getLiveChatMessages(stream.id));
      }
    };
    const handleReplaysUpdate = () => {
      setReplays(getStreamReplays());
      setLastEndedStream(getLastEndedStream());
    };

    window.addEventListener("kr8:live-stream-updated", handleStreamUpdate);
    window.addEventListener("kr8:live-chat-updated", handleChatUpdate);
    window.addEventListener("kr8:replays-updated", handleReplaysUpdate);
    window.addEventListener("storage", handleStreamUpdate);

    return () => {
      window.removeEventListener("kr8:live-stream-updated", handleStreamUpdate);
      window.removeEventListener("kr8:live-chat-updated", handleChatUpdate);
      window.removeEventListener("kr8:replays-updated", handleReplaysUpdate);
      window.removeEventListener("storage", handleStreamUpdate);
    };
  }, [syncStream]);

  // Handle URL parameters for joining a stream directly via shared link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const liveParam = params.get("live") || params.get("stream");
    const keyParam = params.get("key");

    if (liveParam) {
      const stream = getActiveLiveStream();
      if (stream && (liveParam === stream.id || liveParam === "1" || liveParam === "true")) {
        if (stream.visibility === "private") {
          if (keyParam && keyParam.trim().toUpperCase() === stream.accessKey?.trim().toUpperCase()) {
            setIsPrivateAuthorized(true);
          }
        } else {
          setIsPrivateAuthorized(true);
        }
        setIsStageOpen(true);
      } else {
        // Check if matching a recorded replay in the vault
        const matchedReplay = getStreamReplays().find((r) => r.id === liveParam || r.streamId === liveParam);
        if (matchedReplay) {
          setActiveReplay(matchedReplay);
          setIsStageOpen(true);
        }
      }
    }
  }, []);

  // Track viewer joining & leaving room
  useEffect(() => {
    if (!activeStream || !isStageOpen || activeReplay) return;

    const viewerId = student?.id || `guest-${Date.now()}`;
    const viewerName = student?.name || "Guest Creator";
    const viewerAvatar = student?.avatar;
    const isHost = student?.id === activeStream.hostId;

    const participant: LiveStreamParticipant = {
      id: viewerId,
      name: viewerName,
      avatar: viewerAvatar,
      role: isHost ? "host" : "viewer",
      joinedAt: Date.now(),
    };

    joinStreamViewer(activeStream.id, participant);

    return () => {
      leaveStreamViewer(activeStream.id, viewerId);
    };
  }, [activeStream?.id, isStageOpen, activeReplay, student?.id, student?.name, student?.avatar]);

  // Hardware Media Device Management with Virtual Studio Fallback
  const createVirtualStudioStream = (title: string, presenterName: string): MediaStream => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");

    let frame = 0;
    const render = () => {
      if (!ctx) return;
      frame++;

      // Gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#19082c");
      bgGrad.addColorStop(0.5, "#0d0118");
      bgGrad.addColorStop(1, "#2b0a3d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Glowing stage grid lines
      ctx.strokeStyle = "rgba(236, 72, 153, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Central pulsing spotlight
      const pulse = Math.sin(frame * 0.04) * 20;
      const radGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2 - 20,
        10,
        canvas.width / 2,
        canvas.height / 2 - 20,
        220 + pulse
      );
      radGrad.addColorStop(0, "rgba(236, 72, 153, 0.25)");
      radGrad.addColorStop(0.6, "rgba(168, 85, 247, 0.12)");
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Presenter Avatar Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 40, 80, 0, Math.PI * 2);
      ctx.fillStyle = "#2a1245";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ec4899";
      ctx.stroke();

      // Initials in avatar
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 56px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const initial = (presenterName || "K").charAt(0).toUpperCase();
      ctx.fillText(initial, canvas.width / 2, canvas.height / 2 - 38);
      ctx.restore();

      // Animated Live Audio Equalizer Waveform below avatar
      const barCount = 32;
      const startX = canvas.width / 2 - (barCount * 12) / 2;
      for (let i = 0; i < barCount; i++) {
        const h = Math.abs(Math.sin(frame * 0.08 + i * 0.35)) * 45 + 8;
        const bGrad = ctx.createLinearGradient(0, canvas.height / 2 + 70, 0, canvas.height / 2 + 70 - h);
        bGrad.addColorStop(0, "#ec4899");
        bGrad.addColorStop(1, "#a855f7");
        ctx.fillStyle = bGrad;
        ctx.fillRect(startX + i * 12, canvas.height / 2 + 80 - h, 8, h);
      }

      // Top Live Badge
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.roundRect(40, 40, 160, 42, 12);
      ctx.fill();

      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(64, 61, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("LIVE ON AIR", 82, 66);

      // Presenter & Stream Title at Bottom
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(40, canvas.height - 110, canvas.width - 80, 70, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.stroke();

      ctx.fillStyle = "#ec4899";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText(title || "KR8 MASTERCLASS LIVE BROADCAST", 65, canvas.height - 82);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(presenterName || "KR8 Executive Presenter", 65, canvas.height - 56);

      // Timestamp on right
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px monospace";
      ctx.textAlign = "right";
      const timeStr = new Date().toLocaleTimeString();
      ctx.fillText(timeStr, canvas.width - 65, canvas.height - 65);

      requestAnimationFrame(render);
    };

    render();

    const stream = canvas.captureStream(30);

    // Add silent synthetic audio track so MediaRecorder and consumers have an audio track
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        const dest = audioCtx.createMediaStreamDestination();
        gain.connect(dest);
        osc.start();
        const track = dest.stream.getAudioTracks()[0];
        if (track) stream.addTrack(track);
      }
    } catch {
      /* ignore audio context error */
    }

    return stream;
  };

  const startCameraStream = async (): Promise<MediaStream | null> => {
    try {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }

      let stream: MediaStream | null = null;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Attempt 1: Hardware Video + Audio together
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
            },
            audio: true,
          });
        } catch (hardwareErr) {
          console.warn("Hardware camera+mic unavailable, trying video-only:", hardwareErr);
          try {
            // Attempt 2: Hardware Video only (in case mic was blocked or missing)
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              },
            });
            // Try to acquire mic separately
            try {
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const audioTrack = audioStream.getAudioTracks()[0];
              if (audioTrack) stream.addTrack(audioTrack);
            } catch {
              // mic not available
            }
          } catch (videoOnlyErr) {
            console.warn("Hardware camera unavailable, activating Virtual Studio HD Stage:", videoOnlyErr);
          }
        }
      }

      if (stream) {
        setLocalStream(stream);
        setCameraActive(true);
        const hasAudio = stream.getAudioTracks().length > 0;
        setMicActive(hasAudio);
        setIsScreenSharing(false);
        initMediaRecorder(stream);
        addNotification("Live camera and presenter feed active.");
        return stream;
      }

      // Seamless fallback to High-Definition Virtual Studio Camera Feed
      const virtualStream = createVirtualStudioStream(
        activeStream?.title || "KR8 Studio Live",
        student?.name || "Timfire (Founder & CEO)"
      );

      // Attempt to attach real microphone to virtual stage if available
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];
          if (audioTrack) {
            const synTracks = virtualStream.getAudioTracks();
            synTracks.forEach((t) => {
              virtualStream.removeTrack(t);
              t.stop();
            });
            virtualStream.addTrack(audioTrack);
            setMicActive(true);
            addNotification("Microphone active on Virtual Studio Stage.");
          }
        } catch {
          // mic not available
        }
      }

      setLocalStream(virtualStream);
      setCameraActive(true);
      setIsScreenSharing(false);
      initMediaRecorder(virtualStream);
      addNotification("Virtual Studio HD Stage active.");
      return virtualStream;
    } catch (err) {
      console.warn("Could not start camera stream:", err);
      return null;
    }
  };

  const startScreenShare = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      setIsScreenSharing(true);

      // Listen for when user stops screen share from browser controls
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => {
          setIsScreenSharing(false);
          startCameraStream();
        };
      }

      initMediaRecorder(stream);
      return stream;
    } catch (err) {
      console.warn("Screen share cancelled:", err);
      return null;
    }
  };

  const initMediaRecorder = (stream: MediaStream) => {
    try {
      if (typeof MediaRecorder === "undefined") return;
      recordedChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        try {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            recordedBlobUrlRef.current = url;
          }
        } catch (e) {
          console.warn("Error creating recording blob:", e);
        }
      };

      recorder.start(2000);
      mediaRecorderRef.current = recorder;
    } catch (e) {
      console.warn("MediaRecorder could not be initialized:", e);
    }
  };

  const stopMediaTracks = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      setCameraActive(false);
      setMicActive(false);
    }
    setIsScreenSharing(false);
  };

  const toggleCamera = (): boolean => {
    if (!localStream) {
      startCameraStream();
      addNotification("Camera activated (Studio Live Stage).");
      return true;
    }
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraActive(videoTrack.enabled);
      addNotification(videoTrack.enabled ? "Camera turned on." : "Camera turned off (Audio mode).");
      return videoTrack.enabled;
    }
    startCameraStream();
    addNotification("Camera activated.");
    return true;
  };

  const toggleMic = (): boolean => {
    if (!localStream) {
      setMicActive((prev) => {
        const next = !prev;
        addNotification(next ? "Microphone active." : "Microphone muted.");
        return next;
      });
      return !micActive;
    }
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicActive(audioTrack.enabled);
      addNotification(audioTrack.enabled ? "Microphone active." : "Microphone muted.");
      return audioTrack.enabled;
    }
    setMicActive((prev) => {
      const next = !prev;
      addNotification(next ? "Microphone active." : "Microphone muted.");
      return next;
    });
    return !micActive;
  };

  const unlockPrivateStream = (key: string): boolean => {
    if (!activeStream || activeStream.visibility !== "private") return true;
    if (key.trim().toUpperCase() === activeStream.accessKey?.trim().toUpperCase()) {
      setIsPrivateAuthorized(true);
      addNotification("Private access granted! Welcome to the closed session.");
      return true;
    }
    addNotification("Invalid access key. Please check your invitation link.");
    return false;
  };

  const openStage = (replayToWatch?: StreamReplay) => {
    if (replayToWatch) {
      setActiveReplay(replayToWatch);
    }
    setIsStageOpen(true);
    setIsMiniPlayerOpen(false);
  };

  const closeStage = () => {
    setIsStageOpen(false);
    if (activeStream && activeStream.isLive && !activeReplay) {
      setIsMiniPlayerOpen(true);
    }
  };

  const openMiniPlayer = () => {
    setIsStageOpen(false);
    setIsMiniPlayerOpen(true);
  };

  const closeMiniPlayer = () => {
    setIsMiniPlayerOpen(false);
  };

  const closeReplay = () => {
    setActiveReplay(null);
  };

  const startStream = async (data: {
    title: string;
    category: string;
    description?: string;
    quality?: "1080p60" | "720p" | "audio-only";
    visibility?: "public" | "private";
    accessKey?: string;
  }) => {
    const effectiveHost =
      student ||
      getAccounts().find((a) => a.type === "founder") ||
      DEFAULT_FOUNDER_ACCOUNT;

    // Access real camera or virtual studio camera
    await startCameraStream();

    const created = storeStartStream({
      title: data.title,
      category: data.category,
      description: data.description,
      host: effectiveHost,
      quality: data.quality,
      visibility: data.visibility || "public",
      accessKey: data.accessKey,
    });

    setActiveStream(created);
    setIsPrivateAuthorized(true);
    setChatMessages(getLiveChatMessages(created.id));
    setIsStageOpen(true);
    setIsMiniPlayerOpen(false);

    addNotification(
      `🔴 Broadcast LIVE: "${created.title}" [${created.visibility === "private" ? "🔒 Private" : "🌐 Public"}]`
    );
    return created;
  };

  const endStream = () => {
    const currentStreamId = activeStream?.id;
    stopMediaTracks();

    const recordedUrl = recordedBlobUrlRef.current || undefined;
    const archivedReplay = storeEndStream(recordedUrl);

    if (currentStreamId) {
      markStreamTerminated(currentStreamId);
    }

    setActiveStream(null);
    setIsStageOpen(false);
    setIsMiniPlayerOpen(false);
    setReplays(getStreamReplays());
    setLastEndedStream(getLastEndedStream());

    // Explicitly update store & trigger sync across tabs
    saveActiveLiveStream(null);

    addNotification(
      "Broadcast ended! Stream stopped across the entire website."
    );
    return archivedReplay;
  };

  const sendMessage = (text: string, guestName?: string) => {
    if (!activeStream) return;
    const isFounder = student?.type === "founder";
    const isCoFounder = student?.type === "co-founder";
    const isCoach = student?.admin?.role === "coach";
    const isStudent = student?.type === "student";
    const isTribe = student?.type === "tribe";

    const isHost = student?.id === activeStream.hostId;
    const isMod = (activeStream.promotedModerators || []).includes(student?.id || guestName || "");
    const isSpeaker = (activeStream.promotedSpeakers || []).includes(student?.id || guestName || "");

    let role: StreamRole = "viewer";
    let badge = "⭐ Guest";

    if (isHost) {
      role = "host";
      badge = "👑 Host & Founder";
    } else if (isSpeaker) {
      role = "speaker";
      badge = "🎙️ Speaker";
    } else if (isMod) {
      role = "moderator";
      badge = "🛡️ Moderator";
    } else if (isFounder) {
      role = "host";
      badge = "👑 Founder";
    } else if (isCoFounder) {
      role = "co-host";
      badge = "💎 Co-Founder";
    } else if (isCoach) {
      role = "moderator";
      badge = "🛡️ KR8 Coach";
    } else if (isStudent) {
      role = "viewer";
      badge = "🎓 Student";
    } else if (isTribe) {
      role = "viewer";
      badge = "🌍 Tribe";
    }

    const senderName = student?.name || guestName || "Guest Creator";
    const senderId = student?.id || `guest-${Date.now()}`;

    const newMsg = sendLiveChatMessage({
      streamId: activeStream.id,
      senderId,
      senderName,
      senderRole: role,
      senderBadge: badge,
      text,
    });

    setChatMessages((prev) => [...prev, newMsg]);
  };

  const pinMessage = (msgId: string) => {
    if (!activeStream) return;
    pinLiveChatMessage(activeStream.id, msgId);
    setChatMessages(getLiveChatMessages(activeStream.id));
    addNotification("Pinned message updated.");
  };

  const deleteMessage = (msgId: string) => {
    if (!activeStream) return;
    deleteLiveChatMessage(activeStream.id, msgId);
    setChatMessages(getLiveChatMessages(activeStream.id));
    addNotification("Message removed by moderator.");
  };

  const promoteMod = (participantKey: string) => {
    if (!activeStream) return;
    promoteViewerToMod(activeStream.id, participantKey);
    setActiveStream(getActiveLiveStream());
    addNotification(`Promoted "${participantKey}" to Chat Moderator.`);
  };

  const promoteSpeaker = (participantKey: string) => {
    if (!activeStream) return;
    promoteViewerToSpeaker(activeStream.id, participantKey);
    setActiveStream(getActiveLiveStream());
    addNotification(`Invited "${participantKey}" to speak on stage!`);
  };

  const demote = (participantKey: string) => {
    if (!activeStream) return;
    demoteViewer(activeStream.id, participantKey);
    setActiveStream(getActiveLiveStream());
    addNotification(`Updated permissions for "${participantKey}".`);
  };

  const assignTask = (targetUserId: string, targetUserName: string, task: string, points?: number) => {
    if (!activeStream) return;
    assignTaskToViewer(activeStream.id, {
      targetUserId,
      targetUserName,
      task,
      points,
    });
    setActiveStream(getActiveLiveStream());
    addNotification(`Assigned task to ${targetUserName}: "${task}"`);
  };

  const markTaskDone = (taskId: string) => {
    if (!activeStream) return;
    completeStreamTask(activeStream.id, taskId);
    setActiveStream(getActiveLiveStream());
    addNotification("Task marked as completed! XP awarded to participant.");
  };

  const awardPoints = (userId: string, userName: string, points: number, reason: string) => {
    if (!activeStream) return;
    awardPointsToStreamViewer(activeStream.id, userId, userName, points, reason);
    setActiveStream(getActiveLiveStream());
    addNotification(`Awarded +${points} XP to ${userName}!`);
  };

  const muteListener = (listenerId: string, forceMute?: boolean) => {
    if (!activeStream) return;
    const isMuted = toggleParticipantMute(activeStream.id, listenerId, forceMute);
    setActiveStream(getActiveLiveStream());
    addNotification(isMuted ? "Participant microphone muted." : "Participant microphone unmuted.");
  };

  const muteAll = () => {
    if (!activeStream) return;
    muteAllListeners(activeStream.id);
    setActiveStream(getActiveLiveStream());
    addNotification("All listeners have been muted.");
  };

  const sendReaction = (emoji: string) => {
    const id = `rx-${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 80) + 10;
    setReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  const refreshReplays = () => {
    setReplays(getStreamReplays());
    setLastEndedStream(getLastEndedStream());
  };

  return (
    <LiveStreamContext.Provider
      value={{
        activeStream,
        isLive: !!activeStream && activeStream.isLive,
        isStageOpen,
        isMiniPlayerOpen,
        canHost,
        chatMessages,
        replays,
        lastEndedStream,
        reactions,
        activeReplay,
        localStream,
        cameraActive,
        micActive,
        isScreenSharing,
        isPrivateAuthorized,
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
        refreshReplays,
        closeReplay,
      }}
    >
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const context = useContext(LiveStreamContext);
  if (!context) {
    throw new Error("useLiveStream must be used within a LiveStreamProvider");
  }
  return context;
}
