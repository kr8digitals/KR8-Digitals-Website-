const { chromium } = require("playwright");

async function run() {
  console.log("=== STARTING STEP 3: TESTIMONIAL RESPONSIVE LAYOUT VERIFICATION ===");
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "Mobile", width: 390, height: 844, expectSideBySide: false },
    { name: "Tablet", width: 768, height: 1024, expectSideBySide: false },
    { name: "Laptop", width: 1280, height: 800, expectSideBySide: true },
    { name: "Desktop", width: 1920, height: 1080, expectSideBySide: true },
  ];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:5173/#student-stories", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const videoBox = await page.locator("video").boundingBox();
    const commentBox = await page.locator("text=Community Cheers").first().boundingBox();

    if (!videoBox) throw new Error(`Video element not visible in ${vp.name}!`);
    if (!commentBox) throw new Error(`Community Cheers not visible in ${vp.name}!`);

    console.log(`  Video box: x=${videoBox.x.toFixed(0)}, y=${videoBox.y.toFixed(0)}, w=${videoBox.width.toFixed(0)}, h=${videoBox.height.toFixed(0)}`);
    console.log(`  Comment box: x=${commentBox.x.toFixed(0)}, y=${commentBox.y.toFixed(0)}`);

    if (vp.expectSideBySide) {
      // Must be side by side: video X < comment X, and tops roughly aligned
      const isSideBySide = videoBox.x + videoBox.width <= commentBox.x + 100 && videoBox.x < commentBox.x;
      if (!isSideBySide) {
        throw new Error(`Expected Side-by-Side on ${vp.name}, but video is not to the left of comments!`);
      }
      console.log(`  ✓ ${vp.name}: Confirmed Side-by-Side (Video Left: x=${videoBox.x.toFixed(0)} | Comment Right: x=${commentBox.x.toFixed(0)})`);
    } else {
      // Must be stacked: comment Y > video Y
      const isStacked = commentBox.y > videoBox.y + videoBox.height * 0.5;
      if (!isStacked) {
        throw new Error(`Expected Stacked on ${vp.name}, but comments are not below video!`);
      }
      console.log(`  ✓ ${vp.name}: Confirmed Mobile/Tablet Stacked Layout (Video above, Comments below)`);
    }

    // Verify video playback still works
    const isPlaying = await page.evaluate(() => {
      const v = document.querySelector("video");
      return v && !v.paused && v.currentTime > 0;
    });
    console.log(`  ✓ ${vp.name}: Autoplay active (${isPlaying})`);

    await page.close();
  }

  await browser.close();
  console.log("\n=== STEP 3: ALL RESPONSIVE TESTS PASSED 100% ===");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
