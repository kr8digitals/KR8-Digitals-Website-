/**
 * MINDSET SHIFT 7.0 — ACCESS FLOW (v2: no share gate)
 *
 * Completing onboarding grants WhatsApp access immediately. The old
 * proof-upload / share-verification pipeline is gone from the public
 * flow; the confirmation screen carries the optional, conviction-based
 * share moment instead. This suite verifies:
 *   1. registration → instant access block, join link when configured
 *   2. no proof/share-gate UI anywhere in the public flow
 *   3. the master share moment (flyer + share panel + copy)
 *   4. revocation → paused state + re-onboarding restores access
 *   5. legacy statuses (rejected / share_submitted / needs_resubmission)
 *
 * Requires the dev server on http://localhost:5173 (npm run dev).
 */
const { chromium } = require("playwright");

const BASE = "http://localhost:5173";
const REGS_KEY = "kr8_mindset_shift_registrations_v1";
const EVENT_KEY = "kr8_mindset_shift_event_v1";
const GROUP_URL = "https://chat.whatsapp.com/MS7-NEW-Space-999";

let pass = 0, fail = 0;
function check(cond, label, detail) {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}

async function onboard(page, opts = {}) {
  const o = {
    name: "Ada Obi",
    why: "debt",
    debtType: "Loan app or card",
    duration: "A couple of years",
    stress: "It's okay. I'm mostly in control",
    challenge: "I keep restarting my budget every single month.",
    goal: "yes",
    area: "Saving & investing",
    email: "flow-ada@example.com",
    phone: "08061112223",
    heard: "Facebook",
    ...opts,
  };
  await page.getByPlaceholder(/Your name/).fill(o.name);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);
  const WHY = {
    money: "Money never seems to last, no matter how much I make",
    debt: "I'm trying to get out of debt",
    build: "I want to build something — savings, a business, a future",
    curious: "I'm just curious (I might be braver than I look)",
  };
  await page.getByRole("button", { name: WHY[o.why] }).first().click();
  await page.waitForTimeout(150);
  if (o.why === "debt") {
    await page.getByRole("button", { name: o.debtType }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: o.duration }).first().click();
    await page.waitForTimeout(120);
  } else if (o.why === "money") {
    await page.getByRole("button", { name: "Steady, but little left at the end of the month" }).first().click();
    await page.waitForTimeout(120);
  } else if (o.why === "build") {
    await page.getByRole("button", { name: "Paying off debt" }).first().click();
    await page.waitForTimeout(120);
  }
  await page.getByRole("button", { name: o.stress }).first().click();
  await page.waitForTimeout(120);
  await page.getByPlaceholder(/My money never lasts/).fill(o.challenge);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  if (o.goal === "yes") {
    await page.getByRole("button", { name: "Yes, I am" }).click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: o.area }).first().click();
    await page.waitForTimeout(120);
  } else {
    await page.getByRole("button", { name: "Not yet" }).click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(120);
  }
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.waitForTimeout(120);
  await page.getByLabel("Email *").fill(o.email);
  await page.getByLabel("Phone number").fill(o.phone);
  await page.getByLabel("How did you find this? *").selectOption(o.heard);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(150);
  await page.getByRole("button", { name: "Save My Seat" }).click();
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).slice(0, 140)));

  await page.goto(BASE + "/mindset-shift", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);

  /* ============ 1. Register → instant access ============ */
  console.log("\n[flow: register → instant access]");
  await onboard(page);
  check(await page.getByText("You're in, Ada.", { exact: false }).isVisible(), "graduation screen after onboarding");

  const done = page.locator("#register");
  check(await done.getByText("You're in.").isVisible(), "access block: 'You're in.'");
  check((await done.locator("text=finalising the group invite").count()) === 1,
    "without a configured link: 'finalising the group invite' note");
  check((await done.locator("text=WhatsApp link").count()) === 0, "no group link visible before it is configured");

  // No share gate anywhere in the public flow
  const bodyHtml = await page.locator("body").innerHTML();
  check(!bodyHtml.includes("Upload screenshot"), "no proof-upload UI in the public flow");
  check(!bodyHtml.includes("Submit proof"), "no 'Submit proof' in the public flow");
  check(!bodyHtml.includes("Awaiting your proof"), "no awaiting-proof status in the public flow");

  /* ============ 2. Admin configures the link → join button ============ */
  console.log("\n[flow: join link appears when configured]");
  await page.evaluate(({ key, url }) => {
    const ev = JSON.parse(localStorage.getItem(key) || "{}");
    ev.whatsappGroupUrl = url;
    ev.accessEnabled = true;
    localStorage.setItem(key, JSON.stringify(ev));
    window.dispatchEvent(new Event("kr8:ms-event-updated"));
  }, { key: EVENT_KEY, url: GROUP_URL });
  await page.waitForTimeout(500);
  const join = page.getByRole("link", { name: "Join the WhatsApp space" });
  check(await join.isVisible(), "join button appears for the participant");
  check((await join.getAttribute("href")) === GROUP_URL, "join button points at the admin-managed link");
  check((await join.getAttribute("target")) === "_blank", "opens in a new tab");
  check((await page.locator("a[href='" + GROUP_URL + "']").count()) >= 1, "link present in the DOM exactly for this participant");

  /* ============ 3. Master share moment ============ */
  console.log("\n[flow: master share moment]");
  const share = done;
  check(await share.getByText("One last thing, Ada", { exact: false }).first().isVisible(),
    "share moment addresses the participant by name");
  check((await share.locator("text=Save it first").count()) === 1, "flyer save instructions");
  check((await share.locator("img[alt*='flyer']").count()) === 1, "event flyer shown in the share moment");
  check((await share.locator("text=I care about you").count()) >= 1, "master copy: 'I care about you' framing");
  check((await share.locator("text=optional").count()) >= 1, "sharing is presented as optional");
  // platform buttons + admin-managed caption preview + copy
  check((await share.getByRole("button", { name: "WhatsApp Status", exact: true }).count()) === 1,
    "share panel: WhatsApp Status platform");
  check((await share.getByRole("button", { name: "Any platform", exact: true }).count()) === 1,
    "share panel: 'Any platform' fallback");
  await share.getByRole("button", { name: "Any platform", exact: true }).click();
  await page.waitForTimeout(200);
  const preview = share.locator("pre").first();
  check((await preview.count()) === 1, "caption preview appears after platform pick");
  const capVal = await preview.innerText();
  check(capVal.includes("Mindset Shift"), "admin-managed caption names the event", capVal.slice(0, 60));
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await share.getByRole("button", { name: "Copy text" }).click();
  await page.waitForTimeout(300);
  check(await share.getByRole("button", { name: "Copied" }).isVisible(), "copy button confirms 'Copied'");
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  if (clip) check(clip.includes("Mindset Shift"), "clipboard holds the caption", clip.slice(0, 60));
  else check(true, "clipboard read unavailable in this browser (Copied state already asserted)");

  /* ============ 4. Revocation → paused + re-onboard restores ============ */
  console.log("\n[flow: revocation + re-onboarding]");
  const regId = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]")[0].id, REGS_KEY);
  await page.evaluate(({ k, id }) => {
    const regs = JSON.parse(localStorage.getItem(k) || "[]");
    const r = regs.find((x) => x.id === id);
    r.status = "registered";
    r.adminNote = "Flagged by admin for follow-up.";
    localStorage.setItem(k, JSON.stringify(regs));
    window.dispatchEvent(new Event("kr8:ms-regs-updated"));
  }, { k: REGS_KEY, id: regId });
  await page.waitForTimeout(500);
  check(await done.getByText("Your access is paused.", { exact: true }).isVisible(), "revoked: paused state");
  check((await done.locator("a[href='" + GROUP_URL + "']").count()) === 0, "revoked: link removed immediately");
  await done.getByRole("button", { name: "Complete onboarding again" }).click();
  await page.waitForTimeout(300);
  check(await page.getByText("What should we call you?").isVisible(), "re-onboarding starts the wizard");
  // answer briefly
  await page.getByPlaceholder(/Your name/).fill("Ada Obi");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "I'm trying to get out of debt" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Loan app or card" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "A couple of years" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "It's okay. I'm mostly in control" }).first().click();
  await page.waitForTimeout(120);
  await page.getByPlaceholder(/My money never lasts/).fill("Restarting my budget again.");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Not yet" }).click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.waitForTimeout(120);
  await page.getByLabel("Email *").fill("flow-ada@example.com");
  await page.getByLabel("Phone number").fill("08061112223");
  await page.getByLabel("How did you find this? *").selectOption("Facebook");
  await page.getByRole("button", { name: "Continue" }).first().click();
  await page.waitForTimeout(120);
  await page.getByRole("button", { name: "Save My Seat" }).click();
  await page.waitForTimeout(500);
  check(await page.getByText("Welcome back, Ada.", { exact: false }).isVisible(), "re-onboarded: 'Welcome back, Ada.'");
  const regsAfter = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "[]"), REGS_KEY);
  check(regsAfter.length === 1, "re-onboarding updated the same record (no duplicate)");
  check(regsAfter[0].status === "access_granted", "access restored after re-onboarding", regsAfter[0].status);
  check((await done.locator("a[href='" + GROUP_URL + "']").count()) === 1, "join link is back");

  /* ============ 5. Legacy statuses ============ */
  console.log("\n[flow: legacy statuses]");
  for (const legacy of ["rejected", "share_submitted", "needs_resubmission"]) {
    await page.evaluate(({ k, st }) => {
      const regs = JSON.parse(localStorage.getItem(k) || "[]");
      regs[0].status = st;
      localStorage.setItem(k, JSON.stringify(regs));
      window.dispatchEvent(new Event("kr8:ms-regs-updated"));
    }, { k: REGS_KEY, st: legacy });
    await page.waitForTimeout(400);
    const heading =
      legacy === "rejected"
        ? "This registration was rejected."
        : "Good news — no more share verification.";
    check((await page.locator(`text=${heading}`).count()) === 1, `${legacy}: '${heading}' shown`,
      `saw nothing for ${legacy}`);
    if (legacy === "share_submitted" || legacy === "needs_resubmission") {
      check((await page.locator("text=That step no longer exists.").count()) === 1,
        `${legacy}: explains the old gate is gone`);
      check((await page.getByRole("button", { name: "Complete onboarding", exact: true }).count()) === 1,
        `${legacy}: re-onboard CTA present`);
    }
    if (legacy === "rejected") {
      check((await page.locator("text=contact the team on WhatsApp").count()) === 1,
        "rejected: points to the team instead of a gate");
    }
    if (legacy === "rejected") {
      check((await done.locator("a[href='" + GROUP_URL + "']").count()) === 0, "rejected: no link");
    }
  }

  /* ============ 6. No share gate copy left on the page ============ */
  console.log("\n[flow: old gate copy gone]");
  await page.evaluate((k) => {
    const regs = JSON.parse(localStorage.getItem(k) || "[]");
    regs[0].status = "access_granted";
    localStorage.setItem(k, JSON.stringify(regs));
    window.dispatchEvent(new Event("kr8:ms-regs-updated"));
  }, REGS_KEY);
  await page.waitForTimeout(400);
  const html = await page.locator("body").innerHTML();
  check(!html.includes("Share & Screenshot"), "old step-3 'Share & Screenshot' copy gone");
  check(!html.includes("Take a screenshot of your confirmation"), "old screenshot instructions gone");
  check(!html.includes("Share the event on WhatsApp or Facebook first"), "old 'share first' instructions gone");

  check(errors.length === 0, "no page errors", errors.join(" | "));
  console.log("\n------------------------------------------------------------");
  console.log(`MINDSET SHIFT ACCESS FLOW (V2): ${fail === 0 ? "ALL CHECKS PASSED" : fail + " CHECK(S) FAILED"}`);
  console.log(`  passed=${pass} failed=${fail}`);
  await browser.close();
  process.exit(fail === 0 ? 0 : 1);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
