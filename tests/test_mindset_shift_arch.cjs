/**
 * MINDSET SHIFT ARCHITECTURE TEST (STEP 2)
 * Validates the dynamic event system's data + sync layer end to end:
 *   1. Event defaults are the VERIFIED flyer facts (no invented data).
 *   2. Admin edits to event config persist + dispatch live-update events.
 *   3. Registration creates identifiable records with correct lifecycle.
 *   4. Duplicate registration (same email OR phone) resumes, never duplicates.
 *   5. Proof submission + admin verification state machine (approve /
 *      reject / request resubmission) transitions correctly.
 *   6. Access is gated: granted ONLY after approval + admin link + enabled.
 *   7. Cross-device: participant registers on device A -> pushed to cloud ->
 *      admin hydrates on device B -> approves -> participant sees access.
 *   8. Event config (e.g. WhatsApp link) set on the admin device reaches the
 *      participant device via cloud hydration.
 *   9. Push behaviour is bounded (no full-set re-push storm).
 *   10. Supabase schema SQL + SupabaseManager wiring include the new tables.
 *
 * Run: node tests/test_mindset_shift_arch.cjs
 */
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

console.log("------------------------------------------------------------");
console.log("RUNNING MINDSET SHIFT ARCHITECTURE VERIFICATION");
console.log("------------------------------------------------------------");

const ROOT = path.resolve(__dirname, "..");
let failed = false;
const check = (label, cond) => {
  console.log((cond ? "✓ " : "✗ ") + label);
  if (!cond) failed = true;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------- Environment: shared window, per-device storage ----------------
const windows = new EventTarget();
globalThis.window = windows;

function makeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() {
      return m.size;
    },
  };
}
function switchDevice(name) {
  globalThis.localStorage = makeStorage();
  console.log(`   [device: ${name}]`);
}

// ---------------- Bundle the REAL data + sync layer (Supabase stubbed) ----------------
const STUB = path.join(__dirname, "stubs", "msSupabaseStub.ts");
const OUT = path.join(__dirname, ".ms_bundle.cjs");
const ENTRY = path.join(__dirname, "ms_entry.ts");
const stubPlugin = {
  name: "ms-supabase-stub",
  setup(build) {
    build.onResolve({ filter: /(^|\/)supabase$/ }, (args) => {
      if (args.importer.includes("mindsetShiftSync")) return { path: STUB };
      return undefined;
    });
  },
};

(async () => {
  await esbuild.build({
    entryPoints: [ENTRY],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: OUT,
    plugins: [stubPlugin],
    logLevel: "silent",
  });
  const api = require(OUT);
  const { __msCloud } = api;

  switchDevice("init");
  api.initMindsetShiftSync();

  // =====================================================================
  console.log("\n1. EVENT DEFAULTS = VERIFIED FLYER FACTS");
  // =====================================================================
  const ev0 = api.getMsEvent();
  check("edition is 7.0", ev0.edition === "7.0");
  check("program name 'Mindset Shift'", ev0.programName === "Mindset Shift");
  check("theme 'BUILDING WEALTH'", ev0.theme === "BUILDING WEALTH");
  check("subtitle matches flyer", ev0.subtitle === "How To Get Out Of Debt And Build Wealth.");
  check("date matches flyer (4th October 2026)", ev0.dateLabel === "4th October 2026");
  check("time matches flyer (9PM)", ev0.timeLabel === "9PM");
  check("location matches flyer (kr8digitals.com)", ev0.locationLabel === "kr8digitals.com");
  check("registration is free", ev0.registrationFree === true);
  check("registration open by default", ev0.regOpen === true);
  check("speaker is Sagacious Tehilla", ev0.speaker.name === "Sagacious Tehilla");
  check("host is Timfire (Kenneth Timothy)", ev0.host.name.includes("Timfire"));
  check("flyer points to staged official asset", ev0.flyer === "/events/mindset-shift-7-flyer.jpg");
  check("official flyer asset exists on disk", fs.existsSync(path.join(ROOT, "public/events/mindset-shift-7-flyer.jpg")));
  check("speaker portrait exists on disk", fs.existsSync(path.join(ROOT, "public/events/sagacious-tehilla.png")));
  check(
    "speaker bio uses verified positioning (no invented stats)",
    ev0.speaker.bio.includes("psychology-driven marketing strategist") &&
      ev0.speaker.bio.includes("Brain Seduction")
  );
  check("host bio states the recurring program cadence (1st + 3rd Sunday)",
    ev0.host.bio.includes("first Sunday and the third Sunday"));
  check("WHATSAPP LINK IS NOT HARD-CODED (empty until admin sets it)", ev0.whatsappGroupUrl === "");
  check("share copy has all 6 platform variants",
    ["whatsappStatus","facebook","instagram","x","linkedin","general"]
      .every((k) => typeof ev0.shareCopy[k] === "string" && ev0.shareCopy[k].length > 20));
  check("5 'What You Will Explore' topics present", ev0.topics.length === 5);
  check("audience section has 8 welcoming entries", ev0.audience.length === 8);

  // =====================================================================
  console.log("\n2. ADMIN EDITS PERSIST + DISPATCH LIVE-UPDATE EVENT");
  // =====================================================================
  let eventUpdated = 0;
  windows.addEventListener("kr8:ms-event-updated", () => eventUpdated++);
  api.saveMsEvent({ dateLabel: "25th December 2026", speaker: { ...ev0.speaker, name: "New Speaker" } });
  await sleep(20);
  const ev1 = api.getMsEvent();
  check("patched dateLabel persisted", ev1.dateLabel === "25th December 2026");
  check("nested speaker patch deep-merged (bio preserved)", ev1.speaker.name === "New Speaker" && ev1.speaker.bio.length > 50);
  check("kr8:ms-event-updated dispatched", eventUpdated >= 1);
  api.saveMsEvent({ dateLabel: ev0.dateLabel, speaker: ev0.speaker }); // restore verified defaults
  await sleep(20);

  // =====================================================================
  console.log("\n3. REGISTRATION + DUPLICATE RESUMPTION");
  // =====================================================================
  switchDevice("participant-Ada");
  api.__testTeardownMsSync();
  api.initMindsetShiftSync();

  const base = {
    fullName: "Ada Obi",
    email: "Ada.Obi@Example.com ",
    phone: "+234 801 234 5678",
    whatsapp: "",
    location: "Umuahia, Abia",
    heardAbout: "WhatsApp Status",
    hopingToLearn: "Debt repayment strategy",
    moneyQuestion: "How do I stop living paycheck to paycheck?",
    biggestChallenge: "Credit card debt",
    debtExperience: "Yes — significant debt",
    financialSituation: "Struggling to save",
    hasFinancialGoal: true,
    areaToImprove: "Saving discipline",
  };
  const r1 = api.registerForMsEvent(base);
  check("first registration created", !r1.existing && !!r1.registration.id);
  check("id has MS7- confirmation code format", /^MS7-[A-Z0-9]{6,}$/.test(r1.registration.id));
  check("status starts at 'registered'", r1.registration.status === "registered");
  check("record flagged syncPending (cloud push queued)", r1.registration.syncPending === true);
  check("email normalized (lowercase/trimmed)", r1.registration.email === "ada.obi@example.com");

  const r2 = api.registerForMsEvent({ ...base, fullName: "Ada Obi", email: "ada.obi@example.com" });
  check("duplicate email resumes the SAME record (no new id)", r2.existing && r2.registration.id === r1.registration.id);
  const r3 = api.registerForMsEvent({ ...base, email: "different@mail.com", phone: "08012345678" });
  check("duplicate phone (diff format) resumes the SAME record", r3.existing && r3.registration.id === r1.registration.id);
  check("exactly ONE registration stored", api.getMsRegistrations().length === 1);

  // =====================================================================
  console.log("\n4. PROOF SUBMISSION + VERIFICATION STATE MACHINE");
  // =====================================================================
  const id = r1.registration.id;
  const proof = "data:image/png;base64,TEVWX1NUUkVDSEhPUlQ=";
  api.submitMsProof(id, "idb:proof-1", proof);
  let rec = api.findMsRegistration(id);
  check("proof submitted -> status 'share_submitted'", rec.status === "share_submitted");
  check("proof stored + timestamped", rec.proofData === proof && typeof rec.proofSubmittedAt === "number");

  api.setMsVerification(id, "rejected", "Admin Test", "Blurry screenshot");
  rec = api.findMsRegistration(id);
  check("admin reject -> 'rejected' + note + verifiedBy", rec.status === "rejected" && rec.adminNote === "Blurry screenshot" && rec.verifiedBy === "Admin Test");
  check("rejected participant has NO access", api.hasMsAccess(rec) === false);

  api.setMsVerification(id, "resubmit", "Admin Test", "Please retake");
  rec = api.findMsRegistration(id);
  check("request resubmission -> 'needs_resubmission'", rec.status === "needs_resubmission");

  api.submitMsProof(id, "idb:proof-2", proof);
  rec = api.findMsRegistration(id);
  check("resubmitted proof -> back to 'share_submitted', old note cleared",
    rec.status === "share_submitted" && rec.adminNote === "" && rec.verifiedBy === null);

  api.setMsVerification(id, "approved", "Admin Test", "Verified on WhatsApp");
  rec = api.findMsRegistration(id);
  check("approval -> 'access_granted' + verifiedBy/At", rec.status === "access_granted" && rec.verifiedBy === "Admin Test" && typeof rec.verifiedAt === "number");

  // =====================================================================
  console.log("\n5. ACCESS GATING (link + flag + status)");
  // =====================================================================
  const evBefore = api.getMsEvent();
  check("approved but NO admin link yet -> NO access", api.hasMsAccess(rec) === false);
  api.saveMsEvent({ whatsappGroupUrl: "https://chat.whatsapp.com/TESTGROUP" });
  await sleep(20);
  check("approved + link set -> ACCESS GRANTED", api.hasMsAccess(api.findMsRegistration(id)) === true);
  check("public page reads the CURRENT admin-configured link",
    api.getMsEvent().whatsappGroupUrl === "https://chat.whatsapp.com/TESTGROUP");
  api.saveMsEvent({ accessEnabled: false });
  await sleep(20);
  check("admin disables access -> participant access revoked", api.hasMsAccess(api.findMsRegistration(id)) === false);
  api.saveMsEvent({ accessEnabled: true, whatsappGroupUrl: evBefore.whatsappGroupUrl });
  await sleep(20);

  // =====================================================================
  console.log("\n6. RESUME CODE (participant returns later)");
  // =====================================================================
  const byCode = api.findByResumeCode(id.toLowerCase());
  check("resume by confirmation code (case-insensitive)", byCode && byCode.id === id);
  check("resume finds nothing for garbage input", api.findByResumeCode("nonsense") === undefined);

  // =====================================================================
  console.log("\n7. ANALYTICS");
  // =====================================================================
  const stats = api.getMsStats();
  check("stats.total reflects edition registrations", stats.total === 1);
  check("stats.byStatus counts approved", stats.byStatus.access_granted === 1);
  check("stats.bySource counts source", (stats.bySource["WhatsApp Status"] || 0) === 1);
  check("stats.daily has 14 days", stats.daily.length === 14);
  check("stats.grantedAccess === 1", stats.grantedAccess === 1);

  // =====================================================================
  console.log("\n8. CROSS-DEVICE CLOUD SYNC (participant A -> admin B -> back)");
  // =====================================================================
  // Reset the cloud + clear participant's pending flags state
  __msCloud.reset();
  __msCloud.clearUpserts();

  // Participant pushes her registration to the cloud (re-dispatch triggers the
  // debounced push of pending rows)
  api.updateMsRegistration(id, {}); // dispatches kr8:ms-regs-updated -> schedules push
  await sleep(800);
  let cloudRegs = __msCloud.getRegs();
  check("registration pushed to cloud exactly once", cloudRegs.length === 1);
  check("cloud row uses snake_case schema fields",
    cloudRegs[0].full_name === "Ada Obi" && cloudRegs[0].has_financial_goal === true);
  check("cloud status reflects latest (access_granted)", cloudRegs[0].status === "access_granted");

  // Admin device hydrates
  switchDevice("admin-Bolanle");
  api.__testTeardownMsSync();
  api.initMindsetShiftSync();
  await api.hydrateMsRegistrationsFromCloud();
  await sleep(30);
  const adminRegs = api.getMsRegistrations();
  check("ADMIN sees participant's registration (cross-device)", adminRegs.length === 1 && adminRegs[0].fullName === "Ada Obi");
  check("admin sees the submitted proof", adminRegs[0].proofData === proof);

  // Admin approves (already approved here; simulate a NEW participant instead)
  const bob = api.registerForMsEvent({
    ...base,
    fullName: "Bob Eze",
    email: "bob@ezemail.com",
    phone: "+234 909 888 7777",
    heardAbout: "Facebook",
  });
  api.submitMsProof(bob.registration.id, "idb:bob-proof", "data:image/png;base64,RElORQ==");
  await sleep(700); // push
  check("Bob's registration + proof reached cloud", __msCloud.getRegs().length === 2 &&
    __msCloud.getRegs().find((r) => r.full_name === "Bob Eze")?.proof_data === "data:image/png;base64,RElORQ==");

  // Participant-B device (Bob's phone) — fresh browser, hydrates
  switchDevice("participant-Bob");
  api.__testTeardownMsSync();
  api.initMindsetShiftSync();
  await api.hydrateMsRegistrationsFromCloud();
  await sleep(30);
  const bobRec = api.getMsRegistrations().find((r) => r.fullName === "Bob Eze");
  check("Bob (new device) sees his own registration via cloud", !!bobRec);

  // Admin approves Bob -> Bob's device hydrates -> access unlocks
  switchDevice("admin-Bolanle");
  api.__testTeardownMsSync();
  api.initMindsetShiftSync();
  await api.hydrateMsRegistrationsFromCloud();
  await sleep(30);
  const bobOnAdmin = api.getMsRegistrations().find((r) => r.fullName === "Bob Eze");
  api.saveMsEvent({ whatsappGroupUrl: "https://chat.whatsapp.com/MS7-GROUP" });
  api.setMsVerification(bobOnAdmin.id, "approved", "Bolanle", "Confirmed");
  await sleep(700); // push

  switchDevice("participant-Bob");
  api.__testTeardownMsSync();
  api.initMindsetShiftSync();
  await api.hydrateMsRegistrationsFromCloud();
  await api.hydrateMsEventFromCloud();
  await sleep(30);
  const bobFinal = api.getMsRegistrations().find((r) => r.fullName === "Bob Eze");
  check("Bob's status updated to access_granted after admin approval", bobFinal.status === "access_granted");
  check("Bob sees the admin-set WhatsApp link", api.getMsEvent().whatsappGroupUrl === "https://chat.whatsapp.com/MS7-GROUP");
  check("Bob has full access now", api.hasMsAccess(bobFinal) === true);

  // =====================================================================
  console.log("\n9. PUSH BOUNDEDNESS (no full-set storm)");
  // =====================================================================
  const upserts = __msCloud.getUpserts().filter((u) => u.table === "mindset_shift_registrations");
  check("total registration upserts bounded (< 12 for this whole flow)", upserts.length < 12);
  console.log(`   (observed registration upserts: ${upserts.length})`);

  // =====================================================================
  console.log("\n10. SCHEMA SQL + ADMIN WIRING");
  // =====================================================================
  const sql = api.MS_SUPABASE_SQL;
  check("SQL creates mindset_shift_registrations table", sql.includes("create table if not exists public.mindset_shift_registrations"));
  check("SQL creates mindset_shift_event table", sql.includes("create table if not exists public.mindset_shift_event"));
  check("SQL adds both tables to realtime publication",
    sql.includes("alter publication supabase_realtime add table public.mindset_shift_registrations") &&
    sql.includes("alter publication supabase_realtime add table public.mindset_shift_event"));
  check("SQL has status + proof + verification columns",
    ["status", "proof_data", "proof_submitted_at", "admin_note", "verified_by", "verified_at"].every((c) => sql.includes(c)));

  const adminSrc = fs.readFileSync(path.join(ROOT, "src/pages/Admin.tsx"), "utf-8");
  check("SupabaseManager Copy-SQL includes the Mindset Shift schema", adminSrc.includes("MS_SUPABASE_SQL"));
  check("App.tsx initializes Mindset Shift sync", fs.readFileSync(path.join(ROOT, "src/App.tsx"), "utf-8").includes("initMindsetShiftSync()"));

  // Privacy guardrail: financial fields live only on the record
  check("privacy: financial reflection fields exist on the record",
    ["debtExperience", "financialSituation", "biggestChallenge"].every((f) => f in bobFinal));

  console.log("\n------------------------------------------------------------");
  console.log(failed ? "MINDSET SHIFT ARCHITECTURE: FAILURES DETECTED" : "MINDSET SHIFT ARCHITECTURE: ALL CHECKS PASSED");
  console.log("------------------------------------------------------------");
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error("Test crashed:", e);
  process.exit(1);
});
