/**
 * KR8 Digitals — Centralized Dynamic Content Management System (CMS)
 * Enables live, dynamic admin control over headlines, subheadings, paragraphs,
 * CTAs, button labels, links, media, and contact information across every page.
 * 
 * Directly connected to the real website: changing any field in the Admin Dashboard
 * immediately updates the live website view.
 */

export interface SiteContent {
  global: {
    siteName: string;
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    whatsappNumber: string;
    footerText: string;
    copyrightText: string;
    address: string;
    socialLinks: {
      youtube: string;
      tiktok: string;
      instagram: string;
      facebook: string;
      x: string;
      linkedin: string;
    };
  };
  home: {
    heroBadge: string;
    heroHeadline: string;
    heroLine1: string;
    heroLine2: string;
    heroLine3: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    tribeCtaText: string;
    tribeCtaLink: string;
    agencyCtaText: string;
    agencyCtaLink: string;
    projectsDone: number;
    pillarsLabel: string;
    pillarsTitle: string;
    pillarsSub: string;
    pillar1Label: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar2Label: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar3Label: string;
    pillar3Title: string;
    pillar3Desc: string;
    blueprintBadge: string;
    blueprintTitle: string;
    blueprintSub: string;
    blueprintCtaText: string;
    blueprintCtaLink: string;
    agencyEyebrow: string;
    agencyHeadline: string;
    agencyDescription: string;
  };
  academy: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
    primaryCtaText: string;
    secondaryCtaText: string;
  };
  tribe: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
    ctaText: string;
    secondaryCtaText: string;
  };
  agency: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
    primaryCtaText: string;
    secondaryCtaText: string;
  };
  about: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
  };
  partner: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  global: {
    siteName: "KR8 Digitals",
    tagline: "Think It. KR8 It.",
    supportEmail: "kr8digitals01@gmail.com",
    supportPhone: "+234 812 568 7509",
    whatsappNumber: "+2348125687509",
    footerText: "A school. A community. A studio. Turning curious minds into working creators — free training, real belonging, real work.",
    copyrightText: "KR8 Digitals 2026 · Think It. KR8 It.",
    address: "Federal University Dutse (FUD), Dutse, Jigawa State, Nigeria",
    socialLinks: {
      youtube: "https://youtube.com/@kr8digitals",
      tiktok: "https://tiktok.com/@kr8digitals",
      instagram: "https://instagram.com/kr8digitals",
      facebook: "https://facebook.com/kr8digitals",
      x: "https://x.com/kr8digitals",
      linkedin: "https://linkedin.com/company/kr8digitals",
    },
  },
  home: {
    heroBadge: "Unified Creative Institution & Agency",
    heroHeadline: "We Make It Happen.",
    heroLine1: "Learn digital skills free.",
    heroLine2: "Belong and build with our tribe.",
    heroLine3: "Let's bring your brand to life.",
    primaryCtaText: "Start Learning Free",
    primaryCtaLink: "/academy",
    tribeCtaText: "Join the Tribe",
    tribeCtaLink: "/tribe",
    agencyCtaText: "Hire the Agency",
    agencyCtaLink: "/agency",
    projectsDone: 120,
    pillarsLabel: "One platform, three pillars",
    pillarsTitle: "Learn. Belong. Build.",
    pillarsSub: "Academy, Tribe and Agency — one unified creative institution.",
    pillar1Label: "The Academy",
    pillar1Title: "Zero Tuition. Pure Craft.",
    pillar1Desc: "Intensive week-by-week cohorts in Graphic Design, Web Engineering, and Video Editing. Real tutors, live feedback, verifiable graduation certificates — 100% free.",
    pillar2Label: "The Tribe",
    pillar2Title: "Never Build Alone Again.",
    pillar2Desc: "An unbroken African creative family. Share messy in-progress drafts, find collaborators, exchange paid gigs, and lift each other into high-income careers.",
    pillar3Label: "The Agency",
    pillar3Title: "From Free Classes to Paid Retainers.",
    pillar3Desc: "We engineer brand positioning, conversion websites, and viral short-form video engines for global companies — executed by our vetted senior directors and top graduates.",
    blueprintBadge: "The Blueprint",
    blueprintTitle: "From zero skills to getting paid.",
    blueprintSub: "No tuition ransom. No 4-year theory degrees. A battle-tested path from cracking open design and code tools to billing international clients.",
    blueprintCtaText: "Join the Free Cohort Today →",
    blueprintCtaLink: "/academy",
    agencyEyebrow: "KR8 Creative & Digital Agency",
    agencyHeadline: "Stop Being Invisible. We Turn Brands into Market Leaders.",
    agencyDescription: "Most businesses lose 60%+ of their potential revenue because their visual identity looks amateur, their website fails to convert, or their content gets drowned out by competitors. We engineer your complete brand transformation — positioning you to command premium prices, double your digital visibility, and turn curious visitors into high-ticket clients.",
  },
  academy: {
    heroBadge: "The Academy",
    heroHeadline: "Master high-income craft — completely free.",
    heroSubtitle: "Stop letting expensive bootcamps gatekeep your future. We offer intensive, practical tracks taught by senior practitioners who ship client work every single day. Pick your track, claim your verifiable KR8 ID, and turn your craft into income.",
    primaryCtaText: "Join the Free Cohort →",
    secondaryCtaText: "Verify a Graduate KR8 ID",
  },
  tribe: {
    heroBadge: "The Creative Family",
    heroHeadline: "Isolation Kills Craft. You Never Have to Build Alone.",
    heroSubtitle: "Late nights staring at Figma, Premiere, or VS Code trying to figure it all out alone are over. The KR8 Tribe is an unbroken African creative family of 3,000+ designers, video directors, web developers, and founders. We share raw drafts, swap paid gigs, review portfolios with zero ego, and lift each other into financial freedom.",
    ctaText: "Join the Tribe (100% Free) →",
    secondaryCtaText: "Read Community Stories",
  },
  agency: {
    heroBadge: "Strategic Growth & Digital Agency",
    heroHeadline: "We Don't Just Design. We Re-Engineer How Clients See and Pay You.",
    heroSubtitle: "Most businesses look like ten other competitors in their industry. KR8 Agency breaks that cycle. We combine category-defining brand strategy, high-speed digital architecture, and algorithm-engineered video to make your business unmistakable and scale your revenue.",
    primaryCtaText: "Book a Free Brand Audit →",
    secondaryCtaText: "Start a Project",
  },
  about: {
    heroBadge: "Our Mission & Manifesto",
    heroHeadline: "Raw African Talent Is Everywhere. Access Is Not.",
    heroSubtitle: "KR8 Digitals was forged to kill the predatory paywalls and gatekeeping of the tech and creative economy. We believe world-class education should be free, community should feel like family, and high-income skills should translate directly into economic independence.",
  },
  partner: {
    heroBadge: "Official Partnership Proposition",
    heroHeadline: "Turn Raw African Potential Into Economic Sovereignty.",
    heroSubtitle: "Millions of brilliant young minds across Africa want to work, create, and build. What stands between them and high-income digital careers isn't lack of intelligence—it is access to structured training, hardware, and client opportunities.",
  },
};

const CMS_STORAGE_KEY = "kr8_cms_content_v2";

let memoryCms: SiteContent | null = null;

function sanitizeSection<T extends Record<string, any>>(userObj: Partial<T> | undefined, defaultObj: T): T {
  if (!userObj) return { ...defaultObj };
  const result: any = { ...defaultObj };
  for (const key in defaultObj) {
    const val = userObj[key];
    if (typeof defaultObj[key] === "string") {
      result[key] = (typeof val === "string" && val.trim().length > 0) ? val : defaultObj[key];
    } else if (typeof defaultObj[key] === "number") {
      result[key] = (typeof val === "number" && !isNaN(val)) ? val : defaultObj[key];
    } else if (typeof defaultObj[key] === "object" && defaultObj[key] !== null) {
      result[key] = { ...defaultObj[key], ...(val || {}) };
    } else {
      result[key] = val !== undefined ? val : defaultObj[key];
    }
  }
  return result as T;
}

export function getSiteContent(): SiteContent {
  if (memoryCms) return memoryCms;
  if (typeof window === "undefined") return DEFAULT_SITE_CONTENT;

  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) {
      memoryCms = DEFAULT_SITE_CONTENT;
      return memoryCms;
    }
    const parsed = JSON.parse(raw);
    // Deep merge and sanitize with defaults to ensure all keys exist and empty fields never break layout
    memoryCms = {
      global: sanitizeSection(parsed.global, DEFAULT_SITE_CONTENT.global),
      home: sanitizeSection(parsed.home, DEFAULT_SITE_CONTENT.home),
      academy: sanitizeSection(parsed.academy, DEFAULT_SITE_CONTENT.academy),
      agency: sanitizeSection(parsed.agency, DEFAULT_SITE_CONTENT.agency),
      tribe: sanitizeSection(parsed.tribe, DEFAULT_SITE_CONTENT.tribe),
      partner: sanitizeSection(parsed.partner, DEFAULT_SITE_CONTENT.partner),
      about: sanitizeSection(parsed.about, DEFAULT_SITE_CONTENT.about),
    };
    return memoryCms;
  } catch {
    memoryCms = DEFAULT_SITE_CONTENT;
    return memoryCms;
  }
}

export function saveSiteContent(patch: Partial<SiteContent>): SiteContent {
  const current = getSiteContent();
  const updated: SiteContent = {
    global: patch.global ? { ...current.global, ...patch.global } : current.global,
    home: patch.home ? { ...current.home, ...patch.home } : current.home,
    academy: patch.academy ? { ...current.academy, ...patch.academy } : current.academy,
    agency: patch.agency ? { ...current.agency, ...patch.agency } : current.agency,
    tribe: patch.tribe ? { ...current.tribe, ...patch.tribe } : current.tribe,
    partner: patch.partner ? { ...current.partner, ...patch.partner } : current.partner,
    about: patch.about ? { ...current.about, ...patch.about } : current.about,
  };

  memoryCms = updated;

  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(updated));
      
      // Also sync heroHeadline and projectsDone to homepageSettings for full cross-compatibility
      if (patch.home?.heroHeadline !== undefined || patch.home?.projectsDone !== undefined) {
        try {
          const rawHp = localStorage.getItem("kr8_homepage_settings_v3");
          const hp = rawHp ? JSON.parse(rawHp) : {};
          if (patch.home.heroHeadline !== undefined) hp.heroHeadline = patch.home.heroHeadline;
          if (patch.home.projectsDone !== undefined) hp.projectsDone = patch.home.projectsDone;
          localStorage.setItem("kr8_homepage_settings_v3", JSON.stringify(hp));
          window.dispatchEvent(new Event("kr8:homepage-settings-updated"));
        } catch {
          /* ignore */
        }
      }

      window.dispatchEvent(new Event("kr8:cms-updated"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch {
    /* ignore storage errors */
  }

  return updated;
}

export function resetSiteContent(): SiteContent {
  memoryCms = DEFAULT_SITE_CONTENT;
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CMS_STORAGE_KEY);
      window.dispatchEvent(new Event("kr8:cms-updated"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_SITE_CONTENT;
}
