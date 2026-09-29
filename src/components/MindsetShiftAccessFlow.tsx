import type { ReactNode } from "react";
import { hasMsAccess, type MsEventConfig, type MsRegistration } from "../data/mindsetShift";
import Icon from "./Icon";
import { AssetImage } from "../lib/msMedia";
import MindsetShiftSharePanel from "./MindsetShiftSharePanel";
import MindsetShiftProofUpload from "./MindsetShiftProofUpload";

/* ------------------------------------------------------------------ */
/* Mindset Shift — post-registration access flow                      */
/*                                                                    */
/* The share-before-WhatsApp journey, rendered live from the          */
/* registration's status:                                             */
/*   registered → share_submitted → access_granted                    */
/*                ↘ rejected / needs_resubmission                     */
/*                                                                    */
/* Step 1 (share) is fully usable here: the participant saves the     */
/* official flyer and posts it. Per-platform share copy and native    */
/* share buttons are added to this same step by the share             */
/* experience step (step 6). Screenshot upload UI lands in step 7;    */
/* the WhatsApp button (from the admin-managed group link) in step 9. */
/* ------------------------------------------------------------------ */

type StepState = "done" | "active" | "pending" | "error";

function StepBadge({ state, index }: { state: StepState; index: number }) {
  if (state === "done") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-pink text-white shadow-md shadow-pink-500/25">
        <Icon name="check" size={17} />
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/50 bg-red-500/10 text-red-300">
        <Icon name="alert" size={17} />
      </span>
    );
  }
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${
        state === "active"
          ? "border-pink-400/70 bg-pink-500/15 text-[#e79bf0] shadow-md shadow-pink-500/20"
          : "border-white/15 bg-white/[0.03] text-[#8a7ba8]"
      }`}
    >
      {state === "pending" ? <Icon name="lock" size={15} /> : index}
    </span>
  );
}

function StepTitle({ state, children }: { state: StepState; children: ReactNode }) {
  return (
    <p
      className={`font-display text-lg font-bold ${
        state === "pending" ? "text-[#8a7ba8]" : state === "error" ? "text-red-300" : "text-white"
      }`}
    >
      {children}
    </p>
  );
}

export default function MindsetShiftAccessFlow({
  registration,
  event,
}: {
  registration: MsRegistration;
  event: MsEventConfig;
}) {
  const status = registration.status;
  const shareState: StepState = status === "registered" ? "active" : "done";
  const proofState: StepState =
    status === "registered"
      ? "pending"
      : status === "share_submitted"
        ? "active"
        : status === "access_granted"
          ? "done"
          : status === "needs_resubmission"
            ? "active"
            : "error";
  const accessState: StepState = status === "access_granted" ? "done" : "pending";

  return (
    <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9a8e8]">
        Your path to WhatsApp access
      </p>

      <ol className="mt-4">
        {/* ============ STEP 1 — SHARE ============ */}
        <li className="relative flex gap-4 pb-7">
          <div className="flex flex-col items-center">
            <StepBadge state={shareState} index={1} />
            <span className={`mt-2 w-px flex-1 ${shareState === "done" ? "bg-pink-400/50" : "bg-white/10"}`} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <StepTitle state={shareState}>Share the event</StepTitle>
            {shareState === "active" ? (
              <div className="mt-2">
                <p className="text-sm leading-relaxed text-[#b8aecf]">
                  Post the official flyer on your socials — WhatsApp Status, Facebook, Instagram,
                  X, or LinkedIn. Mindset Shift grows the way a good conversation does: person to
                  person.
                </p>

                {/* Share card (the official flyer) + save hint */}
                <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="relative w-36 shrink-0 sm:w-40">
                    <div className="absolute -inset-2 rounded-2xl bg-gradient-pink opacity-30 blur-xl" />
                    <AssetImage
                      src={event.flyer}
                      alt={`${event.programName} ${event.edition} flyer — save and share this`}
                      className="relative w-full rounded-xl border border-white/15"
                      loading="lazy"
                    />
                  </div>
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-[#8a7ba8]">
                    <Icon name="mobile" size={14} className="mt-0.5 shrink-0 text-[#e026c4]" />
                    Long-press (mobile) or right-click (desktop) the flyer to save it to your
                    device first — you'll need the image for your post.
                  </p>
                </div>

                {/* Per-platform share copy + copy/native/social actions */}
                <MindsetShiftSharePanel event={event} />
              </div>
            ) : (
              <p className="mt-1.5 text-sm text-[#8a7ba8]">Done — you shared the event.</p>
            )}
          </div>
        </li>

        {/* ============ STEP 2 — SCREENSHOT PROOF ============ */}
        <li className="relative flex gap-4 pb-7">
          <div className="flex flex-col items-center">
            <StepBadge state={proofState} index={2} />
            <span className={`mt-2 w-px flex-1 ${proofState === "done" ? "bg-pink-400/50" : "bg-white/10"}`} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <StepTitle state={proofState}>Screenshot proof</StepTitle>
            <div className="mt-1.5 text-sm leading-relaxed">
              {status === "registered" && (
                <p className="text-[#8a7ba8]">
                  Once you've posted it, upload a screenshot of your share below. A real person on
                  the team verifies it — no automatic checks, nothing hidden.
                </p>
              )}
              {status === "share_submitted" && (
                <p className="text-[#b8aecf]">
                  <span className="font-semibold text-white">Your screenshot is with the team.</span>{" "}
                  It's being verified by a real person, and once it's confirmed your WhatsApp
                  access unlocks on this same page.
                </p>
              )}
              {status === "needs_resubmission" && (
                <p className="text-[#f0c9a8]">
                  The team couldn't verify that screenshot, so a fresh one is needed. Upload a new
                  screenshot of your share to continue.
                </p>
              )}
              {status === "rejected" && (
                <p className="text-red-300/90">
                  Unfortunately this registration was rejected — the share couldn't be verified.
                  If you believe that's a mistake, contact the team on WhatsApp and we'll sort it
                  out.
                </p>
              )}
              {status === "access_granted" && (
                <p className="text-[#8a7ba8]">Verified — share confirmed by the team.</p>
              )}
            </div>
            <MindsetShiftProofUpload registration={registration} />
          </div>
        </li>

        {/* ============ STEP 3 — WHATSAPP ACCESS ============ */}
        <li className="relative flex gap-4">
          <div className="flex flex-col items-center">
            <StepBadge state={accessState} index={3} />
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <StepTitle state={accessState}>WhatsApp access</StepTitle>
            <div className="mt-1.5 text-sm leading-relaxed">
              {status === "access_granted" ? (
                <>
                  <p className="text-[#b8aecf]">
                    <span className="font-semibold text-emerald-300">You're in.</span> The private
                    WhatsApp space for {event.programName} {event.edition} is unlocked for you.
                  </p>
                  {hasMsAccess(registration) ? (
                    <a
                      href={event.whatsappGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black shadow-md shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
                    >
                      <Icon name="message" size={17} />
                      Join the WhatsApp space
                    </a>
                  ) : (
                    <p className="mt-3 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs leading-relaxed text-[#8a7ba8]">
                      <Icon name="bell" size={14} className="mt-0.5 shrink-0" />
                      Your access is confirmed — the team is finalising the group invite. The link
                      will appear right here the moment it's live.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[#8a7ba8]">
                  Once your share is verified, the team unlocks the private WhatsApp space for the
                  event. The link appears right here — it's admin-managed and never shared before
                  verification.
                </p>
              )}
            </div>
          </div>
        </li>
      </ol>
    </div>
  );
}
