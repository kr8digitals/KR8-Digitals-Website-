/**
 * MINDSET SHIFT — STEP 13: SECURITY & EDGE CASES
 *
 *  1. Privacy audit: financial/personal answers + admin notes must never
 *     appear on ANY public page, in ANY participant status.
 *  2. WhatsApp group URL secrecy (regression, DOM-string level).
 *  3. ?resume=CODE: valid code resumes; unknown code reveals nothing.
 *  4. Admin gates: regOpen=false → closed card; capacity → full card;
 *     existing participants are never locked out; rejected don't count.
 *  5. XSS: hostile input in a registration is rendered as text.
 *  6. Corrupted localStorage: page still loads, no crash.
 *  7. Zero page errors throughout.
 *
 * Run with dev server on :5173.
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const PROOF =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const GROUP_URL = "https://chat.whatsapp.com/STEP13-SECRET-GROUP";

let pass = 0;
let fail = 0;
function check(cond, label) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.log(`  ✗ ${label}`);
  }
}

function mk(id, name, phone, email, patch = {}) {
  const now = Date.now();
  return {
    id,
    edition: "7.0",
    fullName: name,
    email,
    phone,
    whatsapp: "",
    location: "LO-SECRET-9281",
    heardAbout: "Instagram",
    hopingToLearn: "HL-SECRET-9281",
    moneyQuestion: "PQ-SECRET-9281",
    biggestChallenge: "BC-SECRET-9281",
    debtExperience: "Managing consumer debt (card, personal loan)",
    financialSituation: "Tight — living close to my limit",
    hasFinancialGoal: true,
    areaToImprove: "Paying off debt",
    status: "registered",
    proofKey: null,
    proofData: null,
    proofSubmittedAt: null,
    adminNote: "AN-SECRET-9281",
    verifiedBy: null,
    verifiedAt: null,
    createdAt: now - 86400000,
    updatedAt: now - 86400000,
    syncPending: true,
    deletedAt: null,
    ...patch,
  };
}

const MARKERS = [
  "PQ-SECRET-9281",
  "BC-SECRET-9281",
  "HL-SECRET-9281",
  "LO-SECRET-9281",
  "AN-SECRET-9281",
  "Tight — living close to my limit",
  "Managing consumer debt (card, personal loan)",
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e.message)));

  const bodyText = () => page.evaluate(() => document.body.innerText);
  const pageHtml = () => page.content();

  const setRegs = (regs) =>
    page.evaluate((r) => localStorage.setItem("kr8_mindset_shift_registrations_v1", JSON.stringify(r)), regs);
  const setEvent = (patch) =>
    page.evaluate((p) => {
      const ev = JSON.parse(localStorage.getItem("kr8_mindset_shift_event_v1") || "{}");
      Object.assign(ev, p);
      localStorage.setItem("kr8_mindset_shift_event_v1", JSON.stringify(ev));
    }, patch);

  // ---- Seed: one participant per status, plus a live group URL
  const SEED = [
    mk("MS7-SEC101", "Sade Adebayo", "+2348031111111", "sec1@example.com"),
    mk("MS7-SEC102", "Tobi Akin", "+2348042222222", "sec2@example.com", {
      status: "share_submitted",
      proofData: PROOF,
      proofKey: "idb:proof-sec2",
      proofSubmittedAt: Date.now() - 3600000,
    }),
    mk("MS7-SEC103", "Uche Bello", "+2348053333333", "sec3@example.com", {
      status: "access_granted",
      verifiedBy: "VX-SECRET-9281",
      verifiedAt: Date.now() - 7200000,
    }),
    mk("MS7-SEC104", "Vida Cole", "+2348064444444", "sec4@example.com", {
      status: "rejected",
      verifiedBy: "VX-SECRET-9281",
    }),
  ];

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await setRegs(SEED);
  await setEvent({ whatsappGroupUrl: GROUP_URL, regOpen: true, capacity: 0 });

  // ================= 1. Privacy audit across statuses =================
  console.log("\n[privacy: financial data never public]");
  for (const reg of SEED) {
    await page.goto(`${BASE}/mindset-shift?resume=${reg.id}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const text = await bodyText();
    const html = await pageHtml();
    const leaked = MARKERS.filter((m) => text.includes(m))
      .concat(html.includes("VX-SECRET-9281") ? ["verifiedBy"] : []);
    check(
      leaked.length === 0,
      `${reg.status}: no financial answers / admin notes leak (${leaked.length ? "LEAKED: " + leaked.join(", ") : "clean"})`
    );
    check(
      text.includes(reg.fullName.split(" ")[0]) || text.includes(reg.fullName),
      `${reg.status}: their own status card still renders`
    );
  }
  // Public page with no resume (fresh visitor)
  await page.evaluate(() => localStorage.removeItem("kr8_mindset_shift_registrations_v1"));
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const freshText = await bodyText();
  // Only the invented secret markers — the form's own option labels are
  // legitimate public content on the registration form.
  const secretMarkers = MARKERS.filter((m) => m.includes("SECRET"));
  check(
    secretMarkers.every((m) => !freshText.includes(m)),
    "fresh visitor: no seeded personal data on the page"
  );

  // ================= 2. WhatsApp URL secrecy =================
  console.log("\n[secrecy: group URL]");
  await setRegs(SEED);
  for (const id of ["MS7-SEC101", "MS7-SEC102", "MS7-SEC104"]) {
    await page.goto(`${BASE}/mindset-shift?resume=${id}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    const html = await pageHtml();
    check(
      !html.includes("STEP13-SECRET-GROUP"),
      `${id}: group URL absent from entire DOM`
    );
  }
  await page.goto(`${BASE}/mindset-shift?resume=MS7-SEC103`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  check(
    (await pageHtml()).includes("STEP13-SECRET-GROUP"),
    "granted participant: link present"
  );

  // ================= 3. Resume code privacy =================
  console.log("\n[resume codes]");
  await page.evaluate(() => localStorage.removeItem("kr8_mindset_shift_registrations_v1"));
  await page.goto(`${BASE}/mindset-shift?resume=MS7-DOESNOTEXIST`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const badText = await bodyText();
  check(
    !badText.includes("Sade") && !badText.includes("Tobi") && !badText.includes("Uche"),
    "unknown code reveals no participant data"
  );
  check(
    (await page.locator("#ms-fullname").count()) === 1,
    "unknown code falls back to the registration form"
  );
  await setRegs(SEED);
  await page.goto(`${BASE}/mindset-shift?resume=MS7-SEC102`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  check(
    (await bodyText()).includes("Welcome back, Tobi."),
    "valid code resumes the matching registration"
  );

  // ================= 4. Admin gates =================
  console.log("\n[admin gates]");
  // Closed registration
  await setEvent({ regOpen: false, regDeadlineLabel: "September 20", capacity: 0 });
  await page.evaluate(() => localStorage.removeItem("kr8_mindset_shift_registrations_v1"));
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const closedText = await bodyText();
  check(
    closedText.includes("Already registered?"),
    "regOpen=false: closed gate for new visitors"
  );
  check(
    closedText.includes("September 20"),
    "deadline label shown on the closed gate"
  );
  check(
    closedText.includes("1st and 3rd Sunday"),
    "next-edition cadence mentioned (verified series fact)"
  );
  check(
    (await page.locator("#ms-fullname").count()) === 0,
    "no form rendered while closed"
  );
  // Existing participant unaffected
  await setRegs(SEED);
  await page.goto(`${BASE}/mindset-shift?resume=MS7-SEC101`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  check(
    (await bodyText()).includes("Welcome back, Sade."),
    "existing participant still sees their card while closed"
  );

  // Capacity: the device that knows the registrations holds 2 of 2
  // non-rejected seats (rejected don't count). A second person on the
  // device takes the "different person" path and hits the full gate.
  await setRegs([SEED[0], SEED[2], SEED[3]]); // registered + granted + rejected
  await setEvent({ regOpen: true, capacity: 2 });
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  check(
    (await bodyText()).includes("Welcome back"),
    "device resumes the existing participant first"
  );
  await page.getByRole("button", { name: /Different person on this device/ }).click();
  await page.waitForTimeout(600);
  const capText = await bodyText();
  check(
    capText.includes("fully booked"),
    "capacity reached (2/2 non-rejected): full gate blocks the second person"
  );
  check(
    capText.includes("2-participant capacity"),
    "capacity figure shown on the full gate"
  );
  check(
    (await page.locator("#ms-fullname").count()) === 0,
    "no form rendered when full"
  );
  // One more seat opens → the second person can now register
  await setEvent({ capacity: 3 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: /Different person on this device/ }).click();
  await page.waitForTimeout(600);
  check(
    (await page.locator("#ms-fullname").count()) === 1,
    "raising capacity reopens the form for the second person"
  );
  // Existing participant never sees the gate
  await setEvent({ capacity: 1 });
  await page.goto(`${BASE}/mindset-shift?resume=MS7-SEC102`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  check(
    !(await bodyText()).includes("fully booked"),
    "existing participant not locked out by capacity"
  );

  // ================= 5. XSS =================
  console.log("\n[xss]");
  await setEvent({ regOpen: true, capacity: 0 });
  await page.evaluate(() => localStorage.removeItem("kr8_mindset_shift_registrations_v1"));
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  const XSS = '<img src=x onerror="window.__xss_fired=1">';
  await page.locator("#ms-fullname").fill(XSS);
  await page.locator("#ms-email").fill("xss@example.com");
  await page.getByPlaceholder("Phone number").fill("8011112222");
  await page.locator("#ms-heard").selectOption("Instagram");
  await page.locator("#ms-hoping").fill("I want to learn about debt freedom.");
  await page.locator("#ms-money-q").fill("How do I stop living paycheck to paycheck?");
  await page.locator("#ms-challenge").fill("Staying consistent.");
  await page.locator("#ms-debt").selectOption({ index: 1 });
  await page.locator("#ms-situation").selectOption({ index: 1 });
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  await page.locator("#ms-area").selectOption({ index: 1 });
  await page.getByRole("button", { name: /Register Free/ }).click();
  await page.waitForTimeout(1400);
  const xssRes = await page.evaluate(() => ({
    fired: !!window.__xss_fired,
    imgCount: document.querySelectorAll("#register img[src='x']").length,
    done: document.body.innerText.includes("registered,") || document.body.innerText.includes("registered."),
  }));
  check(xssRes.fired === false, "onerror payload did not execute");
  check(xssRes.imgCount === 0, "no injected <img> element in the DOM");
  // The stored value is the literal string (visible to admins, escaped everywhere)
  const stored = await page.evaluate(() => {
    const regs = JSON.parse(localStorage.getItem("kr8_mindset_shift_registrations_v1") || "[]");
    return regs.length ? regs[regs.length - 1].fullName : null;
  });
  check(stored === XSS, "hostile name stored as inert text");

  // ================= 6. Corrupted storage =================
  console.log("\n[corrupted storage]");
  await page.evaluate(() => {
    localStorage.setItem("kr8_mindset_shift_registrations_v1", "{not-json!!");
    localStorage.setItem("kr8_mindset_shift_event_v1", "???corrupt");
  });
  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  check(
    (await bodyText()).includes("MINDSET SHIFT 7.0"),
    "corrupted storage: event hero still renders (defaults)"
  );
  check(
    (await page.locator("#ms-fullname").count()) === 1,
    "corrupted storage: form still usable"
  );

  // ================= 7. Page errors =================
  console.log("\n[page errors]");
  const real = pageErrors.filter((m) => !/ipapi|ERR_FAILED|net::|404|supabase/i.test(m));
  check(real.length === 0, `no unexpected page errors (${real.length})`);
  if (real.length) console.log("  errors:", real.slice(0, 3));

  console.log("\n------------------------------------------------------------");
  console.log(
    fail === 0 ? "MINDSET SHIFT SECURITY & EDGE: ALL CHECKS PASSED" : `MINDSET SHIFT SECURITY & EDGE: ${fail} CHECK(S) FAILED`
  );
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
