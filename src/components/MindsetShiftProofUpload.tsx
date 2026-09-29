import { useEffect, useRef, useState, type DragEvent } from "react";
import { submitMsProof, type MsRegistration } from "../data/mindsetShift";
import { getMediaAsset, saveMediaAsset } from "../utils/mediaStorage";
import Icon from "./Icon";

/* ------------------------------------------------------------------ */
/* Mindset Shift — screenshot proof upload (step 7)                   */
/*                                                                    */
/* Manual verification only: the participant uploads a screenshot of  */
/* their share; a real admin verifies it later (step 8). Nothing is   */
/* auto-approved.                                                     */
/*                                                                    */
/* Upload validation: images only (jpeg/png/webp — HEIC can't be      */
/* decoded by browsers), max 10 MB raw. The image is downscaled to    */
/* <=1400px wide JPEG before storage, so the local record, the media  */
/* vault, and the cloud row all stay comfortably small.               */
/* ------------------------------------------------------------------ */

const MAX_RAW_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_WIDTH = 1400;
const JPEG_QUALITY = 0.82;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

function downscaleImage(dataUrl: string, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl); // can't process — keep original
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function MindsetShiftProofUpload({ registration }: { registration: MsRegistration }) {
  const status = registration.status;
  const canUpload = status === "registered" || status === "needs_resubmission";
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [storedProof, setStoredProof] = useState<string | null>(registration.proofData);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the shown proof in sync (cloud hydration, resubmission).
  useEffect(() => {
    if (registration.proofData) setStoredProof(registration.proofData);
  }, [registration.proofData, registration.id]);

  // Fall back to the media vault if the data URL isn't on this device yet.
  useEffect(() => {
    if (storedProof || !registration.proofKey) return;
    let live = true;
    getMediaAsset(registration.proofKey)
      .then((d) => {
        if (live && d) setStoredProof(d);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [storedProof, registration.proofKey]);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError(
        file.type.startsWith("image/")
          ? "That image format can't be read by browsers — please export it as JPG or PNG and try again."
          : "Please upload a screenshot image (JPG, PNG, or WebP)."
      );
      return;
    }
    if (file.size > MAX_RAW_BYTES) {
      setError(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the maximum is 10 MB. Try a smaller screenshot.`);
      return;
    }
    setProcessing(true);
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(String(e.target?.result || ""));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const compressed = await downscaleImage(raw, MAX_WIDTH, JPEG_QUALITY);
      setPreview(compressed);
    } catch {
      setError("We couldn't read that file. Please try a different screenshot.");
    } finally {
      setProcessing(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    void handleFile(file);
  };

  const onSubmitProof = async () => {
    if (!preview || processing) return;
    setProcessing(true);
    try {
      const idbKey = `idb:img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await saveMediaAsset(idbKey, preview);
      submitMsProof(registration.id, idbKey, preview);
      setPreview(null);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Something went wrong saving your screenshot. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!canUpload && !storedProof) return null;

  const proofLabel =
    status === "access_granted"
      ? "Verified proof"
      : status === "share_submitted"
        ? "Your screenshot (with the team)"
        : status === "needs_resubmission"
          ? "Previous screenshot"
          : "Screenshot";

  return (
    <div className="mt-3">
      {/* Stored proof — shown in every state where one exists (incl.
          the previous shot during resubmission) */}
      {storedProof && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">{proofLabel}</p>
          <img
            src={storedProof}
            alt="Share proof screenshot submitted by you"
            className="mt-2 max-h-64 w-auto rounded-xl border border-white/15"
          />
          {(status === "share_submitted" || status === "access_granted") &&
            registration.proofSubmittedAt && (
              <p className="mt-2 text-xs text-[#8a7ba8]">
                Submitted {new Date(registration.proofSubmittedAt).toLocaleString()}
              </p>
            )}
        </div>
      )}

      {/* Upload control — only while a (re)submission is possible */}
      {canUpload && (
        <>
      <input
        ref={inputRef}
        id="ms-proof-file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Upload screenshot of your share"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="group flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] px-6 py-8 text-center transition-colors hover:border-pink-400/50 hover:bg-pink-500/[0.04]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-pink text-white">
            <Icon name="mobile" size={20} />
          </span>
          <span className="text-sm font-bold text-white">
            {status === "needs_resubmission" ? "Upload a new screenshot" : "Upload your screenshot"}
          </span>
          <span className="text-xs text-[#8a7ba8]">
            Tap to choose, or drag &amp; drop · JPG, PNG or WebP · max 10 MB
          </span>
        </button>
      ) : (
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4">
          <img src={preview} alt="Screenshot preview before submission" className="max-h-64 w-auto rounded-xl" />
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onSubmitProof}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-pink-500/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              <Icon name="check" size={13} />
              {processing ? "Saving…" : "Submit proof"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:border-pink-400/60"
            >
              <Icon name="close" size={13} />
              Choose another
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-2 flex items-start gap-2 text-xs font-medium text-red-400">
          <Icon name="alert" size={13} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
        </>
      )}
    </div>
  );
}
