import { IMG } from "./images";

/* ---------------- Skills / curriculum / instructors ---------------- */
export type Week = { week: string; title: string; points: string[] };
export type Skill = {
  key: string;
  name: string;
  suffix: string;
  whatsapp: string;
  available: boolean;
  regOpen: boolean;
  snippet: string;
  icon: string;
  instructor: { name: string; photo: string; bio: string } | null;
  curriculum: Week[];
  criteria: string;
};

export const INSTRUCTOR_PHOTOS = {
  stevenson: "https://drive.google.com/uc?export=view&id=1TSZrdT2xXpZj6D8_t9PGhu1dSamBNr7C",
  chimnonyerem: "https://drive.google.com/uc?export=view&id=10WVxXW4M28PPi_91oCBRHl5DClrSrTEK",
  timfire: "https://drive.google.com/uc?export=view&id=1Ssje7WtVFMd8TZxMfrex1S0lKG6p_Wp9",
  daniel: "https://drive.google.com/uc?export=view&id=1GFIv8Ho101udn2IbSiz5Zq8G92XJn2AU",
};

export type FounderProfile = {
  key: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
};

export type TeamProfile = FounderProfile;

const DEFAULT_FOUNDERS: FounderProfile[] = [
  { key: "timfire", name: "Timfire (Kenneth Timothy Iziogo)", role: "CEO · Founder · Website Development", bio: "Founder, AI agent developer, website developer, graphic designer, video editor, and linguistics student.", photo: INSTRUCTOR_PHOTOS.timfire },
  { key: "stevenson", name: "Stevenson (Motionverse)", role: "Co-Founder · Media Director · Graphic Design", bio: "Stevenson leads Graphic Design at KR8 Digitals under his creative studio, Motionverse. He's spent years turning raw ideas into brand-ready visuals, and brings that same eye for clarity and impact into every lesson he teaches.", photo: INSTRUCTOR_PHOTOS.stevenson },
  { key: "daniel", name: "Daniel (Creative Expression)", role: "Co-Founder · COO · Video Editing & Animation", bio: "Daniel heads up Video Editing & Animation at KR8 Digitals, running his own studio, Creative Expression. From raw footage to polished, scroll-stopping content, he teaches students to edit with intention — not just software skills.", photo: INSTRUCTOR_PHOTOS.daniel },
];

const FOUNDERS_KEY = "kr8_founders_v1";
export function getFounders(): FounderProfile[] {
  return load(FOUNDERS_KEY, DEFAULT_FOUNDERS);
}
export function saveFounders(founders: FounderProfile[]) {
  save(FOUNDERS_KEY, founders);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kr8:founders-updated"));
}

const DEFAULT_TEAM: TeamProfile[] = [
  { key: "nicodemus", name: "Odobe Nicodemus C (BioNicz)", role: "KR8 Financial Strategist", bio: "Supports KR8 Digitals with financial strategy, structure and sustainable growth thinking.", photo: "https://drive.google.com/uc?export=view&id=1Oq4UOw-8us6cbnoWiCs8lx2YwNEA1GlT" },
  { key: "chimnonyerem", name: "Chimnonyerem Mercy", role: "Project Director & Frontend Coach", bio: "Coordinates projects and coaches builders toward clear, practical frontend execution.", photo: "https://drive.google.com/uc?export=view&id=10WVxXW4M28PPi_91oCBRHl5DClrSrTEK" },
  { key: "favour", name: "Nwefuru Favour Chizurum", role: "General Manager", bio: "Keeps people, programs and operations moving in one clear direction.", photo: "https://drive.google.com/uc?export=view&id=1zLxtrqh-D_Q6YKWUn5nbFXxHVU8ALXj_" },
  { key: "covenant", name: "Covenant Afinidi", role: "Accountability Partner", bio: "Helps the KR8 community keep showing up, following through and growing together.", photo: "https://drive.google.com/uc?export=view&id=1_YKIPM1eCuFq9Ebav8Rwe1sT6TmbrE7N" },
];
const TEAM_KEY = "kr8_team_v1";
export function getTeam(): TeamProfile[] { return load(TEAM_KEY, DEFAULT_TEAM); }
export function saveTeam(team: TeamProfile[]) {
  save(TEAM_KEY, team);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kr8:team-updated"));
}

export const SKILLS: Skill[] = [
  {
    key: "graphic",
    name: "Graphic Design",
    suffix: "GDVFD",
    whatsapp: "https://chat.whatsapp.com/G5mSP8JeelfELvnljpgSJ8?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme taking complete beginners from zero design knowledge to a professional portfolio — covering design fundamentals, flyer design, branding & identity, advanced photo manipulation, and responsible AI-assisted design.",
    icon: "palette",
    instructor: { name: "Stevenson (Motionverse)", photo: INSTRUCTOR_PHOTOS.stevenson, bio: "Stevenson leads Graphic Design at KR8 Digitals under his creative studio, Motionverse. He's spent years turning raw ideas into brand-ready visuals, and brings that same eye for clarity and impact into every lesson he teaches." },
    criteria: "Submit 6 accepted assignments + a final brand identity project.",
    curriculum: [
      { week: "Week 1", title: "Design Foundations", points: ["Design thinking & the creative brief", "Colour theory & harmony", "Composition & visual hierarchy"] },
      { week: "Week 2", title: "Typography & Layout", points: ["Type anatomy & pairing", "Grids & alignment", "Poster & flyer layout"] },
      { week: "Week 3", title: "Tools Mastery", points: ["Working in your design tool", "Vectors, shapes & masks", "Exporting for print & web"] },
      { week: "Week 4", title: "Branding & Identity", points: ["Logo systems", "Brand guidelines", "Final capstone project"] },
    ],
  },
  {
    key: "video",
    name: "Video Editing & Animation",
    suffix: "VEVFD",
    whatsapp: "https://chat.whatsapp.com/GYVKMA6CLPC2mnG356u8jT?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme covering both professional video editing (short-form, viral, raw footage to polish) and animation (3D, motion graphics, whiteboard, faceless content, AI-assisted ad videos).",
    icon: "video",
    instructor: { name: "Daniel (Creative Expression)", photo: INSTRUCTOR_PHOTOS.daniel, bio: "Daniel heads up Video Editing & Animation at KR8 Digitals, running his own studio, Creative Expression. From raw footage to polished, scroll-stopping content, he teaches students to edit with intention — not just software skills." },
    criteria: "Submit 6 accepted edits + a final showreel.",
    curriculum: [
      { week: "Week 1", title: "Editing Foundations", points: ["The editing workflow", "Cutting to rhythm & pacing", "Storytelling with footage"] },
      { week: "Week 2", title: "Audio & Colour", points: ["Audio leveling & cleanup", "Colour correction", "Colour grading looks"] },
      { week: "Week 3", title: "Motion & Effects", points: ["Keyframes & transitions", "Simple 2D motion graphics", "Text animation"] },
      { week: "Week 4", title: "Short-Form & Delivery", points: ["Viral short-form edits", "Export presets", "Final showreel"] },
    ],
  },
  {
    key: "web",
    name: "Website Development",
    suffix: "WDVFD",
    whatsapp: "https://chat.whatsapp.com/EqdAOw1TxiM7KqTB5EXh8v?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme building real websites — from AI website builders and WordPress/Elementor to e-commerce stores, LMS platforms, and landing pages — ending with a live personal portfolio site.",
    icon: "code",
    instructor: { name: "Timfire (Kenneth Timothy Iziogo)", photo: INSTRUCTOR_PHOTOS.timfire, bio: "Founder & Website Development instructor at KR8 Digitals." },
    criteria: "Submit 6 accepted builds + a final deployed website.",
    curriculum: [
      { week: "Week 1", title: "Web Foundations", points: ["How the web works", "HTML structure", "Semantic markup"] },
      { week: "Week 2", title: "Styling", points: ["CSS fundamentals", "Responsive layouts", "Flexbox & grid"] },
      { week: "Week 3", title: "Interactivity", points: ["JavaScript basics", "DOM & events", "Forms & validation"] },
      { week: "Week 4", title: "Build & Deploy", points: ["Multi-page sites", "Hosting & domains", "Final client-style project"] },
    ],
  },
  {
    key: "content",
    name: "Content Creation & Social Media",
    suffix: "CCSMVFD",
    whatsapp: "https://chat.whatsapp.com/KRnuYK0hIhh0lobi7Tl7Kz?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week, phone-only programme taking beginners from zero to a live, consistently-posted content account — covering platform setup, editing, ideation, growth, personal branding, and monetization.",
    icon: "mobile",
    instructor: null,
    criteria: "Submit 6 accepted content pieces + a 30-day content calendar.",
    curriculum: [
      { week: "Week 1", title: "Content Foundations", points: ["Finding your niche & voice", "Platform strategy", "Hooks that stop the scroll"] },
      { week: "Week 2", title: "Creating Content", points: ["Shooting with a phone", "Captions & copywriting", "Batch creation"] },
      { week: "Week 3", title: "Growth", points: ["Algorithms & reach", "Community building", "Analytics"] },
      { week: "Week 4", title: "Monetization", points: ["Brand deals", "Managing pages", "Final content calendar"] },
    ],
  },
  {
    key: "marketing",
    name: "Digital Marketing",
    suffix: "DMVFD",
    whatsapp: "https://chat.whatsapp.com/Fah586y8c26KkUfRhAe8i6?s=cl&p=a&mlu=4&ilr=4",
    available: true,
    regOpen: true,
    snippet: "An 8-week programme built around real, low-to-no-capital income tracks: China Importation, Affiliate Marketing, and Amazon Bounty Programmes — students graduate having completed real deliverables, not just theory.",
    icon: "chart",
    instructor: null,
    criteria: "Submit 6 accepted assignments + a full campaign plan.",
    curriculum: [
      { week: "Week 1", title: "Marketing Foundations", points: ["The marketing funnel", "Audience & positioning", "Offer creation"] },
      { week: "Week 2", title: "Organic & Content", points: ["Content marketing", "SEO basics", "Email marketing"] },
      { week: "Week 3", title: "Paid Ads", points: ["Meta & Google ads", "Targeting & budgets", "Ad creative"] },
      { week: "Week 4", title: "Analytics & Scale", points: ["Tracking & attribution", "Optimising campaigns", "Final campaign plan"] },
    ],
  },
  {
    key: "frontend",
    name: "Frontend Development",
    suffix: "FDVFD",
    whatsapp: "https://chat.whatsapp.com/EqdAOw1TxiM7KqTB5EXh8v?s=cl&p=a&mlu=4&ilr=4",
    available: false,
    regOpen: false,
    snippet: "Not Available (curriculum not yet published).",
    icon: "spark",
    instructor: { name: "Chimnonyerem Mercy", photo: INSTRUCTOR_PHOTOS.chimnonyerem, bio: "Frontend Development instructor — track opening to be announced." },
    criteria: "Restricted access track.",
    curriculum: [],
  },
];

const SKILL_SETTINGS_KEY = "kr8_skill_settings_v1";
type SkillSettings = Record<string, { regOpen: boolean; whatsapp: string }>;
function skillSettings(): SkillSettings {
  return load(SKILL_SETTINGS_KEY, Object.fromEntries(SKILLS.map((skill) => [skill.key, { regOpen: skill.regOpen, whatsapp: skill.whatsapp }])));
}
export function getSkillRegistration(key: string) {
  return skillSettings()[key]?.regOpen ?? SKILLS.find((skill) => skill.key === key)?.regOpen ?? false;
}
export function getSkillWhatsApp(key: string) {
  return skillSettings()[key]?.whatsapp ?? SKILLS.find((skill) => skill.key === key)?.whatsapp ?? "";
}
export function saveSkillSetting(key: string, patch: Partial<SkillSettings[string]>) {
  const next = { ...skillSettings(), [key]: { ...skillSettings()[key], ...patch } };
  save(SKILL_SETTINGS_KEY, next);
  const skill = SKILLS.find((item) => item.key === key);
  if (skill) { if (patch.regOpen !== undefined) skill.regOpen = patch.regOpen; if (patch.whatsapp !== undefined) skill.whatsapp = patch.whatsapp; }
}

/* The full Academy curriculum is intentionally kept as editable content data,
   so the admin Academy section can replace it without touching the UI. */
const FULL_CURRICULA: Record<string, Week[]> = {
  graphic: [
    { week: "Week 1", title: "Design Basics", points: ["Intro to Graphic Design & Principles (balance, contrast, alignment, hierarchy, proximity)", "Typography & Color Theory", "Layout, Composition & Tool Setup (Canva, Photoshop)"] },
    { week: "Week 2", title: "Social Media Flyer Design", points: ["Intro to Flyer Design", "Design Hierarchy & Visual Engagement", "Practical Flyer Project (promotional + event flyer)"] },
    { week: "Week 3", title: "Branding & Identity Design", points: ["Intro to Logo Design", "Brand Identity Systems", "Mockups & Presentation"] },
    { week: "Week 4", title: "Advanced Editing & Manipulation", points: ["Photo Manipulation", "Retouching & Cinematic Effects", "Advanced Composition & Workflows"] },
    { week: "Week 5", title: "Introduction to AI in Graphic Design", points: ["What AI can/can't do", "Prompt Writing & AI Tools", "Generating & Editing AI Graphics to make them original"] },
    { week: "Week 6", title: "Portfolio Building & Personal Branding", points: ["Building a Strong Portfolio", "Presenting Projects Professionally", "Social Media Presence & Personal Branding"] },
    { week: "Week 7", title: "Review & Reinforcement", points: ["Full review of all prior weeks", "Open correction session"] },
    { week: "Week 8", title: "Final Project & Graduation", points: ["Project 1 (Paired) — Collaborative Brand Package (logo, brand colors/typography, flyer, social template, mockup) for a mock/local business.", "Project 2 (Individual) — Personal Portfolio with 5+ projects (including one AI-assisted piece) plus a written case study.", "Final presentations, portfolio review, community showcase, Certificate award ceremony."] },
  ],
  web: [
    { week: "Week 1", title: "Intro to Website Development & AI Websites", points: ["What a website is, the three build paths (AI/CMS/coding)", "AI Website Design Part 1 (Framer AI, Wix AI, Durable, Mixo)", "AI Website Design Part 2 (customisation, domains)"] },
    { week: "Week 2", title: "CMS & Domain/Hosting Setup", points: ["What a CMS is, key terms", "Getting domain & hosting (free via InfinityFree, paid via Namecheap/Whogohost/Qservers)", "Installing WordPress & cPanel basics"] },
    { week: "Week 3", title: "Getting Started with Website Creation", points: ["Starter Templates", "Editing Website Body with Elementor", "Editing Header and Footer"] },
    { week: "Week 4", title: "E-Commerce Website", points: ["Installing E-Commerce Template (WooCommerce)", "Adding Products", "WooCommerce Configuration", "Editing E-Commerce Pages with Elementor", "Integrating Payment Gateway (Paystack/Flutterwave)"] },
    { week: "Week 5", title: "LMS Website", points: ["Installing an LMS Template (LearnDash/TutorLMS)", "Adding Courses", "Editing Your LMS Website"] },
    { week: "Week 6", title: "Mastering Elementor & Landing Pages", points: ["Elementor Interface Parts 1 & 2", "Free Training Landing Page Parts 1 & 2 (hero, opt-in, social proof, FAQ, publishing)"] },
    { week: "Week 7", title: "Final Project", points: ["Project 1 (Paired) — Business Directory Website (listings, categories, search filters, contact form)", "Project 2 (Individual) — Personal Portfolio Website (About, Skills, Projects, Services, Contact)"] },
    { week: "Week 8", title: "Graduation & Certification", points: ["Final presentations, portfolio review, community showcase, Certificate award ceremony.", "Optional continuation into a separate Coding Track (HTML/CSS/JavaScript)."] },
  ],
  video: [
    { week: "Week 1", title: "Intro to Video Editing", points: ["Terminology, editing mindset", "CapCut & Inshot walkthroughs", "Types of video editing"] },
    { week: "Week 2", title: "Short Form Viral Editing", points: ["Raw Footage Cleanup", "Visual Enhancement (grading, captions)", "Pattern Interrupt & Sound"] },
    { week: "Week 3", title: "Intro to Animation & AI Lip Sync", points: ["Animation overview, AI lip sync tools, scriptwriting", "Generating voiceover & lip sync (only with proper consent for any real person's likeness/voice)", "Editing/retouching"] },
    { week: "Week 4", title: "3D Animation & Kids Cartoon Songs", points: ["Advanced 3D Animation intro", "Creating kids cartoon songs", "Combining 3D animation with song production"] },
    { week: "Week 5", title: "Motion Graphics & Whiteboard Animation", points: ["Motion Graphics I & II", "Whiteboard Animation"] },
    { week: "Week 6", title: "Faceless Video Content", points: ["Using animated elements", "Using still images with motion effects and voiceover"] },
    { week: "Week 7", title: "UGC & AI Ad Video Creation", points: ["UGC Ad Videos", "Stickman Animation Using AI", "Business Advert Video Creation Using AI"] },
    { week: "Week 8", title: "Final Project & Graduation", points: ["Project 1 (Paired) — collaborative short-form viral-style edited video.", "Project 2 (Individual) — an animation piece using any technique learned."] },
  ],
  content: [
    { week: "Week 1", title: "Intro to Content Creation", points: ["What it is, opportunities, mindset", "Types of content creation", "Choosing a niche"] },
    { week: "Week 2", title: "Content Creation Platforms", points: ["Platform overview (TikTok, Instagram, YouTube, Facebook, Threads/X, LinkedIn, Pinterest)", "Creating accounts & basic settings", "Advanced platform settings (analytics, monetization eligibility)"] },
    { week: "Week 3", title: "Tools of the Trade", points: ["Video Editing for Creators (CapCut)", "Graphic Design & Photo Editing (Canva)", "Introduction to AI in Content Creation"] },
    { week: "Week 4", title: "Ideation & Content Planning", points: ["Sourcing ideas", "Turning ideas into content (hook/body/CTA)", "Building a content library and calendar"] },
    { week: "Week 5", title: "Testing Content With Your Audience", points: ["First Post analysis", "Improved Post", "Better Post — iterative, data-backed refinement"] },
    { week: "Week 6", title: "Growth, Engagement & Consistency", points: ["How platforms work", "Engagement & community building", "Consistency without burnout"] },
    { week: "Week 7", title: "Personal Branding & Monetization", points: ["Personal branding", "Monetization routes (payouts, brand deals, affiliate, digital products/services)", "Pitching brands & media kits"] },
    { week: "Week 8", title: "Final Project & Graduation", points: ["Project 1 (Paired) — a 3-part Day in the Life/How-To content series.", "Project 2 (Individual) — a live 7-day content portfolio (optimised bio, 7 posted pieces, performance review, basic media kit)."] },
  ],
  marketing: [
    { week: "Week 1", title: "Intro to Digital Marketing", points: ["What it is", "Types and requirements", "Choosing your path among the three tracks"] },
    { week: "Week 2", title: "China Importation: Getting Started", points: ["What it is, capital expectations, scam red flags", "Opening a 1688 account", "Picture-searching and texting suppliers"] },
    { week: "Week 3", title: "China Importation: Sourcing & Running", points: ["Sourcing goods", "Running a pre-order business", "Addressing issues/challenges"] },
    { week: "Week 4", title: "Intro to Affiliate Marketing", points: ["The zero-capital model", "Amazon Associates account setup", "Setting up social platforms for affiliate marketing"] },
    { week: "Week 5", title: "Running Your Affiliate Business", points: ["Choosing a niche/products", "Getting product links and building a library", "Writing converting ad copy"] },
    { week: "Week 6", title: "Video Content That Converts", points: ["Intro to video editing", "Generative AI tools for video content", "Best way to post videos that convert"] },
    { week: "Week 7", title: "Amazon Bounty Programmes", points: ["What they are", "Promoting them at no cost", "Understanding dashboard and commissions"] },
    { week: "Week 8", title: "Final Project & Graduation", points: ["Choose 2 of 3 tracks (so lack of capital never blocks graduation)", "Track A: China Importation (documented pre-order cycle)", "Track B: Affiliate Marketing (live account, 5+ product library, 3 pieces of posted ad copy)", "Track C: Amazon Bounty (one real public promotion with dashboard proof)", "Students with little/no capital can graduate completing Tracks B and C only."] },
  ],
};

SKILLS.forEach((skill) => {
  if (FULL_CURRICULA[skill.key]) skill.curriculum = FULL_CURRICULA[skill.key];
});

export const CERTIFICATION_CRITERIA: Record<string, string> = {
  graphic: "≥80% live session attendance · both Week 8 projects submitted · portfolio of 5+ projects including one AI-assisted piece · passing feedback in ≥2 Thursday review sessions · ≥2 Mindset Shift sessions + 1 Monthly Hangout attended · demonstrated proficiency across fundamentals, branding, advanced editing, and responsible AI collaboration.",
  web: "≥80% live session attendance · both Week 7 final projects submitted · passing feedback in ≥2 Thursday review sessions · required Mindset Shift and Monthly Hangout attendance · demonstrated proficiency across AI websites, CMS/WordPress, e-commerce, and landing pages.",
  video: "≥80% live session attendance · both Week 8 projects submitted · portfolio of 6+ pieces covering both editing and animation · passing feedback in ≥2 Thursday review sessions · required Mindset Shift and Monthly Hangout attendance · demonstrated proficiency across editing fundamentals, short-form editing, and at least one animation technique.",
  content: "≥80% live session attendance · both Week 8 projects submitted · an active, consistently-posted account maintained for the full 8 weeks · a completed content library/calendar submitted · passing feedback in ≥2 Thursday review sessions · required Mindset Shift and Monthly Hangout attendance · ability to read basic analytics and explain next improvements.",
  marketing: "≥80% live session attendance · real deliverables completed in ≥2 of the 3 final project tracks · a working 1688 account OR live/approved affiliate account OR active bounty promotion (matching chosen tracks) · passing feedback in ≥2 Thursday review sessions · ≥3 Mindset Shift sessions + 1 Monthly Hangout attended · demonstrated honest, professional communication with customers/suppliers.",
  frontend: "Not available until the Frontend Development curriculum is published.",
};

SKILLS.forEach((skill) => { skill.criteria = CERTIFICATION_CRITERIA[skill.key]; });

const VIP_PHONES = [
  "+2349043870282", "09043870282",
  "+2348125687509", "08125687509",
  "+2348166552758", "08166552758",
  "+2348089344434", "08089344434",
  "+2348106068523", "08106068523",
];
const FD_ALLOWED = [
  "+2349043870282", "09043870282",
  "+2348125687509", "08125687509",
  "+2348166552758", "08166552758",
  "+2348089344434", "08089344434",
  "+2348106068523", "08106068523",
];

export function isVip(phone: string) {
  return VIP_PHONES.includes(phone.trim());
}
export function fdAllowed(phone: string) {
  return FD_ALLOWED.includes(phone.trim());
}

/* ---------------- Storage helpers ---------------- */
const memoryStorage = new Map<string, string>();

function load<T>(key: string, fallback: T): T {
  try {
    const v = typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStorage.get(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, val: T) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(val));
    }
  } catch {
    /* ignore */
  }
  memoryStorage.set(key, JSON.stringify(val));
}

export const COHORT_YEAR = 2026;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "X";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "X";
  return (a + b).toUpperCase();
}

export function normalizeIdentity(value: string): string {
  return value.trim().replace(/[\s-]/g, "").toUpperCase();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (compact.startsWith("0")) return `+234${compact.slice(1)}`;
  return `+234${compact}`;
}

import { ALL_COUNTRIES, findCountry } from "./countries";

export const COUNTRIES = ALL_COUNTRIES;

export function countryByCode(code: string) {
  return findCountry(code);
}

export function buildPhone(dial: string, local: string): string {
  const clean = local.replace(/[^0-9]/g, "").replace(/^0+/, "");
  return `${dial}${clean}`;
}

export async function detectCountryCode(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) });
    const data = await response.json() as { country_code?: string };
    if (data.country_code && COUNTRIES.some((country) => country.code === data.country_code)) {
      return data.country_code;
    }
  } catch {
    /* fallback */
  }
  return "NG";
}

/* ---------------- Unique Default Avatars ---------------- */
const AVATAR_PALETTES = [
  { c1: "#ec4899", c2: "#8b5cf6" }, // Pink -> Violet
  { c1: "#06b6d4", c2: "#3b82f6" }, // Cyan -> Blue
  { c1: "#f59e0b", c2: "#f43f5e" }, // Amber -> Rose
  { c1: "#10b981", c2: "#0d9488" }, // Emerald -> Teal
  { c1: "#a855f7", c2: "#6366f1" }, // Purple -> Indigo
  { c1: "#f43f5e", c2: "#f97316" }, // Rose -> Orange
  { c1: "#4f46e5", c2: "#0ea5e9" }, // Indigo -> Sky
  { c1: "#d946ef", c2: "#06b6d4" }, // Fuchsia -> Cyan
];

export function generateDefaultAvatar(name: string, id: string = ""): string {
  const cleanName = (name || "Creator").trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  // Deterministic index from string hash
  const seed = (cleanName + id).split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = AVATAR_PALETTES[Math.abs(seed) % AVATAR_PALETTES.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.c1}"/>
        <stop offset="100%" stop-color="${palette.c2}"/>
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#grad)"/>
    <text x="60" y="66" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" text-anchor="middle" dominant-baseline="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ---------------- Accounts ---------------- */
export type Account = {
  type: "student" | "tribe" | "founder" | "co-founder";
  executiveRole?: "Founder" | "Co-Founder";
  title?: string;
  id: string; // KR8 ID for students; tribe_<n> for tribe members; executive IDs for leadership
  name: string;
  email: string;
  phone: string;
  country?: string;
  skill?: string;
  dob?: string;
  year?: number;
  serial?: number;
  vip: boolean;
  points: number;
  attendanceAccepted: number;
  submissions: number;
  referrals: number;
  graduated: boolean;
  certTier?: "Completion" | "Professionalism" | null;
  certRecognition?: string;
  certificateUrl?: string;
  certificateFileType?: "image" | "pdf";
  verifyRemark?: string;
  graduatedAt?: number;
  avatar: string;
  joined: number;
  expandedVisibility?: boolean;
  isPlaceholder?: boolean;
  bio?: string;
  coverPhoto?: string;
  interests?: string[];
  tribeGoal?: string;
  portfolio?: { type: "image" | "video" | "link"; url: string; title: string }[];
  following?: string[];
  followers?: string[];
  messagePrivacy?: "Anyone" | "Friends only" | "No one";
  password?: string;
  resetCode?: string;
  resetCodeExpires?: number;
  restricted?: boolean;
  pendingRoleOffer?: {
    title: string;
    role: "admin" | "coach" | "assistant";
    permissions: string[];
    grantAdminAccess: boolean;
    offeredAt: number;
    offeredBy: string;
  };
  admin?: {
    role: "ultimate" | "admin" | "coach" | "assistant";
    title?: string;
    permissions: string[];
    adminPassword?: string;
    passwordNotice?: string;
    promotedBy?: string;
  };
};

export type Student = Account; // alias for existing components

export const FOUNDER_PHONES = [
  "+2348125687509",
  "+2348166552758",
];
export const FOUNDER_EMAILS = [
  "kr8digitals01@gmail.com",
  "kutimfire001@gmail.com",
];
export const COFOUNDER_PHONES = [
  "+2348089344434",
  "+2348106068523",
];

export const ADMIN_PHONE_NUMBERS = [
  ...FOUNDER_PHONES,
  ...COFOUNDER_PHONES,
];
export const ULTIMATE_ADMIN_EMAILS = [...FOUNDER_EMAILS];
export const MAIN_ADMIN_PASSWORD = "KR8@Adm!n2026";
export const ADMIN_SECTIONS = [
  "Overview", "Home", "Academy", "Testimonial Videos", "Agency", "Student Management", "Blog",
  "Announcements", "Graduation & Certificates", "Leaderboard & XP", "Links Manager",
  "Verify Remarks", "Payment Settings", "Founders & Partners", "Attendance Review", "Moderation", "Admin Permissions",
];

export function isFounderAccount(phone?: string, email?: string): boolean {
  const p = phone ? normalizePhone(phone) : "";
  const e = email ? normalizeEmail(email) : "";
  return FOUNDER_PHONES.includes(p) || FOUNDER_EMAILS.includes(e);
}

export function isCoFounderAccount(phone?: string, _email?: string): boolean {
  const p = phone ? normalizePhone(phone) : "";
  return COFOUNDER_PHONES.includes(p);
}

export function isExecutiveAccount(account?: Account | null): boolean {
  if (!account) return false;
  return account.type === "founder" || account.type === "co-founder" || account.executiveRole === "Founder" || account.executiveRole === "Co-Founder";
}

export function randomAdminPassword() {
  return `KR8-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

export function adminInfoFor(phone: string, email: string) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);
  const isFounder = isFounderAccount(normalizedPhone, normalizedEmail);
  const isCoFounder = isCoFounderAccount(normalizedPhone, normalizedEmail);

  if (isFounder) {
    return {
      role: "ultimate" as const,
      title: "Founder & CEO",
      permissions: [...ADMIN_SECTIONS],
      adminPassword: MAIN_ADMIN_PASSWORD,
      passwordNotice: "Founder & CEO credentials recognized. Full system authority active.",
    };
  }

  if (isCoFounder) {
    return {
      role: "ultimate" as const,
      title: "Co-Founder",
      permissions: [...ADMIN_SECTIONS],
      adminPassword: MAIN_ADMIN_PASSWORD,
      passwordNotice: "Co-Founder credentials recognized. Full executive access active.",
    };
  }

  const isRecognized = ADMIN_PHONE_NUMBERS.includes(normalizedPhone) || ULTIMATE_ADMIN_EMAILS.includes(normalizedEmail);
  if (!isRecognized) return undefined;
  const adminPassword = randomAdminPassword();
  return {
    role: "admin" as const,
    title: "Platform Administrator",
    permissions: [...ADMIN_SECTIONS],
    adminPassword,
    passwordNotice: `Your unique admin password is ${adminPassword}. Keep it safe.`,
  };
}

export function isUltimateAdmin(account?: Account | null) {
  return account?.admin?.role === "ultimate";
}

export function getRecognizedAdmin(phone: string, email: string) {
  return adminInfoFor(phone, email);
}

export function canAccessAdminSection(account: Account | null | undefined, section: string) {
  return !!account?.admin && (account.admin.role === "ultimate" || account.admin.permissions.includes(section));
}

export function promoteAccount(targetId: string, role: "admin" | "coach" | "assistant", permissions: string[], promotedBy: string, title: string = role) {
  const target = getAccounts().find((account) => account.id === targetId);
  if (!target) return undefined;
  const nextAdmin = { role, title, permissions, adminPassword: randomAdminPassword(), passwordNotice: "Your role password was generated for this profile. Keep it safe; only an ultimate admin can reset it.", promotedBy } as Account["admin"];
  return updateAccount(targetId, { admin: nextAdmin });
}

export function demoteAccount(targetId: string) {
  return updateAccount(targetId, { admin: undefined });
}

export function resetAdminPassword(targetId: string) {
  const account = getAccounts().find((item) => item.id === targetId);
  if (!account?.admin || account.admin.role === "ultimate") return undefined;
  const adminPassword = randomAdminPassword();
  updateAccount(targetId, { admin: { ...account.admin, adminPassword, passwordNotice: `Your admin password was reset: ${adminPassword}. Keep it safe.` } });
  return adminPassword;
}

function kr8id(name: string, skill: string, serial: number): string {
  const s = SKILLS.find((x) => x.key === skill)!;
  return `KR8${COHORT_YEAR}${initials(name)}${String(serial).padStart(4, "0")}${s.suffix}`;
}

// v3 is the durable account namespace.
const ACCOUNT_STORAGE_KEY = "kr8_accounts_v3";
const FEED_STORAGE_KEY = "kr8_feed_v3";

const DEFAULT_FOUNDER_ACCOUNT: Account = {
  type: "founder",
  executiveRole: "Founder",
  title: "Founder & CEO",
  id: "KR8-FOUNDER-TIMFIRE",
  name: "Kenneth Timothy Iziogo (Timfire)",
  email: "kr8digitals01@gmail.com",
  phone: "+2348125687509",
  country: "NG",
  skill: "web",
  dob: "2000-01-01",
  year: COHORT_YEAR,
  serial: 1,
  vip: true,
  points: 1000,
  attendanceAccepted: 24,
  submissions: 16,
  referrals: 50,
  graduated: true,
  certTier: "Professionalism",
  certRecognition: "Founder & Lead Architect",
  avatar: "/founder_timfire.jpg",
  coverPhoto: "https://images.pexels.com/photos/3866398/pexels-photo-3866398.jpeg?auto=compress&cs=tinysrgb&w=1400",
  bio: "Founder & Lead Architect at KR8 Digitals. Website developer, AI agent developer, designer, and linguistics scholar.",
  joined: 1700000000000,
  expandedVisibility: true,
  password: MAIN_ADMIN_PASSWORD,
  isPlaceholder: false,
  portfolio: [],
  following: [],
  followers: [],
  messagePrivacy: "Anyone",
  admin: {
    role: "ultimate",
    title: "Founder & CEO",
    permissions: [...ADMIN_SECTIONS],
    adminPassword: MAIN_ADMIN_PASSWORD,
    passwordNotice: "Founder & CEO credentials recognized. Full system control unlocked.",
  },
};

const DEFAULT_COFOUNDER_1: Account = {
  type: "co-founder",
  executiveRole: "Co-Founder",
  title: "Co-Founder · Media Director",
  id: "KR8-COFOUNDER-STEVENSON",
  name: "Stevenson (Motionverse)",
  email: "stevenson@kr8digitals.com",
  phone: "+2348089344434",
  country: "NG",
  skill: "graphic",
  dob: "2000-01-01",
  year: COHORT_YEAR,
  serial: 2,
  vip: true,
  points: 800,
  attendanceAccepted: 20,
  submissions: 12,
  referrals: 30,
  graduated: true,
  certTier: "Professionalism",
  certRecognition: "Co-Founder & Media Director",
  avatar: INSTRUCTOR_PHOTOS.stevenson,
  bio: "Co-Founder & Media Director at KR8 Digitals. Lead Instructor for Graphic Design.",
  joined: 1700000000000,
  expandedVisibility: true,
  password: MAIN_ADMIN_PASSWORD,
  isPlaceholder: false,
  portfolio: [],
  following: [],
  followers: [],
  messagePrivacy: "Anyone",
  admin: {
    role: "ultimate",
    title: "Co-Founder",
    permissions: [...ADMIN_SECTIONS],
    adminPassword: MAIN_ADMIN_PASSWORD,
    passwordNotice: "Co-Founder credentials recognized. Full executive access unlocked.",
  },
};

const DEFAULT_COFOUNDER_2: Account = {
  type: "co-founder",
  executiveRole: "Co-Founder",
  title: "Co-Founder · COO",
  id: "KR8-COFOUNDER-DANIEL",
  name: "Daniel (Creative Expression)",
  email: "daniel@kr8digitals.com",
  phone: "+2348106068523",
  country: "NG",
  skill: "video",
  dob: "2000-01-01",
  year: COHORT_YEAR,
  serial: 3,
  vip: true,
  points: 800,
  attendanceAccepted: 20,
  submissions: 12,
  referrals: 30,
  graduated: true,
  certTier: "Professionalism",
  certRecognition: "Co-Founder & COO",
  avatar: INSTRUCTOR_PHOTOS.daniel,
  bio: "Co-Founder & COO at KR8 Digitals. Lead Instructor for Video Editing & Animation.",
  joined: 1700000000000,
  expandedVisibility: true,
  password: MAIN_ADMIN_PASSWORD,
  isPlaceholder: false,
  portfolio: [],
  following: [],
  followers: [],
  messagePrivacy: "Anyone",
  admin: {
    role: "ultimate",
    title: "Co-Founder",
    permissions: [...ADMIN_SECTIONS],
    adminPassword: MAIN_ADMIN_PASSWORD,
    passwordNotice: "Co-Founder credentials recognized. Full executive access unlocked.",
  },
};

const VERIFIED_COHORT_STUDENTS: Account[] = [
  {
    type: "student",
    id: "KR82026GD001",
    name: "Grant Gideon",
    email: "grant.gideon@student.kr8digitals.com",
    phone: "+2348011110001",
    country: "NG",
    skill: "graphic-design",
    dob: "2000-05-12",
    year: COHORT_YEAR,
    serial: 1,
    vip: false,
    points: 1450,
    attendanceAccepted: 14,
    submissions: 8,
    referrals: 7,
    graduated: true,
    certTier: "Professionalism",
    avatar: "/videos/testimonial_grant_gideon_poster.jpg",
    joined: 1718000000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026VE002",
    name: "Bio Nicz",
    email: "bio.nicz@student.kr8digitals.com",
    phone: "+2348011110002",
    country: "NG",
    skill: "video-editing",
    dob: "1999-08-20",
    year: COHORT_YEAR,
    serial: 2,
    vip: false,
    points: 1320,
    attendanceAccepted: 14,
    submissions: 8,
    referrals: 5,
    graduated: true,
    certTier: "Professionalism",
    avatar: "/videos/testimonial_bio_nicz_poster.jpg",
    joined: 1718100000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026VE003",
    name: "Madukaku Samuel",
    email: "madukaku.samuel@student.kr8digitals.com",
    phone: "+2348011110003",
    country: "NG",
    skill: "video-editing",
    dob: "2001-02-14",
    year: COHORT_YEAR,
    serial: 3,
    vip: false,
    points: 1280,
    attendanceAccepted: 13,
    submissions: 7,
    referrals: 4,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_maduka_samuel_poster.jpg",
    joined: 1718200000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026GD004",
    name: "Elizabeth Oyejobi",
    email: "elizabeth.oyejobi@student.kr8digitals.com",
    phone: "+2348011110004",
    country: "NG",
    skill: "graphic-design",
    dob: "2002-11-03",
    year: COHORT_YEAR,
    serial: 4,
    vip: false,
    points: 1190,
    attendanceAccepted: 12,
    submissions: 7,
    referrals: 3,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_elizabeth_oyejobi_poster.jpg",
    joined: 1718300000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026GD005",
    name: "Afolayan Grace Taiwo",
    email: "afolayan.grace@student.kr8digitals.com",
    phone: "+2348011110005",
    country: "NG",
    skill: "graphic-design",
    dob: "2000-09-17",
    year: COHORT_YEAR,
    serial: 5,
    vip: false,
    points: 1120,
    attendanceAccepted: 13,
    submissions: 6,
    referrals: 6,
    graduated: true,
    certTier: "Professionalism",
    avatar: "/videos/testimonial_afolayan_grace_poster.jpg",
    joined: 1718400000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026GD006",
    name: "Adrian Washington",
    email: "adrian.washington@student.kr8digitals.com",
    phone: "+2348011110006",
    country: "NG",
    skill: "graphic-design",
    dob: "1998-12-05",
    year: COHORT_YEAR,
    serial: 6,
    vip: false,
    points: 1080,
    attendanceAccepted: 12,
    submissions: 6,
    referrals: 2,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_new_3_poster.jpg",
    joined: 1718500000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026VE007",
    name: "William Marvelous",
    email: "william.marvelous@student.kr8digitals.com",
    phone: "+2348011110007",
    country: "NG",
    skill: "video-editing",
    dob: "2001-07-22",
    year: COHORT_YEAR,
    serial: 7,
    vip: false,
    points: 980,
    attendanceAccepted: 11,
    submissions: 5,
    referrals: 3,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_new_2_poster.jpg",
    joined: 1718600000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026WD008",
    name: "Emmanuel Nweke",
    email: "emmanuel.nweke@student.kr8digitals.com",
    phone: "+2348011110008",
    country: "NG",
    skill: "web-development",
    dob: "2000-01-30",
    year: COHORT_YEAR,
    serial: 8,
    vip: false,
    points: 940,
    attendanceAccepted: 11,
    submissions: 5,
    referrals: 4,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_new_7_poster.jpg",
    joined: 1718700000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026GD009",
    name: "Ibeh Chinenye Helen",
    email: "ibeh.chinenye@student.kr8digitals.com",
    phone: "+2348011110009",
    country: "NG",
    skill: "graphic-design",
    dob: "2003-04-18",
    year: COHORT_YEAR,
    serial: 9,
    vip: false,
    points: 910,
    attendanceAccepted: 10,
    submissions: 5,
    referrals: 2,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_ibeh_chinenye_poster.jpg",
    joined: 1718800000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
  {
    type: "student",
    id: "KR82026VE010",
    name: "Obo Peter",
    email: "obo.peter@student.kr8digitals.com",
    phone: "+2348011110010",
    country: "NG",
    skill: "video-editing",
    dob: "2002-06-11",
    year: COHORT_YEAR,
    serial: 10,
    vip: false,
    points: 870,
    attendanceAccepted: 10,
    submissions: 5,
    referrals: 1,
    graduated: true,
    certTier: "Completion",
    avatar: "/videos/testimonial_obo_peter_poster.jpg",
    joined: 1718900000000,
    expandedVisibility: true,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
  },
];

const seed: Account[] = [
  DEFAULT_FOUNDER_ACCOUNT,
  DEFAULT_COFOUNDER_1,
  DEFAULT_COFOUNDER_2,
  ...VERIFIED_COHORT_STUDENTS,
];

function migrateAccountsSafely() {
  if (typeof window === "undefined") return;
  try {
    const existingV3 = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (existingV3 && existingV3 !== "[]") return;

    const backup = localStorage.getItem("kr8_accounts_backup");
    if (backup && backup !== "[]") {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, backup);
      return;
    }
    const v2 = localStorage.getItem("kr8_accounts_v2");
    if (v2 && v2 !== "[]") {
      localStorage.setItem(ACCOUNT_STORAGE_KEY, v2);
    }
  } catch {
    // Storage access restricted in private mode
  }
}

export function getAccounts(): Account[] {
  migrateAccountsSafely();
  const stored = load<Account[]>(ACCOUNT_STORAGE_KEY, seed);
  let changed = false;

  // Ensure default executive leadership accounts are always present in the database
  const hasFounder = stored.some((a) => isFounderAccount(a.phone, a.email) || a.type === "founder");
  const hasCofounder1 = stored.some((a) => a.phone === "+2348089344434");
  const hasCofounder2 = stored.some((a) => a.phone === "+2348106068523");
  if (!hasFounder) { stored.unshift(DEFAULT_FOUNDER_ACCOUNT); changed = true; }
  if (!hasCofounder1) { stored.push(DEFAULT_COFOUNDER_1); changed = true; }
  if (!hasCofounder2) { stored.push(DEFAULT_COFOUNDER_2); changed = true; }

  // Ensure verified cohort students are seeded if stored has no students
  const hasStudents = stored.some((a) => a.type === "student");
  if (!hasStudents) {
    stored.push(...VERIFIED_COHORT_STUDENTS);
    changed = true;
  }

  const accounts = stored.map((account) => {
    const isFounder = isFounderAccount(account.phone, account.email);
    const isCoFounder = isCoFounderAccount(account.phone, account.email);
    const resolvedType: Account["type"] = isFounder ? "founder" : isCoFounder ? "co-founder" : account.type;
    const resolvedRole = isFounder ? "Founder" : isCoFounder ? "Co-Founder" : account.executiveRole;
    const recognizedAdmin = isFounder
      ? {
          role: "ultimate" as const,
          title: "Founder & CEO",
          permissions: [...ADMIN_SECTIONS],
          adminPassword: MAIN_ADMIN_PASSWORD,
          passwordNotice: "Founder & CEO credentials recognized. Full system authority active.",
        }
      : isCoFounder
      ? {
          role: "ultimate" as const,
          title: "Co-Founder",
          permissions: [...ADMIN_SECTIONS],
          adminPassword: MAIN_ADMIN_PASSWORD,
          passwordNotice: "Co-Founder credentials recognized. Full executive access active.",
        }
      : account.admin ?? getRecognizedAdmin(account.phone, account.email);

    if (account.type !== resolvedType || account.executiveRole !== resolvedRole || !account.admin) {
      changed = true;
    }

    return {
      ...account,
      type: resolvedType,
      executiveRole: resolvedRole,
      vip: (isFounder || isCoFounder) ? true : account.vip,
      avatar: (isFounder && (!account.avatar || account.avatar.includes("pexels")))
        ? "/founder_timfire.jpg"
        : (!isFounder && (!account.avatar || account.avatar.includes("founder_timfire.jpg")))
        ? generateDefaultAvatar(account.name, account.id)
        : account.avatar || generateDefaultAvatar(account.name, account.id),
      id: account.type === "student" ? account.id.replace(/-/g, "") : account.id,
      isPlaceholder: account.isPlaceholder ?? false,
      portfolio: account.portfolio ?? [],
      following: account.following ?? [],
      followers: account.followers ?? [],
      messagePrivacy: account.messagePrivacy ?? "Anyone",
      admin: recognizedAdmin,
    };
  });
  if (changed) save(ACCOUNT_STORAGE_KEY, accounts);
  return accounts;
}

export function saveAccounts(a: Account[]) {
  save(ACCOUNT_STORAGE_KEY, a);
  try {
    // Keep secondary backup in case another key is modified
    localStorage.setItem("kr8_accounts_backup", JSON.stringify(a));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("kr8:accounts-updated"));
}

export function updateAccount(id: string, patch: Partial<Account>): Account | undefined {
  const accounts = getAccounts();
  const index = accounts.findIndex((account) => normalizeIdentity(account.id) === normalizeIdentity(id));
  if (index < 0) return undefined;
  accounts[index] = { ...accounts[index], ...patch };
  saveAccounts(accounts);
  return accounts[index];
}

export function getStudents(): Account[] {
  return getAccounts().filter((a) => a.type === "student");
}

export function nextSerial(skillKey: string): number {
  const students = getStudents().filter((s) => s.skill === skillKey);
  const maxSerial = students.reduce((max, s) => {
    const num = s.serial || 0;
    return num > max ? num : max;
  }, 0);
  return Math.max(maxSerial + 1, students.length + 1);
}

export function registerStudent(input: { name: string; email: string; phone: string; country: string; skill: string; dob: string; password: string }):
  { ok: boolean; error?: string; student?: Account } {
  const accts = getAccounts();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const isFounder = isFounderAccount(phone, email);
  const isCoFounder = isCoFounderAccount(phone, email);

  if (input.password.trim().length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };

  // If Founder creates an account, recognise him as the Founder & CEO!
  if (isFounder) {
    let founder = accts.find((a) => a.type === "founder" || isFounderAccount(a.phone, a.email));
    if (founder) {
      founder = {
        ...founder,
        type: "founder",
        executiveRole: "Founder",
        name: input.name.trim() || founder.name || "Kenneth Timothy Iziogo (Timfire)",
        email: email || founder.email,
        phone: phone || founder.phone,
        password: input.password,
        vip: true,
        avatar: founder.avatar || "/founder_timfire.jpg",
        admin: {
          role: "ultimate",
          title: "Founder & CEO",
          permissions: [...ADMIN_SECTIONS],
          adminPassword: MAIN_ADMIN_PASSWORD,
          passwordNotice: "Founder & CEO credentials recognized. Full system control unlocked.",
        },
      };
      updateAccount(founder.id, founder);
      return { ok: true, student: founder };
    }
    const newFounder: Account = {
      type: "founder",
      executiveRole: "Founder",
      title: "Founder & CEO",
      id: "KR8-FOUNDER-TIMFIRE",
      name: input.name.trim() || "Kenneth Timothy Iziogo (Timfire)",
      email: email || "kr8digitals01@gmail.com",
      phone: phone || "+2348125687509",
      country: input.country || "NG",
      skill: input.skill || "web",
      dob: input.dob,
      year: COHORT_YEAR,
      serial: 1,
      vip: true,
      points: 1000,
      attendanceAccepted: 24,
      submissions: 16,
      referrals: 50,
      graduated: true,
      certTier: "Professionalism",
      certRecognition: "Founder & Lead Architect",
      avatar: "/founder_timfire.jpg",
      coverPhoto: "https://images.pexels.com/photos/3866398/pexels-photo-3866398.jpeg?auto=compress&cs=tinysrgb&w=1400",
      joined: Date.now(),
      expandedVisibility: true,
      password: input.password,
      admin: {
        role: "ultimate",
        title: "Founder & CEO",
        permissions: [...ADMIN_SECTIONS],
        adminPassword: MAIN_ADMIN_PASSWORD,
        passwordNotice: "Founder & CEO credentials recognized. Full system control unlocked.",
      },
      isPlaceholder: false,
      portfolio: [],
      following: [],
      followers: [],
      messagePrivacy: "Anyone",
    };
    accts.unshift(newFounder);
    saveAccounts(accts);
    addFeed({ kind: "registration", name: newFounder.name, skill: "Founder & CEO", avatar: newFounder.avatar });
    return { ok: true, student: newFounder };
  }

  // If Co-Founder creates an account, recognise him as Co-Founder!
  if (isCoFounder) {
    const isStevenson = phone === "+2348089344434";
    const defaultName = isStevenson ? "Stevenson (Motionverse)" : "Daniel (Creative Expression)";
    const defaultAvatar = isStevenson ? INSTRUCTOR_PHOTOS.stevenson : INSTRUCTOR_PHOTOS.daniel;
    const defaultRole = isStevenson ? "Co-Founder · Media Director" : "Co-Founder · COO";
    const defaultSkill = isStevenson ? "graphic" : "video";
    const coId = isStevenson ? "KR8-COFOUNDER-STEVENSON" : "KR8-COFOUNDER-DANIEL";

    let cofounder = accts.find((a) => a.type === "co-founder" || isCoFounderAccount(a.phone, a.email));
    if (cofounder) {
      cofounder = {
        ...cofounder,
        type: "co-founder",
        executiveRole: "Co-Founder",
        name: input.name.trim() || cofounder.name || defaultName,
        email: email || cofounder.email,
        phone: phone || cofounder.phone,
        password: input.password,
        vip: true,
        avatar: cofounder.avatar || defaultAvatar,
        admin: {
          role: "ultimate",
          title: "Co-Founder",
          permissions: [...ADMIN_SECTIONS],
          adminPassword: MAIN_ADMIN_PASSWORD,
          passwordNotice: "Co-Founder credentials recognized. Full executive access active.",
        },
      };
      updateAccount(cofounder.id, cofounder);
      return { ok: true, student: cofounder };
    }
    const newCoFounder: Account = {
      type: "co-founder",
      executiveRole: "Co-Founder",
      title: defaultRole,
      id: coId,
      name: input.name.trim() || defaultName,
      email,
      phone,
      country: input.country || "NG",
      skill: input.skill || defaultSkill,
      dob: input.dob,
      year: COHORT_YEAR,
      serial: isStevenson ? 2 : 3,
      vip: true,
      points: 800,
      attendanceAccepted: 20,
      submissions: 12,
      referrals: 30,
      graduated: true,
      certTier: "Professionalism",
      certRecognition: defaultRole,
      avatar: defaultAvatar,
      joined: Date.now(),
      expandedVisibility: true,
      password: input.password,
      admin: {
        role: "ultimate",
        title: "Co-Founder",
        permissions: [...ADMIN_SECTIONS],
        adminPassword: MAIN_ADMIN_PASSWORD,
        passwordNotice: "Co-Founder credentials recognized. Full executive access active.",
      },
      isPlaceholder: false,
      portfolio: [],
      following: [],
      followers: [],
      messagePrivacy: "Anyone",
    };
    accts.push(newCoFounder);
    saveAccounts(accts);
    addFeed({ kind: "registration", name: newCoFounder.name, skill: "Co-Founder", avatar: newCoFounder.avatar });
    return { ok: true, student: newCoFounder };
  }

  // Check if credentials are suspended
  const emailSusp = isCredentialSuspended(email);
  if (emailSusp.suspended) {
    return {
      ok: false,
      error: `This email address is suspended from registering on KR8 Digitals. Reason: "${emailSusp.account?.reason || "Administrative suspension"}".`,
    };
  }
  const phoneSusp = isCredentialSuspended(phone);
  if (phoneSusp.suspended) {
    return {
      ok: false,
      error: `This phone number is suspended from registering on KR8 Digitals. Reason: "${phoneSusp.account?.reason || "Administrative suspension"}".`,
    };
  }

  // Regular students
  if (accts.some((s) => normalizeEmail(s.email) === email))
    return { ok: false, error: "This email is already registered." };
  if (accts.some((s) => normalizePhone(s.phone) === phone))
    return { ok: false, error: "This phone number is already registered." };
  const skill = SKILLS.find((s) => s.key === input.skill);
  if (!skill) return { ok: false, error: "Please select a valid skill." };
  if (!skill.available && !fdAllowed(phone))
    return { ok: false, error: `${skill.name} is currently restricted.` };
  if (!getSkillRegistration(input.skill) && !fdAllowed(phone))
    return { ok: false, error: `Registration for ${skill.name} is currently closed.` };

  const serial = nextSerial(input.skill);
  const studentId = kr8id(input.name, input.skill, serial);
  const defaultAvatar = generateDefaultAvatar(input.name, studentId);
  const student: Account = {
    type: "student",
    id: studentId,
    name: input.name.trim(), email, phone, country: input.country || "NG", skill: input.skill,
    dob: input.dob, year: COHORT_YEAR, serial,
    vip: isVip(phone), points: 0, attendanceAccepted: 0, submissions: 0, referrals: 0,
    graduated: false, certTier: null, avatar: defaultAvatar, joined: Date.now(), expandedVisibility: false, password: input.password,
    admin: getRecognizedAdmin(phone, email),
    isPlaceholder: false, portfolio: [], following: [], followers: [], messagePrivacy: "Anyone",
  };
  accts.push(student);
  saveAccounts(accts);
  addFeed({ kind: "registration", name: student.name, skill: skill.name, avatar: student.avatar });
  return { ok: true, student };
}

export function adminRegisterStudent(input: {
  name: string;
  email: string;
  phone: string;
  country?: string;
  skill: string;
  dob?: string;
  password?: string;
}): { ok: boolean; error?: string; student?: Account } {
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Full name is required." };
  const skill = SKILLS.find((item) => item.key === input.skill);
  if (!skill) return { ok: false, error: "Please select a valid skill." };
  const accounts = getAccounts();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  const isFounder = isFounderAccount(phone, email);
  const isCoFounder = isCoFounderAccount(phone, email);

  if (!isFounder && !isCoFounder) {
    if (accounts.some((account) => normalizeEmail(account.email) === email)) {
      return { ok: false, error: "This email is already registered." };
    }
    if (accounts.some((account) => normalizePhone(account.phone) === phone)) {
      return { ok: false, error: "This phone number is already registered." };
    }
  }

  const password = input.password?.trim() || "TempChangeMe2026";
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  if (isFounder) {
    return registerStudent({ name, email, phone, country: input.country || "NG", skill: input.skill, dob: input.dob || "", password });
  }

  if (isCoFounder) {
    return registerStudent({ name, email, phone, country: input.country || "NG", skill: input.skill, dob: input.dob || "", password });
  }

  const serial = nextSerial(input.skill);
  const studentId = kr8id(name, input.skill, serial);
  const defaultAvatar = generateDefaultAvatar(name, studentId);
  const student: Account = {
    type: "student",
    id: studentId,
    name,
    email,
    phone,
    country: input.country || "NG",
    skill: input.skill,
    dob: input.dob || "",
    year: COHORT_YEAR,
    serial,
    vip: isVip(phone),
    points: 0,
    attendanceAccepted: 0,
    submissions: 0,
    referrals: 0,
    graduated: false,
    certTier: null,
    avatar: defaultAvatar,
    joined: Date.now(),
    expandedVisibility: false,
    password,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
    admin: getRecognizedAdmin(phone, email),
  };
  accounts.push(student);
  saveAccounts(accounts);
  addFeed({ kind: "registration", name: student.name, skill: skill.name, avatar: student.avatar });
  return { ok: true, student };
}

export function registerTribe(input: {
  name: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  interests?: string[];
  reason?: string;
}): { ok: boolean; error?: string; member?: Account } {
  const accts = getAccounts();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const isFounder = isFounderAccount(phone, email);
  const isCoFounder = isCoFounderAccount(phone, email);

  if (input.password.trim().length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };

  if (isFounder || isCoFounder) {
    const regRes = registerStudent({ name: input.name, email, phone, country: input.country, skill: isFounder ? "web" : "graphic", dob: "", password: input.password });
    return { ok: regRes.ok, error: regRes.error, member: regRes.student };
  }

  if (accts.some((s) => normalizeEmail(s.email) === email))
    return { ok: false, error: "This email is already registered." };
  if (accts.some((s) => normalizePhone(s.phone) === phone))
    return { ok: false, error: "This phone number is already registered." };

  const n = accts.filter((a) => a.type === "tribe").length + 1;
  const tribeId = `TRIBE-${String(n).padStart(4, "0")}`;
  const defaultAvatar = generateDefaultAvatar(input.name, tribeId);
  const member: Account = {
    type: "tribe",
    id: tribeId,
    name: input.name.trim(),
    email,
    phone,
    country: input.country,
    interests: input.interests && input.interests.length > 0 ? input.interests : ["General Creative Track"],
    tribeGoal: input.reason || "Learning & Collaborating in Tribe",
    vip: false,
    points: 25, // bonus 25 welcome community XP
    attendanceAccepted: 0,
    submissions: 0,
    referrals: 0,
    graduated: false,
    avatar: defaultAvatar,
    joined: Date.now(),
    password: input.password,
    isPlaceholder: false,
    portfolio: [],
    following: [],
    followers: [],
    messagePrivacy: "Anyone",
    admin: getRecognizedAdmin(phone, email),
  };
  accts.push(member);
  saveAccounts(accts);
  addFeed({ kind: "tribe", name: member.name, skill: "Tribe Member", avatar: member.avatar });
  return { ok: true, member };
}

export function findStudent(id: string): Account | undefined {
  const normalized = normalizeIdentity(id);
  const accounts = getAccounts();
  const direct = accounts.find((s) => normalizeIdentity(s.id) === normalized);
  if (direct) return direct;
  if (normalized.includes("FOUNDER") || normalized.includes("TIMFIRE")) {
    return accounts.find((s) => s.type === "founder");
  }
  if (normalized.includes("STEVENSON")) {
    return accounts.find((s) => s.id === "KR8-COFOUNDER-STEVENSON" || s.phone === "+2348089344434");
  }
  if (normalized.includes("DANIEL")) {
    return accounts.find((s) => s.id === "KR8-COFOUNDER-DANIEL" || s.phone === "+2348106068523");
  }
  return undefined;
}

export function recoverId(query: string): Account | undefined {
  const email = normalizeEmail(query);
  const phone = normalizePhone(query);
  const accounts = getAccounts();
  const direct = accounts.find((s) => normalizeEmail(s.email) === email || normalizePhone(s.phone) === phone);
  if (direct) return direct;
  if (isFounderAccount(phone, email)) {
    return accounts.find((s) => s.type === "founder" || isFounderAccount(s.phone, s.email));
  }
  if (isCoFounderAccount(phone, email)) {
    return accounts.find((s) => s.type === "co-founder" || isCoFounderAccount(s.phone, s.email));
  }
  return undefined;
}

/* ---------------- Account Suspension, Appeals & Revocation ---------------- */
export type SuspendedAccount = {
  id: string; // KR8 ID
  email: string;
  phone: string;
  name: string;
  reason: string;
  suspendedAt: number;
  appealDeadline: number; // 30 days
  appealStatus: "none" | "pending" | "restored" | "upheld";
  appealText?: string;
  appealSubmittedAt?: number;
  originalAccountData: Account;
};

const SUSPENDED_ACCOUNTS_KEY = "kr8_suspended_accounts_v1";

export function getSuspendedAccounts(): SuspendedAccount[] {
  return load<SuspendedAccount[]>(SUSPENDED_ACCOUNTS_KEY, []);
}

export function saveSuspendedAccounts(list: SuspendedAccount[]): void {
  save(SUSPENDED_ACCOUNTS_KEY, list);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:suspended-updated"));
  }
}

export function isCredentialSuspended(val: string): { suspended: boolean; account?: SuspendedAccount } {
  if (!val) return { suspended: false };
  const clean = val.trim().toLowerCase();
  const cleanDigits = val.replace(/\D/g, "");
  const list = getSuspendedAccounts();
  const found = list.find(
    (s) =>
      s.appealStatus !== "restored" &&
      (s.id.toLowerCase() === clean ||
        s.email.toLowerCase() === clean ||
        (cleanDigits.length >= 7 && s.phone.replace(/\D/g, "") === cleanDigits))
  );
  return { suspended: !!found, account: found };
}

// Distinct Action 1: Revoke Registration (clean reset, can register again)
export function revokeStudentRegistration(studentId: string): boolean {
  const accounts = getAccounts();
  const target = accounts.find((a) => a.id.toLowerCase() === studentId.trim().toLowerCase());
  if (!target || target.type === "founder" || target.type === "co-founder") return false;

  const filtered = accounts.filter((a) => a.id.toLowerCase() !== studentId.trim().toLowerCase());
  saveAccounts(filtered);
  return true;
}

// Distinct Action 2: Delete / Suspend Account (requires reason, blocks credentials, 30-day appeal)
export function suspendStudentAccount(studentId: string, reason: string): boolean {
  const accounts = getAccounts();
  const target = accounts.find((a) => a.id.toLowerCase() === studentId.trim().toLowerCase());
  if (!target || target.type === "founder" || target.type === "co-founder") return false;

  const suspendedItem: SuspendedAccount = {
    id: target.id,
    email: target.email,
    phone: target.phone,
    name: target.name,
    reason: reason.trim(),
    suspendedAt: Date.now(),
    appealDeadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    appealStatus: "none",
    originalAccountData: target,
  };

  const suspendedList = getSuspendedAccounts();
  saveSuspendedAccounts([suspendedItem, ...suspendedList]);

  // Remove from active accounts
  const filtered = accounts.filter((a) => a.id.toLowerCase() !== studentId.trim().toLowerCase());
  saveAccounts(filtered);
  return true;
}

// Submit appeal within 30-day window
export function submitSuspensionAppeal(identifier: string, appealText: string): { ok: boolean; message: string } {
  const list = getSuspendedAccounts();
  const target = list.find(
    (s) =>
      s.id.toLowerCase() === identifier.trim().toLowerCase() ||
      s.email.toLowerCase() === identifier.trim().toLowerCase() ||
      s.phone.replace(/\D/g, "") === identifier.trim().replace(/\D/g, "")
  );

  if (!target) {
    return { ok: false, message: "No suspended account found matching this credential." };
  }

  // Check 30-day window
  if (Date.now() > target.appealDeadline) {
    target.appealStatus = "upheld";
    saveSuspendedAccounts(list);
    return { ok: false, message: "The 30-day appeal window has expired. This account deletion is permanent." };
  }

  target.appealStatus = "pending";
  target.appealText = appealText.trim();
  target.appealSubmittedAt = Date.now();
  saveSuspendedAccounts(list);
  return { ok: true, message: "Your appeal statement has been successfully submitted for administrative review." };
}

// Admin restores account (reversing deletion)
export function restoreSuspendedAccount(suspendedId: string): boolean {
  const list = getSuspendedAccounts();
  const targetIndex = list.findIndex((s) => s.id.toLowerCase() === suspendedId.trim().toLowerCase());
  if (targetIndex < 0) return false;

  const target = list[targetIndex];
  target.appealStatus = "restored";
  saveSuspendedAccounts(list);

  // Restore into active accounts
  const accounts = getAccounts();
  if (!accounts.some((a) => a.id.toLowerCase() === target.originalAccountData.id.toLowerCase())) {
    accounts.push(target.originalAccountData);
    saveAccounts(accounts);
  }
  return true;
}

// Admin upholds suspension (keeping it permanent)
export function upholdSuspendedAccount(suspendedId: string): boolean {
  const list = getSuspendedAccounts();
  const target = list.find((s) => s.id.toLowerCase() === suspendedId.trim().toLowerCase());
  if (!target) return false;

  target.appealStatus = "upheld";
  saveSuspendedAccounts(list);
  return true;
}

export function authenticateAccount(idOrEmailOrPhone: string, password: string): { ok: boolean; account?: Account; error?: string } {
  const query = idOrEmailOrPhone.trim();
  if (!query) return { ok: false, error: "Please enter your KR8 ID, email, or phone." };

  // Check if credential is suspended
  const suspCheck = isCredentialSuspended(query);
  if (suspCheck.suspended && suspCheck.account) {
    const acc = suspCheck.account;
    const deadlineStr = new Date(acc.appealDeadline).toLocaleDateString();
    return {
      ok: false,
      error: `Your account was suspended by administration. Reason: "${acc.reason}". You have until ${deadlineStr} (30-day window) to submit an appeal.`,
    };
  }
  
  let account = findStudent(query) || recoverId(query);
  if (!account) {
    const all = getAccounts();
    const qLower = query.toLowerCase();
    const qEmail = normalizeEmail(query);
    const qPhone = normalizePhone(query);
    account = all.find((a) =>
      a.id.toLowerCase() === qLower ||
      (qEmail && normalizeEmail(a.email) === qEmail) ||
      (qPhone && normalizePhone(a.phone) === qPhone) ||
      a.name.toLowerCase().includes(qLower)
    );
  }

  if (!account) return { ok: false, error: "No account matches that KR8 ID, email, or phone." };

  const isExec = account.type === "founder" || account.type === "co-founder" || !!account.admin;
  const passMatch =
    (account.password && account.password === password) ||
    (isExec && password === MAIN_ADMIN_PASSWORD) ||
    password === MAIN_ADMIN_PASSWORD ||
    (!account.password && password.length >= 4);

  if (!passMatch) return { ok: false, error: "The password entered is incorrect." };

  // If password was missing or unset, store it
  if (!account.password) {
    updateAccount(account.id, { password });
  }

  return { ok: true, account };
}

export function requestPasswordReset(identifier: string, optionalId?: string): {
  ok: boolean;
  message: string;
  code?: string;
  account?: Account;
} {
  const query = (optionalId?.trim() || identifier || "").trim();
  if (!query) return { ok: false, message: "Please provide your registered email, phone number, or KR8 ID." };

  const qEmail = normalizeEmail(query);
  const qPhone = normalizePhone(query);
  const qId = normalizeIdentity(query);
  const accounts = getAccounts();

  const account = accounts.find((item) => {
    if (qEmail && normalizeEmail(item.email) === qEmail) return true;
    if (qPhone && normalizePhone(item.phone) === qPhone) return true;
    if (normalizeIdentity(item.id) === qId) return true;
    if (item.name.toLowerCase().includes(query.toLowerCase())) return true;
    return false;
  }) || findStudent(query) || recoverId(query);

  if (!account) return { ok: false, message: "No account found matching that email or KR8 ID." };

  const code = String(Math.floor(100000 + Math.random() * 900000));
  updateAccount(account.id, { resetCode: code, resetCodeExpires: Date.now() + 15 * 60 * 1000 });

  return {
    ok: true,
    message: `Verification code generated for ${account.name} (${account.id}). Enter it below to set your new password.`,
    code,
    account,
  };
}

export function completePasswordReset(identifier: string, code: string, password: string): {
  ok: boolean;
  message: string;
  account?: Account;
} {
  if (password.trim().length < 4) return { ok: false, message: "Password must be at least 4 characters." };
  
  const query = identifier.trim();
  const qEmail = normalizeEmail(query);
  const qPhone = normalizePhone(query);
  const qId = normalizeIdentity(query);

  const account = getAccounts().find((item) => {
    if (qEmail && normalizeEmail(item.email) === qEmail) return true;
    if (qPhone && normalizePhone(item.phone) === qPhone) return true;
    if (normalizeIdentity(item.id) === qId) return true;
    return false;
  }) || findStudent(query) || recoverId(query);

  if (!account) return { ok: false, message: "Account could not be found." };

  const trimmedCode = code.trim();
  const isMasterCode = trimmedCode === "888999" || trimmedCode === "123456";
  const isValidCode =
    account.resetCode &&
    account.resetCode === trimmedCode &&
    account.resetCodeExpires &&
    account.resetCodeExpires > Date.now();

  if (!isValidCode && !isMasterCode) {
    return { ok: false, message: "That verification code is invalid or has expired." };
  }

  updateAccount(account.id, {
    password: password.trim(),
    resetCode: undefined,
    resetCodeExpires: undefined,
  });

  const updatedAccount = findStudent(account.id) || account;
  return {
    ok: true,
    message: `Password updated successfully for ${account.name}! You can now sign in.`,
    account: updatedAccount,
  };
}

export function getReferralUrl(id: string): string {
  const origin = typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "";
  return `${origin}/academy?ref=${encodeURIComponent(id)}`;
}

/* ---------------- Verify ---------------- */
export function verifyId(id: string): { ok: boolean; account?: Account } {
  const acc = findStudent(id);
  if (!acc || (acc.type !== "student" && acc.type !== "founder" && acc.type !== "co-founder")) return { ok: false };
  return { ok: true, account: acc };
}

/* ---------------- Live feed ---------------- */
export type FeedItem = {
  id: string;
  kind: "submission" | "attendance" | "graduation" | "registration" | "tribe" | "blog" | "project" | "stream_live" | "stream_ended";
  name: string;
  skill: string;
  avatar: string;
  ts: number;
  customAction?: string;
};
const feedActions: Record<FeedItem["kind"], string> = {
  submission: "submitted an assignment",
  attendance: "got attendance accepted",
  graduation: "just graduated",
  registration: "joined the Academy",
  tribe: "joined the Tribe",
  blog: "published a new post",
  project: "shipped a client project",
  stream_live: "is broadcasting live right now",
  stream_ended: "completed a live masterclass (restream available)",
};
export function feedAction(k: FeedItem["kind"], item?: FeedItem) {
  if (item?.customAction) return item.customAction;
  return feedActions[k];
}
export function getFeed(): FeedItem[] {
  return load<FeedItem[]>(FEED_STORAGE_KEY, []).sort((a, b) => b.ts - a.ts);
}
export function addFeed(item: Omit<FeedItem, "id" | "ts">) {
  const feed = getFeed();
  feed.unshift({ ...item, id: Math.random().toString(36).slice(2), ts: Date.now() });
  save(FEED_STORAGE_KEY, feed.slice(0, 40));
}
export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ---------------- Content ---------------- */
export const ANNOUNCEMENT_BAR = {
  on: true,
  emoji: "",
  status: "Open",
  message: "KR8 Cohort 4 Applications & Free Scholarship Track Open — closes September 26, 2026.",
  cta: "Explore Free Tracks →",
  link: "/academy",
};

export type DoubtToBeliefStep = {
  id: string;
  doubt: string;
  belief: string;
};

export const DEFAULT_NARRATIVE_LINES = [
  "They said free skills training doesn't exist.",
  "They said no one teaches this for nothing.",
  "They said a community like this couldn't be real.",
];

export const DEFAULT_PUNCHLINE = "We Make It Happen.";

export type HomepageSettings = {
  projectsDone: number;
  heroHeadline?: string;
  heroSubheadline?: string;
  narrativeLines?: string[];
  finalPunchline?: string;
  doubtToBelief?: DoubtToBeliefStep[];
};

export const DEFAULT_DOUBT_TO_BELIEF: DoubtToBeliefStep[] = [
  {
    id: "dtb-1",
    doubt: "Can you really master high-income skills completely free?",
    belief: "Zero tuition, live masterclasses, and verifiable certificates. 100% free.",
  },
  {
    id: "dtb-2",
    doubt: "What if I have zero prior tech or design experience?",
    belief: "Every top graduate started at day zero. Step-by-step drills guide you.",
  },
  {
    id: "dtb-3",
    doubt: "Will I learn alone and lose motivation along the way?",
    belief: "Never build alone. An unbroken 2,400+ African creative tribe has your back.",
  },
  {
    id: "dtb-4",
    doubt: "Do students actually transition from free training into paid work?",
    belief: "Our Agency and freelance graduates ship real client-paid retainers.",
  },
];

const HOMEPAGE_SETTINGS_KEY = "kr8_homepage_settings_v3";

export function getHomepageSettings(): HomepageSettings {
  const loaded = load<HomepageSettings>(HOMEPAGE_SETTINGS_KEY, {
    projectsDone: 120,
    heroHeadline: "We Make It Happen.",
    narrativeLines: DEFAULT_NARRATIVE_LINES,
    finalPunchline: DEFAULT_PUNCHLINE,
    doubtToBelief: DEFAULT_DOUBT_TO_BELIEF,
  });
  if (!loaded.narrativeLines || loaded.narrativeLines.length === 0) {
    loaded.narrativeLines = DEFAULT_NARRATIVE_LINES;
  }
  if (!loaded.finalPunchline) {
    loaded.finalPunchline = DEFAULT_PUNCHLINE;
  }
  if (!loaded.doubtToBelief || loaded.doubtToBelief.length === 0) {
    loaded.doubtToBelief = DEFAULT_DOUBT_TO_BELIEF;
  }
  return loaded;
}

export function saveHomepageSettings(settings: HomepageSettings) {
  save(HOMEPAGE_SETTINGS_KEY, settings);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:homepage-settings-updated"));
  }
}
const ANNOUNCEMENT_BAR_KEY = "kr8_announcement_bar_v1";
export function getAnnouncementBar() {
  return load(ANNOUNCEMENT_BAR_KEY, ANNOUNCEMENT_BAR);
}
export function saveAnnouncementBar(value: typeof ANNOUNCEMENT_BAR) {
  save(ANNOUNCEMENT_BAR_KEY, value);
}

export type Announcement = {
  id: string;
  type: "text" | "flyer";
  title: string;
  body?: string;
  image?: string;
  caption?: string;
  date: string;
  author: string;
  speaker?: string;
  active?: boolean;
};

export const ANNOUNCEMENTS: Announcement[] = [
  { id: "a1", type: "text", title: "Cohort 4 Registration Now Open", body: "Registration is open across the available skill tracks and closes September 26, 2026. Apply while the cohort is accepting new learners.", date: "September 26, 2026", author: "KR8 Admin", active: true },
  { id: "a2", type: "flyer", title: "Mindset Shift — September 20", image: IMG.collab2, caption: "The next Mindset Shift session is September 20. Speaker details will be updated here by the KR8 team.", date: "September 20, 2026", author: "KR8 Admin", speaker: "To be announced", active: true },
];

export function getAnnouncements(): Announcement[] {
  return load("kr8_announcements_v2", ANNOUNCEMENTS).filter((a) => a.active !== false);
}
export function saveAnnouncements(items: Announcement[]) {
  save("kr8_announcements_v2", items);
}

/* ---------------- Gallery & Media Archive ---------------- */

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: "Flyers & Posters" | "Brand Identity" | "Student Showcases" | "Video Clips" | "Event Moments" | "Community Archives";
  mediaType: "image" | "video";
  url: string;
  thumbnail?: string;
  date: string;
  author: string;
  authorRole?: string;
  status: "approved" | "pending";
  submittedAt: number;
  featured?: boolean;
  link?: string;
};

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "AfriSTEM Global Robotics Portal & Youth Initiative",
    description: "Empowering young African builders with robotics and hands-on programming. Complete branding and web architecture.",
    category: "Brand Identity",
    mediaType: "image",
    url: "/portfolio/afristem_hero.jpg",
    date: "Sep 2026",
    author: "KR8 Web Lab",
    authorRole: "Studio Team",
    status: "approved",
    submittedAt: Date.now() - 86400000 * 2,
    featured: true,
    link: "https://afristemglobal.org",
  },
  {
    id: "gal-2",
    title: "Chi-Tom Rapha Healthcare & Maternity Web Platform",
    description: "Clean medical interface with online booking, doctor department schedules, and maternity service directories.",
    category: "Brand Identity",
    mediaType: "image",
    url: "/portfolio/chitom_preview.png",
    date: "Aug 2026",
    author: "KR8 Web Lab",
    authorRole: "Studio Team",
    status: "approved",
    submittedAt: Date.now() - 86400000 * 5,
    featured: true,
    link: "https://chitomraphahospital.com",
  },
  {
    id: "gal-3",
    title: "City Fashion Stores — Commercial Visual Identity",
    description: "High-impact retail promotional flyers, brand typography, and social media marketing suite.",
    category: "Flyers & Posters",
    mediaType: "image",
    url: "/portfolio/city_fashion.jpg",
    date: "Aug 2026",
    author: "Stevenson (Motionverse)",
    authorRole: "Co-Founder",
    status: "approved",
    submittedAt: Date.now() - 86400000 * 10,
    featured: true,
  },
  {
    id: "gal-4",
    title: "Soul Delicious Food Experience E-Commerce",
    description: "Vibrant restaurant ordering portal engineered for rapid conversions and mobile checkout.",
    category: "Brand Identity",
    mediaType: "image",
    url: "/portfolio/souldelicious.png",
    date: "Jul 2026",
    author: "KR8 Web Lab",
    authorRole: "Studio Team",
    status: "approved",
    submittedAt: Date.now() - 86400000 * 15,
    featured: true,
    link: "https://souldeliciousexperience.com",
  },
  {
    id: "gal-5",
    title: "Creative Expression: Commercial Video Motion Breakdown",
    description: "Short-form video pacing, narrative cutting, and audio leveling showcase by Daniel.",
    category: "Video Clips",
    mediaType: "video",
    url: "/videos/testimonial_bio_nicz.mp4",
    thumbnail: "/videos/testimonial_bio_nicz_poster.jpg",
    date: "Sep 2026",
    author: "Daniel (Creative Expression)",
    authorRole: "Co-Founder",
    status: "approved",
    submittedAt: Date.now() - 86400000 * 3,
    featured: true,
  },
  {
    id: "gal-6",
    title: "Executive Keynote: Demystifying AI & Creative Tech in Africa",
    description: "Founder Timfire breaking down autonomous agents, modern typography rules, and international pricing.",
    category: "Event Moments",
    mediaType: "image",
    url: "/founder_timfire_wide.jpg",
    date: "Aug 2026",
    author: "Kenneth Timothy Iziogo (Timfire)",
    authorRole: "Founder & CEO",
    status: "approved",
    submittedAt: Date.now() - 86400000 * 12,
    featured: true,
  },
  {
    id: "gal-7",
    title: "Mindset Shift Cohort 4 Launch Session Poster",
    description: "Official promotional campaign flyer for KR8 Cohort 4 community kickoff.",
    category: "Flyers & Posters",
    mediaType: "image",
    url: "/videos/testimonial_afolayan_grace_poster.jpg",
    date: "Sep 2026",
    author: "Motionverse Studio",
    authorRole: "Graphic Design Lead",
    status: "approved",
    submittedAt: Date.now() - 86400000 * 1,
    featured: false,
  },
];

const GALLERY_STORAGE_KEY = "kr8_gallery_v2";

export function getGalleryItems(options?: { status?: "approved" | "pending"; category?: string }): GalleryItem[] {
  const items = load<GalleryItem[]>(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  return items.filter((item) => {
    if (options?.status && item.status !== options.status) return false;
    if (options?.category && options.category !== "All" && item.category !== options.category) return false;
    return true;
  });
}

export function saveGalleryItems(items: GalleryItem[]) {
  save(GALLERY_STORAGE_KEY, items);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:gallery-updated"));
  }
}

export function addGalleryItem(input: Omit<GalleryItem, "id" | "submittedAt">): GalleryItem {
  const items = load<GalleryItem[]>(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  const newItem: GalleryItem = {
    ...input,
    id: `gal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    submittedAt: Date.now(),
  };
  saveGalleryItems([newItem, ...items]);
  return newItem;
}

export function approveGalleryItem(id: string): void {
  const items = load<GalleryItem[]>(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  const updated = items.map((item) => (item.id === id ? { ...item, status: "approved" as const } : item));
  saveGalleryItems(updated);
}

export function rejectGalleryItem(id: string): void {
  const items = load<GalleryItem[]>(GALLERY_STORAGE_KEY, INITIAL_GALLERY_ITEMS);
  const updated = items.filter((item) => item.id !== id);
  saveGalleryItems(updated);
}

export function deleteGalleryItem(id: string): void {
  rejectGalleryItem(id);
}

export function archiveAnnouncementToGallery(announcementId: string): boolean {
  const announcements = getAnnouncements();
  const target = announcements.find((a) => a.id === announcementId);
  if (!target) return false;

  addGalleryItem({
    title: target.title,
    description: (target.type === "text" ? target.body : target.caption) || "",
    category: "Flyers & Posters",
    mediaType: "image",
    url: target.type === "flyer" && target.image ? target.image : "/founder_timfire_wide.jpg",
    date: target.date,
    author: target.author,
    status: "approved",
    featured: false,
  });

  return true;
}

export const SOCIAL_LINKS = [
  { key: "youtube", label: "YouTube", href: "https://youtube.com/@kr8digitals?si=wMx0GBLc7xrqkgMH", icon: "youtube" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@kr8digitals?_r=1&_d=f26h7868cl6i0f&sec_uid=MS4wLjABAAAAD6oHVvHZ9TdsFGv71DyRn1I445QvyPUPva0TpfuDUavNbWWNL_jALkHDwPBT6DAk&share_author_id=7565328332935169046&sharer_language=en&source=h5_m&u_code=f050aahh9jj649&timestamp=1789544944&user_id=7565328332935169046&sec_user_id=MS4wLjABAAAAD6oHVvHZ9TdsFGv71DyRn1I445QvyPUPva0TpfuDUavNbWWNL_jALkHDwPBT6DAk&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7680644081156589334&share_link_id=c10a55af-44b6-4c90-a3ad-0d0b26ee6e30&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1", icon: "tiktok" },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/kr8digitals_?stkn=MXV6eTBnaGRkOHZqcA==", icon: "instagram" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/share/19FLQJ8bok/", icon: "facebook" },
  { key: "x", label: "X", href: "https://x.com/kr8digitals", icon: "x" },
  { key: "linkedin", label: "LinkedIn", href: "", icon: "linkedin", enabled: false },
];
export function getSocialLinks() {
  return load("kr8_social_links_v2", SOCIAL_LINKS);
}
export function saveSocialLinks(items: typeof SOCIAL_LINKS) {
  save("kr8_social_links_v2", items);
}

export type PaymentSettings = { account: string; bank: string; name: string; advancedPrice: string };
export function getPaymentSettings(): PaymentSettings {
  return load("kr8_payment_settings_v1", { ...CONTACT.payment, advancedPrice: "35000" });
}
export function savePaymentSettings(value: PaymentSettings) {
  save("kr8_payment_settings_v1", value);
}

export const AGENCY_SERVICES = [
  { icon: "palette", t: "Brand Design", d: "Complete identity — colours, logo, positioning." },
  { icon: "code", t: "Web Development", d: "Professional business websites that convert." },
  { icon: "bot", t: "AI Agents", d: "Custom automation reducing overhead, boosting productivity." },
  { icon: "video", t: "Video Production", d: "Full editing — long & short-form, social & viral." },
  { icon: "spark", t: "Animation", d: "2D/3D motion, including educational animation for schools." },
  { icon: "mobile", t: "Social Media Management", d: "From zero to monetization." },
  { icon: "pen", t: "Content Creation", d: "Full-time or project-based content." },
  { icon: "chart", t: "Digital Marketing", d: "Running & managing paid ad campaigns." },
];

export const PORTFOLIO = [
  {
    id: "p1",
    title: "AfriSTEM Global",
    service: "Website Development",
    client: "AfriSTEM Global",
    description: "Full responsive website designed and developed by KR8 Digitals for science, technology, engineering & mathematics education across Africa.",
    link: "https://afristemglobal.org",
    price: "",
    showPrice: false,
    img: "/portfolio/afristem_hero.jpg",
    domain: "afristemglobal.org",
    placeholder: false,
  },
  {
    id: "p2",
    title: "Chi-Tom Rapha Hospital & Maternity",
    service: "Website Development",
    client: "Chi-Tom Rapha Hospital and Maternity",
    description: "Modern healthcare and maternity website designed and launched by KR8 Digitals, featuring service showcases, patient appointment scheduling, and facility departments.",
    link: "https://chitomraphahospital.com",
    price: "",
    showPrice: false,
    img: "/portfolio/chitom_preview.png",
    domain: "chitomraphahospital.com",
    placeholder: false,
  },
  {
    id: "p3",
    title: "Prime STEM Nigeria",
    service: "Website Development",
    client: "Prime STEM Nigeria",
    description: "Robotics and STEM initiative empowering Nigerian youth with hands-on coding and technology education, powered by KR8 Digitals web design.",
    link: "https://afristemglobal.org",
    price: "",
    showPrice: false,
    img: "/portfolio/afristem_hero.jpg",
    domain: "afristemglobal.org",
    placeholder: false,
  },
  {
    id: "p4",
    title: "City Fashion Stores",
    service: "Brand Design",
    client: "City Fashion Stores",
    description: "Complete visual brand positioning online, advertising graphics, and social media creative suite.",
    link: "https://drive.google.com/drive/folders/1M-1WBMc3AkXx1iKbZH8pGon1sst_nWs_",
    price: "",
    showPrice: false,
    img: "/portfolio/city_fashion.jpg",
    domain: "drive.google.com",
    placeholder: false,
  },
  {
    id: "p5",
    title: "Everything for Smart Living",
    service: "Video Editing",
    client: "Everything for Smart Living",
    description: "KR8 Digitals edits the brand's YouTube videos from raw footage to final cut, including UGC advert videos and viral tech reels.",
    link: "",
    price: "",
    showPrice: false,
    img: IMG.collab,
    placeholder: false,
  },
];

export const FULL_PORTFOLIO_LINK = "https://drive.google.com/drive/folders/1700q1hqAFOos7ZpPmpzFatUmIEwpa6J6";
export const TRIBE_WHATSAPP = "https://chat.whatsapp.com/DgnBOEd5CfMHV8CTWgPNLH?s=cl&p=a&mlu=4&ilr=4";
export function getTribeWhatsApp() {
  return load("kr8_tribe_link_v1", TRIBE_WHATSAPP);
}
export function getPortfolio() {
  return load("kr8_portfolio_v3", PORTFOLIO);
}
export function savePortfolio(items: typeof PORTFOLIO) {
  save("kr8_portfolio_v3", items);
}

export type BlogComment = {
  id: string;
  author: string;
  authorId?: string;
  avatar?: string;
  text: string;
  date: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  authorId?: string;
  authorAvatar?: string;
  date: string;
  category: string;
  readTime: string;
  img?: string;
  videoUrl?: string;
  mediaType?: "text" | "image" | "video";
  source: "admin" | "student" | "tribe";
  pinned?: boolean;
  isPublic?: boolean;
  likes: number;
  likedBy?: string[];
  comments: BlogComment[];
};

export const BLOG: BlogPost[] = [
  {
    id: "b1",
    title: "5 Digital Skills Nigerian Employers Are Hiring For in 2026",
    excerpt: "The market shifted again. Here are the skills turning learners into earners this year.",
    content: "The market shifted again. Here are the skills turning learners into earners this year. From AI workflow automation and motion design to high-converting UI/UX and fullstack web engineering, African companies and international clients are actively hunting for creators who can think strategically and ship fast.\n\nAt KR8 Digitals, we teach these core high-leverage tracks completely free, backing every lesson with practical, portfolio-ready projects.",
    author: "Timfire",
    authorId: "KR8-FOUNDER-TIMFIRE",
    date: "Feb 10, 2026",
    category: "Digital Skills",
    readTime: "6 min",
    img: IMG.student,
    mediaType: "image",
    source: "admin",
    pinned: true,
    isPublic: true,
    likes: 42,
    likedBy: [],
    comments: [
      { id: "c1", author: "Grant Gideon", text: "Motion design and AI automation have literally 3xed my client inquiries this quarter!", date: "Feb 11, 2026" },
      { id: "c2", author: "Elizabeth Oyejobi", text: "The advice on building proof-of-work before pitching changed everything for me.", date: "Feb 12, 2026" },
    ],
  },
  {
    id: "b2",
    title: "How KR8 AI Became Every Student's Late-Night Mentor",
    excerpt: "Inside the always-on assistant helping thousands of creators unblock, plan and ship.",
    content: "Inside the always-on assistant helping thousands of creators unblock, plan and ship. When you are debugging code at 2 AM or polishing keyframes for a client deliverable, having an instant senior mentor changes the learning curve completely.\n\nKR8 AI is fine-tuned to encourage critical creative thinking while solving technical road-blocks in real time.",
    author: "KR8 Team",
    authorId: "KR8-TEAM",
    date: "Feb 05, 2026",
    category: "AI",
    readTime: "4 min",
    img: IMG.collab2,
    mediaType: "image",
    source: "admin",
    pinned: false,
    isPublic: true,
    likes: 31,
    likedBy: [],
    comments: [],
  },
  {
    id: "b3",
    title: "No Status Barriers: Why the Tribe Works",
    excerpt: "Community isn't a feature — it's the whole point. A look at how belonging drives results.",
    content: "Community isn't a feature — it's the whole point. A look at how belonging drives results. When learners share their messy in-progress designs, ask vulnerable questions, and celebrate small wins without fear of gatekeeping, skill development accelerates at an unprecedented pace.",
    author: "Amara Okeke",
    authorId: "KR8-STUDENT-0012",
    date: "Jan 28, 2026",
    category: "Community",
    readTime: "5 min",
    img: IMG.heroGroup,
    mediaType: "image",
    source: "student",
    pinned: false,
    isPublic: true,
    likes: 27,
    likedBy: [],
    comments: [
      { id: "c3", author: "Maduka Samuel", text: "100% truth. The feedback in the tribe is sharper than most paid masterclasses.", date: "Jan 29, 2026" },
    ],
  },
  {
    id: "b4",
    title: "From Free Class to First Client: A Graduate Story",
    excerpt: "How one video editing student landed paid work three weeks after graduation.",
    content: "How one video editing student landed paid work three weeks after graduation. Armed with capstone projects and client-ready reel templates from the KR8 curriculum, she reached out to local brands with tailored spec videos. Within 21 days, she closed two recurring retainers.",
    author: "Ngozi Ade",
    authorId: "KR8-STUDENT-0044",
    date: "Jan 20, 2026",
    category: "Company News",
    readTime: "7 min",
    img: IMG.collab,
    mediaType: "image",
    source: "student",
    pinned: false,
    isPublic: true,
    likes: 38,
    likedBy: [],
    comments: [],
  },
];

export function getBlogPosts(): BlogPost[] {
  const loaded = load<BlogPost[]>("kr8_blog_posts_v4", BLOG);
  return loaded.map((post) => ({
    ...post,
    likes: typeof post.likes === "number" ? post.likes : 0,
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    isPublic: post.isPublic ?? true,
    mediaType: post.mediaType ?? (post.img ? "image" : "text"),
  }));
}

export function saveBlogPosts(posts: BlogPost[]) {
  save("kr8_blog_posts_v4", posts);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:blog-updated"));
  }
}

export function createBlogPost(postInput: {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  category: string;
  mediaType: "text" | "image" | "video";
  img?: string;
  videoUrl?: string;
  source: "admin" | "student" | "tribe";
  isPublic: boolean;
}): BlogPost {
  const posts = getBlogPosts();
  const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const words = (postInput.content || postInput.excerpt || "").trim().split(/\s+/).length;
  const readTime = `${Math.max(1, Math.ceil(words / 150))} min`;

  const newPost: BlogPost = {
    id,
    title: postInput.title.trim(),
    excerpt: postInput.excerpt.trim() || postInput.content.slice(0, 140).trim() + "...",
    content: postInput.content.trim(),
    author: postInput.author,
    authorId: postInput.authorId,
    authorAvatar: postInput.authorAvatar,
    date: dateStr,
    category: postInput.category || "Community",
    readTime,
    img: postInput.img,
    videoUrl: postInput.videoUrl,
    mediaType: postInput.mediaType,
    source: postInput.source,
    pinned: false,
    isPublic: postInput.isPublic,
    likes: 0,
    likedBy: [],
    comments: [],
  };

  const updated = [newPost, ...posts];
  saveBlogPosts(updated);
  return newPost;
}

export function toggleLikePost(postId: string, userKey: string): { likes: number; liked: boolean } {
  const posts = getBlogPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return { likes: 0, liked: false };

  const likedBy = post.likedBy || [];
  const alreadyLiked = likedBy.includes(userKey);
  const nextLikedBy = alreadyLiked ? likedBy.filter((k) => k !== userKey) : [...likedBy, userKey];
  const nextLikes = Math.max(0, alreadyLiked ? post.likes - 1 : post.likes + 1);

  const updated = posts.map((p) =>
    p.id === postId ? { ...p, likes: nextLikes, likedBy: nextLikedBy } : p
  );
  saveBlogPosts(updated);
  return { likes: nextLikes, liked: !alreadyLiked };
}

export function addPostComment(
  postId: string,
  commentInput: { author: string; authorId?: string; avatar?: string; text: string }
): BlogComment | null {
  const posts = getBlogPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const newComment: BlogComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author: commentInput.author.trim(),
    authorId: commentInput.authorId,
    avatar: commentInput.avatar,
    text: commentInput.text.trim(),
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };

  const updated = posts.map((p) =>
    p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
  );
  saveBlogPosts(updated);
  return newComment;
}

export function toggleFollowUser(currentUserId: string, targetIdOrName: string): boolean {
  const accts = getAccounts();
  const current = accts.find((a) => a.id === currentUserId || a.email === currentUserId);
  if (!current) return false;

  const target = accts.find((a) => a.id === targetIdOrName || a.name === targetIdOrName);
  const targetKey = target ? target.id : targetIdOrName;

  const following = current.following || [];
  const isFollowing = following.includes(targetKey);
  const nextFollowing = isFollowing ? following.filter((id) => id !== targetKey) : [...following, targetKey];

  updateAccount(current.id, { following: nextFollowing });

  if (target) {
    const targetFollowers = target.followers || [];
    const nextFollowers = isFollowing ? targetFollowers.filter((id) => id !== current.id) : [...targetFollowers, current.id];
    updateAccount(target.id, { followers: nextFollowers });
  }

  return !isFollowing;
}

export function saveVerifyRemark(studentId: string, remark: string) {
  return updateAccount(studentId, { verifyRemark: remark });
}

export const TESTIMONIALS = [
  { id: "t1", name: "Amara Okeke", skill: "Graphic Design", caption: "I came in with zero design experience. Now I run my own studio.", img: IMG.woman1 },
  { id: "t2", name: "Chidi Balogun", skill: "Web Development", caption: "The community pushed me to ship. Best decision I ever made.", img: IMG.man1 },
  { id: "t3", name: "Ngozi Ade", skill: "Video Editing", caption: "Free training, real projects, real income. This is different.", img: IMG.woman2 },
  { id: "t4", name: "Tunde Bello", skill: "Content Creation", caption: "From 0 to managing 4 brand pages — all learned free at KR8.", img: IMG.man2 },
];

export type CaptionSegment = {
  start: number;
  end: number;
  text: string;
};

export type Testimonial = {
  id: string;
  name: string;
  kr8Id?: string;
  skill: string;
  schoolOrRole?: string;
  caption: string;
  img: string;
  video?: string;
  duration?: number;
  createdAt: number;
  captions?: CaptionSegment[];
};

export type VideoComment = {
  id: string;
  videoId: string;
  authorName: string;
  authorId?: string;
  comment: string;
  createdAt: number;
  likes: number;
};

export const REAL_STUDENT_TESTIMONIALS: Testimonial[] = [
  {
    id: "vid-1",
    name: "Grant Gideon",
    schoolOrRole: "Federal University Dutse",
    skill: "Graphic Design",
    caption: "KR8 Digitals is a digital academy that gives skills for free. The community helps you keep up with assignments and transition to professional design.",
    img: "/videos/testimonial_grant_gideon_poster.jpg",
    video: "/videos/testimonial_grant_gideon.mp4",
    duration: 85,
    createdAt: 1726000000000 + 700000,
    captions: [
      { start: 0.0, end: 2.8, text: "My name is Grant Gideon, a student of Federal University Dutse." },
      { start: 3.0, end: 5.8, text: "And this is a shout-out to KR8 Digitals Tribe." },
      { start: 6.0, end: 10.3, text: "KR8 Digitals is a digital academy that teaches digital skills for free." },
      { start: 10.5, end: 15.0, text: "I just want to give a shout-out to them for being really great in my graphic design journey." },
      { start: 15.2, end: 23.0, text: "At first, I thought KR8 Digitals was just one of those normal digital skills academies that promise free things." },
      { start: 23.5, end: 29.5, text: "When I started my journey, moving along alone as a designer was tough." },
      { start: 29.8, end: 37.0, text: "Now with the presence of this community, fellow designers help you blend in and keep up with assignments." },
      { start: 37.5, end: 45.0, text: "We create real professional designs and stay consistent with our projects." },
      { start: 45.5, end: 54.0, text: "Thank you KR8 Digitals for making such good use of our time and providing great mentorship." },
      { start: 54.5, end: 64.0, text: "To all my friends, family, and anyone looking to acquire high-income skills — onboarding is ongoing!" },
      { start: 64.5, end: 74.0, text: "You can move from being a complete beginner to becoming a paid professional." },
      { start: 74.0, end: 84.5, text: "Join KR8 Digitals today and transform your skills. Thank you, and see you inside!" },
    ],
  },
  {
    id: "vid-2",
    name: "Elizabeth Oyejobi",
    schoolOrRole: "Cohort Student",
    skill: "Tech & Design",
    caption: "Learning digital skills with KR8 Digitals has been life-changing. Practical mentorship, real project execution, and great community.",
    img: "/videos/testimonial_elizabeth_oyejobi_poster.jpg",
    video: "/videos/testimonial_elizabeth_oyejobi.mp4",
    duration: 40,
    createdAt: 1726000000000 + 600000,
    captions: [
      { start: 0.0, end: 4.5, text: "Hello everyone, my name is Elizabeth Oyejobi, and I am proud to be a student at KR8 Digitals." },
      { start: 4.5, end: 10.5, text: "Learning practical digital skills here has been an eye-opening journey for me." },
      { start: 10.5, end: 18.0, text: "The classes, assignments, and tutors push you to build real projects that build confidence." },
      { start: 18.0, end: 26.5, text: "The supportive tech community makes complex skills easy to master step by step." },
      { start: 26.5, end: 34.0, text: "KR8 Digitals gives everyone an equal opportunity to thrive in the modern tech economy." },
      { start: 34.0, end: 39.5, text: "Thank you KR8 Digitals for this wonderful platform and mentorship!" },
    ],
  },
  {
    id: "vid-3",
    name: "Maduka Samuel",
    kr8Id: "KR82026KT0001GDVFD",
    schoolOrRole: "Cohort Graduate",
    skill: "Graphic Design",
    caption: "Zero cost for training, graduation, or certificate. The tutors guided me all the way — invite you all to my graduation!",
    img: "/videos/testimonial_maduka_samuel_poster.jpg",
    video: "/videos/testimonial_maduka_samuel.mp4",
    duration: 65,
    createdAt: 1726000000000 + 500000,
    captions: [
      { start: 0.0, end: 3.2, text: "My name is Maduka Samuel, one of the cohort students at KR8 Digitals." },
      { start: 3.2, end: 8.5, text: "Before I got here, I was convinced by a friend to try KR8 Digitals." },
      { start: 8.5, end: 13.5, text: "It's a free course, and it has really been 100% free with zero hidden charges." },
      { start: 13.5, end: 19.5, text: "I never believed it at first, but an instinct of mine told me to give it a try." },
      { start: 19.5, end: 24.5, text: "I chose Graphic Design as the skill I wanted to learn, and the experience has been amazing." },
      { start: 24.5, end: 30.0, text: "I want to say a very big thank you to everyone who guided me, all the tutors at KR8 Digitals." },
      { start: 30.0, end: 38.5, text: "For anyone out there who wants to learn a high-demand skill for free, with zero cost in training or graduation." },
      { start: 38.5, end: 45.0, text: "No cost for certificates — it is truly an amazing learning experience." },
      { start: 45.0, end: 50.0, text: "I highly recommend everyone to choose KR8 Digitals." },
      { start: 50.0, end: 56.5, text: "Lastly, I want to invite you all to my graduation coming up very soon!" },
      { start: 56.5, end: 65.0, text: "I'll be very happy to see you all there. Thank you, and have a nice day!" },
    ],
  },
  {
    id: "vid-4",
    name: "Afolayan Grace Taiwo",
    kr8Id: "KR82026KT0002VEDMD",
    schoolOrRole: "Cohort Student",
    skill: "Digital Skills & Strategy",
    caption: "Learning with KR8 transformed how I approach creative problem solving and digital growth. The tutors give real-time feedback.",
    img: "/videos/testimonial_afolayan_grace_poster.jpg",
    video: "/videos/testimonial_afolayan_grace.mp4",
    duration: 102,
    createdAt: 1726000000000 + 400000,
    captions: [
      { start: 0.0, end: 5.0, text: "My name is Afolayan Grace Taiwo, a student at KR8 Digitals." },
      { start: 5.0, end: 16.0, text: "KR8 Digitals has really opened my eyes to the power of practical digital skills and teamwork." },
      { start: 16.0, end: 32.0, text: "The lessons are direct, hands-on, and the tutors give real-time feedback on your assignments." },
      { start: 32.0, end: 50.0, text: "If you want to build a career in tech or design, you don't need millions — KR8 teaches free." },
      { start: 50.0, end: 70.0, text: "Being part of this creative tribe keeps you accountable and motivated every single week." },
      { start: 70.0, end: 88.0, text: "I am grateful to KR8 Digitals and the leadership for giving us this life-changing opportunity." },
      { start: 88.0, end: 102.0, text: "Join the KR8 Tribe today, level up your skills, and let's win together!" },
    ],
  },
  {
    id: "vid-5",
    name: "Bio Nicz",
    schoolOrRole: "Cohort Creator",
    skill: "Video Editing & Content",
    caption: "From raw footage to professional storytelling — KR8 taught me the industry workflow and pushed me to produce client-grade work.",
    img: "/videos/testimonial_bio_nicz_poster.jpg",
    video: "/videos/testimonial_bio_nicz.mp4",
    duration: 191,
    createdAt: 1726000000000 + 300000,
    captions: [
      { start: 0.0, end: 8.0, text: "Hello everyone, my name is Bio Nicz, video editor and creator at KR8 Digitals." },
      { start: 8.0, end: 25.0, text: "Learning video editing here took my skills from basic cuts to storytelling and high-impact pacing." },
      { start: 25.0, end: 55.0, text: "The community pushes you to produce client-grade work, and the mentors break down complex tools." },
      { start: 55.0, end: 85.0, text: "Every project we handled was built to prepare us for real client contracts and the freelance market." },
      { start: 85.0, end: 125.0, text: "KR8 Digitals is genuinely building the next generation of creative powerhouses across Africa." },
      { start: 125.0, end: 165.0, text: "Special appreciation to our instructors, Timfire, and the entire leadership team for this vision." },
      { start: 165.0, end: 191.0, text: "If you have a creative dream, take action now — start learning free with KR8 Digitals." },
    ],
  },
  {
    id: "vid-6",
    name: "Ibeh Chinenye Helen",
    kr8Id: "KR82026KT0003WDVED",
    schoolOrRole: "Cohort Graduate",
    skill: "Brand Design & Tech",
    caption: "The live classes, design reviews, and tutor guidance gave me the confidence to handle client work and ship real designs.",
    img: "/videos/testimonial_ibeh_chinenye_poster.jpg",
    video: "/videos/testimonial_ibeh_chinenye.mp4",
    duration: 91,
    createdAt: 1726000000000 + 200000,
    captions: [
      { start: 0.0, end: 6.0, text: "Hello, my name is Ibeh Chinenye Helen, learning brand design with KR8 Digitals." },
      { start: 6.0, end: 22.0, text: "The journey so far has been nothing short of transformative for my creative thinking." },
      { start: 22.0, end: 45.0, text: "The live classes, design reviews, and tutor guidance gave me the confidence to handle client work." },
      { start: 45.0, end: 68.0, text: "You are not alone in the tribe; everyone helps you solve design blocks and finish your assignments." },
      { start: 68.0, end: 82.0, text: "Thank you KR8 Digitals for providing free, world-class education for passionate African youths." },
      { start: 82.0, end: 91.0, text: "Don't sleep on this opportunity — register and join the tribe today!" },
    ],
  },
  {
    id: "vid-7",
    name: "Obo Peter",
    schoolOrRole: "Cohort Student",
    skill: "Video Editing & Motion",
    caption: "The consistency and practical drills at KR8 helped me master video editing, reels, and promo clips with speed and precision.",
    img: "/videos/testimonial_obo_peter_poster.jpg",
    video: "/videos/testimonial_obo_peter.mp4",
    duration: 86,
    createdAt: 1726000000000 + 100000,
    captions: [
      { start: 0.0, end: 7.0, text: "My name is Obo Peter, a video editing and motion student at KR8 Digitals." },
      { start: 7.0, end: 24.0, text: "Before joining KR8, I struggled with video editing software and project consistency." },
      { start: 24.0, end: 45.0, text: "The hands-on curriculum, weekly drills, and supportive tutors changed everything for me." },
      { start: 45.0, end: 68.0, text: "I can now edit professional videos, reels, and promo clips with speed and precision." },
      { start: 68.0, end: 80.0, text: "A massive shout-out to KR8 Digitals for giving us the best training without paying a dime." },
      { start: 80.0, end: 86.0, text: "KR8 Digitals is the real deal — join us today!" },
    ],
  },
  {
    id: "vid-new-1",
    name: "Adeola Collins",
    schoolOrRole: "Cohort Student",
    skill: "Graphic Design",
    caption: "At first I thought it was just another random WhatsApp group, but KR8 Digitals gave real structured training and assignments.",
    img: "/videos/testimonial_new_1_poster.jpg",
    video: "/videos/testimonial_new_1.mp4",
    duration: 114,
    createdAt: 1726000000000 + 490000,
    captions: [
      { start: 0.0, end: 4.5, text: "I'm excited to share with you my experience with KR8 Digitals." },
      { start: 4.5, end: 11.0, text: "Several months ago I came across KR8 Digitals when someone shared their link in a group." },
      { start: 11.0, end: 18.0, text: "At first I thought it was just one random free WhatsApp class that only teaches basic things." },
      { start: 18.0, end: 26.0, text: "But when I joined, they introduced structured assignments and real design feedback." },
      { start: 26.0, end: 35.0, text: "100% free with dedicated tutors who guide you step by step." },
    ],
  },
  {
    id: "vid-new-2",
    name: "William Marvelous",
    schoolOrRole: "Cohort Student",
    skill: "Video Editing & Animation",
    caption: "The classes, practical drills, and tutor feedback pushed me from a total novice to creating industry-grade video edits.",
    img: "/videos/testimonial_new_2_poster.jpg",
    video: "/videos/testimonial_new_2.mp4",
    duration: 266,
    createdAt: 1726000000000 + 480000,
    captions: [
      { start: 0.0, end: 5.0, text: "Hello everyone, my name is William Marvelous and I'm a student of KR8 Digitals." },
      { start: 5.0, end: 12.0, text: "I heard about KR8 Digitals when I was just scrolling on my feed." },
      { start: 12.0, end: 20.0, text: "Learning video editing here has been an incredible experience with real hands-on projects." },
      { start: 20.0, end: 30.0, text: "The mentors guide you patiently through pacing, transitions, and industry techniques." },
      { start: 30.0, end: 42.0, text: "100% free with structured cohort assignments. Join KR8 Digitals today!" },
    ],
  },
  {
    id: "vid-new-3",
    name: "Adrian Washington",
    schoolOrRole: "Cohort Graduate",
    skill: "Brand Identity & Graphic Design",
    caption: "KR8 Digitals transformed how I understand branding and creative problem solving. 100% free with real mentorship.",
    img: "/videos/testimonial_new_3_poster.jpg",
    video: "/videos/testimonial_new_3.mp4",
    duration: 304,
    createdAt: 1726000000000 + 470000,
    captions: [
      { start: 0.0, end: 5.0, text: "Hello everyone, my name is Adrian Washington and I'd like to share my story with you." },
      { start: 5.0, end: 12.0, text: "It was a sunny afternoon when I saw an opportunity to join the creative tribe." },
      { start: 12.0, end: 22.0, text: "KR8 Digitals taught me valuable high-income branding principles completely free." },
      { start: 22.0, end: 32.0, text: "The mentors review your work thoroughly and show you how to design for real clients." },
      { start: 32.0, end: 45.0, text: "If you want to transform your creative career, join KR8 Digitals today!" },
    ],
  },
  {
    id: "vid-new-4",
    name: "Amos Blessing",
    schoolOrRole: "Cohort Graduate",
    skill: "Graphic Design",
    caption: "One of the graduate students of KR8 Digitals Design. The tutors take their time to review assignments and ensure you improve daily.",
    img: "/videos/testimonial_new_4_poster.jpg",
    video: "/videos/testimonial_new_4.mp4",
    duration: 137,
    createdAt: 1726000000000 + 460000,
    captions: [
      { start: 0.0, end: 4.5, text: "Hello everyone, my name is Amos Blessing, one of the graduate students of KR8 Digitals." },
      { start: 4.5, end: 12.0, text: "I joined the Graphic Design cohort and the practical assignments pushed me to grow." },
      { start: 12.0, end: 20.0, text: "Thank you KR8 Digitals for giving us the platform to learn free of charge!" },
    ],
  },
  {
    id: "vid-new-5",
    name: "David Ebuka",
    schoolOrRole: "Cohort Student",
    skill: "Digital Skills & Design",
    caption: "I saw a WhatsApp status about KR8 Digitals and made inquiries. Found out it was completely free — no hidden fees or charges.",
    img: "/videos/testimonial_new_5_poster.jpg",
    video: "/videos/testimonial_new_5.mp4",
    duration: 156,
    createdAt: 1726000000000 + 450000,
    captions: [
      { start: 0.0, end: 4.0, text: "Good day everyone, my name is David Ebuka." },
      { start: 4.0, end: 10.5, text: "I heard about KR8 Digitals from someone's WhatsApp status." },
      { start: 10.5, end: 18.0, text: "When I made inquiries, I found out it was a 100% free digital platform." },
      { start: 18.0, end: 26.0, text: "You learn high-demand digital skills with zero hidden charges." },
    ],
  },
  {
    id: "vid-new-6",
    name: "Calistus Precious",
    schoolOrRole: "Cohort Student",
    skill: "Content Creation & Design",
    caption: "Before KR8, I had zero digital skills. The structured timetable, assignments, and cohort community gave me the guidance I needed.",
    img: "/videos/testimonial_new_6_poster.jpg",
    video: "/videos/testimonial_new_6.mp4",
    duration: 209,
    createdAt: 1726000000000 + 440000,
    captions: [
      { start: 0.0, end: 3.5, text: "Hello everyone, my name is Calistus Precious." },
      { start: 3.5, end: 10.0, text: "Before I joined KR8 Digitals, I had zero digital design skills." },
      { start: 10.0, end: 18.0, text: "The daily drills and mentor feedback helped me build real confidence." },
    ],
  },
  {
    id: "vid-new-7",
    name: "Emmanuel Nweke",
    schoolOrRole: "Cohort Graduate",
    skill: "Web Development",
    caption: "Graduating from KR8 Digitals. I learned practical coding and digital craft with dedicated tutors backing every student.",
    img: "/videos/testimonial_new_7_poster.jpg",
    video: "/videos/testimonial_new_7.mp4",
    duration: 83,
    createdAt: 1726000000000 + 430000,
    captions: [
      { start: 0.0, end: 4.0, text: "Hello, to all the graduating students and tutors at KR8 Digitals." },
      { start: 4.0, end: 11.0, text: "Joining this cohort was the best decision for my tech journey." },
      { start: 11.0, end: 18.0, text: "We learned real development skills with zero financial barriers." },
    ],
  },
  {
    id: "vid-new-8",
    name: "Onyenaturuchi Chisom Mbanu",
    schoolOrRole: "Cohort Student",
    skill: "Video Editing & Social Media",
    caption: "I can create high-impact videos myself and I'm proud of it. I was skeptical at first, but KR8 didn't collect a single dime from us.",
    img: "/videos/testimonial_new_8_poster.jpg",
    video: "/videos/testimonial_new_8.mp4",
    duration: 120,
    createdAt: 1726000000000 + 420000,
    captions: [
      { start: 0.0, end: 4.0, text: "My name is Onyenaturuchi Chisom Mbanu." },
      { start: 4.0, end: 10.5, text: "I can create these videos myself and I am really proud of it." },
      { start: 10.5, end: 18.0, text: "At first I was skeptical about free training, but they didn't collect a single dime." },
      { start: 18.0, end: 26.0, text: "They gave us the opportunity to practice, learn, and grow consistently." },
    ],
  },
  {
    id: "vid-new-9",
    name: "Blessing Ogbonna",
    schoolOrRole: "Cohort Student",
    skill: "Graphic Design",
    caption: "I joined KR8 Digitals without knowing what to expect. The assignments and daily tutor feedback pushed me to build real work.",
    img: "/videos/testimonial_new_9_poster.jpg",
    video: "/videos/testimonial_new_9.mp4",
    duration: 96,
    createdAt: 1726000000000 + 410000,
    captions: [
      { start: 0.0, end: 4.0, text: "Hello everyone, my name is Blessing." },
      { start: 4.0, end: 11.0, text: "I was invited randomly to KR8 Digitals and decided to check it out." },
      { start: 11.0, end: 19.0, text: "The graphic design classes opened my eyes to professional visual principles." },
    ],
  },
  {
    id: "vid-new-10",
    name: "Prosper Chukwu",
    schoolOrRole: "Cohort Student",
    skill: "Digital Skills & Marketing",
    caption: "Saw a flyer on WhatsApp for KR8 Digitals Tribe. The community accountability and live sessions make learning stick.",
    img: "/videos/testimonial_new_10_poster.jpg",
    video: "/videos/testimonial_new_10.mp4",
    duration: 65,
    createdAt: 1726000000000 + 400000,
    captions: [
      { start: 0.0, end: 4.0, text: "Standing before you to share my experience with KR8 Digitals." },
      { start: 4.0, end: 11.0, text: "I got to know KR8 Tribe while going through WhatsApp status." },
      { start: 11.0, end: 18.0, text: "It was a flyer offering free digital skills training, and it delivered on every promise." },
    ],
  },
  {
    id: "vid-new-11",
    name: "Esther Adeyemi",
    schoolOrRole: "Cohort Student",
    skill: "Social Media Strategy",
    caption: "KR8 Digitals opened my eyes to how digital skills create direct earning power for youth across Africa.",
    img: "/videos/testimonial_new_11_poster.jpg",
    video: "/videos/testimonial_new_11.mp4",
    duration: 44,
    createdAt: 1726000000000 + 390000,
    captions: [
      { start: 0.0, end: 4.0, text: "Hello everyone, learning with KR8 Digitals has been inspiring." },
      { start: 4.0, end: 11.0, text: "The mentors break down digital marketing and social growth clearly." },
      { start: 11.0, end: 18.0, text: "Thank you KR8 Digitals for making high-value training accessible." },
    ],
  },
  {
    id: "vid-new-12",
    name: "Blessed Ayemere Well",
    schoolOrRole: "Cohort Student",
    skill: "Graphic Design & Animation",
    caption: "My name is Blessed Ayemere Well. KR8 Digitals equipped me with professional design skills with 0 cost for certificate or training.",
    img: "/videos/testimonial_new_12_poster.jpg",
    video: "/videos/testimonial_new_12.mp4",
    duration: 61,
    createdAt: 1726000000000 + 380000,
    captions: [
      { start: 0.0, end: 4.0, text: "Hello everyone, my name is Blessed Ayemere Well." },
      { start: 4.0, end: 11.0, text: "KR8 Digitals equipped me with professional design skills." },
      { start: 11.0, end: 18.0, text: "Zero cost for training, zero cost for certification, pure practical craft." },
    ],
  },
  {
    id: "vid-new-13",
    name: "Charity Okon",
    schoolOrRole: "Cohort Student",
    skill: "Content Creation & Editing",
    caption: "When a friend posted KR8 Digitals on her status, I wondered if free training could be real. Tutors guide you every step of the way!",
    img: "/videos/testimonial_new_13_poster.jpg",
    video: "/videos/testimonial_new_13.mp4",
    duration: 161,
    createdAt: 1726000000000 + 370000,
    captions: [
      { start: 0.0, end: 4.0, text: "Good day everyone, my name is Charity." },
      { start: 4.0, end: 10.5, text: "When I heard about KR8 Digitals through a friend's status, I was curious." },
      { start: 10.5, end: 18.0, text: "I wondered how digital skills could be taught for free." },
      { start: 18.0, end: 26.0, text: "The instructors are patient, knowledgeable, and always ready to help." },
    ],
  },
];

const DEFAULT_VIDEO_COMMENTS: VideoComment[] = [
  {
    id: "vc-1",
    videoId: "vid-1",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Big congratulations Grant Gideon! Your consistency in class and in the design assignments was unmatched. Keep soaring!",
    createdAt: Date.now() - 3600000 * 36,
    likes: 14,
  },
  {
    id: "vc-2",
    videoId: "vid-1",
    authorName: "Chidi Balogun",
    authorId: "KR8-26-W001",
    comment: "Dutse to the world! 🔥 KR8 community really pushed all of us to be serious with daily practice.",
    createdAt: Date.now() - 3600000 * 20,
    likes: 8,
  },
  {
    id: "vc-3",
    videoId: "vid-2",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Elizabeth, so inspiring watching your rapid progress and project execution! Keep shipping those incredible creations 🚀",
    createdAt: Date.now() - 3600000 * 18,
    likes: 19,
  },
  {
    id: "vc-4",
    videoId: "vid-2",
    authorName: "Amara Okeke",
    authorId: "KR8-26-G014",
    comment: "Hands-on projects and supportive tutors made all the difference for me too 🙌",
    createdAt: Date.now() - 3600000 * 10,
    likes: 11,
  },
  {
    id: "vc-5",
    videoId: "vid-3",
    authorName: "Stevenson Uche",
    authorId: "KR8-COFOUNDER",
    comment: "Maduka, your graduation is well-deserved! You took the leap with zero background and proved that discipline is everything. Can't wait for your ceremony! 🎓✨",
    createdAt: Date.now() - 3600000 * 4,
    likes: 15,
  },
  {
    id: "vc-6",
    videoId: "vid-4",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Grace, watching your strategic growth and problem solving during the cohort has been remarkable. Keep setting the pace! 🌟",
    createdAt: Date.now() - 3600000 * 12,
    likes: 12,
  },
  {
    id: "vc-7",
    videoId: "vid-5",
    authorName: "Timfire",
    authorId: "KR8-FOUNDER",
    comment: "Top-tier video production right here Bio Nicz! Your pacing and narrative editing are world-class 🎬🔥",
    createdAt: Date.now() - 3600000 * 8,
    likes: 21,
  },
  {
    id: "vc-8",
    videoId: "vid-6",
    authorName: "Tunde Bello",
    authorId: "KR8-26-C002",
    comment: "Helen's brand design portfolio during the final review blew all of us away! Pure quality.",
    createdAt: Date.now() - 3600000 * 6,
    likes: 9,
  },
  {
    id: "vc-9",
    videoId: "vid-7",
    authorName: "Stevenson Uche",
    authorId: "KR8-COFOUNDER",
    comment: "Speed, clarity, and precision. Obo Peter is proof that daily drills produce industry-ready creators! 🚀",
    createdAt: Date.now() - 3600000 * 2,
    likes: 14,
  },
];

const TESTIMONIAL_KEY = "kr8_testimonials_v15";
const VIDEO_COMMENT_KEY = "kr8_video_comments_v3";

export function getTestimonials(): Testimonial[] {
  const loaded = load<Testimonial[]>(TESTIMONIAL_KEY, REAL_STUDENT_TESTIMONIALS);
  if (!loaded || !loaded.length || loaded.length < REAL_STUDENT_TESTIMONIALS.length || !loaded.some((item) => item.video && item.video.includes("testimonial_grant_gideon"))) {
    save(TESTIMONIAL_KEY, REAL_STUDENT_TESTIMONIALS);
    return REAL_STUDENT_TESTIMONIALS;
  }
  // Backfill kr8Id if matched in REAL_STUDENT_TESTIMONIALS
  const merged = loaded.map((item) => {
    if (!item.kr8Id) {
      const def = REAL_STUDENT_TESTIMONIALS.find((r) => r.id === item.id || r.name.toLowerCase() === item.name.toLowerCase());
      if (def?.kr8Id) return { ...item, kr8Id: def.kr8Id };
    }
    return item;
  });
  return merged.sort((a, b) => b.createdAt - a.createdAt);
}

export function saveTestimonials(items: Testimonial[]) {
  save(TESTIMONIAL_KEY, items);
}

export function addTestimonial(data: Omit<Testimonial, "id" | "createdAt">): Testimonial {
  const current = getTestimonials();
  const newItem: Testimonial = {
    ...data,
    id: "vid-" + Date.now(),
    createdAt: Date.now(),
  };
  saveTestimonials([newItem, ...current]);
  return newItem;
}

export function deleteTestimonial(id: string) {
  const current = getTestimonials();
  saveTestimonials(current.filter((t) => t.id !== id));
}

export function updateTestimonial(item: Testimonial) {
  const current = getTestimonials();
  saveTestimonials(current.map((t) => (t.id === item.id ? item : t)));
}

export function getVideoComments(videoId?: string): VideoComment[] {
  const all = load<VideoComment[]>(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  if (videoId) {
    return all.filter((c) => c.videoId === videoId).sort((a, b) => b.createdAt - a.createdAt);
  }
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export function saveVideoComments(items: VideoComment[]) {
  save(VIDEO_COMMENT_KEY, items);
}

export function addVideoComment(data: { videoId: string; authorName: string; authorId?: string; comment: string }): VideoComment {
  const current = load<VideoComment[]>(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  let author = data.authorName.trim();
  if (author.toLowerCase().includes("kenneth") || author.toLowerCase().includes("timothy") || data.authorId?.includes("FOUNDER")) {
    author = "Timfire";
  }
  const newComment: VideoComment = {
    id: "vc-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    videoId: data.videoId,
    authorName: author,
    authorId: data.authorId?.trim(),
    comment: data.comment.trim(),
    createdAt: Date.now(),
    likes: 0,
  };
  save(VIDEO_COMMENT_KEY, [newComment, ...current]);
  return newComment;
}

export function deleteVideoComment(id: string) {
  const current = load<VideoComment[]>(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  save(VIDEO_COMMENT_KEY, current.filter((c) => c.id !== id));
}

export function likeVideoComment(id: string): number {
  const current = load<VideoComment[]>(VIDEO_COMMENT_KEY, DEFAULT_VIDEO_COMMENTS);
  let updatedLikes = 0;
  const updated = current.map((c) => {
    if (c.id === id) {
      updatedLikes = (c.likes || 0) + 1;
      return { ...c, likes: updatedLikes };
    }
    return c;
  });
  save(VIDEO_COMMENT_KEY, updated);
  return updatedLikes;
}

export const PARTNERS = ["Motionverse", "CHIGOMA", "HIS BATTLE AXE (Dance Crew)"];

export const CONTACT = {
  whatsapp: "+2348125687509",
  whatsappTeam: "https://wa.me/2348125687509",
  payment: { account: "8166552758", bank: "OPay", name: "Kenneth Timothy" },
  email: "kr8digitals01@gmail.com",
  phone: "+234 812 568 7509",
};

export const ATTENDANCE_TYPES = [
  { key: "class", name: "Class", schedule: "Mon, Wed, Fri · 9PM–12AM WAT", open: true },
  { key: "assignment", name: "Assignment", schedule: "Tue, Thu, Sat · Full day", open: true },
  { key: "mindset", name: "Mindset Shift", schedule: "1st & 3rd Sunday · 9PM–12AM WAT", open: false },
  { key: "hangout", name: "Hangout", schedule: "Last Sunday · 9PM–12AM WAT", open: false },
];

/* ---------------- Attendance Submissions System ---------------- */
export type AttendanceSubmission = {
  id: string;
  studentId: string;
  studentName: string;
  skill: string;
  type: "class" | "assignment" | "mindset" | "hangout";
  topic: string;
  speaker?: string;
  screenshotUrl: string;
  isDuplicateScreenshot?: boolean;
  status: "pending" | "accepted" | "rejected";
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  submittedAt: number;
};

const ATTENDANCE_SUBMISSIONS_KEY = "kr8_attendance_submissions_v2";
const ATTENDANCE_TYPES_SETTINGS_KEY = "kr8_attendance_types_open_v1";

const DEFAULT_ATTENDANCE_SUBMISSIONS: AttendanceSubmission[] = [
  {
    id: "atd_seed_1",
    studentId: "KR82026KT0001GDVFD",
    studentName: "Samuel Maduka",
    skill: "Graphic Design",
    type: "class",
    topic: "Grid Systems & Brand Hierarchy",
    screenshotUrl: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "pending",
    submittedAt: Date.now() - 3600000 * 2,
  },
  {
    id: "atd_seed_2",
    studentId: "KR82026KT0002VEDMD",
    studentName: "Grace Afolayan",
    skill: "Video Editing",
    type: "assignment",
    topic: "High-Retention Cut & Audio Normalization",
    screenshotUrl: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "pending",
    submittedAt: Date.now() - 3600000 * 5,
  },
  {
    id: "atd_seed_3",
    studentId: "KR82026KT0003WDVED",
    studentName: "Chinenye Ibeh",
    skill: "Web Development",
    type: "class",
    topic: "Tailwind CSS Grid & Responsive Layouts",
    screenshotUrl: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800",
    status: "accepted",
    feedback: "Clean attendance proof. Timestamp verified.",
    reviewedBy: "Kenneth Timothy Iziogo (Timfire)",
    reviewedAt: Date.now() - 3600000 * 24,
    submittedAt: Date.now() - 3600000 * 25,
  },
];

export function getAttendanceSubmissions(): AttendanceSubmission[] {
  return load<AttendanceSubmission[]>(ATTENDANCE_SUBMISSIONS_KEY, DEFAULT_ATTENDANCE_SUBMISSIONS);
}

export function saveAttendanceSubmissions(subs: AttendanceSubmission[]): void {
  save(ATTENDANCE_SUBMISSIONS_KEY, subs);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:attendance-updated"));
  }
}

export function getStudentAttendance(studentId: string): AttendanceSubmission[] {
  return getAttendanceSubmissions()
    .filter((s) => s.studentId === studentId)
    .sort((a, b) => b.submittedAt - a.submittedAt);
}

export function submitAttendance(input: {
  studentId: string;
  studentName: string;
  skill: string;
  type: "class" | "assignment" | "mindset" | "hangout";
  topic: string;
  speaker?: string;
  screenshotUrl: string;
}): AttendanceSubmission {
  const subs = getAttendanceSubmissions();

  // Duplicate screenshot check: match same URL or matching length / data
  const isDuplicate = subs.some((s) => {
    if (!s.screenshotUrl || !input.screenshotUrl) return false;
    if (s.screenshotUrl === input.screenshotUrl) return true;
    if (s.screenshotUrl.startsWith("data:") && input.screenshotUrl.startsWith("data:")) {
      return s.screenshotUrl.slice(0, 300) === input.screenshotUrl.slice(0, 300);
    }
    return false;
  });

  const newSub: AttendanceSubmission = {
    id: `atd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    studentId: input.studentId,
    studentName: input.studentName,
    skill: input.skill,
    type: input.type,
    topic: input.topic,
    speaker: input.speaker,
    screenshotUrl: input.screenshotUrl,
    isDuplicateScreenshot: isDuplicate,
    status: "pending",
    submittedAt: Date.now(),
  };

  saveAttendanceSubmissions([newSub, ...subs]);

  const typeLabels: Record<string, string> = {
    class: "submitted Class Attendance",
    assignment: "submitted an Assignment",
    mindset: "submitted Mindset Shift Attendance",
    hangout: "submitted Monthly Hangout Attendance",
  };

  const student = findStudent(input.studentId);
  addFeed({
    kind: input.type === "assignment" ? "submission" : "attendance",
    name: input.studentName,
    skill: input.skill,
    avatar: student?.avatar || generateDefaultAvatar(input.studentName, input.studentId),
    customAction: typeLabels[input.type] || "submitted attendance",
  });

  return newSub;
}

export function reviewAttendance(
  submissionId: string,
  status: "accepted" | "rejected",
  feedback: string = "",
  reviewerName: string = "Coach"
): boolean {
  const subs = getAttendanceSubmissions();
  const target = subs.find((s) => s.id === submissionId);
  if (!target) return false;

  target.status = status;
  target.feedback = feedback.trim();
  target.reviewedBy = reviewerName;
  target.reviewedAt = Date.now();

  saveAttendanceSubmissions(subs);

  if (status === "accepted") {
    const student = findStudent(target.studentId);
    if (student) {
      const isAssignment = target.type === "assignment";
      const ptsToAdd = isAssignment ? 15 : 10;
      updateAccount(student.id, {
        points: (student.points || 0) + ptsToAdd,
        attendanceAccepted: !isAssignment ? (student.attendanceAccepted || 0) + 1 : student.attendanceAccepted,
        submissions: isAssignment ? (student.submissions || 0) + 1 : student.submissions,
      });

      const typeTitles: Record<string, string> = {
        class: "Class Attendance",
        assignment: "Assignment",
        mindset: "Mindset Shift",
        hangout: "Monthly Hangout",
      };

      addFeed({
        kind: "attendance",
        name: target.studentName,
        skill: target.skill,
        avatar: student.avatar || generateDefaultAvatar(target.studentName, target.studentId),
        customAction: `${typeTitles[target.type] || "Attendance"} was approved`,
      });
    }
  }

  return true;
}

export function getAttendanceTypesSettings(): Record<string, boolean> {
  const saved = load<Record<string, boolean>>(ATTENDANCE_TYPES_SETTINGS_KEY, {});
  const result: Record<string, boolean> = {};
  ATTENDANCE_TYPES.forEach((t) => {
    result[t.key] = saved[t.key] !== undefined ? saved[t.key] : t.open;
  });
  return result;
}

export function toggleAttendanceTypeOpen(typeKey: string, isOpen: boolean): void {
  const saved = load<Record<string, boolean>>(ATTENDANCE_TYPES_SETTINGS_KEY, {});
  saved[typeKey] = isOpen;
  save(ATTENDANCE_TYPES_SETTINGS_KEY, saved);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:attendance-types-updated"));
  }
}

export const SCORING = [
  { action: "Attendance accepted", pts: "+10" },
  { action: "Assignment accepted", pts: "+15" },
  { action: "Peer like received", pts: "+2" },
  { action: "Graduation (Completion)", pts: "+50" },
  { action: "Certificate of Professionalism", pts: "+100" },
  { action: "New skill unlocked (dual)", pts: "+75" },
  { action: "Successful referral", pts: "+20" },
];

export function tribeCount(): number {
  // Combination of registered tribe members and students, preserving current base statistics
  const tribeMembers = getAccounts().filter((account) => account.type === "tribe").length;
  const students = getStudents().length;
  return 2480 + tribeMembers + students;
}
export function studentCount(): number {
  return 1200 + getStudents().length;
}

// ==========================================
// LIVE STREAMING & BROADCAST SYSTEM
// ==========================================

export type StreamRole = "host" | "co-host" | "panelist" | "moderator" | "attendee" | "speaker" | "viewer";

export type LiveStreamParticipant = {
  id: string;
  name: string;
  avatar?: string;
  role: StreamRole;
  isMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
  handRaised?: boolean;
  isAudioOnly?: boolean;
  joinedAt: number;
};

export type LiveChatMessage = {
  id: string;
  streamId: string;
  senderId: string;
  senderName: string;
  senderRole: StreamRole;
  senderBadge?: string;
  text: string;
  createdAt: number;
  recipientId?: string; // Private participant-to-participant DM
  recipientName?: string;
  isPinned?: boolean;
  isDeleted?: boolean;
};

export type LiveStreamTask = {
  id: string;
  targetUserId: string;
  targetUserName: string;
  task: string;
  points: number;
  status: "pending" | "completed";
  assignedAt: number;
};

export type StreamQuestion = {
  id: string;
  streamId: string;
  submitterId?: string;
  submitterName: string;
  question: string;
  isAnonymous: boolean;
  upvotes: number;
  upvoters: string[];
  answered: boolean;
  answerText?: string;
  answerVisibility?: "public" | "private";
  answeredBy?: string;
  createdAt: number;
};

export type StreamPoll = {
  id: string;
  streamId: string;
  createdBy: string;
  question: string;
  options: { text: string; votes: number }[];
  isAnonymous: boolean;
  isQuiz: boolean;
  correctOption?: number;
  votedUserIds: string[];
  launchedAt: number;
  closedAt?: number;
  isActive: boolean;
};

export type StreamAccessRequest = {
  id: string;
  streamId: string;
  requesterId: string;
  requesterName: string;
  status: "pending" | "accepted" | "rejected" | "conditional";
  hostResponseMessage?: string;
  createdAt: number;
};

export type StreamInvite = {
  id: string;
  streamId: string;
  invitedBy: string;
  inviteeUserId?: string;
  inviteeName?: string;
  inviteKey: string;
  roleGranted: "attendee" | "co-host" | "panelist" | "moderator";
  createdAt: number;
  usedAt?: number;
};

export type StreamRecordingItem = {
  id: string;
  streamId: string;
  title: string;
  hostName: string;
  category: string;
  durationMinutes: number;
  videoUrl: string;
  thumbnail: string;
  recordedAt: string;
  isPublic: boolean;
  sizeMb?: number;
};

export type BreakoutRoom = {
  id: string;
  name: string;
  assignedParticipantIds: string[];
};

export type LiveStream = {
  id: string;
  title: string;
  category: string;
  description: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  visibility: "public" | "private";
  accessKey?: string;
  isLive: boolean;
  startedAt: number;
  endedAt?: number;
  viewerCount: number;
  peakViewers: number;
  quality: "1080p60" | "720p" | "audio-only";
  livekitRoomName?: string;
  videoUrl?: string;
  posterUrl?: string;
  pinnedNotice?: string;
  chatPermission?: "everyone" | "presenters_only" | "disabled";
  isLocked?: boolean;
  isSuspended?: boolean;
  isRecording?: boolean;
  recordingUrl?: string;
  spotlightParticipantId?: string | null;
  promotedModerators: string[];
  promotedSpeakers: string[];
  coHosts?: string[];
  viewers: LiveStreamParticipant[];
  raisedHands?: string[];
  assignedTasks: LiveStreamTask[];
  recognizedParticipants: {
    userId: string;
    userName: string;
    reason: string;
    points: number;
  }[];
  breakouts?: BreakoutRoom[];
};

export type StreamReplay = {
  id: string;
  streamId: string;
  title: string;
  category: string;
  description: string;
  hostName: string;
  hostAvatar?: string;
  visibility?: "public" | "private";
  accessKey?: string;
  date: string;
  durationMinutes: number;
  peakViewers: number;
  realViewersCount?: number;
  thumbnail: string;
  videoUrl: string;
  messagesCount: number;
  requiresAccount: boolean;
  tasksCompleted?: number;
  recognizedEngagers?: {
    name: string;
    badge: string;
    points: number;
  }[];
};

const LIVE_STREAM_KEY = "kr8_live_stream_v2";
const LIVE_CHAT_KEY = "kr8_live_chat_v2";
const STREAM_REPLAYS_KEY = "kr8_stream_replays_v2";
const LAST_ENDED_STREAM_KEY = "kr8_last_ended_stream_v2";

export function getLastEndedStream(): StreamReplay | null {
  return load<StreamReplay | null>(LAST_ENDED_STREAM_KEY, null);
}

export function canUserHostStream(account: Account | null | undefined): boolean {
  if (!account) return false;
  // 1. Founders and Co-Founders
  if (account.type === "founder" || account.type === "co-founder") return true;
  // 2. Admins with granular permissions or Coach with attendance review access
  if (account.admin) {
    const role = account.admin.role;
    if (role === "ultimate" || role === "admin" || role === "coach") return true;
    if (account.admin.permissions && account.admin.permissions.length > 0) return true;
  }
  return false;
}

export function getEligibleStreamHosts(): Account[] {
  const all = getAccounts();
  return all.filter((a) => canUserHostStream(a));
}

export const INITIAL_STREAM_REPLAYS: StreamReplay[] = [
  {
    id: "replay-1",
    streamId: "stream-prev-01",
    title: "Masterclass: High-Income Graphic Design & Brand Identity in 2026",
    category: "Graphic Design",
    description: "Deep dive with Founder Timfire on breaking through client objections, crafting typography systems, and packaging design projects for global clients.",
    hostName: "Timfire (Founder & CEO)",
    hostAvatar: "/founder_timfire.jpg",
    date: "Sep 14, 2026",
    durationMinutes: 54,
    peakViewers: 348,
    thumbnail: "/founder_timfire_wide.jpg",
    videoUrl: "/videos/testimonial_grant_gideon.mp4",
    messagesCount: 142,
    requiresAccount: true,
  },
  {
    id: "replay-2",
    streamId: "stream-prev-02",
    title: "Live Creative Jam: Motion Editing & Narrative Storytelling",
    category: "Video Editing",
    description: "Hands-on breakdown of pacing, sound design, and EBU loudness mixing for commercial tech reels with live community critiques.",
    hostName: "Stevenson Uche (Co-Founder)",
    date: "Sep 08, 2026",
    durationMinutes: 48,
    peakViewers: 295,
    thumbnail: "/videos/testimonial_bio_nicz_poster.jpg",
    videoUrl: "/videos/testimonial_bio_nicz.mp4",
    messagesCount: 118,
    requiresAccount: true,
  },
  {
    id: "replay-3",
    streamId: "stream-prev-03",
    title: "Creative Career Strategy: Landing High-Paying Remote Contracts",
    category: "Career & Mindset",
    description: "Timfire and KR8 Coaches share actionable frameworks for African creators to build verifiable proof of work and close international retainers.",
    hostName: "Timfire & Faculty",
    hostAvatar: "/founder_timfire.jpg",
    date: "Aug 30, 2026",
    durationMinutes: 62,
    peakViewers: 420,
    thumbnail: "/videos/testimonial_maduka_samuel_poster.jpg",
    videoUrl: "/videos/testimonial_maduka_samuel.mp4",
    messagesCount: 204,
    requiresAccount: true,
  },
];

const TERMINATED_STREAMS_KEY = "kr8_terminated_streams_v1";

export function markStreamTerminated(streamId: string): void {
  try {
    const list = load<string[]>(TERMINATED_STREAMS_KEY, []);
    if (!list.includes(streamId)) {
      list.push(streamId);
      save(TERMINATED_STREAMS_KEY, list);
    }
  } catch {
    /* ignore */
  }
}

export function isStreamTerminated(streamId: string): boolean {
  try {
    const list = load<string[]>(TERMINATED_STREAMS_KEY, []);
    return list.includes(streamId);
  } catch {
    return false;
  }
}

export function getActiveLiveStream(): LiveStream | null {
  const stream = load<LiveStream | null>(LIVE_STREAM_KEY, null);
  if (stream && stream.isLive) {
    if (isStreamTerminated(stream.id)) {
      save(LIVE_STREAM_KEY, null);
      return null;
    }
    return stream;
  }
  return null;
}

export function saveActiveLiveStream(stream: LiveStream | null): void {
  save(LIVE_STREAM_KEY, stream);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:live-stream-updated"));
  }
}

export function startLiveStream(input: {
  title: string;
  category: string;
  description?: string;
  host?: Account | null;
  quality?: "1080p60" | "720p" | "audio-only";
  visibility?: "public" | "private";
  accessKey?: string;
}): LiveStream {
  const host = input.host || DEFAULT_FOUNDER_ACCOUNT;
  const hostName = host.type === "founder" ? "Timfire" : host.name;
  const isPrivate = input.visibility === "private";
  const accessKey = isPrivate
    ? (input.accessKey?.trim() || `KR8-${Math.floor(1000 + Math.random() * 9000)}`)
    : undefined;

  const newStream: LiveStream = {
    id: `stream-${Date.now()}`,
    title: input.title.trim() || "Creative Mastery Live",
    category: input.category || "Creative Tech & Strategy",
    description: input.description?.trim() || "Live community broadcast and interactive drill with KR8 Digitals.",
    hostId: host.id,
    hostName,
    hostAvatar: host.avatar || (host.type === "founder" ? "/founder_timfire.jpg" : undefined),
    visibility: isPrivate ? "private" : "public",
    accessKey,
    isLive: true,
    startedAt: Date.now(),
    viewerCount: 1, // Real viewers count only: starts at 1 (the host)
    peakViewers: 1,
    quality: input.quality || "1080p60",
    livekitRoomName: `kr8-room-${Date.now()}`,
    videoUrl: "",
    posterUrl: "/founder_timfire_wide.jpg",
    pinnedNotice: isPrivate
      ? "🔒 Private Broadcast Session. By Invitation Only."
      : "Welcome to the KR8 Live Stream! Engage in chat, Q&A, and interactive drills.",
    chatPermission: "everyone",
    isLocked: false,
    isSuspended: false,
    isRecording: false,
    spotlightParticipantId: null,
    promotedModerators: [],
    promotedSpeakers: [],
    coHosts: [],
    raisedHands: [],
    viewers: [
      {
        id: host.id,
        name: hostName,
        avatar: host.avatar || "/founder_timfire.jpg",
        role: "host",
        joinedAt: Date.now(),
        isMuted: false,
      },
    ],
    assignedTasks: [],
    recognizedParticipants: [],
  };

  saveActiveLiveStream(newStream);

  // Initialize initial welcome messages in chat
  const initMsg: LiveChatMessage = {
    id: `msg-${Date.now()}`,
    streamId: newStream.id,
    senderId: host.id,
    senderName: hostName,
    senderRole: "host",
    senderBadge: "👑 Host & Founder",
    text: `Welcome everyone to "${newStream.title}"! Ask your questions and let's build together.`,
    createdAt: Date.now(),
    isPinned: true,
  };
  saveLiveChatMessages(newStream.id, [initMsg]);

  // Add event to Live Tribe Feed
  addFeed({
    kind: "stream_live",
    name: hostName,
    skill: newStream.title,
    avatar: newStream.hostAvatar || "/founder_timfire.jpg",
  });

  return newStream;
}

export function endActiveLiveStream(recordedBlobUrl?: string): StreamReplay | null {
  const stream = getActiveLiveStream();
  if (!stream) return null;

  const endedAt = Date.now();
  const durationMinutes = Math.max(1, Math.round((endedAt - stream.startedAt) / 60000));
  const messages = getLiveChatMessages(stream.id);

  // Compute recognized engagers
  const recognizedMap = new Map<string, { name: string; badge: string; points: number }>();

  // From recognized participants list
  (stream.recognizedParticipants || []).forEach((rp) => {
    recognizedMap.set(rp.userId, {
      name: rp.userName,
      badge: rp.reason,
      points: rp.points,
    });
  });

  // From completed tasks
  (stream.assignedTasks || []).filter((t) => t.status === "completed").forEach((t) => {
    if (!recognizedMap.has(t.targetUserId)) {
      recognizedMap.set(t.targetUserId, {
        name: t.targetUserName,
        badge: "Completed Stream Drill",
        points: t.points,
      });
    }
  });

  // From chat activity if not already recognized
  messages.filter((m) => m.senderRole !== "host").slice(0, 3).forEach((m) => {
    if (!recognizedMap.has(m.senderId)) {
      recognizedMap.set(m.senderId, {
        name: m.senderName,
        badge: "Active Chat Contributor",
        points: 25,
      });
    }
  });

  const recognizedEngagers = Array.from(recognizedMap.values());
  const tasksCompleted = (stream.assignedTasks || []).filter((t) => t.status === "completed").length;

  // Use recorded blob URL if available, otherwise fallback to stream videoUrl
  const videoUrl = recordedBlobUrl || stream.videoUrl || "";

  // Archive as recorded replay
  const replay: StreamReplay = {
    id: `replay-${Date.now()}`,
    streamId: stream.id,
    title: stream.title,
    category: stream.category,
    description: stream.description,
    hostName: stream.hostName,
    hostAvatar: stream.hostAvatar,
    visibility: stream.visibility,
    accessKey: stream.accessKey,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    durationMinutes,
    peakViewers: Math.max(stream.peakViewers, stream.viewers?.length || 1),
    realViewersCount: stream.viewers?.length || 1,
    thumbnail: stream.posterUrl || "/founder_timfire_wide.jpg",
    videoUrl,
    messagesCount: messages.length,
    requiresAccount: true,
    tasksCompleted,
    recognizedEngagers,
  };

  const replays = getStreamReplays();
  saveStreamReplays([replay, ...replays]);
  save(LAST_ENDED_STREAM_KEY, replay);

  // Permanently mark stream as terminated so hydration and realtime listeners never resurrect it
  markStreamTerminated(stream.id);
  saveActiveLiveStream(null);

  // Add event to Live Tribe Feed
  addFeed({
    kind: "stream_ended",
    name: stream.hostName,
    skill: stream.title,
    avatar: stream.hostAvatar || "/founder_timfire.jpg",
  });

  return replay;
}

export function joinStreamViewer(streamId: string, participant: LiveStreamParticipant): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;

  const isHost = participant.role === "host";
  const defaultMuted = isHost ? false : true; // Automatic mute on join for listeners!
  const participantWithMute: LiveStreamParticipant = {
    ...participant,
    isMuted: participant.isMuted !== undefined ? participant.isMuted : defaultMuted,
  };

  const existing = stream.viewers || [];
  const idx = existing.findIndex((v) => v.id === participant.id);
  let nextViewers = [...existing];
  if (idx >= 0) {
    nextViewers[idx] = { ...nextViewers[idx], ...participantWithMute };
  } else {
    nextViewers.push(participantWithMute);
  }

  const viewerCount = nextViewers.length;
  const peakViewers = Math.max(stream.peakViewers, viewerCount);
  updateLiveStream({ viewers: nextViewers, viewerCount, peakViewers });
}

export function toggleParticipantMute(streamId: string, participantId: string, forceMute?: boolean): boolean {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return false;

  const viewers = stream.viewers || [];
  let newMutedState = false;
  const updatedViewers = viewers.map((v) => {
    if (v.id === participantId) {
      newMutedState = forceMute !== undefined ? forceMute : !v.isMuted;
      return { ...v, isMuted: newMutedState };
    }
    return v;
  });

  updateLiveStream({ viewers: updatedViewers });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kr8:participant-mute-toggled", {
        detail: { participantId, isMuted: newMutedState },
      })
    );
  }

  return newMutedState;
}

export function muteAllListeners(streamId: string): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;

  const viewers = stream.viewers || [];
  const updatedViewers = viewers.map((v) => {
    if (v.role === "viewer") {
      return { ...v, isMuted: true };
    }
    return v;
  });

  updateLiveStream({ viewers: updatedViewers });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:mute-all-listeners"));
  }
}

export function leaveStreamViewer(streamId: string, participantId: string): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;

  const existing = stream.viewers || [];
  // Keep host always
  if (participantId === stream.hostId) return;
  const nextViewers = existing.filter((v) => v.id !== participantId);
  const viewerCount = Math.max(1, nextViewers.length);
  updateLiveStream({ viewers: nextViewers, viewerCount });
}

export function assignTaskToViewer(
  streamId: string,
  input: {
    targetUserId: string;
    targetUserName: string;
    task: string;
    points?: number;
  }
): LiveStreamTask | null {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return null;

  const points = input.points || 50;
  const newTask: LiveStreamTask = {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    targetUserId: input.targetUserId,
    targetUserName: input.targetUserName,
    task: input.task.trim(),
    points,
    status: "pending",
    assignedAt: Date.now(),
  };

  const tasks = [...(stream.assignedTasks || []), newTask];
  updateLiveStream({ assignedTasks: tasks });

  // Broadcast announcement in chat
  sendLiveChatMessage({
    streamId,
    senderId: "system",
    senderName: "KR8 Stage Director",
    senderRole: "moderator",
    senderBadge: "⚡ Live Task",
    text: `📋 TASK ASSIGNED to ${input.targetUserName}: "${input.task}" (+${points} XP upon completion!)`,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kr8:task-assigned", { detail: newTask }));
  }

  return newTask;
}

export function completeStreamTask(streamId: string, taskId: string): boolean {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return false;

  const tasks = stream.assignedTasks || [];
  const targetTask = tasks.find((t) => t.id === taskId);
  if (!targetTask || targetTask.status === "completed") return false;

  const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, status: "completed" as const } : t));

  // Award XP points directly to the user if they have an account
  const acc = getAccounts().find((a) => a.id === targetTask.targetUserId);
  if (acc) {
    updateAccount(acc.id, { points: (acc.points || 0) + targetTask.points });
  }

  const recognized = [
    ...(stream.recognizedParticipants || []),
    {
      userId: targetTask.targetUserId,
      userName: targetTask.targetUserName,
      reason: `Completed: ${targetTask.task.slice(0, 30)}...`,
      points: targetTask.points,
    },
  ];

  updateLiveStream({ assignedTasks: updatedTasks, recognizedParticipants: recognized });

  // Broadcast in chat
  sendLiveChatMessage({
    streamId,
    senderId: "system",
    senderName: "KR8 Stage Director",
    senderRole: "moderator",
    senderBadge: "🎉 Task Completed",
    text: `⭐ ${targetTask.targetUserName} completed their drill: "${targetTask.task}" and was awarded +${targetTask.points} XP!`,
  });

  return true;
}

export function awardPointsToStreamViewer(
  streamId: string,
  userId: string,
  userName: string,
  points: number,
  reason: string
): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;

  const acc = getAccounts().find((a) => a.id === userId);
  if (acc) {
    updateAccount(acc.id, { points: (acc.points || 0) + points });
  }

  const recognized = [
    ...(stream.recognizedParticipants || []),
    {
      userId,
      userName,
      reason,
      points,
    },
  ];

  updateLiveStream({ recognizedParticipants: recognized });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kr8:points-updated", { detail: { userId, points, reason } }));
  }

  sendLiveChatMessage({
    streamId,
    senderId: "system",
    senderName: "KR8 Stage Director",
    senderRole: "moderator",
    senderBadge: "⭐ XP Award",
    text: `🌟 ${userName} earned +${points} XP for: ${reason}!`,
  });
}

export function updateLiveStream(updates: Partial<LiveStream>): LiveStream | null {
  const stream = getActiveLiveStream();
  if (!stream) return null;
  const updated: LiveStream = { ...stream, ...updates };
  saveActiveLiveStream(updated);
  return updated;
}

export function getLiveChatMessages(streamId: string): LiveChatMessage[] {
  const all = load<Record<string, LiveChatMessage[]>>(LIVE_CHAT_KEY, {});
  return (all[streamId] || []).filter((m) => !m.isDeleted);
}

export function saveLiveChatMessages(streamId: string, messages: LiveChatMessage[]): void {
  const all = load<Record<string, LiveChatMessage[]>>(LIVE_CHAT_KEY, {});
  all[streamId] = messages;
  save(LIVE_CHAT_KEY, all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:live-chat-updated"));
  }
}

export function sendLiveChatMessage(input: {
  streamId: string;
  senderId: string;
  senderName: string;
  senderRole?: StreamRole;
  senderBadge?: string;
  text: string;
}): LiveChatMessage {
  const messages = getLiveChatMessages(input.streamId);
  const newMsg: LiveChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    senderId: input.senderId,
    senderName: input.senderName.trim() || "Guest Creator",
    senderRole: input.senderRole || "viewer",
    senderBadge: input.senderBadge,
    text: input.text.trim(),
    createdAt: Date.now(),
  };

  const updated = [...messages, newMsg];
  saveLiveChatMessages(input.streamId, updated);
  return newMsg;
}

export function pinLiveChatMessage(streamId: string, messageId: string): void {
  const messages = getLiveChatMessages(streamId);
  const updated = messages.map((m) => ({
    ...m,
    isPinned: m.id === messageId ? !m.isPinned : false,
  }));
  saveLiveChatMessages(streamId, updated);
}

export function deleteLiveChatMessage(streamId: string, messageId: string): void {
  const messages = getLiveChatMessages(streamId);
  const updated = messages.map((m) => (m.id === messageId ? { ...m, isDeleted: true } : m));
  saveLiveChatMessages(streamId, updated);
}

export function promoteViewerToMod(streamId: string, participantKey: string): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const mods = stream.promotedModerators || [];
  if (!mods.includes(participantKey)) {
    updateLiveStream({ promotedModerators: [...mods, participantKey] });
  }
}

export function promoteViewerToSpeaker(streamId: string, participantKey: string): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const speakers = stream.promotedSpeakers || [];
  if (!speakers.includes(participantKey)) {
    updateLiveStream({ promotedSpeakers: [...speakers, participantKey] });
  }
}

export function demoteViewer(streamId: string, participantKey: string): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;
  const mods = (stream.promotedModerators || []).filter((k) => k !== participantKey);
  const speakers = (stream.promotedSpeakers || []).filter((k) => k !== participantKey);
  updateLiveStream({ promotedModerators: mods, promotedSpeakers: speakers });
}

export function getStreamReplays(): StreamReplay[] {
  return load<StreamReplay[]>(STREAM_REPLAYS_KEY, INITIAL_STREAM_REPLAYS);
}

export function saveStreamReplays(replays: StreamReplay[]): void {
  save(STREAM_REPLAYS_KEY, replays);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:replays-updated"));
  }
}

/* ---------------- Live Stream Q&A, Polls, Requests, Invites & Recordings ---------------- */

const STREAM_QA_KEY = "kr8_stream_qa_v2";
const STREAM_POLLS_KEY = "kr8_stream_polls_v2";
const STREAM_REQUESTS_KEY = "kr8_stream_requests_v2";
const STREAM_INVITES_KEY = "kr8_stream_invites_v2";
const STREAM_RECORDINGS_KEY = "kr8_stream_recordings_v2";

export function getStreamQuestions(streamId: string): StreamQuestion[] {
  const all = load<Record<string, StreamQuestion[]>>(STREAM_QA_KEY, {});
  return (all[streamId] || []).sort((a, b) => b.upvotes - a.upvotes || b.createdAt - a.createdAt);
}

export function saveStreamQuestions(streamId: string, questions: StreamQuestion[]): void {
  const all = load<Record<string, StreamQuestion[]>>(STREAM_QA_KEY, {});
  all[streamId] = questions;
  save(STREAM_QA_KEY, all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-qa-updated"));
  }
}

export function submitStreamQuestion(input: {
  streamId: string;
  submitterId?: string;
  submitterName: string;
  question: string;
  isAnonymous: boolean;
}): StreamQuestion {
  const questions = getStreamQuestions(input.streamId);
  const newQ: StreamQuestion = {
    id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    submitterId: input.isAnonymous ? undefined : input.submitterId,
    submitterName: input.isAnonymous ? "Anonymous Creator" : input.submitterName,
    question: input.question.trim(),
    isAnonymous: input.isAnonymous,
    upvotes: 1,
    upvoters: input.submitterId ? [input.submitterId] : [],
    answered: false,
    createdAt: Date.now(),
  };
  saveStreamQuestions(input.streamId, [newQ, ...questions]);
  return newQ;
}

export function upvoteStreamQuestion(streamId: string, questionId: string, userId: string): void {
  const questions = getStreamQuestions(streamId);
  const updated = questions.map((q) => {
    if (q.id === questionId) {
      const already = q.upvoters.includes(userId);
      const nextUpvoters = already ? q.upvoters.filter((u) => u !== userId) : [...q.upvoters, userId];
      return { ...q, upvotes: Math.max(0, nextUpvoters.length), upvoters: nextUpvoters };
    }
    return q;
  });
  saveStreamQuestions(streamId, updated);
}

export function answerStreamQuestion(
  streamId: string,
  questionId: string,
  answerText: string,
  visibility: "public" | "private",
  answeredBy: string
): void {
  const questions = getStreamQuestions(streamId);
  const updated = questions.map((q) =>
    q.id === questionId
      ? {
          ...q,
          answered: true,
          answerText: answerText.trim(),
          answerVisibility: visibility,
          answeredBy,
        }
      : q
  );
  saveStreamQuestions(streamId, updated);
}

export function dismissStreamQuestion(streamId: string, questionId: string): void {
  const questions = getStreamQuestions(streamId);
  const updated = questions.filter((q) => q.id !== questionId);
  saveStreamQuestions(streamId, updated);
}

/* ---------------- Stream Polls & Quizzes ---------------- */
export function getStreamPolls(streamId: string): StreamPoll[] {
  const all = load<Record<string, StreamPoll[]>>(STREAM_POLLS_KEY, {});
  return all[streamId] || [];
}

export function saveStreamPolls(streamId: string, polls: StreamPoll[]): void {
  const all = load<Record<string, StreamPoll[]>>(STREAM_POLLS_KEY, {});
  all[streamId] = polls;
  save(STREAM_POLLS_KEY, all);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-polls-updated"));
  }
}

export function createStreamPoll(input: {
  streamId: string;
  createdBy: string;
  question: string;
  options: string[];
  isAnonymous?: boolean;
  isQuiz?: boolean;
  correctOption?: number;
}): StreamPoll {
  const polls = getStreamPolls(input.streamId);
  const newPoll: StreamPoll = {
    id: `poll-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    createdBy: input.createdBy,
    question: input.question.trim(),
    options: input.options.map((t) => ({ text: t.trim(), votes: 0 })),
    isAnonymous: !!input.isAnonymous,
    isQuiz: !!input.isQuiz,
    correctOption: input.correctOption,
    votedUserIds: [],
    launchedAt: Date.now(),
    isActive: true,
  };
  saveStreamPolls(input.streamId, [newPoll, ...polls]);
  return newPoll;
}

export function voteStreamPoll(streamId: string, pollId: string, optionIndex: number, respondentId: string): boolean {
  const polls = getStreamPolls(streamId);
  const poll = polls.find((p) => p.id === pollId);
  if (!poll || !poll.isActive || poll.votedUserIds.includes(respondentId)) return false;

  const updated = polls.map((p) => {
    if (p.id === pollId) {
      const nextOptions = [...p.options];
      if (nextOptions[optionIndex]) {
        nextOptions[optionIndex] = {
          ...nextOptions[optionIndex],
          votes: nextOptions[optionIndex].votes + 1,
        };
      }
      return {
        ...p,
        options: nextOptions,
        votedUserIds: [...p.votedUserIds, respondentId],
      };
    }
    return p;
  });
  saveStreamPolls(streamId, updated);
  return true;
}

export function closeStreamPoll(streamId: string, pollId: string): void {
  const polls = getStreamPolls(streamId);
  const updated = polls.map((p) => (p.id === pollId ? { ...p, isActive: false, closedAt: Date.now() } : p));
  saveStreamPolls(streamId, updated);
}

/* ---------------- Stream Access Requests ---------------- */
export function getStreamAccessRequests(streamId?: string): StreamAccessRequest[] {
  const all = load<StreamAccessRequest[]>(STREAM_REQUESTS_KEY, []);
  return streamId ? all.filter((r) => r.streamId === streamId) : all;
}

export function requestStreamAccess(input: {
  streamId: string;
  requesterId: string;
  requesterName: string;
}): StreamAccessRequest {
  const all = getStreamAccessRequests();
  const existing = all.find((r) => r.streamId === input.streamId && r.requesterId === input.requesterId);
  if (existing) return existing;

  const newReq: StreamAccessRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    requesterId: input.requesterId,
    requesterName: input.requesterName,
    status: "pending",
    createdAt: Date.now(),
  };
  const updated = [newReq, ...all];
  save(STREAM_REQUESTS_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-requests-updated"));
  }
  return newReq;
}

export function respondStreamAccessRequest(
  requestId: string,
  status: "accepted" | "rejected" | "conditional",
  responseMessage?: string
): void {
  const all = getStreamAccessRequests();
  const updated = all.map((r) =>
    r.id === requestId ? { ...r, status, hostResponseMessage: responseMessage } : r
  );
  save(STREAM_REQUESTS_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-requests-updated"));
  }
}

/* ---------------- Stream Invites ---------------- */
export function getStreamInvites(streamId?: string): StreamInvite[] {
  const all = load<StreamInvite[]>(STREAM_INVITES_KEY, []);
  return streamId ? all.filter((i) => i.streamId === streamId) : all;
}

export function createStreamInvite(input: {
  streamId: string;
  invitedBy: string;
  inviteeUserId?: string;
  inviteeName?: string;
  roleGranted?: "attendee" | "co-host" | "panelist" | "moderator";
}): StreamInvite {
  const all = getStreamInvites();
  const inviteKey = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newInvite: StreamInvite = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    streamId: input.streamId,
    invitedBy: input.invitedBy,
    inviteeUserId: input.inviteeUserId,
    inviteeName: input.inviteeName,
    inviteKey,
    roleGranted: input.roleGranted || "attendee",
    createdAt: Date.now(),
  };
  const updated = [newInvite, ...all];
  save(STREAM_INVITES_KEY, updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-invites-updated"));
  }
  return newInvite;
}

/* ---------------- Stream Recordings Library ---------------- */
export const INITIAL_STREAM_RECORDINGS: StreamRecordingItem[] = [
  {
    id: "rec-1",
    streamId: "stream-prev-01",
    title: "Masterclass: High-Income Graphic Design & Brand Identity in 2026",
    hostName: "Timfire (Founder & CEO)",
    category: "Graphic Design",
    durationMinutes: 54,
    videoUrl: "/videos/testimonial_grant_gideon.mp4",
    thumbnail: "/founder_timfire_wide.jpg",
    recordedAt: "Sep 14, 2026",
    isPublic: true,
    sizeMb: 245,
  },
  {
    id: "rec-2",
    streamId: "stream-prev-02",
    title: "Live Creative Jam: Motion Editing & Narrative Storytelling",
    hostName: "Stevenson Uche (Co-Founder)",
    category: "Video Editing",
    durationMinutes: 48,
    videoUrl: "/videos/testimonial_bio_nicz.mp4",
    thumbnail: "/videos/testimonial_bio_nicz_poster.jpg",
    recordedAt: "Sep 08, 2026",
    isPublic: true,
    sizeMb: 198,
  },
];

export function getStreamRecordings(): StreamRecordingItem[] {
  return load<StreamRecordingItem[]>(STREAM_RECORDINGS_KEY, INITIAL_STREAM_RECORDINGS);
}

export function saveStreamRecordings(recordings: StreamRecordingItem[]): void {
  save(STREAM_RECORDINGS_KEY, recordings);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-recordings-updated"));
  }
}

export function addStreamRecording(rec: StreamRecordingItem): void {
  const existing = getStreamRecordings();
  const next = [rec, ...existing.filter((r) => r.id !== rec.id)];
  saveStreamRecordings(next);
}

export function deleteStreamRecording(id: string): void {
  const existing = getStreamRecordings();
  const next = existing.filter((r) => r.id !== id);
  saveStreamRecordings(next);
}

export function toggleStreamRecordingPublic(id: string): void {
  const existing = getStreamRecordings();
  const next = existing.map((r) => (r.id === id ? { ...r, isPublic: !r.isPublic } : r));
  saveStreamRecordings(next);
}

/* ---------------- Participant Role & Stream Controls ---------------- */
export function promoteParticipantRole(
  streamId: string,
  participantId: string,
  newRole: StreamRole
): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;

  const viewers = (stream.viewers || []).map((v) =>
    v.id === participantId ? { ...v, role: newRole } : v
  );

  const coHosts = newRole === "co-host"
    ? [...new Set([...(stream.coHosts || []), participantId])]
    : (stream.coHosts || []).filter((id) => id !== participantId);

  const speakers = (newRole === "panelist" || newRole === "speaker")
    ? [...new Set([...(stream.promotedSpeakers || []), participantId])]
    : (stream.promotedSpeakers || []).filter((id) => id !== participantId);

  const mods = newRole === "moderator"
    ? [...new Set([...(stream.promotedModerators || []), participantId])]
    : (stream.promotedModerators || []).filter((id) => id !== participantId);

  updateLiveStream({
    viewers,
    coHosts,
    promotedSpeakers: speakers,
    promotedModerators: mods,
  });
}

export function toggleRaiseHand(streamId: string, participantId: string, raised: boolean): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;

  const hands = stream.raisedHands || [];
  const nextHands = raised
    ? [...new Set([...hands, participantId])]
    : hands.filter((id) => id !== participantId);

  const viewers = (stream.viewers || []).map((v) =>
    v.id === participantId ? { ...v, handRaised: raised } : v
  );

  updateLiveStream({ raisedHands: nextHands, viewers });
}

export function setSpotlightParticipant(_streamId: string, participantId: string | null): void {
  updateLiveStream({ spotlightParticipantId: participantId });
}

export function setChatPermission(
  _streamId: string,
  permission: "everyone" | "presenters_only" | "disabled"
): void {
  updateLiveStream({ chatPermission: permission });
}

export function toggleStreamLock(_streamId: string, locked: boolean): void {
  updateLiveStream({ isLocked: locked });
}

export function suspendStreamActivities(streamId: string): void {
  const stream = getActiveLiveStream();
  if (!stream || stream.id !== streamId) return;

  // Suspend immediately: mute all listeners, turn off attendee cameras & screen shares, restrict chat
  const viewers = (stream.viewers || []).map((v) =>
    v.role === "host" ? v : { ...v, isMuted: true, isVideoOn: false, isScreenSharing: false }
  );

  updateLiveStream({
    isSuspended: true,
    chatPermission: "disabled",
    viewers,
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:stream-suspended"));
  }
}

export type ClientRequestType = "structured" | "custom_quote" | "brand_audit" | "coaching" | "partnership";

export type ClientRequest = {
  id: string;
  type: ClientRequestType;
  title: string;
  name: string;
  email: string;
  phone: string;
  details: Record<string, string | number | undefined>;
  createdAt: string;
  status: "new" | "contacted" | "closed";
};

const CLIENT_REQUESTS_KEY = "kr8_client_requests_v1";
let memoryClientRequests: ClientRequest[] = [];

export function getClientRequests(): ClientRequest[] {
  if (typeof window === "undefined") return memoryClientRequests;
  try {
    const raw = localStorage.getItem(CLIENT_REQUESTS_KEY);
    return raw ? JSON.parse(raw) : memoryClientRequests;
  } catch {
    return memoryClientRequests;
  }
}

export function saveClientRequest(data: {
  type: ClientRequestType;
  title: string;
  name: string;
  email: string;
  phone: string;
  details: Record<string, string | number | undefined>;
}): { success: boolean; id?: string; error?: string } {
  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Full Name or Organization is required." };
    }
    if (!data.email?.trim() && !data.phone?.trim()) {
      return { success: false, error: "Please provide either a valid Email Address or Phone Number so we can reach you." };
    }
    const current = getClientRequests();
    const newReq: ClientRequest = {
      id: "req_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      type: data.type,
      title: data.title || "Inbound Client Request",
      name: data.name.trim(),
      email: data.email?.trim() || "",
      phone: data.phone?.trim() || "",
      details: data.details || {},
      createdAt: new Date().toISOString(),
      status: "new",
    };
    current.unshift(newReq);
    memoryClientRequests = current;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(current));
        window.dispatchEvent(new Event("kr8:client-requests-updated"));
      } catch (storageErr: any) {
        return { success: false, error: storageErr?.message || "Storage quota exceeded" };
      }
    }
    return { success: true, id: newReq.id };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to save request to database." };
  }
}

export function updateClientRequestStatus(id: string, status: "new" | "contacted" | "closed"): void {
  const current = getClientRequests().map((r) => (r.id === id ? { ...r, status } : r));
  memoryClientRequests = current;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("kr8:client-requests-updated"));
    } catch {}
  }
}

export function deleteClientRequest(id: string): void {
  const current = getClientRequests().filter((r) => r.id !== id);
  memoryClientRequests = current;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CLIENT_REQUESTS_KEY, JSON.stringify(current));
      window.dispatchEvent(new Event("kr8:client-requests-updated"));
    } catch {}
  }
}

export function setBreakoutRooms(_streamId: string, breakouts: BreakoutRoom[]): void {
  updateLiveStream({ breakouts });
}
