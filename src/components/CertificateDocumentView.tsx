import { useState, useEffect } from "react";
import type { CertificateRecord, Account } from "../data/store";
import { resolveCertificateImageUrl } from "../utils/certificate";
import Icon from "./Icon";

interface CertificateDocumentViewProps {
  cert: CertificateRecord;
  student?: Account;
  className?: string;
  maxHeight?: string;
  onLoaded?: (imageUrl: string) => void;
}

export default function CertificateDocumentView({
  cert,
  student,
  className = "",
  maxHeight = "400px",
  onLoaded,
}: CertificateDocumentViewProps) {
  const [imageUrl, setImageUrl] = useState<string>(() => {
    if (cert.certificateImageUrl && cert.certificateImageUrl.startsWith("data:image/")) {
      return cert.certificateImageUrl;
    }
    return "";
  });
  const [loading, setLoading] = useState(!imageUrl);

  useEffect(() => {
    let active = true;

    if (cert.certificateImageUrl && cert.certificateImageUrl.startsWith("data:image/")) {
      setImageUrl(cert.certificateImageUrl);
      setLoading(false);
      onLoaded?.(cert.certificateImageUrl);
      return;
    }

    setLoading(true);
    resolveCertificateImageUrl(cert, student)
      .then((url) => {
        if (!active) return;
        setImageUrl(url);
        setLoading(false);
        onLoaded?.(url);
      })
      .catch((err) => {
        console.warn("Failed to resolve certificate image:", err);
        if (!active) return;
        setImageUrl(cert.templateUrl || "/certificates/reusable_completion.png");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cert.id, cert.certificateImageUrl, cert.tier, cert.skill, student?.id]);

  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-xl ${className}`}>
      {loading ? (
        <div className="flex min-h-[260px] w-full flex-col items-center justify-center bg-black/60 p-6 text-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          <p className="text-xs text-[#cabfe0] font-medium">
            Rendering Official KR8 Certificate Document...
          </p>
          <p className="text-[10px] text-[#8a7ba8]">
            Applying Encode Sans Bold typography & dynamic QR verification
          </p>
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={`Official Certificate of ${cert.formattedName || cert.studentName}`}
          className="w-full object-contain transition-opacity duration-300"
          style={{ maxHeight }}
        />
      )}

      {/* FOOTER BAR WITH VERIFICATION BADGE & CERT ID */}
      <div className="p-2.5 bg-black/90 text-center border-t border-white/10 flex items-center justify-between px-4">
        <span className="text-[11px] text-green-300 font-semibold flex items-center gap-1">
          <Icon name="check" size={12} /> Includes verifiable QR code
        </span>
        <span className="text-[11px] font-mono text-pink-400">
          {cert.id}
        </span>
      </div>
    </div>
  );
}
