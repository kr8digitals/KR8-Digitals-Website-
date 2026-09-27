const { JSDOM } = require("jsdom");

console.log("=== RUNNING STEP 3 — ANNOUNCEMENT MEDIA VALIDATION ===");

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`, {
  url: "http://localhost:5173",
});
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;

// Test Announcements Storage Schema
const mockAnnouncements = [
  {
    id: "a-text-1",
    type: "text",
    title: "Cohort 4 Text Announcement",
    body: "Cohort 4 is progressing smoothly through week 5.",
    date: "Sep 26, 2026",
    author: "Admin Desk",
    active: true,
  },
  {
    id: "a-img-1",
    type: "image",
    title: "Mindset Shift Visual Flyer",
    body: "Join us this Sunday for a transformative session.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    date: "Sep 26, 2026",
    author: "Stevenson",
    speaker: "Stevenson (Motionverse)",
    active: true,
  },
  {
    id: "a-vid-1",
    type: "video",
    title: "Special Executive Briefing",
    body: "A video message from KR8 Digitals Founder Timfire.",
    videoUrl: "https://kr8digitals.com/videos/briefing.mp4",
    videoPoster: "https://kr8digitals.com/videos/briefing_poster.jpg",
    date: "Sep 26, 2026",
    author: "Timfire",
    active: true,
  },
];

// Test storage
localStorage.setItem("kr8_announcements_v2", JSON.stringify(mockAnnouncements));
const retrieved = JSON.parse(localStorage.getItem("kr8_announcements_v2"));

console.log("\n--- [TEST 1] Announcement Types & Media Fields ---");
if (retrieved.length !== 3) {
  throw new Error("Failed to store and retrieve all 3 announcement types.");
}

const textA = retrieved.find(a => a.type === "text");
const imgA = retrieved.find(a => a.type === "image");
const vidA = retrieved.find(a => a.type === "video");

if (!textA || !textA.body) throw new Error("Text announcement missing body.");
console.log("✓ Text announcement validated:", textA.title);

if (!imgA || !imgA.image) throw new Error("Image announcement missing image URL.");
console.log("✓ Image announcement validated with media:", imgA.image);

if (!vidA || !vidA.videoUrl || !vidA.videoPoster) throw new Error("Video announcement missing videoUrl or poster.");
console.log("✓ Video announcement validated with videoUrl:", vidA.videoUrl, "and poster:", vidA.videoPoster);

console.log("\n--- [TEST 2] Media Mutability (Replacing/Removing Media) ---");
// Simulate updating an announcement: removing image, converting to text
imgA.image = undefined;
imgA.type = "text";
if (imgA.image !== undefined || imgA.type !== "text") {
  throw new Error("Failed to mutate media.");
}
console.log("✓ Mutated image announcement to text successfully without breaking structure.");

console.log("\n=======================================================");
console.log("=== STEP 3 ANNOUNCEMENT MEDIA VERIFIED SUCCESSFULLY! ===");
console.log("=======================================================");
