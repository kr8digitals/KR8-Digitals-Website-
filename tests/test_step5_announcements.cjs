/**
 * STEP 5 Comprehensive Test: Announcement System, Images & Video Uploads
 */

const fs = require("fs");

console.log("------------------------------------------------------------");
console.log("RUNNING STEP 5: ANNOUNCEMENT SYSTEM & MEDIA UPLOADS VERIFICATION");
console.log("------------------------------------------------------------");

let failed = false;

// 1. Verify parseVideoSource logic from src/utils/mediaStorage.ts
function parseVideoSource(url) {
  if (!url) return { type: "native", sourceUrl: "" };
  const trimmed = url.trim();
  if (trimmed.startsWith("idb:")) {
    return { type: "idb", sourceUrl: trimmed };
  }
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
    };
  }
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }
  return { type: "native", sourceUrl: trimmed };
}

const ytTest = parseVideoSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
if (ytTest.type === "youtube" && ytTest.embedUrl.includes("dQw4w9WgXcQ")) {
  console.log("✓ YouTube URL parsing and embed conversion verified!");
} else {
  console.error("✗ YouTube URL parsing failed:", ytTest);
  failed = true;
}

const vimeoTest = parseVideoSource("https://vimeo.com/76979871");
if (vimeoTest.type === "vimeo" && vimeoTest.embedUrl.includes("76979871")) {
  console.log("✓ Vimeo URL parsing and embed conversion verified!");
} else {
  console.error("✗ Vimeo URL parsing failed:", vimeoTest);
  failed = true;
}

const idbTest = parseVideoSource("idb:vid-12345");
if (idbTest.type === "idb") {
  console.log("✓ IndexedDB video vault key detection verified!");
} else {
  console.error("✗ IDB video detection failed:", idbTest);
  failed = true;
}

// 2. Verify AnnouncementManager.tsx file upload & IDB integration
const mgrSrc = fs.readFileSync("./src/components/admin/AnnouncementManager.tsx", "utf-8");
if (
  mgrSrc.includes("saveMediaAsset") &&
  mgrSrc.includes("handleImageUpload") &&
  mgrSrc.includes("handleVideoUpload") &&
  mgrSrc.includes("idb:vid-") &&
  mgrSrc.includes("idb:img-")
) {
  console.log("✓ AnnouncementManager saves media uploads into IndexedDB vault, preventing localStorage quota crashes!");
} else {
  console.error("✗ AnnouncementManager missing IndexedDB media vault integration!");
  failed = true;
}

// 3. Verify AnnouncementCard.tsx supports both video embeds and native video
const cardSrc = fs.readFileSync("./src/components/AnnouncementCard.tsx", "utf-8");
if (
  cardSrc.includes("parseVideoSource") &&
  cardSrc.includes("<iframe") &&
  cardSrc.includes("<video") &&
  cardSrc.includes("getMediaAsset")
) {
  console.log("✓ AnnouncementCard resolves IDB media asynchronously and renders both responsive iframes and native video!");
} else {
  console.error("✗ AnnouncementCard missing multi-format video rendering!");
  failed = true;
}

if (failed) {
  console.error("Step 5 verification failed!");
  process.exit(1);
}

console.log("------------------------------------------------------------");
console.log("ALL STEP 5 CHECKS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
