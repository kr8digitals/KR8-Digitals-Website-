/**
 * KR8 Digitals — Centralized Dynamic Content Management System (CMS)
 * Enables live, dynamic admin control over headlines, subheadings, paragraphs,
 * CTAs, button labels, links, media, and contact information across every page.
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
    heroSubheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    statsTrained: string;
    statsProjects: string;
    statsCohorts: string;
    statsSatisfaction: string;
    aboutHeadline: string;
    aboutParagraph1: string;
    aboutParagraph2: string;
    ctaHeadline: string;
    ctaSubtitle: string;
    ctaButtonText: string;
    ctaButtonLink: string;
  };
  academy: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
    applyCtaText: string;
    applyCtaLink: string;
    guaranteeText: string;
  };
  agency: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
    ctaHeadline: string;
    ctaSubtitle: string;
    ctaButtonText: string;
  };
  tribe: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
    ctaText: string;
    communityNotice: string;
  };
  partner: {
    heroBadge: string;
    heroHeadline: string;
    heroSubtitle: string;
    formHeadline: string;
    formSubtitle: string;
  };
  about: {
    heroHeadline: string;
    heroSubtitle: string;
    missionHeadline: string;
    missionText: string;
    visionHeadline: string;
    visionText: string;
    founderQuote: string;
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
    heroBadge: "Tuition-Free Digital Training Cohort 4 Open",
    heroHeadline: "We Turn Hungry Beginners Into Hired Digital Creators.",
    heroSubheadline: "Master high-income digital skills 100% free with world-class mentors, live collaborative projects, and verifiable credentials.",
    primaryCtaText: "Start Learning Free →",
    primaryCtaLink: "/register",
    secondaryCtaText: "Join the Community",
    secondaryCtaLink: "/tribe",
    statsTrained: "2,400+",
    statsProjects: "120+",
    statsCohorts: "Cohort 4 Active",
    statsSatisfaction: "98%",
    aboutHeadline: "Not Another Bootcamp. A Creative Movement.",
    aboutParagraph1: "KR8 Digitals was forged out of a simple, fierce belief: Talent is equally distributed across Africa, but structured opportunity is not. We tore down tuition barriers so anyone with curiosity and dedication can master high-income skills.",
    aboutParagraph2: "Our students do not just watch recorded videos. They build production-grade brand identities, edit viral short-form video reels, deploy full-stack web applications, and launch sustainable digital agencies.",
    ctaHeadline: "Stop Waiting For The 'Right Time'. Build Your Future Today.",
    ctaSubtitle: "100% free tuition. Industry-standard curriculum. Verifiable graduation certificates. Zero excuses.",
    ctaButtonText: "Apply For Free Scholarship →",
    ctaButtonLink: "/register",
  },
  academy: {
    heroBadge: "Hands-on Creative & Technical Training",
    heroHeadline: "Specialized Tracks Designed For Real Industry Demands.",
    heroSubtitle: "Explore our intensive 8-week tracks. Learn from senior practitioners, complete weekly production sprints, and build an undeniable portfolio.",
    applyCtaText: "Enroll In A Track",
    applyCtaLink: "/register",
    guaranteeText: "100% Tuition-Free · Live Mentorship · Verified Graduation Certificate",
  },
  agency: {
    heroBadge: "KR8 Creative & Tech Agency",
    heroHeadline: "We Build High-Converting Brands, Media & Digital Systems.",
    heroSubtitle: "Work directly with elite KR8 alumni and lead directors. From visual identities to full-scale web platforms and commercial video production.",
    ctaHeadline: "Ready To Elevate Your Brand With Top Digital Talent?",
    ctaSubtitle: "Request a discovery call or custom project proposal. Handled end-to-end by experienced directors.",
    ctaButtonText: "Request Client Proposal →",
  },
  tribe: {
    heroBadge: "The Official KR8 Creative Network",
    heroHeadline: "Never Build In Isolation. Welcome To The Tribe.",
    heroSubtitle: "A vibrant continent-wide collective of graphic designers, video editors, web developers, content creators, and digital founders sharing gigs, critiques, and opportunities.",
    ctaText: "Join The Tribe Free →",
    communityNotice: "Connect with over 2,400 ambitious digital creators on WhatsApp, Discord, and Telegram.",
  },
  partner: {
    heroBadge: "Institutional & Corporate Partnerships",
    heroHeadline: "Partner With KR8 Digitals To Empower 10,000 African Creators.",
    heroSubtitle: "Whether sponsoring student cohorts, hiring pre-vetted talent, providing tech hub resources, or delivering executive masterclasses, let's create systemic impact together.",
    formHeadline: "Submit A Partnership Proposal",
    formSubtitle: "Tell us about your organization and how you'd like to collaborate.",
  },
  about: {
    heroHeadline: "Democratizing Digital Excellence Across Africa.",
    heroSubtitle: "From a single room of passionate learners in Dutse to a thriving multi-disciplinary ecosystem turning creative ambition into economic freedom.",
    missionHeadline: "Our Mission",
    missionText: "To eradicate technical and financial barriers to world-class digital skills education, transforming passionate African youth into globally competitive creators, operators, and agency founders.",
    visionHeadline: "Our Vision",
    visionText: "To become Africa's premier tuition-free creative and digital innovation network, deploying 50,000 high-earning digital creators into the global digital economy by 2030.",
    founderQuote: "\"We do not teach digital skills just for certificates. We teach digital skills so an ambitious youth in Dutse, Aba, Lagos, or Nairobi can command global value from their bedroom.\" — Kenneth Timothy Iziogo (Timfire)",
  },
};

const CMS_STORAGE_KEY = "kr8_cms_content_v1";

let memoryCms: SiteContent | null = null;

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
    // Deep merge with defaults to ensure all keys exist even if new fields are added
    memoryCms = {
      global: { ...DEFAULT_SITE_CONTENT.global, ...(parsed.global || {}) },
      home: { ...DEFAULT_SITE_CONTENT.home, ...(parsed.home || {}) },
      academy: { ...DEFAULT_SITE_CONTENT.academy, ...(parsed.academy || {}) },
      agency: { ...DEFAULT_SITE_CONTENT.agency, ...(parsed.agency || {}) },
      tribe: { ...DEFAULT_SITE_CONTENT.tribe, ...(parsed.tribe || {}) },
      partner: { ...DEFAULT_SITE_CONTENT.partner, ...(parsed.partner || {}) },
      about: { ...DEFAULT_SITE_CONTENT.about, ...(parsed.about || {}) },
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

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("kr8:cms-updated"));
    } catch (e) {
      console.warn("Could not write CMS content to localStorage:", e);
    }
  }

  return updated;
}

export function resetSiteContent(): SiteContent {
  memoryCms = DEFAULT_SITE_CONTENT;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONTENT));
      window.dispatchEvent(new Event("kr8:cms-updated"));
    } catch {}
  }
  return DEFAULT_SITE_CONTENT;
}
