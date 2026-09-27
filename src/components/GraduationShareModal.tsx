import { useState, useEffect } from "react";
import type { CertificateRecord, Account } from "../data/store";
import { generateGraduationShareImage, buildSocialShareLinks } from "../utils/socialShare";
import Icon from "./Icon";
import { GradientButton, GhostButton } from "./ui";

interface GraduationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  cert: CertificateRecord;
  student: Account;
}

export default function GraduationShareModal({
  isOpen,
  onClose,
  cert,
  student,
}: GraduationShareModalProps) {
  const [format, setFormat] = useState<"landscape" | "square">("landscape");
  const [shareImageUrl, setShareImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const links = buildSocialShareLinks({
    student,
    cert,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  });

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);

    generateGraduationShareImage({
      cert,
      student,
      format,
    })
      .then((url) => {
        if (!active) return;
        setShareImageUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Error rendering social share image:", err);
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, cert.id, format, student.id]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(links.verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadImage = () => {
    if (!shareImageUrl) return;
    const a = document.createElement("a");
    a.href = shareImageUrl;
    a.download = `KR8-Graduation-${student.name.replace(/\s+/g, "_")}-${cert.tier}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-[#12001f] shadow-2xl z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400">
              <Icon name="share" className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display font-bold text-white text-base sm:text-lg">
                Share Your <span className="text-gradient">Graduation Milestone</span>
              </h2>
              <p className="text-[11px] text-[#8a7ba8]">
                Broadcast your verified credentials to employers and friends across social media.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[#8a7ba8] hover:bg-white/10 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Format Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">
              Social Card Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormat("landscape")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  format === "landscape"
                    ? "bg-gradient-pink text-white"
                    : "border border-white/15 text-[#8a7ba8] hover:text-white"
                }`}
              >
                16:9 Landscape (LinkedIn / Twitter)
              </button>
              <button
                type="button"
                onClick={() => setFormat("square")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  format === "square"
                    ? "bg-gradient-pink text-white"
                    : "border border-white/15 text-[#8a7ba8] hover:text-white"
                }`}
              >
                1:1 Square (Instagram / Status)
              </button>
            </div>
          </div>

          {/* Image Preview Box */}
          <div className="relative rounded-2xl border border-white/15 bg-black/60 overflow-hidden shadow-xl flex items-center justify-center min-h-[220px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
                <p className="text-xs text-[#cabfe0]">Generating High-Resolution Share Graphic...</p>
              </div>
            ) : shareImageUrl ? (
              <img
                src={shareImageUrl}
                alt="Social Graduation Card"
                className="w-full h-auto object-contain max-h-[380px]"
              />
            ) : (
              <p className="text-xs text-rose-400">Failed to render share preview.</p>
            )}
          </div>

          {/* Action Row 1: Direct Social Buttons */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">
              One-Click Direct Share
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* WhatsApp */}
              <a
                href={links.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                <span>💬</span>
                <span>Share to WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={links.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/[0.1] transition-colors"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
                <span>Share to X / Twitter</span>
              </a>

              {/* LinkedIn */}
              <a
                href={links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600/20 border border-blue-500/40 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-600/30 transition-colors"
              >
                <Icon name="linkedin" className="h-3.5 w-3.5" />
                <span>Share to LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Action Row 2: Verification Link Copy + Image Download */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#b8aecf]">
              Verifiable Link & Graphic Asset
            </span>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                readOnly
                value={links.verifyUrl}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 font-mono text-xs text-pink-300 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                {copiedLink ? "Copied! ✓" : "Copy Link"}
              </button>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-[#8a7ba8]">
                PNG asset contains official KR8 certification seals, student credentials & verification QR code.
              </p>
              <GradientButton
                onClick={handleDownloadImage}
                disabled={!shareImageUrl || loading}
                className="w-full sm:w-auto px-5 py-2 text-xs font-bold shrink-0"
              >
                Download Share Image (PNG) ↓
              </GradientButton>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-white/10 px-6 py-3 bg-white/[0.01]">
          <GhostButton onClick={onClose} className="px-5 py-1.5 text-xs">
            Done
          </GhostButton>
        </div>
      </div>
    </div>
  );
}
