/**
 * KR8 Digitals — Certificate Templates Architecture
 * Strict separation of Certificate of Professionalism and Certificate of Completion.
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
  // Canvas coordinate geometry for text & QR positioning
  geometry: {
    // Underline baseline: Y = 51.0% of height, centered at X = 50.0% of width
    nameCenterRatioX: number; // 0.50
    nameBaselineRatioY: number; // 0.507
    nameMaxRatioWidth: number; // 0.78 (within 10% to 90% boundary)
    // QR code position: bottom-right
    qrBottomRightMarginRatioX: number; // margin from right edge
    qrBottomRightMarginRatioY: number; // margin from bottom edge
    qrRatioWidth: number; // size relative to certificate width
  };
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
    smm: {
      templateUrl: "/certificates/professionalism_content_creation.png",
      courseName: "Social Media Management",
    },
    content: {
      templateUrl: "/certificates/professionalism_content_creation.png",
      courseName: "Content Creation & Social Media Management",
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
    marketing: {
      templateUrl: "/certificates/professionalism_content_creation.png",
      courseName: "Digital Marketing",
    },
  },
  Completion: {
    content_creation: {
      templateUrl: "/certificates/completion_content_creation.png",
      courseName: "Content Creation",
    },
    smm: {
      templateUrl: "/certificates/completion_content_creation.png",
      courseName: "Social Media Management",
    },
    content: {
      templateUrl: "/certificates/completion_content_creation.png",
      courseName: "Content Creation & Social Media Management",
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
    marketing: {
      templateUrl: "/certificates/completion_content_creation.png",
      courseName: "Digital Marketing",
    },
  },
};

/**
 * Returns the exact certificate template configuration for a given skill and tier.
 * Never allows a Completion certificate to use a Professionalism template or vice versa.
 */
export function getCertificateTemplate(
  skillKey: string,
  tier: CertificateTier
): CertificateTemplateConfig {
  const normalizedKey = (skillKey || "graphic").toLowerCase().trim();
  const tierTemplates = CERTIFICATE_TEMPLATES[tier];

  // Direct lookup or fallback to graphic template
  const mapped =
    tierTemplates[normalizedKey] ||
    tierTemplates["graphic"] || {
      templateUrl:
        tier === "Professionalism"
          ? "/certificates/professionalism_graphic.png"
          : "/certificates/completion_graphic.png",
      courseName: "Digital Skills",
    };

  return {
    skillKey: normalizedKey,
    tier,
    templateUrl: mapped.templateUrl,
    courseName: mapped.courseName,
    achievementText: ACHIEVEMENT_TEXT[tier],
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
