import { getSupabase } from "./supabase";
import {
  getAccounts,
  saveAccounts,
  getActiveLiveStream,
  saveActiveLiveStream,
  getLiveChatMessages,
  saveLiveChatMessages,
  getFeed,
  addFeed,
  type Account,
  type LiveStream,
  type LiveChatMessage,
  type FeedItem,
} from "../data/store";

let isInitialized = false;

export function initSupabaseSync() {
  if (typeof window === "undefined" || isInitialized) return;
  const supabase = getSupabase();
  if (!supabase) return;

  isInitialized = true;

  // 1. Initial hydration from Supabase
  hydrateAccountsFromSupabase();
  hydrateLiveStreamFromSupabase();

  // 2. Automated background push to Supabase on local changes
  window.addEventListener("kr8:accounts-updated", () => {
    const accounts = getAccounts();
    accounts.forEach((acc) => {
      if (!acc.isPlaceholder) {
        syncAccountToSupabase(acc);
      }
    });
  });

  window.addEventListener("kr8:live-stream-updated", () => {
    syncLiveStreamToSupabase(getActiveLiveStream());
  });

  // 3. Realtime Subscriptions
  try {
    const streamChannel = supabase
      .channel("public:live_streams")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as any;
            if (row && row.is_live) {
              const stream: LiveStream = {
                id: row.id,
                title: row.title,
                category: row.category,
                description: row.description || "",
                hostId: row.host_id || "",
                hostName: row.host_name,
                hostAvatar: row.host_avatar,
                visibility: row.visibility || "public",
                accessKey: row.access_key,
                isLive: row.is_live,
                startedAt: Number(row.started_at) || Date.now(),
                viewerCount: Number(row.viewer_count) || 1,
                peakViewers: Number(row.peak_viewers) || 1,
                quality: row.quality || "1080p60",
                videoUrl: row.video_url || "",
                posterUrl: row.poster_url || "",
                pinnedNotice: row.pinned_notice,
                promotedModerators: [],
                promotedSpeakers: [],
                viewers: row.viewers || [],
                assignedTasks: row.assigned_tasks || [],
                recognizedParticipants: row.recognized_participants || [],
              };
              saveActiveLiveStream(stream);
            } else if (payload.eventType === "UPDATE" && !row.is_live) {
              saveActiveLiveStream(null);
            }
          } else if (payload.eventType === "DELETE") {
            saveActiveLiveStream(null);
          }
        }
      )
      .subscribe();

    const chatChannel = supabase
      .channel("public:live_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat" },
        (payload) => {
          const row = payload.new as any;
          if (row) {
            const active = getActiveLiveStream();
            if (active && active.id === row.stream_id) {
              const currentMessages = getLiveChatMessages(row.stream_id);
              if (!currentMessages.some((m) => m.id === row.id)) {
                const newMsg: LiveChatMessage = {
                  id: row.id,
                  streamId: row.stream_id,
                  senderId: row.sender_id,
                  senderName: row.sender_name,
                  senderRole: row.sender_role || "viewer",
                  senderBadge: row.sender_badge,
                  text: row.text,
                  createdAt: Number(row.created_at) || Date.now(),
                  isPinned: row.is_pinned || false,
                };
                saveLiveChatMessages(row.stream_id, [...currentMessages, newMsg]);
              }
            }
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("Realtime subscription initialization error:", err);
  }
}

async function hydrateAccountsFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data, error } = await supabase.from("accounts").select("*");
    if (!error && data && data.length > 0) {
      const local = getAccounts();
      const localMap = new Map(local.map((a) => [a.id, a]));

      data.forEach((row: any) => {
        const acc: Account = {
          id: row.id,
          type: row.type || "student",
          name: row.name,
          email: row.email,
          phone: row.phone,
          country: row.country || "NG",
          skill: row.skill || "",
          dob: row.dob || "",
          points: Number(row.points) || 0,
          vip: !!row.vip,
          attendanceAccepted: Number(row.attendance_accepted) || 0,
          submissions: Number(row.submissions) || 0,
          referrals: Number(row.referrals) || 0,
          graduated: !!row.graduated,
          avatar: row.avatar || "/founder_timfire.jpg",
          executiveRole: row.executive_role,
        };
        localMap.set(acc.id, acc);
      });

      saveAccounts(Array.from(localMap.values()));
    }
  } catch {
    /* ignore network/table error */
  }
}

async function hydrateLiveStreamFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { data, error } = await supabase
      .from("live_streams")
      .select("*")
      .eq("is_live", true)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const stream: LiveStream = {
        id: data.id,
        title: data.title,
        category: data.category,
        description: data.description || "",
        hostId: data.host_id || "",
        hostName: data.host_name,
        hostAvatar: data.host_avatar,
        visibility: data.visibility || "public",
        accessKey: data.access_key,
        isLive: true,
        startedAt: Number(data.started_at) || Date.now(),
        viewerCount: Number(data.viewer_count) || 1,
        peakViewers: Number(data.peak_viewers) || 1,
        quality: data.quality || "1080p60",
        videoUrl: data.video_url || "",
        posterUrl: data.poster_url || "",
        pinnedNotice: data.pinned_notice,
        promotedModerators: [],
        promotedSpeakers: [],
        viewers: data.viewers || [],
        assignedTasks: data.assigned_tasks || [],
        recognizedParticipants: data.recognized_participants || [],
      };
      saveActiveLiveStream(stream);
    }
  } catch {
    /* ignore */
  }
}

export async function syncAccountToSupabase(account: Account) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from("accounts").upsert({
      id: account.id,
      type: account.type,
      name: account.name,
      email: account.email,
      phone: account.phone,
      country: account.country || "NG",
      skill: account.skill || null,
      dob: account.dob || null,
      password: (account as any).password || "kr8-account",
      vip: !!account.vip,
      points: account.points || 0,
      attendance_accepted: account.attendanceAccepted || 0,
      submissions: account.submissions || 0,
      referrals: account.referrals || 0,
      graduated: !!account.graduated,
      avatar: account.avatar || null,
      executive_role: account.executiveRole || null,
    });
  } catch (err) {
    console.warn("Could not sync account to Supabase:", err);
  }
}

export async function syncLiveStreamToSupabase(stream: LiveStream | null) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    if (!stream) {
      await supabase.from("live_streams").update({ is_live: false }).eq("is_live", true);
    } else {
      await supabase.from("live_streams").upsert({
        id: stream.id,
        title: stream.title,
        category: stream.category,
        description: stream.description,
        host_id: stream.hostId,
        host_name: stream.hostName,
        host_avatar: stream.hostAvatar,
        visibility: stream.visibility,
        access_key: stream.accessKey,
        is_live: stream.isLive,
        started_at: stream.startedAt,
        viewer_count: stream.viewerCount,
        peak_viewers: stream.peakViewers,
        quality: stream.quality,
        viewers: stream.viewers || [],
        assigned_tasks: stream.assignedTasks || [],
        recognized_participants: stream.recognizedParticipants || [],
      });
    }
  } catch (err) {
    console.warn("Could not sync live stream to Supabase:", err);
  }
}

export async function syncLiveChatMessageToSupabase(msg: LiveChatMessage) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from("live_chat").insert({
      id: msg.id,
      stream_id: msg.streamId,
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      sender_badge: msg.senderBadge || null,
      text: msg.text,
      is_pinned: !!msg.isPinned,
      created_at: msg.createdAt,
    });
  } catch (err) {
    console.warn("Could not sync chat message to Supabase:", err);
  }
}
