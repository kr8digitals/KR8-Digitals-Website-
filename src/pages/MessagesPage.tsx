import { useState, useEffect, useRef } from "react";
import { useSeo } from "../lib/useSeo";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getAccountById,
  getDirectMessagesBetween,
  sendDirectMessage,
  markConversationRead,
  getStudentConversations,
  searchStudentsFast,
  toggleFollowStudent,
  blockStudent,
  unblockStudent,
  isStudentBlocked,
  reportConversation,
  type Account,
  type DirectMessage,
  type ConversationSummary,
} from "../data/store";
import Icon from "../components/Icon";
import { Avatar } from "../components/ui";

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function MessagesPage() {
  useSeo({ path: "/messages", noindex: true });
  const { student, signIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<Account | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Account[]>([]);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync conversations list
  const refreshConversations = () => {
    if (!student?.id) return;
    const list = getStudentConversations(student.id);
    setConversations(list);
  };

  useEffect(() => {
    refreshConversations();
    window.addEventListener("kr8:direct-messages-updated", refreshConversations);
    window.addEventListener("kr8:blocks-updated", refreshConversations);
    return () => {
      window.removeEventListener("kr8:direct-messages-updated", refreshConversations);
      window.removeEventListener("kr8:blocks-updated", refreshConversations);
    };
  }, [student?.id]);

  // Handle URL user parameter
  useEffect(() => {
    const targetId = searchParams.get("user");
    if (targetId && targetId !== student?.id) {
      setSelectedPartnerId(targetId);
      const acc = getAccountById(targetId);
      if (acc) {
        setActivePartner(acc);
      }
    }
  }, [searchParams, student?.id]);

  // Handle partner selection and thread loading
  useEffect(() => {
    if (!student?.id || !selectedPartnerId) {
      setActivePartner(null);
      setMessages([]);
      return;
    }

    const partner = getAccountById(selectedPartnerId);
    setActivePartner(partner || null);

    const msgs = getDirectMessagesBetween(student.id, selectedPartnerId);
    setMessages(msgs);
    markConversationRead(student.id, selectedPartnerId);

    const blocked = isStudentBlocked(student.id, selectedPartnerId);
    setIsBlocked(blocked);
  }, [selectedPartnerId, student?.id]);

  // Auto-scroll messages container only (does NOT scroll parent window)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Search as you type
  useEffect(() => {
    if (!searchQuery.trim() || !student?.id) {
      setSearchResults([]);
      return;
    }
    const results = searchStudentsFast(searchQuery, student.id, 15);
    setSearchResults(results);
  }, [searchQuery, student?.id]);

  const handleSelectPartner = (partner: Account) => {
    setSelectedPartnerId(partner.id);
    setActivePartner(partner);
    setSearchQuery("");
    setSearchResults([]);
    setSearchParams({ user: partner.id });
    if (student?.id) {
      markConversationRead(student.id, partner.id);
      const msgs = getDirectMessagesBetween(student.id, partner.id);
      setMessages(msgs);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!student?.id || !selectedPartnerId || !inputText.trim()) return;

    const res = sendDirectMessage(student.id, selectedPartnerId, inputText);
    if (!res.ok) {
      setStatusNotice(res.error || "Failed to send message.");
      setTimeout(() => setStatusNotice(null), 4000);
      return;
    }

    setInputText("");
    const updated = getDirectMessagesBetween(student.id, selectedPartnerId);
    setMessages(updated);
    refreshConversations();
  };

  const handleToggleFollow = () => {
    if (!student?.id || !activePartner) return;
    const res = toggleFollowStudent(student.id, activePartner.id);
    if (res.updatedProfile && signIn) {
      signIn(res.updatedProfile);
    }
    const updatedPartner = getAccountById(activePartner.id);
    if (updatedPartner) {
      setActivePartner(updatedPartner);
    }
    setStatusNotice(res.following ? `You are now following ${activePartner.name}.` : `You unfollowed ${activePartner.name}.`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleBlockToggle = () => {
    if (!student?.id || !activePartner) return;
    if (isBlocked) {
      unblockStudent(student.id, activePartner.id);
      setIsBlocked(false);
      setStatusNotice(`Unblocked ${activePartner.name}.`);
    } else {
      blockStudent(student.id, activePartner.id);
      setIsBlocked(true);
      setStatusNotice(`Blocked ${activePartner.name}. Their messages will no longer reach you.`);
    }
    setShowSafetyMenu(false);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleReport = () => {
    if (!student?.id || !activePartner) return;
    reportConversation(student.id, activePartner.id, "User requested moderation review from chat");
    setShowSafetyMenu(false);
    setStatusNotice("Conversation reported to KR8 administration for moderation.");
    setTimeout(() => setStatusNotice(null), 4000);
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0d0118] px-4 py-16 text-center text-white">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400">
            <Icon name="message" size={32} />
          </div>
          <h2 className="mt-4 text-2xl font-black">Student Messages</h2>
          <p className="mt-2 text-sm text-[#b8aecf]">
            Please sign in to your student profile to access your inbox, chat with peers, and manage connections.
          </p>
          <Link
            to="/signin"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-pink px-6 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90"
          >
            Sign In to Messages
          </Link>
        </div>
      </div>
    );
  }

  const isFollowing = (student.following || []).includes(selectedPartnerId || "");
  const canSend = !isBlocked && activePartner?.messagePrivacy !== "No one";

  return (
    <div className="min-h-[calc(100vh-160px)] bg-[#0a0014] text-white py-6 px-2 sm:px-4 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Messenger Header & Breadcrumb */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <Link
              to="/academy"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors mb-1"
            >
              <span>←</span> Back to Academy Profile
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span>KR8 Messenger</span>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-[#a89ec4]">
              Real-time student networking and direct messaging across all tracks.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-[#8a7ba8]">Active as:</span>
            <span className="text-xs font-bold text-pink-300 font-mono bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full">
              {student.name} · {student.id}
            </span>
          </div>
        </div>

        {statusNotice && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-pink-600/90 to-purple-700/90 text-white px-4 py-2.5 text-center text-xs font-semibold shadow-lg animate-fadeIn">
            {statusNotice}
          </div>
        )}

        {/* Messenger Card Container */}
        <div className="h-[640px] sm:h-[680px] rounded-2xl border border-white/10 bg-[#120222]/90 backdrop-blur-xl shadow-2xl flex overflow-hidden">
          {/* LEFT COLUMN: Inbox & Search (hidden on mobile if thread selected) */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col h-full bg-[#140027] ${
              selectedPartnerId ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student name or KR8 ID..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 pl-9 pr-3 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none transition-all"
                />
                <div className="absolute left-3 top-2.5 text-[#7c6f96]">
                  <Icon name="user" size={14} />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-xs text-[#8a7ba8] hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Content: Search Results or Inbox Threads */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {searchQuery.trim() ? (
                <div>
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-pink-400 bg-pink-500/5">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8a7ba8]">
                      No students found matching "{searchQuery}".
                    </div>
                  ) : (
                    searchResults.map((peer) => (
                      <div
                        key={peer.id}
                        onClick={() => handleSelectPartner(peer)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <Avatar name={peer.name} src={peer.avatar} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{peer.name}</h4>
                            <span className="text-[10px] text-pink-400 font-mono">{peer.id}</span>
                          </div>
                          <p className="text-[11px] text-[#9a8db8] capitalize truncate">
                            {peer.skill || "General track"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8a7ba8] bg-white/[0.02]">
                    Inbox ({conversations.length})
                  </div>
                  {conversations.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#8a7ba8]">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[#8a7ba8]">
                        <Icon name="message" size={20} />
                      </div>
                      <p className="font-semibold text-white/80">No active conversations</p>
                      <p className="mt-1 text-[11px] text-[#7c6f96]">
                        Search for a student by name or KR8 ID above to start messaging.
                      </p>
                    </div>
                  ) : (
                    conversations.map((item) => {
                      const isSelected = item.partner.id === selectedPartnerId;
                      const isIncoming = item.lastMessage.recipientId === student.id;

                      return (
                        <div
                          key={item.partner.id}
                          onClick={() => handleSelectPartner(item.partner)}
                          className={`flex items-center gap-3 p-3 cursor-pointer transition-colors relative ${
                            isSelected ? "bg-pink-600/20 border-l-4 border-pink-500" : "hover:bg-white/5"
                          }`}
                        >
                          <Avatar name={item.partner.name} src={item.partner.avatar} size={42} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-white truncate">{item.partner.name}</h4>
                              <span className="text-[10px] text-[#7c6f96]">
                                {formatTime(item.lastMessage.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-[11px] text-[#9a8db8] truncate max-w-[190px]">
                                {isIncoming ? "" : "You: "}
                                {item.lastMessage.text}
                              </p>
                              {item.unreadCount > 0 && (
                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1.5 text-[10px] font-black text-white">
                                  {item.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Active Conversation Thread */}
          <div
            className={`w-full md:flex-1 flex flex-col h-full bg-[#0e001d] ${
              !selectedPartnerId ? "hidden md:flex" : "flex"
            }`}
          >
            {activePartner ? (
              <>
                {/* Thread Header */}
                <div className="p-2.5 sm:p-3 border-b border-white/10 bg-[#16002b] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => {
                        setSelectedPartnerId(null);
                        setSearchParams({});
                      }}
                      className="md:hidden shrink-0 px-2 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/15"
                      title="Back to Inbox"
                    >
                      ←
                    </button>
                    <Avatar name={activePartner.name} src={activePartner.avatar} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[130px] sm:max-w-xs">{activePartner.name}</h3>
                        <span className="text-[9px] sm:text-[10px] font-mono text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20">
                          {activePartner.id}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-[#9a8db8] capitalize truncate">
                        {activePartner.skill || "Student Track"}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Follow Toggle & Safety Menu */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleToggleFollow}
                      className={`rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all ${
                        isFollowing
                          ? "border border-pink-400/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20"
                          : "bg-gradient-pink text-white hover:opacity-90"
                      }`}
                    >
                      {isFollowing ? "Following" : "+ Follow"}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setShowSafetyMenu(!showSafetyMenu)}
                        className="rounded-lg border border-white/15 bg-white/5 p-1.5 sm:p-2 text-xs text-[#cabfe0] hover:bg-white/10"
                        title="Conversation Safety & Moderation"
                      >
                        <Icon name="alert" size={14} />
                      </button>

                      {showSafetyMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-[#1f0338] p-1.5 shadow-2xl z-30 text-xs">
                          <button
                            onClick={handleBlockToggle}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white font-medium"
                          >
                            {isBlocked ? "Unblock Student" : "Block Student"}
                          </button>
                          <button
                            onClick={handleReport}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-rose-400 font-medium"
                          >
                            Report Conversation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages Feed */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#0e001d] to-[#120024]">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-[#8a7ba8]">
                      <div className="h-12 w-12 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center mb-2">
                        <Icon name="message" size={24} />
                      </div>
                      <p className="font-semibold text-white">Start the conversation</p>
                      <p className="mt-1 max-w-xs text-[#9a8db8]">
                        Say hello to {activePartner.name}. Follow each other, collaborate on coursework, and build your digital network.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === student.id;

                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                              isMe
                                ? "bg-gradient-pink text-white rounded-tr-sm"
                                : "bg-[#21053b] border border-white/15 text-[#e5dcf5] rounded-tl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                            <div
                              className={`mt-1 text-[9px] flex items-center gap-1 ${
                                isMe ? "justify-end text-pink-200/80" : "text-[#8a7ba8]"
                              }`}
                            >
                              <span>{formatTime(m.createdAt)}</span>
                              {isMe && <span>{m.read ? "✓✓" : "✓"}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input Bar */}
                <div className="p-3 border-t border-white/10 bg-[#140026]">
                  {canSend ? (
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={`Message ${activePartner.name}...`}
                        className="flex-1 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-pink px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:opacity-90 disabled:opacity-40 transition-all"
                      >
                        <span>Send</span>
                        <Icon name="message" size={14} />
                      </button>
                    </form>
                  ) : (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-center text-xs text-rose-300">
                      {isBlocked
                        ? "You have blocked this student. Unblock them from the safety menu to send messages."
                        : `${activePartner.name} has restricted direct messages in their account privacy settings.`}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8a7ba8]">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-pink-400 flex items-center justify-center mb-4">
                  <Icon name="message" size={32} />
                </div>
                <h3 className="text-base font-bold text-white">Your KR8 Messages</h3>
                <p className="mt-1 text-xs text-[#9a8db8] max-w-sm">
                  Select a conversation from the left or search for any student by name or KR8 ID to start connecting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
