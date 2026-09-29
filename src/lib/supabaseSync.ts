import { getSupabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  getAccounts,
  saveAccounts,
  getActiveLiveStream,
  saveActiveLiveStream,
  isStreamTerminated,
  getLiveChatMessages,
  saveLiveChatMessages,
  generateDefaultAvatar,
  normalizeIdentity,
  type Account,
  type LiveStream,
  type LiveChatMessage,
} from "../data/store";

let isInitialized = false;
let accountsPushListener: ((event: Event) => void) | null = null;
let liveStreamPushListener: (() => void) | null = null;
let activeChannels: RealtimeChannel[] = [];
let hydrateInFlight = false;
let hydratePending = false;
let accountsHydrateTimer: ReturnType<typeof setTimeout> | null = null;

function teardownSync() {
  if (typeof window !== "undefined") {
    if (accountsPushListener) {
      window.removeEventListener("kr8:accounts-updated", accountsPushListener as EventListener);
      accountsPushListener = null;
    }
    if (liveStreamPushListener) {
      window.removeEventListener("kr8:live-stream-updated", liveStreamPushListener as EventListener);
      liveStreamPushListener = null;
    }
  }
  for (const ch of activeChannels) {
    try {
      ch.unsubscribe();
    } catch {
      /* ignore */
    }
  }
  activeChannels = [];
  if (accountsHydrateTimer) {
    clearTimeout(accountsHydrateTimer);
    accountsHydrateTimer = null;
  }
  isInitialized = false;
}

if (typeof window !== "undefined") {
  window.addEventListener("kr8:supabase-configured", () => {
    teardownSync();
    initSupabaseSync();
  });
}

export function initSupabaseSync() {
  if (typeof window === "undefined" || isInitialized) return;
  const supabase = getSupabase();
  if (!supabase) return;

  isInitialized = true;

  // 1. Initial hydration from Supabase
  hydrateAccountsFromSupabase();
  hydrateLiveStreamFromSupabase();

  // 2. Automated background push to Supabase on local changes.
  //    Pushes ONLY the changed accounts (change set arrives in the event
  //    detail) — re-pushing the entire roster on every change caused a
  //    realtime feedback storm that starved new student registrations.
  accountsPushListener = (event: Event) => {
    const detail = (event as CustomEvent).detail as
      | { changedIds?: string[] }
      | undefined;
    const accounts = getAccounts();
    const changed = detail?.changedIds;
    const targets = changed
      ? accounts.filter((acc) =>
          changed.some((c) => normalizeIdentity(c || "") === normalizeIdentity(acc.id || ""))
        )
      : accounts;
    targets.forEach((acc) => {
      if (!acc.isPlaceholder) {
        syncAccountToSupabase(acc);
      }
    });
  };
  window.addEventListener("kr8:accounts-updated", accountsPushListener);

  liveStreamPushListener = () => {
    syncLiveStreamToSupabase(getActiveLiveStream());
  };
  window.addEventListener("kr8:live-stream-updated", liveStreamPushListener);

  // 3. Realtime Subscriptions
  try {
    const liveStreamsChannel = supabase
      .channel("public:live_streams")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_streams" },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const row = payload.new as any;
            if (row && row.is_live) {
              if (isStreamTerminated(row.id)) {
                // Stream was stopped locally; do not resurrect it
                return;
              }
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
      );
    activeChannels.push(liveStreamsChannel);
    liveStreamsChannel.subscribe();

    const liveChatChannel = supabase
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
      );
    activeChannels.push(liveChatChannel);
    liveChatChannel.subscribe();

    const accountsChannel = supabase
      .channel("public:accounts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "accounts" },
        () => {
          // Debounced: a roster push emits many row events; coalesce them into
          // a single hydration so the merge -> save -> push cycle converges
          // instead of storming.
          if (accountsHydrateTimer) clearTimeout(accountsHydrateTimer);
          accountsHydrateTimer = setTimeout(() => {
            hydrateAccountsFromSupabase();
          }, 800);
        }
      );
    activeChannels.push(accountsChannel);
    accountsChannel.subscribe();
  } catch (err) {
    console.warn("Realtime subscription initialization error:", err);
  }
}

// Tolerant account comparison for hydration change detection: the merge uses
// `||` coalescing, which legitimately swaps null <-> undefined (and empty
// arrays) between reads. A strict JSON compare would flag those as changes on
// every hydrate and re-broadcast kr8:accounts-updated forever.
function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object") return Object.keys(v as object).length === 0;
  return false;
}

function sameValue(a: unknown, b: unknown): boolean {
  const ea = isEmptyValue(a);
  const eb = isEmptyValue(b);
  if (ea || eb) return ea && eb;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!sameValue(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    return sameAccount(a, b);
  }
  return a === b;
}

function sameAccount(a: unknown, b: unknown): boolean {
  const ka = a && typeof a === "object" && !Array.isArray(a) ? Object.keys(a as object) : [];
  const kb = b && typeof b === "object" && !Array.isArray(b) ? Object.keys(b as object) : [];
  for (const k of new Set([...ka, ...kb])) {
    if (!sameValue((a as any)?.[k], (b as any)?.[k])) return false;
  }
  return true;
}

// The exact fields the cloud `accounts` table owns (mirrors
// syncAccountToSupabase's payload). Local-only fields (serial, year, skills,
// certificates, notifications, graduatedSkills, ...) are carried through via
// the `...existing` spread and must never trigger a re-broadcast.
const CLOUD_SYNCED_FIELDS = [
  "id",
  "type",
  "name",
  "email",
  "phone",
  "country",
  "skill",
  "dob",
  "vip",
  "points",
  "attendanceAccepted",
  "submissions",
  "referrals",
  "graduated",
  "certTier",
  "certRecognition",
  "avatar",
  "executiveRole",
] as const;

function cloudFieldsDiffer(a: any, b: any): boolean {
  for (const f of CLOUD_SYNCED_FIELDS) {
    if (!sameValue(a?.[f], b?.[f])) return true;
  }
  return false;
}

export async function hydrateAccountsFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return;
  // If a hydration is already in flight, queue one follow-up pass so a
  // concurrent caller (e.g. Verify page + realtime event at the same time)
  // still gets fresh data instead of being silently dropped.
  if (hydrateInFlight) {
    hydratePending = true;
    return;
  }
  hydrateInFlight = true;

  try {
    const { data, error } = await supabase.from("accounts").select("*");
    if (!error && data && data.length > 0) {
      const local = getAccounts();
      const localMap = new Map(local.map((a) => [normalizeIdentity(a.id || ""), a]));
      let changedAny = false;

      data.forEach((row: any) => {
        const key = normalizeIdentity(String(row.id || ""));
        if (!key) return;
        const existing = localMap.get(key);

        // Never downgrade local graduation status or wipe local certificates/notifications
        const isGraduated = existing?.graduated || !!row.graduated;
        const certTier = existing?.certTier || row.cert_tier || (isGraduated ? "Completion" : undefined);

        const acc: Account = {
          ...existing,
          id: row.id,
          type: row.type || existing?.type || "student",
          name: row.name || existing?.name,
          email: row.email || existing?.email,
          phone: row.phone || existing?.phone,
          country: row.country || existing?.country || "NG",
          skill: row.skill || existing?.skill || "",
          dob: row.dob || existing?.dob || "",
          points: Number(row.points) || existing?.points || 0,
          vip: typeof row.vip !== "undefined" ? !!row.vip : (existing?.vip ?? false),
          attendanceAccepted: Number(row.attendance_accepted) || existing?.attendanceAccepted || 0,
          submissions: Number(row.submissions) || existing?.submissions || 0,
          referrals: Number(row.referrals) || existing?.referrals || 0,
          graduated: isGraduated,
          certTier,
          certRecognition: row.cert_recognition || existing?.certRecognition,
          certificates: existing?.certificates || [],
          notifications: existing?.notifications || [],
          graduatedSkills: existing?.graduatedSkills || (isGraduated && (row.skill || existing?.skill) ? [row.skill || existing?.skill] : []),
          certificateUrl: existing?.certificateUrl,
          avatar: (row.avatar && (row.type === "founder" || !row.avatar.includes("founder_timfire.jpg")))
            ? row.avatar
            : (existing?.avatar || generateDefaultAvatar(row.name, row.id)),
          executiveRole: row.executive_role || existing?.executiveRole,
          // Prefer the locally known joined (authoritative); fall back to the
          // cloud timestamp only for records we have never seen before.
          joined: existing?.joined || row.created_at || row.joined || new Date().toISOString(),
        };
        if (!existing || cloudFieldsDiffer(existing, acc)) {
          localMap.set(key, acc);
          changedAny = true;
        }
      });

      // Only persist (and thereby re-broadcast kr8:accounts-updated) when the
      // merge actually changed something — otherwise the save would re-trigger
      // a cloud push and the realtime loop would never converge.
      if (changedAny) saveAccounts(Array.from(localMap.values()));
    }
  } catch {
    /* ignore network/table error */
  } finally {
    hydrateInFlight = false;
    if (hydratePending) {
      hydratePending = false;
      // Follow-up pass to service the caller that arrived while we were busy.
      hydrateAccountsFromSupabase();
    }
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
      if (isStreamTerminated(data.id)) {
        // This stream was already terminated locally; update Supabase so it does not persist
        try {
          await supabase.from("live_streams").update({ is_live: false }).eq("id", data.id);
        } catch {
          /* ignore */
        }
        return;
      }

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
      // NEVER sync real credentials to the cloud (the anon key is public);
      // authentication always resolves against local storage.
      password: "kr8-account",
      vip: !!account.vip,
      points: account.points || 0,
      attendance_accepted: account.attendanceAccepted || 0,
      submissions: account.submissions || 0,
      referrals: account.referrals || 0,
      graduated: !!account.graduated,
      cert_tier: account.certTier || null,
      cert_recognition: account.certRecognition || null,
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
      await supabase.from("live_streams").update({ is_live: false }).neq("id", "none");
      await supabase.from("streams").update({ is_live: false }).neq("id", "none");
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

      // Also upsert to new LiveKit streams table if present
      await supabase.from("streams").upsert({
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
        livekit_room_name: stream.livekitRoomName || stream.id,
        chat_permission: stream.chatPermission || "everyone",
        is_locked: !!stream.isLocked,
        is_suspended: !!stream.isSuspended,
        spotlight_participant_id: stream.spotlightParticipantId || null,
        is_recording: !!stream.isRecording,
        viewers: stream.viewers || [],
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

    await supabase.from("stream_chat_messages").insert({
      id: msg.id,
      stream_id: msg.streamId,
      sender_id: msg.senderId,
      sender_name: msg.senderName,
      sender_role: msg.senderRole,
      recipient_id: msg.recipientId || null,
      recipient_name: msg.recipientName || null,
      is_private: !!msg.recipientId,
      text: msg.text,
      is_pinned: !!msg.isPinned,
      created_at: msg.createdAt,
    });
  } catch (err) {
    console.warn("Could not sync chat message to Supabase:", err);
  }
}
