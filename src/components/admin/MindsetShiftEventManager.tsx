import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_MS_EVENT,
  getMsEvent,
  saveMsEvent,
  type MsEventConfig,
} from "../../data/mindsetShift";
import { saveMediaAsset } from "../../utils/mediaStorage";
import { AssetImage } from "../../lib/msMedia";
import { Card } from "../ui";
import Icon from "../Icon";

/* ------------------------------------------------------------------ */
/* Mindset Shift — event settings (STEP 10)                           */
/*                                                                    */
/* The entire edition config, editable live. Save writes              */
/* kr8:ms-event-updated so the public page re-renders with no deploy. */
/* All fields are admin-managed: nothing here is a hardcoded fact.    */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none";

const MAX_UPLOAD = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type LineList = string[];

function parseLines(v: string): LineList {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parsePairs(v: string): { title: string; text: string }[] {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf("—");
      if (i === -1) return { title: line, text: "" };
      return { title: line.slice(0, i).trim(), text: line.slice(i + 1).trim() };
    });
}

function parseTopics(v: string): { title: string; text: string; icon: string }[] {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      // "icon | Title — text" (icon optional)
      const bar = line.indexOf("|");
      if (bar === -1) {
        const p = parsePairs(line)[0] || { title: line, text: "" };
        return { ...p, icon: "spark" };
      }
      const icon = line.slice(0, bar).trim() || "spark";
      const rest = line.slice(bar + 1).trim();
      const p = parsePairs(rest)[0] || { title: rest, text: "" };
      return { ...p, icon };
    });
}

function Section({
  id,
  title,
  hint,
  open = false,
  children,
}: {
  id: string;
  title: string;
  hint?: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details id={id} open={open} className="group rounded-2xl border border-white/10 bg-black/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          {hint && <p className="mt-0.5 text-xs text-[#8d81ab]">{hint}</p>}
        </div>
        <Icon
          name="arrowRight"
          className="h-4 w-4 shrink-0 text-[#8d81ab] transition-transform group-open:rotate-90"
        />
      </summary>
      <div className="border-t border-white/10 px-5 py-5">{children}</div>
    </details>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#cabfe0]">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[#6f6390]">{hint}</p>}
    </div>
  );
}

export default function MindsetShiftEventManager() {
  const [draft, setDraft] = useState<MsEventConfig>(() => getMsEvent());
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => JSON.stringify(getMsEvent()));
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const dirty = JSON.stringify(draft) !== savedSnapshot;

  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  // Live: if the config changes on another device/tab, refresh the draft
  // (unless the admin has unsaved edits).
  useEffect(() => {
    const sync = () => {
      setDraft((d) => {
        if (JSON.stringify(d) !== savedSnapshot) return d; // unsaved edits win
        return getMsEvent();
      });
    };
    window.addEventListener("kr8:ms-event-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("kr8:ms-event-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [savedSnapshot]);

  const patch = (p: Partial<MsEventConfig>) => setDraft((d) => ({ ...d, ...p }));
  const patchSpeaker = (p: Partial<MsEventConfig["speaker"]>) =>
    setDraft((d) => ({ ...d, speaker: { ...d.speaker, ...p } }));
  const patchHost = (p: Partial<MsEventConfig["host"]>) =>
    setDraft((d) => ({ ...d, host: { ...d.host, ...p } }));
  const patchShare = (p: Partial<MsEventConfig["shareCopy"]>) =>
    setDraft((d) => ({ ...d, shareCopy: { ...d.shareCopy, ...p } }));

  const uploadImage = async (file: File | null | undefined, target: "flyer" | "speaker" | "host") => {
    if (!file) return;
    setImageError(null);
    if (!ACCEPTED.includes(file.type)) {
      setImageError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_UPLOAD) {
      setImageError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB — the maximum is 8 MB.`);
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(String(e.target?.result || ""));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      const key = `idb:img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await saveMediaAsset(key, dataUrl);
      if (target === "flyer") patch({ flyer: key });
      else if (target === "speaker") patchSpeaker({ photo: key });
      else patchHost({ photo: key });
      flash(`${target === "flyer" ? "Flyer" : target === "speaker" ? "Speaker photo" : "Host photo"} uploaded — save to apply.`);
    } catch {
      setImageError("We couldn't save that image. Try a smaller file.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (target: "flyer" | "speaker" | "host") => {
    if (target === "flyer") patch({ flyer: "" });
    else if (target === "speaker") patchSpeaker({ photo: "" });
    else patchHost({ photo: "" });
  };

  const save = () => {
    // Validation
    if (!draft.edition.trim()) return setError("Edition is required (e.g. 7.0).");
    if (!draft.theme.trim()) return setError("Theme is required.");
    if (!draft.subtitle.trim()) return setError("Subtitle is required.");
    if (!Number.isInteger(draft.capacity) || draft.capacity < 0)
      return setError("Capacity must be a whole number — 0 means unlimited.");
    const url = draft.whatsappGroupUrl.trim();
    if (url && !/^https?:\/\//i.test(url))
      return setError("WhatsApp group link must start with https:// (leave it empty while the group isn't live).");

    const saved = saveMsEvent({ ...draft, whatsappGroupUrl: url });
    setDraft(saved);
    setSavedSnapshot(JSON.stringify(saved));
    setError(null);
    flash("Event saved — the public page is live.");
  };

  const reset = () => {
    const ok = window.confirm(
      "Reset all event settings to the built-in defaults for this edition?\n\n" +
        "Unsaved edits will be lost. You'll still need to save for it to go live."
    );
    if (!ok) return;
    const def = JSON.parse(JSON.stringify(DEFAULT_MS_EVENT)) as MsEventConfig;
    setDraft(def);
    setError(null);
    flash("Defaults loaded — review and save to apply.");
  };

  const fileInputCls = "block w-full text-xs text-[#8d81ab] file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-white/20";

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Event Settings — Mindset Shift {draft.edition}</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#b8aecf]">
              Everything the public page shows is edited here and goes live on save — no deploy,
              no static duplicates. For the next edition (8.0, 9.0…): change the edition, date,
              flyer, speaker, questions and group, then save.
            </p>
          </div>
          {toast && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-emerald-300">
              <Icon name="check" className="h-4 w-4" />
              {toast}
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {/* ============ 1. Basics & schedule ============ */}
        <Section id="basics" title="Basics & schedule" hint="Identity, date and registration settings" open>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Edition (e.g. 7.0)">
              <input className={inputCls} value={draft.edition} onChange={(e) => patch({ edition: e.target.value })} />
            </Field>
            <Field label="Program name">
              <input className={inputCls} value={draft.programName} onChange={(e) => patch({ programName: e.target.value })} />
            </Field>
            <Field label="Theme (headline)">
              <input className={inputCls} value={draft.theme} onChange={(e) => patch({ theme: e.target.value })} />
            </Field>
            <Field label="Subtitle">
              <input className={inputCls} value={draft.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
            </Field>
            <Field label="Date (display)">
              <input className={inputCls} value={draft.dateLabel} onChange={(e) => patch({ dateLabel: e.target.value })} />
            </Field>
            <Field label="Time (display)">
              <input className={inputCls} value={draft.timeLabel} onChange={(e) => patch({ timeLabel: e.target.value })} />
            </Field>
            <Field label="Location (display)">
              <input className={inputCls} value={draft.locationLabel} onChange={(e) => patch({ locationLabel: e.target.value })} />
            </Field>
            <Field label="Location URL">
              <input className={inputCls} value={draft.locationUrl} onChange={(e) => patch({ locationUrl: e.target.value })} />
            </Field>
            <Field label="Registration deadline (shown while open — blank hides it)">
              <input className={inputCls} value={draft.regDeadlineLabel} onChange={(e) => patch({ regDeadlineLabel: e.target.value })} />
            </Field>
            <Field label="Capacity (0 = unlimited)">
              <input
                className={inputCls}
                type="number"
                min={0}
                step={1}
                value={draft.capacity}
                onChange={(e) => patch({ capacity: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#cabfe0]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-pink-500"
                checked={draft.regOpen}
                onChange={(e) => patch({ regOpen: e.target.checked })}
              />
              Registration is open
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#cabfe0]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-pink-500"
                checked={draft.registrationFree}
                onChange={(e) => patch({ registrationFree: e.target.checked })}
              />
              Registration is free
            </label>
          </div>
        </Section>

        {/* ============ 2. Flyer ============ */}
        <Section id="flyer" title="Flyer" hint="The event's visual anchor — shared by participants">
          <div className="space-y-4">
            {draft.flyer ? (
              <div className="flex flex-wrap items-start gap-4">
                <div className="w-full max-w-xs">
                  <AssetImage src={draft.flyer} alt="Current flyer" className="w-full rounded-xl border border-white/15" loading="eager" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#8d81ab]">
                    {draft.flyer.startsWith("idb:") ? "Stored in the media vault." : "Public / remote URL."}
                  </p>
                  <button
                    onClick={() => removeImage("flyer")}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#cfc4e8] transition hover:bg-white/5"
                  >
                    Remove flyer
                  </button>
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-white/15 py-4 text-center text-xs text-[#8d81ab]">
                No flyer set — the page shows without one until you upload it.
              </p>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={fileInputCls}
              aria-label="Upload flyer"
              onChange={(e) => {
                void uploadImage(e.target.files?.[0], "flyer");
                e.target.value = "";
              }}
            />
          </div>
        </Section>

        {/* ============ 3. Speaker ============ */}
        <Section id="speaker" title="Speaker" hint="Bio and credentials from the speaker's own public sources">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputCls} value={draft.speaker.name} onChange={(e) => patchSpeaker({ name: e.target.value })} />
            </Field>
            <Field label="Role">
              <input className={inputCls} value={draft.speaker.role} onChange={(e) => patchSpeaker({ role: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Tagline (one line under the name)">
                <input className={inputCls} value={draft.speaker.tagline} onChange={(e) => patchSpeaker({ tagline: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Bio">
                <textarea className={`${inputCls} resize-y`} rows={5} value={draft.speaker.bio} onChange={(e) => patchSpeaker({ bio: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Credentials (one per line)">
                <textarea
                  className={`${inputCls} resize-y`}
                  rows={4}
                  value={draft.speaker.credentials.join("\n")}
                  onChange={(e) => patchSpeaker({ credentials: parseLines(e.target.value) })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Portrait">
                <div className="flex flex-wrap items-center gap-4">
                  {draft.speaker.photo ? (
                    <AssetImage src={draft.speaker.photo} alt="Current speaker portrait" className="h-24 w-24 rounded-xl border border-white/15 object-cover" />
                  ) : null}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={fileInputCls}
                    aria-label="Upload speaker portrait"
                    onChange={(e) => {
                      void uploadImage(e.target.files?.[0], "speaker");
                      e.target.value = "";
                    }}
                  />
                  {draft.speaker.photo && (
                    <button
                      onClick={() => removeImage("speaker")}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#cfc4e8] transition hover:bg-white/5"
                    >
                      Remove portrait
                    </button>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </Section>

        {/* ============ 4. Host ============ */}
        <Section id="host" title="Host" hint="Who hosts the conversation">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputCls} value={draft.host.name} onChange={(e) => patchHost({ name: e.target.value })} />
            </Field>
            <Field label="Role">
              <input className={inputCls} value={draft.host.role} onChange={(e) => patchHost({ role: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Bio">
                <textarea className={`${inputCls} resize-y`} rows={3} value={draft.host.bio} onChange={(e) => patchHost({ bio: e.target.value })} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Photo">
                <div className="flex flex-wrap items-center gap-4">
                  {draft.host.photo ? (
                    <AssetImage src={draft.host.photo} alt="Current host photo" className="h-24 w-24 rounded-xl border border-white/15 object-cover" />
                  ) : null}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={fileInputCls}
                    aria-label="Upload host photo"
                    onChange={(e) => {
                      void uploadImage(e.target.files?.[0], "host");
                      e.target.value = "";
                    }}
                  />
                  {draft.host.photo && (
                    <button
                      onClick={() => removeImage("host")}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#cfc4e8] transition hover:bg-white/5"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </Field>
            </div>
          </div>
        </Section>

        {/* ============ 5. Program story & topics ============ */}
        <Section id="story" title="Program story & topics" hint="The narrative sections on the public page">
          <div className="space-y-4">
            <Field label="Story intro">
              <textarea className={`${inputCls} resize-y`} rows={4} value={draft.storyIntro} onChange={(e) => patch({ storyIntro: e.target.value })} />
            </Field>
            <Field label="Story points (one per line: Title — text)">
              <textarea
                className={`${inputCls} resize-y`}
                rows={4}
                value={draft.storyPoints.map((p) => `${p.title} — ${p.text}`).join("\n")}
                onChange={(e) => patch({ storyPoints: parsePairs(e.target.value) })}
              />
            </Field>
            <Field label="Topics (one per line: icon | Title — text)">
              <textarea
                className={`${inputCls} resize-y`}
                rows={5}
                value={draft.topics.map((t) => `${t.icon} | ${t.title} — ${t.text}`).join("\n")}
                onChange={(e) => patch({ topics: parseTopics(e.target.value) })}
              />
            </Field>
            <Field label="Who this is for (one per line)">
              <textarea
                className={`${inputCls} resize-y`}
                rows={4}
                value={draft.audience.join("\n")}
                onChange={(e) => patch({ audience: parseLines(e.target.value) })}
              />
            </Field>
            <Field label="What to expect (one per line)">
              <textarea
                className={`${inputCls} resize-y`}
                rows={3}
                value={draft.expectations.join("\n")}
                onChange={(e) => patch({ expectations: parseLines(e.target.value) })}
              />
            </Field>
          </div>
        </Section>

        {/* ============ 6. Share copy ============ */}
        <Section id="share" title="Share copy" hint="Per-platform captions the participant can copy">
          <div className="space-y-4">
            <Field label="WhatsApp status">
              <textarea className={`${inputCls} resize-y`} rows={3} value={draft.shareCopy.whatsappStatus} onChange={(e) => patchShare({ whatsappStatus: e.target.value })} />
            </Field>
            <Field label="Facebook">
              <textarea className={`${inputCls} resize-y`} rows={4} value={draft.shareCopy.facebook} onChange={(e) => patchShare({ facebook: e.target.value })} />
            </Field>
            <Field label="Instagram">
              <textarea className={`${inputCls} resize-y`} rows={4} value={draft.shareCopy.instagram} onChange={(e) => patchShare({ instagram: e.target.value })} />
            </Field>
            <Field label="X (Twitter)">
              <textarea className={`${inputCls} resize-y`} rows={3} value={draft.shareCopy.x} onChange={(e) => patchShare({ x: e.target.value })} />
            </Field>
            <Field label="LinkedIn">
              <textarea className={`${inputCls} resize-y`} rows={4} value={draft.shareCopy.linkedin} onChange={(e) => patchShare({ linkedin: e.target.value })} />
            </Field>
            <Field label="General (fallback + native share)">
              <textarea className={`${inputCls} resize-y`} rows={3} value={draft.shareCopy.general} onChange={(e) => patchShare({ general: e.target.value })} />
            </Field>
          </div>
        </Section>

        {/* ============ 7. WhatsApp group access ============ */}
        <Section id="whatsapp" title="WhatsApp group access" hint="Admin-managed — never exposed before verification">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3">
              <Icon name="lock" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-xs leading-relaxed text-amber-200/90">
                This link is <span className="font-bold">admin-managed</span>. It is only rendered
                for participants you have personally approved, while the switch below is on — and
                it never appears in the page for anyone else. Update it whenever the group changes.
              </p>
            </div>
            <Field label="WhatsApp group invite link">
              <input
                type="url"
                className={inputCls}
                placeholder="https://chat.whatsapp.com/…"
                value={draft.whatsappGroupUrl}
                onChange={(e) => patch({ whatsappGroupUrl: e.target.value })}
              />
            </Field>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#cabfe0]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-pink-500"
                checked={draft.accessEnabled}
                onChange={(e) => patch({ accessEnabled: e.target.checked })}
              />
              Access is live (approved participants can see the link)
            </label>
          </div>
        </Section>

        {/* ============ 8. Privacy note & SEO ============ */}
        <Section id="privacy" title="Privacy note & SEO" hint="The privacy promise and the search/social head">
          <div className="space-y-4">
            <Field label="Privacy note (shown near the registration form)">
              <textarea className={`${inputCls} resize-y`} rows={2} value={draft.privacyNote} onChange={(e) => patch({ privacyNote: e.target.value })} />
            </Field>
            <Field label="SEO title">
              <input className={inputCls} value={draft.seoTitle} onChange={(e) => patch({ seoTitle: e.target.value })} />
            </Field>
            <Field label="SEO description">
              <textarea className={`${inputCls} resize-y`} rows={2} value={draft.seoDescription} onChange={(e) => patch({ seoDescription: e.target.value })} />
            </Field>
            <Field label="Event start (ISO 8601 — used for search-result structured data)">
              <input className={inputCls} value={draft.startDate} onChange={(e) => patch({ startDate: e.target.value })} placeholder="2026-10-04T21:00:00+01:00" />
            </Field>
          </div>
        </Section>
      </div>

      {/* Save bar */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            disabled={!dirty && !error}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              dirty ? "bg-pink-500 text-white hover:bg-pink-400" : "bg-white/10 text-[#8d81ab]"
            }`}
          >
            <Icon name="check" className="h-4 w-4" />
            {dirty ? "Save changes (live)" : "Saved"}
          </button>
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-[#cfc4e8] transition hover:bg-white/5">
            Reset to defaults
          </button>
          {dirty && <span className="text-xs font-semibold text-amber-300">Unsaved changes</span>}
          {error && <span className="text-xs font-semibold text-rose-300">{error}</span>}
          {uploading && <span className="text-xs font-semibold text-[#8d81ab]">Saving image…</span>}
          {imageError && <span className="text-xs font-semibold text-rose-300">{imageError}</span>}
        </div>
      </Card>
    </div>
  );
}
