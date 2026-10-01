import { hasMsAccess, type MsEventConfig, type MsRegistration } from "../data/mindsetShift";
import Icon from "./Icon";
import { GradientButton } from "./ui";

/* ------------------------------------------------------------------ */
/* Mindset Shift — post-onboarding access (v2)                        */
/*                                                                    */
/* There is no share-before-access gate. Completing onboarding        */
/* unlocks the admin-managed WhatsApp space immediately. The          */
/* invitation to share (voluntary, framed as a gift) lives on the     */
/* graduation card after this block.                                  */
/*                                                                    */
/* Edge states:                                                       */
/*   access_granted → the link (or "finalising" note)                 */
/*   registered     → revoked; restore by re-onboarding               */
/*   rejected       → final; contact the team                         */
/*   legacy rows    → old share-verification process; verification is */
/*                    no longer required, re-onboard to unlock        */
/* ------------------------------------------------------------------ */

export default function MindsetShiftAccessFlow({
  registration,
  event,
  onReonboard,
}: {
  registration: MsRegistration;
  event: MsEventConfig;
  onReonboard?: () => void;
}) {
  const status = registration.status;
  const accessLive = hasMsAccess(registration);
  const legacy = status === "share_submitted" || status === "needs_resubmission";

  return (
    <div className="mt-7">
      <div
        className={`rounded-2xl border p-5 sm:p-6 ${
          status === "access_granted"
            ? "border-emerald-400/25 bg-emerald-500/[0.06]"
            : status === "rejected"
              ? "border-red-400/25 bg-red-500/[0.05]"
              : "border-white/10 bg-black/25"
        }`}
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              status === "access_granted"
                ? "bg-gradient-pink text-white"
                : status === "rejected"
                  ? "bg-red-500/15 text-red-300"
                  : "border border-white/15 bg-white/[0.03] text-[#8a7ba8]"
            }`}
          >
            <Icon name={status === "access_granted" ? "check" : status === "rejected" ? "close" : "lock"} size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9a8e8]">
              The {event.programName} {event.edition} space
            </p>

            {status === "access_granted" && (
              <>
                <h4 className="font-display mt-2 text-xl font-bold text-white">
                  <span className="text-emerald-300">You're in.</span> Your seat is unlocked.
                </h4>
                {accessLive ? (
                  <>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#b8aecf]">
                      The private WhatsApp space for this edition is live for you. Join before
                      Sunday so the team knows your name.
                    </p>
                    <a
                      href={event.whatsappGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2.5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black shadow-md shadow-emerald-500/25 transition hover:bg-emerald-400 active:scale-[0.98]"
                    >
                      <Icon name="message" size={17} />
                      Join the WhatsApp space
                    </a>
                  </>
                ) : (
                  <p className="mt-3 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs leading-relaxed text-[#8a7ba8]">
                    <Icon name="bell" size={14} className="mt-0.5 shrink-0" />
                    Your access is confirmed — the team is finalising the group invite. The link
                    will appear right here the moment it's live.
                  </p>
                )}
              </>
            )}

            {status === "registered" && (
              <>
                <h4 className="font-display mt-2 text-xl font-bold text-white">Your access is paused.</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-[#b8aecf]">
                  The team revoked access to this edition's space. Completing the onboarding
                  questions again will restore it — your confirmation code stays the same.
                </p>
                {onReonboard && (
                  <GradientButton type="button" onClick={onReonboard} className="mt-4">
                    Complete onboarding again
                    <Icon name="arrowRight" size={16} />
                  </GradientButton>
                )}
              </>
            )}

            {status === "rejected" && (
              <>
                <h4 className="font-display mt-2 text-xl font-bold text-white">This registration was rejected.</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-[#b8aecf]">
                  If you believe that's a mistake, contact the team on WhatsApp and they'll sort
                  it out.
                </p>
              </>
            )}

            {legacy && (
              <>
                <h4 className="font-display mt-2 text-xl font-bold text-white">
                  Good news — no more share verification.
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-[#b8aecf]">
                  Your registration was created under the old process, which asked you to share
                  and upload proof. That step no longer exists. Complete the quick onboarding and
                  your access unlocks instantly — it takes a minute.
                </p>
                {onReonboard && (
                  <GradientButton type="button" onClick={onReonboard} className="mt-4">
                    Complete onboarding
                    <Icon name="arrowRight" size={16} />
                  </GradientButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
