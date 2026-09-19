import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getActiveLiveStream,
  startLiveStream as storeStartStream,
  endActiveLiveStream as storeEndStream,
  updateLiveStream as storeUpdateStream,
  getLiveChatMessages,
  sendLiveChatMessage,
  pinLiveChatMessage,
  deleteLiveChatMessage,
  promoteViewerToMod,
  promoteViewerToSpeaker,
  demoteViewer,
  getStreamReplays,
  canUserHostStream,
  type LiveStream,
  type LiveChatMessage,
  type StreamReplay,
  type StreamRole,
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
  reactions: FloatingReaction[];
  activeReplay: StreamReplay | null;
  openStage: (replayToWatch?: StreamReplay) => void;
  closeStage: () => void;
  openMiniPlayer: () => void;
  closeMiniPlayer: () => void;
  startStream: (data: { title: string; category: string; description?: string; quality?: "1080p60" | "720p" | "audio-only" }) => LiveStream | null;
  endStream: () => StreamReplay | null;
  sendMessage: (text: string, guestName?: string) => void;
  pinMessage: (msgId: string) => void;
  deleteMessage: (msgId: string) => void;
  promoteMod: (participantKey: string) => void;
  promoteSpeaker: (participantKey: string) => void;
  demote: (participantKey: string) => void;
  sendReaction: (emoji: string) => void;
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
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [activeReplay, setActiveReplay] = useState<StreamReplay | null>(null);

  const canHost = canUserHostStream(student);

  // Sync active live stream across tabs and pages
  const syncStream = useCallback(() => {
    const stream = getActiveLiveStream();
    setActiveStream(stream);
    if (stream) {
      setChatMessages(getLiveChatMessages(stream.id));
    }
    setReplays(getStreamReplays());
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
    const handleReplaysUpdate = () => setReplays(getStreamReplays());

    window.addEventListener("kr8:live-stream-updated", handleStreamUpdate);
    window.addEventListener("kr8:live-chat-updated", handleChatUpdate);
    window.addEventListener("kr8:replays-updated", handleReplaysUpdate);
    window.addEventListener("storage", handleStreamUpdate);

    // Periodically poll viewer fluctuations while live to simulate active community traffic
    const interval = setInterval(() => {
      const curr = getActiveLiveStream();
      if (curr && curr.isLive) {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const nextCount = Math.max(28, curr.viewerCount + delta);
        const nextPeak = Math.max(curr.peakViewers, nextCount);
        if (nextCount !== curr.viewerCount) {
          storeUpdateStream({ viewerCount: nextCount, peakViewers: nextPeak });
          setActiveStream(getActiveLiveStream());
        }
      }
    }, 12000);

    return () => {
      window.removeEventListener("kr8:live-stream-updated", handleStreamUpdate);
      window.removeEventListener("kr8:live-chat-updated", handleChatUpdate);
      window.removeEventListener("kr8:replays-updated", handleReplaysUpdate);
      window.removeEventListener("storage", handleStreamUpdate);
      clearInterval(interval);
    };
  }, [syncStream]);

  // Check URL params for joining a stream directly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("join") === "live" || params.get("stream")) {
      setIsStageOpen(true);
    }
  }, []);

  const openStage = (replayToWatch?: StreamReplay) => {
    if (replayToWatch) {
      setActiveReplay(replayToWatch);
    }
    setIsStageOpen(true);
    setIsMiniPlayerOpen(false);
  };

  const closeStage = () => {
    setIsStageOpen(false);
    // If a live stream is still active, keep it accessible via mini-player
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

  const startStream = (data: {
    title: string;
    category: string;
    description?: string;
    quality?: "1080p60" | "720p" | "audio-only";
  }) => {
    if (!student || !canHost) {
      addNotification("You must have executive/coach authorization to start a live broadcast.");
      return null;
    }
    const created = storeStartStream({
      title: data.title,
      category: data.category,
      description: data.description,
      host: student,
      quality: data.quality,
    });
    setActiveStream(created);
    setChatMessages(getLiveChatMessages(created.id));
    setIsStageOpen(true);
    setIsMiniPlayerOpen(false);
    addNotification(`🔴 You are now broadcasting LIVE: "${created.title}"!`);
    return created;
  };

  const endStream = () => {
    if (!activeStream) return null;
    const archivedReplay = storeEndStream();
    setActiveStream(null);
    setIsMiniPlayerOpen(false);
    setReplays(getStreamReplays());
    addNotification("Broadcast ended. Stream recording has been saved to site replay archives.");
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

  const sendReaction = (emoji: string) => {
    const id = `rx-${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 80) + 10; // random percentage 10-90%
    setReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2800);
  };

  const refreshReplays = () => {
    setReplays(getStreamReplays());
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
        reactions,
        activeReplay,
        openStage,
        closeStage,
        openMiniPlayer,
        closeMiniPlayer,
        startStream,
        endStream,
        sendMessage,
        pinMessage,
        deleteMessage,
        promoteMod,
        promoteSpeaker,
        demote,
        sendReaction,
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
