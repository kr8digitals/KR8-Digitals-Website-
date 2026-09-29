import { useState } from "react";
import type { MsEventConfig } from "../data/mindsetShift";
import type { IconName } from "./Icon";
import Icon from "./Icon";

/* ------------------------------------------------------------------ */
/* Mindset Shift — share experience (step 6)                          */
/*                                                                    */
/* Per-platform share copy comes from the ADMIN-MANAGED event config  */
/* (shareCopy.*). Actions: copy text, open the platform share target, */
/* and the device share sheet when the Web Share API is available.    */
/* The share card is the official flyer (saved by the participant).   */
/* ------------------------------------------------------------------ */

type PlatformKey = "whatsappStatus" | "facebook" | "instagram" | "x" | "linkedin" | "general";

interface PlatformDef {
  key: PlatformKey;
  label: string;
  icon: IconName;
  hint: string;
}

const PLATFORMS: PlatformDef[] = [
  {
    key: "whatsappStatus",
    label: "WhatsApp Status",
    icon: "message",
    hint: "Save the flyer, open WhatsApp → Status → add the image and paste this caption.",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "facebook",
    hint: "Share the event page on Facebook, or copy the caption for your own post.",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "instagram",
    hint: "Open Instagram → New post → add the saved flyer image, then paste this caption.",
  },
  {
    key: "x",
    label: "X (Twitter)",
    icon: "x",
    hint: "Open the X composer with the caption ready, or copy it.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "linkedin",
    hint: "Share the event page on LinkedIn, or copy the caption.",
  },
  {
    key: "general",
    label: "Any platform",
    icon: "share",
    hint: "Plain caption — paste it anywhere (SMS, Discord, TikTok, everywhere).",
  },
];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without the async clipboard API
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const okR = document.execCommand("copy");
      document.body.removeChild(ta);
      return okR;
    } catch {
      return false;
    }
  }
}

function shareTarget(key: PlatformKey, text: string, url: string): string | null {
  const enc = encodeURIComponent;
  switch (key) {
    case "whatsappStatus":
      return `https://wa.me/?text=${enc(text)}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`;
    case "x":
      return `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
    default:
      return null;
  }
}

export default function MindsetShiftSharePanel({ event }: { event: MsEventConfig }) {
  const [platform, setPlatform] = useState<PlatformKey>("whatsappStatus");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const def = PLATFORMS.find((p) => p.key === platform)!;
  const text = (event.shareCopy[platform] || event.shareCopy.general).trim();
  const pageUrl = event.locationUrl || "https://kr8digitals.com/mindset-shift";
  const target = shareTarget(platform, text, pageUrl);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const onCopy = async () => {
    const okc = await copyText(text);
    setCopied(okc);
    setCopyFailed(!okc);
    if (okc) setTimeout(() => setCopied(false), 1800);
    else setTimeout(() => setCopyFailed(false), 2500);
  };

  const onNativeShare = async () => {
    try {
      await navigator.share({ title: event.seoTitle, text: event.shareCopy.general, url: pageUrl });
    } catch {
      /* user dismissed the share sheet — no action */
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
      {/* Platform picker */}
      <div className="hide-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              setPlatform(p.key);
              setCopied(false);
              setCopyFailed(false);
            }}
            aria-pressed={platform === p.key}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors ${
              platform === p.key
                ? "border-pink-400/60 bg-pink-500/15 text-white"
                : "border-white/15 bg-white/[0.03] text-[#b8aecf] hover:border-pink-400/40 hover:text-white"
            }`}
          >
            <Icon name={p.icon} size={14} className={platform === p.key ? "text-[#e79bf0]" : ""} />
            {p.label}
          </button>
        ))}
      </div>

      {/* Caption preview */}
      <pre className="mt-4 max-h-52 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-[#0a0012] p-4 font-sans text-xs leading-relaxed text-[#d5cbe6]">
        {text}
      </pre>

      <p className="mt-3 text-xs leading-relaxed text-[#8a7ba8]">{def.hint}</p>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onCopy}
          className={`inline-flex items-center gap-2 rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/25 transition-transform hover:-translate-y-0.5 ${
            copied ? "opacity-90" : ""
          }`}
        >
          <Icon name={copied ? "check" : "share"} size={13} className={copied ? "text-emerald-300" : ""} />
          {copied ? "Copied" : copyFailed ? "Copy failed — select the text manually" : "Copy text"}
        </button>

        {target && (
          <a
            href={target}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:border-pink-400/60"
          >
            <Icon name={def.icon} size={13} className="text-[#e79bf0]" />
            {platform === "whatsappStatus" ? "Open in WhatsApp" : `Open ${def.label}`}
          </a>
        )}

        {canNativeShare && (
          <button
            type="button"
            onClick={onNativeShare}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:border-pink-400/60"
          >
            <Icon name="share" size={13} className="text-[#e79bf0]" />
            Use device share sheet
          </button>
        )}
      </div>
    </div>
  );
}
