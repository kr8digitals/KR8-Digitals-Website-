import { useEffect, useMemo, useState } from "react";
import {
  getMsEvent,
  getMsStats,
  type MsStats,
} from "../../data/mindsetShift";
import { Card } from "../ui";

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: string;
}) {
  return (
    <div data-kpi={label} className="rounded-xl border border-white/10 bg-black/20 px-4 py-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">{label}</p>
      <p className={`mt-1.5 text-3xl font-extrabold ${tone}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-[#6f6390]">{hint}</p>}
    </div>
  );
}

function BarList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-[#8d81ab]">No data yet.</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#d5cdf0]">{r.label}</span>
                <span className="font-bold text-[#8d81ab]">{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-violet-400"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MindsetShiftAnalytics() {
  const ev = getMsEvent();
  const [stats, setStats] = useState<MsStats>(() => getMsStats());

  // Live: admin decisions and new registrations recompute the numbers.
  useEffect(() => {
    const refresh = () => setStats(getMsStats());
    window.addEventListener("kr8:ms-regs-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("kr8:ms-regs-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const derived = useMemo(() => {
    // v2 access model: no share gate — everyone who completes onboarding
    // gets access immediately. The only loss is admin revocation/rejection.
    const inactive =
      stats.byStatus.registered +
      stats.byStatus.rejected +
      stats.byStatus.share_submitted +
      stats.byStatus.needs_resubmission;
    const conversion = stats.total ? Math.round((stats.grantedAccess / stats.total) * 100) : 0;
    const sourceRows = Object.entries(stats.bySource)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
    const funnel = [
      { label: "Completed onboarding", count: stats.total, width: 100 },
      {
        label: "Access live",
        count: stats.grantedAccess,
        width: stats.total ? (stats.grantedAccess / stats.total) * 100 : 0,
      },
      {
        label: "Revoked or rejected",
        count: inactive,
        width: stats.total ? (inactive / stats.total) * 100 : 0,
      },
    ];
    return { inactive, conversion, sourceRows, funnel };
  }, [stats]);

  const dayLabel = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  };
  const maxDay = Math.max(1, ...stats.daily.map((d) => d.count));
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Mindset Shift {ev.edition} — Analytics
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-[#b8aecf]">
              Edition-level numbers: registrations, live access, and where participants are
              coming from. Updated live as registrations and decisions happen.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">
              Access conversion
            </p>
            <p className="mt-0.5 text-2xl font-extrabold text-emerald-300">{derived.conversion}%</p>
            <p className="text-[11px] text-[#6f6390]">
              {stats.grantedAccess} of {stats.total} participants
            </p>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Total registrations"
          value={stats.total}
          hint={`Edition ${ev.edition}`}
          tone="text-white"
        />
        <Kpi
          label="Access live"
          value={stats.grantedAccess}
          hint="in the WhatsApp space"
          tone="text-emerald-300"
        />
        <Kpi
          label="Revoked or rejected"
          value={derived.inactive}
          hint="no access right now"
          tone="text-amber-300"
        />
        <Kpi
          label="Access conversion"
          value={`${derived.conversion}%`}
          hint={`${stats.grantedAccess} of ${stats.total} participants`}
          tone="text-white"
        />
      </div>

      {/* Funnel + sources */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">
            Access pipeline
          </p>
          <div className="mt-4 space-y-4">
            {derived.funnel.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#d5cdf0]">{f.label}</span>
                  <span className="font-bold text-[#8d81ab]">{f.count}</span>
                </div>
                <div className="mt-1.5 h-6 overflow-hidden rounded-lg bg-white/5">
                  <div
                    className="flex h-full items-center rounded-lg bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 pl-2.5 text-[10px] font-bold text-white transition-all"
                    style={{ width: `${Math.max(f.width, f.count > 0 ? 14 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-[#6f6390]">
            There is no share gate — completing onboarding unlocks the WhatsApp space
            immediately. The only exits from "Access live" are admin revocation or rejection.
          </p>
        </div>
        <BarList title="Where participants heard about the event" rows={derived.sourceRows} />
      </div>

      {/* Daily registrations */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8d81ab]">
            Registrations — last 14 days
          </p>
          <p className="text-[11px] font-semibold text-[#6f6390]">
            {stats.total} total this edition
          </p>
        </div>
        <div className="mt-4 flex h-36 items-end gap-1.5">
          {stats.daily.map((d) => (
            <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[10px] font-bold text-[#8d81ab] opacity-0 transition group-hover:opacity-100">
                {d.count}
              </span>
              <div
                className={`w-full rounded-t-md transition ${
                  d.day === todayIso ? "bg-pink-400" : "bg-violet-400/50 group-hover:bg-violet-400"
                }`}
                style={{ height: d.count > 0 ? `${Math.max((d.count / maxDay) * 100, 8)}%` : "4px" }}
                title={`${dayLabel(d.day)}: ${d.count}`}
              />
              <span className="text-[9px] font-semibold text-[#6f6390]">
                {dayLabel(d.day).split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status breakdown */}
      <BarList
        title="Status breakdown"
        rows={[
          { label: "No access (revoked — re-onboard to restore)", count: stats.byStatus.registered },
          { label: "Awaiting share verification (legacy)", count: stats.byStatus.share_submitted },
          { label: "Needs resubmission (legacy)", count: stats.byStatus.needs_resubmission },
          { label: "Access granted", count: stats.byStatus.access_granted },
          { label: "Rejected", count: stats.byStatus.rejected },
        ]}
      />
    </div>
  );
}
