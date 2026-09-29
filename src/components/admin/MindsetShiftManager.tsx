import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteMsRegistration,
  getMsEvent,
  getMsRegistrations,
  revokeMsAccess,
  setMsVerification,
  MS_STATUS_LABELS,
  type MsRegistration,
  type MsRegStatus,
  type MsVerificationDecision,
} from "../../data/mindsetShift";
import { Card } from "../ui";
import Icon from "../Icon";

const STATUS_ORDER: MsRegStatus[] = [
  "registered",
  "share_submitted",
  "needs_resubmission",
  "access_granted",
  "rejected",
];

function fmtDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: MsRegStatus }) {
  const tone: Record<MsRegStatus, string> = {
    registered: "bg-white/10 text-[#cfc4e8]",
    share_submitted: "bg-amber-400/15 text-amber-300",
    needs_resubmission: "bg-orange-400/15 text-orange-300",
    access_granted: "bg-emerald-400/15 text-emerald-300",
    rejected: "bg-rose-400/15 text-rose-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${tone[status]}`}>
      {MS_STATUS_LABELS[status]}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">{label}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-[#e8e2f7]">{value}</p>
    </div>
  );
}

export default function MindsetShiftManager({ adminName }: { adminName: string }) {
  const [regs, setRegs] = useState<MsRegistration[]>(() => getMsRegistrations());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MsRegStatus | "all">("all");
  const [editionFilter, setEditionFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const ev = getMsEvent();

  // Live updates: same-tab admin actions dispatch kr8:ms-regs-updated;
  // a participant submitting proof from another tab fires `storage`.
  useEffect(() => {
    const refresh = () => setRegs(getMsRegistrations());
    window.addEventListener("kr8:ms-regs-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:ms-regs-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const editions = useMemo(
    () => Array.from(new Set(regs.map((r) => r.edition))).sort(),
    [regs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return regs
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => editionFilter === "all" || r.edition === editionFilter)
      .filter(
        (r) =>
          !q ||
          [r.fullName, r.email, r.phone, r.whatsapp, r.id, r.location].some((v) =>
            v.toLowerCase().includes(q)
          )
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [regs, query, statusFilter, editionFilter]);

  // Chip counts come from the visible list (all editions) so they always
  // match the rows under them; the per-edition analytics stay in stats.
  const chipTotal = regs.length;
  const chipByStatus = (st: MsRegStatus) => regs.filter((r) => r.status === st).length;

  const toastTimer = useRef<number | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    // Clear any pending dismissal so a rapid second decision can't be
    // wiped out by the first decision's timer.
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };

  const decide = (reg: MsRegistration, decision: MsVerificationDecision) => {
    const updated = setMsVerification(reg.id, decision, adminName, note.trim());
    if (!updated) {
      setError("Could not find that registration.");
      return;
    }
    setError(null);
    setNote("");
    flash(
      decision === "approved"
        ? `Access granted to ${updated.fullName}.`
        : decision === "resubmit"
          ? `Resubmission requested from ${updated.fullName}.`
          : `${updated.fullName} was rejected.`
    );
  };

  const revoke = (reg: MsRegistration) => {
    const ok = window.confirm(
      `Revoke WhatsApp access for ${reg.fullName} (${reg.id})?\n\n` +
        "They will move back to step 1 and must share the event and re-verify before they can join the group again."
    );
    if (!ok) return;
    const updated = revokeMsAccess(reg.id, adminName, note.trim());
    if (!updated) {
      setError("Could not find that registration.");
      return;
    }
    setError(null);
    setNote("");
    flash(`Access revoked for ${updated.fullName}.`);
  };

  const remove = (reg: MsRegistration) => {
    const ok = window.confirm(
      `Permanently delete ${reg.fullName}'s registration (${reg.id})?\n\n` +
        "Their registration data — including their financial answers and share proof — " +
        "will be removed from this device and the shared cloud. This cannot be undone."
    );
    if (!ok) return;
    const gone = deleteMsRegistration(reg.id);
    if (!gone) {
      setError("Could not find that registration.");
      return;
    }
    setError(null);
    setExpandedId(null);
    flash(`${gone.fullName}'s registration was deleted.`);
  };

  const csvEscape = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

  const exportCsv = () => {
    const cols: [string, (r: MsRegistration) => string][] = [
      ["id", (r) => r.id],
      ["edition", (r) => r.edition],
      ["fullName", (r) => r.fullName],
      ["email", (r) => r.email],
      ["phone", (r) => r.phone],
      ["whatsapp", (r) => r.whatsapp],
      ["location", (r) => r.location],
      ["status", (r) => MS_STATUS_LABELS[r.status]],
      ["heardAbout", (r) => r.heardAbout],
      ["hopingToLearn", (r) => r.hopingToLearn],
      ["moneyQuestion", (r) => r.moneyQuestion],
      ["biggestChallenge", (r) => r.biggestChallenge],
      ["debtExperience", (r) => r.debtExperience],
      ["financialSituation", (r) => r.financialSituation],
      ["hasFinancialGoal", (r) => (r.hasFinancialGoal ? "yes" : "no")],
      ["areaToImprove", (r) => r.areaToImprove],
      ["proofSubmittedAt", (r) => (r.proofSubmittedAt ? new Date(r.proofSubmittedAt).toISOString() : "")],
      ["verifiedBy", (r) => r.verifiedBy || ""],
      ["verifiedAt", (r) => (r.verifiedAt ? new Date(r.verifiedAt).toISOString() : "")],
      ["adminNote", (r) => r.adminNote],
      ["createdAt", (r) => new Date(r.createdAt).toISOString()],
    ];
    const lines = [cols.map((c) => csvEscape(c[0])).join(",")].concat(
      filtered.map((r) => cols.map((c) => csvEscape(c[1](r))).join(","))
    );
    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindset-shift-${ev.edition}-participants-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    flash(`Exported ${filtered.length} participant${filtered.length === 1 ? "" : "s"} to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* ---- Program header + stats ---- */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Mindset Shift {ev.edition} — Registration &amp; Proof Verification
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-[#b8aecf]">
              {ev.speaker.name ? `${ev.speaker.name} · ` : ""}
              {ev.theme} — {ev.subtitle}. Review each participant's share screenshot, then approve
              (grants WhatsApp access), request a fresh screenshot, or reject. This is a
              manual check — nothing is verified automatically.
            </p>
          </div>
          {toast && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-400/15 px-4 py-2 text-sm font-semibold text-emerald-300">
              <Icon name="check" className="h-4 w-4" />
              {toast}
            </div>
          )}
        </div>

        {/* Stats chips (click to filter) */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              statusFilter === "all"
                ? "bg-white text-black"
                : "bg-white/10 text-[#cfc4e8] hover:bg-white/20"
            }`}
          >
            All · {chipTotal}
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                statusFilter === s
                  ? "bg-white text-black"
                  : "bg-white/10 text-[#cfc4e8] hover:bg-white/20"
              }`}
            >
              {MS_STATUS_LABELS[s]} · {chipByStatus(s)}
            </button>
          ))}
        </div>
      </Card>

      {/* ---- Search + list ---- */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d81ab]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, phone, code or city…"
              className="w-full rounded-xl border border-white/15 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none"
            />
          </div>
          {editions.length > 1 && (
            <select
              value={editionFilter}
              onChange={(e) => setEditionFilter(e.target.value)}
              className="rounded-xl border border-white/15 bg-black/20 px-3 py-2.5 text-sm font-semibold text-white focus:border-pink-400/60 focus:outline-none"
              aria-label="Filter by edition"
            >
              <option value="all">All editions</option>
              {editions.map((ed) => (
                <option key={ed} value={ed}>
                  Edition {ed}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="paperclip" className="h-4 w-4" />
            Export CSV ({filtered.length})
          </button>
          <p className="text-xs font-semibold text-[#8d81ab]">
            {filtered.length} of {regs.length} participant{regs.length === 1 ? "" : "s"}
          </p>
        </div>

        {regs.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 py-12 text-center">
            <Icon name="calendar" className="h-8 w-8 text-[#8d81ab]" />
            <p className="text-sm font-semibold text-[#cfc4e8]">No registrations yet</p>
            <p className="max-w-sm text-xs text-[#8d81ab]">
              Once someone registers on the public Mindset Shift page, they appear here
              for proof review.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-6 rounded-xl bg-black/20 py-8 text-center text-sm text-[#8d81ab]">
            No participants match that search{statusFilter !== "all" ? ` or the "${MS_STATUS_LABELS[statusFilter]}" filter` : ""}.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left transition hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{r.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-[#8d81ab]">
                      {r.id} · {r.email} · {r.phone}
                      {r.whatsapp && ` · WA ${r.whatsapp}`}
                    </p>
                  </div>
                  {r.syncPending && (
                    <span className="rounded-full bg-sky-400/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                      Sync pending
                    </span>
                  )}
                  <StatusBadge status={r.status} />
                  <Icon
                    name="arrowRight"
                    className={`h-4 w-4 text-[#8d81ab] transition-transform ${expandedId === r.id ? "rotate-90" : ""}`}
                  />
                </button>

                {/* Expanded detail */}
                {expandedId === r.id && (
                  <div className="space-y-5 border-t border-white/10 bg-black/30 px-4 py-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <DetailRow label="Location" value={r.location} />
                      <DetailRow label="Heard about us via" value={r.heardAbout} />
                      <DetailRow label="Hoping to learn" value={r.hopingToLearn} />
                      <DetailRow label="Money question" value={r.moneyQuestion} />
                      <DetailRow label="Biggest financial challenge" value={r.biggestChallenge} />
                      <DetailRow label="Debt experience" value={r.debtExperience} />
                      <DetailRow label="Financial situation" value={r.financialSituation} />
                      <DetailRow
                        label="Working toward a goal"
                        value={
                          r.hasFinancialGoal
                            ? `Yes${r.areaToImprove ? ` — ${r.areaToImprove}` : ""}`
                            : "Not yet"
                        }
                      />
                    </div>

                    {/* Proof */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">
                        Share proof {r.proofSubmittedAt ? `· submitted ${fmtDate(r.proofSubmittedAt)}` : ""}
                      </p>
                      {r.proofData ? (
                        <img
                          src={r.proofData}
                          alt={`Share proof submitted by ${r.fullName}`}
                          className="mt-2 max-h-96 w-full rounded-lg border border-white/15 object-contain"
                        />
                      ) : (
                        <p className="mt-2 rounded-lg border border-dashed border-white/15 py-4 text-center text-xs text-[#8d81ab]">
                          {r.status === "registered"
                            ? "No proof submitted yet — they haven't shared the event."
                            : "No proof image stored."}
                        </p>
                      )}
                    </div>

                    {/* Previous decision */}
                    {(r.verifiedBy || r.adminNote) && (
                      <div className="rounded-lg bg-white/5 px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">
                          Last decision {r.verifiedBy ? `· ${r.verifiedBy}` : ""} {r.verifiedAt ? `· ${fmtDate(r.verifiedAt)}` : ""}
                        </p>
                        {r.adminNote && (
                          <p className="mt-1 text-sm text-[#e8e2f7]">“{r.adminNote}”</p>
                        )}
                        <p className="mt-1 text-[11px] text-[#8d81ab]">
                          Internal note — only you and other admins can see this.
                        </p>
                      </div>
                    )}

                    {/* Verification actions */}
                    {r.proofData || r.status !== "registered" ? (
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]" htmlFor={`ms-note-${r.id}`}>
                          Note {r.status === "needs_resubmission" || r.status === "rejected" ? "(optional — what they should change)" : "(optional)"}
                        </label>
                        <textarea
                          id={`ms-note-${r.id}`}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={2}
                          placeholder="e.g. The screenshot is blurred — please re-upload a clear one showing the full event details."
                          className="mt-1.5 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none"
                        />
                        {error && <p className="mt-1.5 text-xs font-semibold text-rose-300">{error}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => decide(r, "approved")}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400"
                          >
                            <Icon name="check" className="h-4 w-4" />
                            Approve &amp; grant access
                          </button>
                          <button
                            onClick={() => decide(r, "resubmit")}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-400/90 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-300"
                          >
                            <Icon name="alert" className="h-4 w-4" />
                            Request resubmission
                          </button>
                          <button
                            onClick={() => decide(r, "rejected")}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-400"
                          >
                            <Icon name="close" className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-lg bg-white/5 px-4 py-3 text-xs text-[#8d81ab]">
                        This participant is still on step 1 of their flow — verification
                        becomes available once they upload a share screenshot.
                      </p>
                    )}

                    {/* Management (any status) */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                      {r.status === "access_granted" && (
                        <button
                          onClick={() => revoke(r)}
                          className="inline-flex items-center gap-2 rounded-xl bg-amber-400/15 px-3.5 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-400/25"
                        >
                          <Icon name="lock" className="h-3.5 w-3.5" />
                          Revoke access
                        </button>
                      )}
                      <button
                        onClick={() => remove(r)}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-400/10 px-3.5 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-400/20"
                      >
                        <Icon name="close" className="h-3.5 w-3.5" />
                        Delete registration
                      </button>
                      <p className="ml-auto text-[11px] text-[#6f6390]">
                        Decisions are recorded in this participant's history.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
