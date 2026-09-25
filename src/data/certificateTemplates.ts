/**
 * KR8 Digitals — Certificate Templates Architecture
 * Strict separation of Certificate of Professionalism and Certificate of Completion.
 * Supports autonomous dynamic certificate generation for all current and future skills.
 */

export type CertificateTier = "Professionalism" | "Completion";

export const ACHIEVEMENT_TEXT: Record<CertificateTier, string> = {
  Professionalism:
    "demonstrating excellence and proficiency in turning client requests into client satisfaction.",
  Completion:
    "gaining hands-on experience in turning client requests into finished designs.",
};

export interface CertificateTemplateConfig {
  skillKey: string;
  tier: CertificateTier;
  templateUrl: string;
  courseName: string;
  achievementText: string;
  isDynamicSkillText?: boolean;
  // Canvas coordinate geometry for text & QR positioning
  geometry: {
    // Underline baseline: Y = 50.7% of height, centered at X = 50.0% of width
    nameCenterRatioX: number; // 0.50
    nameBaselineRatioY: number; // 0.507
    nameMaxRatioWidth: number; // 0.76 (within 10% to 90% boundary)
    // QR code position: bottom-right
    qrBottomRightMarginRatioX: number; // margin from right edge
    qrBottomRightMarginRatioY: number; // margin from bottom edge
    qrRatioWidth: number; // size relative to certificate width
  };
}

export const DYNAMIC_SKILL_NAMES: Record<string, string> = {
  graphic: "Graphic Design",
  video: "Video Editing",
  web: "WordPress Website Development",
  content_creation: "Content Creation",
  smm: "Social Media Management",
  frontend: "Front-End Development",
  uiux: "UI/UX Design",
  coding: "Coding",
  content: "Content Creation & Social Media Management",
  marketing: "Digital Marketing",
};

export function resolveSkillDisplayName(skillKey: string, fallbackName?: string): string {
  if (fallbackName && fallbackName.trim()) return fallbackName.trim();
  const normalized = (skillKey || "").toLowerCase().trim();
  if (DYNAMIC_SKILL_NAMES[normalized]) return DYNAMIC_SKILL_NAMES[normalized];
  // Auto-format kebab/snake case e.g. "ui-ux" -> "UI Ux" or "machine_learning" -> "Machine Learning"
  return normalized
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const CERTIFICATE_TEMPLATES: Record<
  CertificateTier,
  Record<string, { templateUrl: string; courseName: string }>
> = {
  Professionalism: {
    content_creation: {
      templateUrl: "/certificates/professionalism_content_creation.png",
      courseName: "Content Creation",
    },
    video: {
      templateUrl: "/certificates/professionalism_video.png",
      courseName: "Video Editing",
    },
    web: {
      templateUrl: "/certificates/professionalism_web.png",
      courseName: "WordPress Website Development",
    },
    graphic: {
      templateUrl: "/certificates/professionalism_graphic.png",
      courseName: "Graphic Design",
    },
  },
  Completion: {
    content_creation: {
      templateUrl: "/certificates/completion_content_creation.png",
      courseName: "Content Creation",
    },
    video: {
      templateUrl: "/certificates/completion_video.png",
      courseName: "Video Editing",
    },
    web: {
      templateUrl: "/certificates/completion_web.png",
      courseName: "WordPress Website Development",
    },
    graphic: {
      templateUrl: "/certificates/completion_graphic.png",
      courseName: "Graphic Design",
    },
  },
};

/**
 * Returns the exact certificate template configuration for a given skill and tier.
 * Never allows a Completion certificate to use a Professionalism template or vice versa.
 * For existing 4 skills (Graphic Design, Video Editing, Website Development, Content Creation),
 * uses their dedicated pre-baked templates.
 * For ALL future/custom skills added by the administrator (e.g. UI/UX Design, Coding, Front-End Development, SMM, etc.),
 * automatically selects the reusable master template and sets isDynamicSkillText: true.
 */
export function getCertificateTemplate(
  skillKey: string,
  tier: CertificateTier,
  customCourseName?: string
): CertificateTemplateConfig {
  const normalizedKey = (skillKey || "graphic").toLowerCase().trim();
  const tierTemplates = CERTIFICATE_TEMPLATES[tier];

  // Core skills with pre-existing dedicated templates from Drive
  if (tierTemplates[normalizedKey]) {
    const mapped = tierTemplates[normalizedKey];
    return {
      skillKey: normalizedKey,
      tier,
      templateUrl: mapped.templateUrl,
      courseName: customCourseName || mapped.courseName,
      achievementText: ACHIEVEMENT_TEXT[tier],
      isDynamicSkillText: false,
      geometry: {
        nameCenterRatioX: 0.5,
        nameBaselineRatioY: 0.507,
        nameMaxRatioWidth: 0.76,
        qrBottomRightMarginRatioX: 0.045,
        qrBottomRightMarginRatioY: 0.055,
        qrRatioWidth: 0.11,
      },
    };
  }

  // Autonomous reusable dynamic template for all future & custom skills
  const reusableTemplateUrl =
    tier === "Professionalism"
      ? "/certificates/reusable_professionalism.png"
      : "/certificates/reusable_completion.png";

  const resolvedCourseName = resolveSkillDisplayName(normalizedKey, customCourseName);

  return {
    skillKey: normalizedKey,
    tier,
    templateUrl: reusableTemplateUrl,
    courseName: resolvedCourseName,
    achievementText: ACHIEVEMENT_TEXT[tier],
    isDynamicSkillText: true,
    geometry: {
      nameCenterRatioX: 0.5,
      nameBaselineRatioY: 0.507,
      nameMaxRatioWidth: 0.76,
      qrBottomRightMarginRatioX: 0.045,
      qrBottomRightMarginRatioY: 0.055,
      qrRatioWidth: 0.11,
    },
  };
}
