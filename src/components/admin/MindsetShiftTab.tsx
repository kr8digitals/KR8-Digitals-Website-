import { useState } from "react";
import MindsetShiftManager from "./MindsetShiftManager";
import MindsetShiftEventManager from "./MindsetShiftEventManager";
import MindsetShiftAnalytics from "./MindsetShiftAnalytics";

/* ------------------------------------------------------------------ */
/* Mindset Shift admin tab — sub-navigation                           */
/*   Verification  : review share proofs, manage all participants     */
/*   Event settings: every public-facing fact for this + next edition */
/*   Analytics     : registrations, pipeline, sources, conversion     */
/* ------------------------------------------------------------------ */

const SUBS = [
  { id: "verify", label: "Verification" },
  { id: "event", label: "Event settings" },
  { id: "analytics", label: "Analytics" },
] as const;

type SubId = (typeof SUBS)[number]["id"];

export default function MindsetShiftTab({ adminName }: { adminName: string }) {
  const [sub, setSub] = useState<SubId>("verify");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SUBS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSub(s.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              sub === s.id ? "bg-pink-500 text-white" : "bg-white/10 text-[#cfc4e8] hover:bg-white/20"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sub === "verify" && <MindsetShiftManager adminName={adminName} />}
      {sub === "event" && <MindsetShiftEventManager />}
      {sub === "analytics" && <MindsetShiftAnalytics />}
    </div>
  );
}
