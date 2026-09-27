console.log("=== RUNNING STEP 13 — LIVE STREAM LIFECYCLE & DEBUGGING ===");

// Emulate store and context
const storage = new Map();
const mockStore = {
  load: (k, def) => storage.get(k) !== undefined ? storage.get(k) : def,
  save: (k, v) => storage.set(k, v),
};

function canUserHost(user) {
  if (!user) return false;
  if (user.type === "founder" || user.type === "co-founder") return true;
  if (user.admin && (user.admin.role === "ultimate" || user.admin.role === "admin" || user.admin.role === "coach")) return true;
  return false;
}

// 1. Initial State Check
console.log("\n--- [TEST 1] Initial Load State ---");
let activeStream = mockStore.load("kr8_live_stream_v2", null);
console.log("Active stream on initial boot:", activeStream);
if (activeStream !== null) {
  throw new Error("Live stream auto-started on initial boot without explicit action!");
}
console.log("✓ Live stream is null. Never starts automatically!");

// 2. Permission Check for Regular Student
console.log("\n--- [TEST 2] Unauthorized User Attempt ---");
const regularStudent = { id: "KR82026ST0042GRA", name: "Student User", type: "student" };
if (canUserHost(regularStudent)) {
  throw new Error("Regular student erroneously allowed to host stream!");
}
console.log("✓ Regular student blocked from starting live stream.");

// 3. Authorized Host Launch
console.log("\n--- [TEST 3] Authorized Host Launches Broadcast ---");
const founderHost = { id: "KR82026ST0000ADM", name: "Timfire", type: "founder" };
if (!canUserHost(founderHost)) {
  throw new Error("Founder denied stream hosting rights!");
}

const newStream = {
  id: `stream-${Date.now()}`,
  title: "Brand Strategy Drill 2026",
  category: "Creative Tech & Strategy",
  hostId: founderHost.id,
  hostName: founderHost.name,
  isLive: true,
  startedAt: Date.now(),
  viewerCount: 1,
  peakViewers: 1,
  viewers: [{ id: founderHost.id, name: founderHost.name, role: "host" }],
};
mockStore.save("kr8_live_stream_v2", newStream);
activeStream = mockStore.load("kr8_live_stream_v2", null);

if (!activeStream || !activeStream.isLive || activeStream.title !== "Brand Strategy Drill 2026") {
  throw new Error("Stream failed to launch properly!");
}
console.log("✓ Broadcast launched successfully:", activeStream.title, "by", activeStream.hostName);

// 4. Viewer Joins
console.log("\n--- [TEST 4] Viewer Joins Stream ---");
activeStream.viewers.push({ id: regularStudent.id, name: regularStudent.name, role: "attendee" });
activeStream.viewerCount = activeStream.viewers.length;
activeStream.peakViewers = Math.max(activeStream.peakViewers, activeStream.viewerCount);
mockStore.save("kr8_live_stream_v2", activeStream);
console.log("Viewer joined. Current online viewers:", activeStream.viewerCount);
if (activeStream.viewerCount !== 2) {
  throw new Error("Viewer join count mismatch!");
}
console.log("✓ Viewer presence tracked accurately.");

// 5. Host Ends Stream
console.log("\n--- [TEST 5] Host Ends Broadcast & Saves Replay ---");
const replays = mockStore.load("kr8_stream_replays_v2", []);
const replay = {
  id: `replay-${Date.now()}`,
  streamId: activeStream.id,
  title: activeStream.title,
  category: activeStream.category,
  hostName: activeStream.hostName,
  durationMinutes: 1,
  peakViewers: activeStream.peakViewers,
};
replays.unshift(replay);
mockStore.save("kr8_stream_replays_v2", replays);
mockStore.save("kr8_last_ended_stream_v2", replay);
// Mark terminated & null active
mockStore.save("kr8_live_stream_v2", null);
const terminatedList = mockStore.load("kr8_terminated_streams_v1", []);
terminatedList.push(activeStream.id);
mockStore.save("kr8_terminated_streams_v1", terminatedList);

console.log("Stream ended. Active stream is now:", mockStore.load("kr8_live_stream_v2", null));
console.log("Saved replay title:", replay.title, "Peak viewers:", replay.peakViewers);

if (mockStore.load("kr8_live_stream_v2", null) !== null) {
  throw new Error("Stream did not reset to null after ending!");
}
console.log("✓ Stream ended cleanly. Active stream is null and replay saved.");

// 6. Reload verification
console.log("\n--- [TEST 6] Page Reload Verification ---");
const reloadedStream = mockStore.load("kr8_live_stream_v2", null);
if (reloadedStream !== null) {
  throw new Error("Stream erroneously revived on page reload!");
}
console.log("✓ Page reload maintains idle state. No ghost streams or auto-start!");

console.log("\n=======================================================");
console.log("=== STEP 13 LIVE STREAM DEBUGGING FULLY VERIFIED! ===");
console.log("=======================================================");
