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

const VIP_PHONES = ["+2349043870282", "09043870282"];
const FD_ALLOWED = ["+2349043870282", "09043870282"];

export function isVip(phone: string) {
  return VIP_PHONES.includes(phone.trim());
}
export function fdAllowed(phone: string) {
  return FD_ALLOWED.includes(phone.trim());
}

/* ---------------- Storage helpers ---------------- */
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
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

export const COUNTRIES = [
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "GH", name: "Ghana", dial: "+233" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "CA", name: "Canada", dial: "+1" },
  { code: "AU", name: "Australia", dial: "+61" },
];

export function countryByCode(code: string) {
  return COUNTRIES.find((country) => country.code === code) ?? COUNTRIES[0];
}

export function buildPhone(dial: string, local: string): string {
  const clean = local.replace(/[^0-9]/g, "").replace(/^0+/, "");
  return `${dial}${clean}`;
}

export async function detectCountryCode(): Promise<string> {
  try {
    const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(2500) });
    const data = await response.json() as { country_code?: string };
    return COUNTRIES.some((country) => country.code === data.country_code) ? data.country_code! : "NG";
  } catch {
    return "NG";
  }
}

/* ---------------- Accounts ---------------- */
export type Account = {
  type: "student" | "tribe";
  id: string; // KR8 ID for students; tribe_<n> for tribe members
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
  portfolio?: { type: "image" | "video" | "link"; url: string; title: string }[];
  following?: string[];
  followers?: string[];
  messagePrivacy?: "Anyone" | "Friends only" | "No one";
  password?: string;
  resetCode?: string;
  resetCodeExpires?: number;
  restricted?: boolean;
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

export const ADMIN_PHONE_NUMBERS = [
  "+2348106068523",
  "+2348089344434",
  "+2348125687509",
  "+2348166552758",
];
export const ULTIMATE_ADMIN_EMAILS = ["kr8digitals01@gmail.com", "kutimfire001@gmail.com"];
export const MAIN_ADMIN_PASSWORD = "KR8@Adm!n2026";
export const ADMIN_SECTIONS = ["Home", "Academy", "Agency", "Student Management", "Blog", "Announcements", "Graduation & Certificates", "Leaderboard & XP", "Links Manager", "Payment Settings", "Verify Remarks", "Attendance Review", "Moderation"];

export function randomAdminPassword() {
  return `KR8-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
}

export function adminInfoFor(phone: string, email: string) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);
  const isUltimate = normalizedPhone === "+2348125687509" || normalizedPhone === "+2348166552758" || ULTIMATE_ADMIN_EMAILS.includes(normalizedEmail);
  const isRecognized = isUltimate || ADMIN_PHONE_NUMBERS.includes(normalizedPhone);
  if (!isRecognized) return undefined;
  const adminPassword = isUltimate ? MAIN_ADMIN_PASSWORD : randomAdminPassword();
  return {
    role: isUltimate ? "ultimate" as const : "admin" as const,
    permissions: [...ADMIN_SECTIONS],
    adminPassword,
    passwordNotice: isUltimate ? "Use the main admin password for dashboard access." : `Your unique admin password is ${adminPassword}. Keep it safe.`,
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

// v3 is the durable account namespace. The empty fallback performs the requested
// one-time fresh start; later registrations persist in this stable key.
const ACCOUNT_STORAGE_KEY = "kr8_accounts_v3";
const FEED_STORAGE_KEY = "kr8_feed_v3";
const seed: Account[] = [];

function migrateAccountsSafely() {
  if (typeof window === "undefined") return;
  // If v3 accounts are present, never wipe or overwrite!
  const existingV3 = localStorage.getItem(ACCOUNT_STORAGE_KEY);
  if (existingV3 && existingV3 !== "[]") return;

  // Attempt recovery from backup or earlier versions if v3 is currently empty
  const backup = localStorage.getItem("kr8_accounts_backup");
  if (backup && backup !== "[]") {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, backup);
    return;
  }
  const v2 = localStorage.getItem("kr8_accounts_v2");
  if (v2 && v2 !== "[]") {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, v2);
  }
}

export function getAccounts(): Account[] {
  migrateAccountsSafely();
  const stored = load<Account[]>(ACCOUNT_STORAGE_KEY, seed);
  let changed = false;
  const accounts = stored.map((account) => {
    const recognizedAdmin = account.admin ?? getRecognizedAdmin(account.phone, account.email);
    if (!account.admin && recognizedAdmin) changed = true;
    return {
      ...account,
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
  if (accts.some((s) => normalizeEmail(s.email) === email))
    return { ok: false, error: "This email is already registered." };
  if (accts.some((s) => normalizePhone(s.phone) === phone))
    return { ok: false, error: "This phone number is already registered." };
  if (input.password.trim().length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  const skill = SKILLS.find((s) => s.key === input.skill);
  if (!skill) return { ok: false, error: "Please select a valid skill." };
  if (!skill.available && !fdAllowed(phone))
    return { ok: false, error: `${skill.name} is currently restricted.` };
  if (!getSkillRegistration(input.skill) && !fdAllowed(phone))
    return { ok: false, error: `Registration for ${skill.name} is currently closed.` };

  const serial = nextSerial(input.skill);
  const student: Account = {
    type: "student",
    id: kr8id(input.name, input.skill, serial),
    name: input.name.trim(), email, phone, country: input.country || "NG", skill: input.skill,
    dob: input.dob, year: COHORT_YEAR, serial,
    vip: isVip(phone), points: 0, attendanceAccepted: 0, submissions: 0, referrals: 0,
    graduated: false, certTier: null, avatar: "", joined: Date.now(), expandedVisibility: false, password: input.password,
    admin: getRecognizedAdmin(phone, email),
    isPlaceholder: false, portfolio: [], following: [], followers: [], messagePrivacy: "Anyone",
  };
  accts.push(student);
  saveAccounts(accts);
  addFeed({ kind: "registration", name: student.name, skill: skill.name, avatar: "" });
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
  if (accounts.some((account) => normalizeEmail(account.email) === email)) {
    return { ok: false, error: "This email is already registered." };
  }
  if (accounts.some((account) => normalizePhone(account.phone) === phone)) {
    return { ok: false, error: "This phone number is already registered." };
  }
  const password = input.password?.trim() || "TempChangeMe2026";
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const serial = nextSerial(input.skill);
  const student: Account = {
    type: "student",
    id: kr8id(name, input.skill, serial),
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
    avatar: "",
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
  addFeed({ kind: "registration", name: student.name, skill: skill.name, avatar: "" });
  return { ok: true, student };
}

export function registerTribe(input: { name: string; email: string; phone: string; country: string; password: string }):
  { ok: boolean; error?: string; member?: Account } {
  const accts = getAccounts();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  if (accts.some((s) => normalizeEmail(s.email) === email))
    return { ok: false, error: "This email is already registered." };
  if (accts.some((s) => normalizePhone(s.phone) === phone))
    return { ok: false, error: "This phone number is already registered." };
  if (input.password.trim().length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  const n = accts.filter((a) => a.type === "tribe").length + 1;
  const member: Account = {
    type: "tribe", id: `TRIBE-${String(n).padStart(4, "0")}`,
    name: input.name.trim(), email, phone, country: input.country,
    vip: false, points: 0, attendanceAccepted: 0, submissions: 0, referrals: 0,
    graduated: false, avatar: "", joined: Date.now(), password: input.password, isPlaceholder: false, portfolio: [], following: [], followers: [], messagePrivacy: "Anyone", admin: getRecognizedAdmin(phone, email),
  };
  accts.push(member);
  saveAccounts(accts);
  addFeed({ kind: "tribe", name: member.name, skill: "Tribe Member", avatar: "" });
  return { ok: true, member };
}

export function findStudent(id: string): Account | undefined {
  const normalized = normalizeIdentity(id);
  return getAccounts().find((s) => normalizeIdentity(s.id) === normalized);
}
export function recoverId(query: string): Account | undefined {
  const email = normalizeEmail(query);
  const phone = normalizePhone(query);
  return getAccounts().find((s) => normalizeEmail(s.email) === email || normalizePhone(s.phone) === phone);
}

export function authenticateAccount(idOrEmailOrPhone: string, password: string): { ok: boolean; account?: Account; error?: string } {
  const query = idOrEmailOrPhone.trim();
  if (!query) return { ok: false, error: "Please enter your KR8 ID, email, or phone." };
  let account = findStudent(query);
  if (!account) {
    account = recoverId(query);
  }
  if (!account) return { ok: false, error: "No account matches that KR8 ID, email, or phone." };
  if (!account.password) return { ok: false, error: "This account needs a password reset before it can sign in." };
  if (account.password !== password) return { ok: false, error: "The password entered is incorrect." };
  return { ok: true, account };
}

export function requestPasswordReset(email: string, id: string): { ok: boolean; message: string; code?: string } {
  const account = getAccounts().find((item) => normalizeEmail(item.email) === normalizeEmail(email) && normalizeIdentity(item.id) === normalizeIdentity(id));
  if (!account) return { ok: false, message: "The email and KR8 ID combination could not be verified." };
  const code = String(Math.floor(100000 + Math.random() * 900000));
  updateAccount(account.id, { resetCode: code, resetCodeExpires: Date.now() + 10 * 60 * 1000 });
  // A production deployment should POST this event to the existing Resend server route.
  return { ok: true, message: "A reset code was sent to your registered email.", code };
}

export function completePasswordReset(id: string, code: string, password: string): { ok: boolean; message: string } {
  if (password.trim().length < 6) return { ok: false, message: "Password must be at least 6 characters." };
  const account = findStudent(id);
  if (!account || account.resetCode !== code.trim() || !account.resetCodeExpires || account.resetCodeExpires < Date.now()) return { ok: false, message: "That reset code is invalid or expired." };
  updateAccount(account.id, { password, resetCode: undefined, resetCodeExpires: undefined });
  return { ok: true, message: "Password updated. You can sign in now." };
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
  if (!acc || acc.type !== "student") return { ok: false };
  return { ok: true, account: acc };
}

/* ---------------- Live feed ---------------- */
export type FeedItem = {
  id: string;
  kind: "submission" | "attendance" | "graduation" | "registration" | "tribe" | "blog" | "project";
  name: string; skill: string; avatar: string; ts: number;
};
const feedActions: Record<FeedItem["kind"], string> = {
  submission: "submitted an assignment",
  attendance: "got attendance accepted",
  graduation: "just graduated",
  registration: "joined the Academy",
  tribe: "joined the Tribe",
  blog: "published a new post",
  project: "shipped a client project",
};
export function feedAction(k: FeedItem["kind"]) {
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

export type HomepageSettings = { projectsDone: number };
const HOMEPAGE_SETTINGS_KEY = "kr8_homepage_settings_v1";
export function getHomepageSettings(): HomepageSettings {
  return load(HOMEPAGE_SETTINGS_KEY, { projectsDone: 120 });
}
export function saveHomepageSettings(settings: HomepageSettings) {
  save(HOMEPAGE_SETTINGS_KEY, settings);
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

export const BLOG = [
  { id: "b1", title: "5 Digital Skills Nigerian Employers Are Hiring For in 2026", excerpt: "The market shifted again. Here are the skills turning learners into earners this year.", author: "Timfire", date: "Feb 10, 2026", category: "Digital Skills", readTime: "6 min", img: IMG.student, source: "admin" as const, pinned: true },
  { id: "b2", title: "How KR8 AI Became Every Student's Late-Night Mentor", excerpt: "Inside the always-on assistant helping thousands of creators unblock, plan and ship.", author: "KR8 Team", date: "Feb 05, 2026", category: "AI", readTime: "4 min", img: IMG.collab2, source: "admin" as const, pinned: false },
  { id: "b3", title: "No Status Barriers: Why the Tribe Works", excerpt: "Community isn't a feature — it's the whole point. A look at how belonging drives results.", author: "Amara Okeke", date: "Jan 28, 2026", category: "Community", readTime: "5 min", img: IMG.heroGroup, source: "student" as const, pinned: false },
  { id: "b4", title: "From Free Class to First Client: A Graduate Story", excerpt: "How one video editing student landed paid work three weeks after graduation.", author: "Ngozi Ade", date: "Jan 20, 2026", category: "Company News", readTime: "7 min", img: IMG.collab, source: "student" as const, pinned: false },
];

export function getBlogPosts() {
  return load<typeof BLOG>("kr8_blog_posts_v2", BLOG);
}

export function saveBlogPosts(posts: typeof BLOG) {
  save("kr8_blog_posts_v2", posts);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kr8:blog-updated"));
  }
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
    img: "/videos/testimonial1_poster.jpg",
    video: "/videos/testimonial1.mp4",
    duration: 85,
    createdAt: 1726000000000 + 300000,
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
    img: "/videos/testimonial3_poster.jpg",
    video: "/videos/testimonial3.mp4",
    duration: 40,
    createdAt: 1726000000000 + 200000,
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
    schoolOrRole: "Cohort Graduate",
    skill: "Graphic Design",
    caption: "Zero cost for training, graduation, or certificate. The tutors guided me all the way — invite you all to my graduation!",
    img: "/videos/testimonial2_poster.jpg",
    video: "/videos/testimonial2.mp4",
    duration: 60,
    createdAt: 1726000000000 + 100000,
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
      { start: 56.5, end: 60.0, text: "I'll be very happy to see you all there. Thank you, and have a nice day!" },
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
];

const TESTIMONIAL_KEY = "kr8_testimonials_v4";
const VIDEO_COMMENT_KEY = "kr8_video_comments_v2";

export function getTestimonials(): Testimonial[] {
  const loaded = load<Testimonial[]>(TESTIMONIAL_KEY, REAL_STUDENT_TESTIMONIALS);
  if (!loaded || !loaded.length || !loaded.some((item) => item.video && item.video.includes("testimonial"))) {
    save(TESTIMONIAL_KEY, REAL_STUDENT_TESTIMONIALS);
    return REAL_STUDENT_TESTIMONIALS;
  }
  return loaded.sort((a, b) => b.createdAt - a.createdAt);
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
  return 2480 + getAccounts().filter((account) => account.type === "tribe").length;
}
export function studentCount(): number {
  return 1200 + getStudents().length;
}
