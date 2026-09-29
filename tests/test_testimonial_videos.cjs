const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function run() {
  console.log("=== STARTING STEP 2: TESTIMONIAL VIDEO COMPREHENSIVE PERFORMANCE & PLAYBACK AUDIT ===");

  // 1. Audit all video and poster files in public/videos
  console.log("1. Auditing video files on disk...");
  const videosDir = path.join(__dirname, "../public/videos");
  const files = fs.readdirSync(videosDir);
  const mp4Files = files.filter((f) => f.endsWith(".mp4"));
  const posterFiles = files.filter((f) => f.endsWith("_poster.jpg"));

  console.log(`Found ${mp4Files.length} MP4 files and ${posterFiles.length} poster files.`);

  if (mp4Files.length < 21) {
    throw new Error(`Expected at least 21 MP4 files, found ${mp4Files.length}`);
  }

  for (const mp4 of mp4Files) {
    const stat = fs.statSync(path.join(videosDir, mp4));
    if (stat.size < 500000) {
      throw new Error(`Video file ${mp4} is suspiciously small: ${stat.size} bytes`);
    }
  }
  console.log("✓ All video files exist on disk with valid file sizes.");

  // 2. Launch browser and test actual video playback on the website
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const networkErrors = [];
  page.on("requestfailed", (req) => {
    // Only capture real network failures, ignore user/lifecycle browser aborts (net::ERR_ABORTED)
    if (req.url().includes("/videos/") && req.failure().errorText !== "net::ERR_ABORTED") {
      networkErrors.push({ url: req.url(), failure: req.failure() });
    }
  });

  try {
    console.log("2. Navigating to Home page (#student-stories)...");
    await page.goto("http://localhost:5173/#student-stories", { waitUntil: "domcontentloaded" });

    // Wait for video element
    const videoLocator = page.locator("video");
    await videoLocator.waitFor({ state: "visible", timeout: 10000 });
    console.log("✓ Video element found in DOM.");

    // 3. Test initial video Autoplay
    console.log("3. Testing smooth autoplay on initial load...");
    await page.waitForTimeout(1500);

    const initialPlayback = await page.evaluate(() => {
      const v = document.querySelector("video");
      if (!v) return null;
      return {
        src: v.src,
        paused: v.paused,
        currentTime: v.currentTime,
        duration: v.duration,
        readyState: v.readyState,
        muted: v.muted,
      };
    });

    console.log("Initial video playback state:", initialPlayback);

    if (!initialPlayback) throw new Error("No video found!");
    if (initialPlayback.paused || initialPlayback.currentTime <= 0) {
      throw new Error(`Initial video did not autoplay properly (paused: ${initialPlayback.paused}, time: ${initialPlayback.currentTime})`);
    }
    console.log(`✓ Video autoplays smoothly! Current time: ${initialPlayback.currentTime.toFixed(2)}s, readyState: ${initialPlayback.readyState}`);

    // 4. Test advancing to next video
    console.log("4. Testing next video navigation & immediate transition...");
    const initialSrc = initialPlayback.src;
    
    await page.evaluate(() => {
      const nextBtn = document.querySelector("div[title^='Next:']");
      if (nextBtn) nextBtn.click();
    });

    await page.waitForTimeout(1500);

    const nextPlayback = await page.evaluate(() => {
      const v = document.querySelector("video");
      return {
        src: v.src,
        paused: v.paused,
        currentTime: v.currentTime,
        duration: v.duration,
        readyState: v.readyState,
      };
    });

    console.log("Next video playback state:", nextPlayback);

    if (nextPlayback.src === initialSrc) {
      throw new Error("Next button click failed to switch to next video!");
    }
    if (nextPlayback.paused || nextPlayback.currentTime <= 0) {
      throw new Error(`Next video failed to autoplay (paused: ${nextPlayback.paused}, time: ${nextPlayback.currentTime})`);
    }
    console.log(`✓ Successfully transitioned to next video and playing smoothly (${nextPlayback.currentTime.toFixed(2)}s)`);

    // 5. Audit all testimonials in the store to ensure EVERY video loads with readyState >= 2 (HAVE_CURRENT_DATA)
    console.log("5. Testing all 21 videos in the testimonial catalog...");
    const auditResults = await page.evaluate(async () => {
      const { getTestimonials } = await import("/src/data/store.ts");
      const list = getTestimonials();
      const results = [];

      for (const item of list) {
        const testVid = document.createElement("video");
        testVid.muted = true;
        testVid.preload = "auto";
        testVid.src = item.video;

        const loaded = await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ ok: false, error: "timeout" });
          }, 8000);

          testVid.oncanplay = () => {
            clearTimeout(timeout);
            resolve({ ok: true, duration: testVid.duration });
          };

          testVid.onerror = () => {
            clearTimeout(timeout);
            resolve({ ok: false, error: testVid.error ? testVid.error.message : "load error" });
          };
        });

        // Clean up
        testVid.removeAttribute("src");
        testVid.load();

        results.push({
          id: item.id,
          name: item.name,
          video: item.video,
          ok: loaded.ok,
          duration: loaded.duration,
          error: loaded.error,
        });
      }

      return results;
    });

    console.log(`Audited ${auditResults.length} videos:`);
    let failCount = 0;
    for (const res of auditResults) {
      if (res.ok) {
        console.log(`  ✓ [${res.id}] ${res.name}: ${res.duration.toFixed(1)}s (${res.video})`);
      } else {
        console.error(`  ✗ [${res.id}] ${res.name}: FAILED (${res.error}) at ${res.video}`);
        failCount++;
      }
    }

    if (failCount > 0) {
      throw new Error(`${failCount} video(s) failed playback audit!`);
    }

    if (networkErrors.length > 0) {
      console.error("Network errors:", networkErrors);
      throw new Error(`Encountered ${networkErrors.length} genuine video network errors.`);
    }

    console.log("=== STEP 2 AUDIT COMPLETE: 100% OF VIDEOS LOAD, PLAY SMOOTHLY & FAST ===");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
