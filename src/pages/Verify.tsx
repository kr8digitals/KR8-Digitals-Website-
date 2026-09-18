import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyId, SKILLS, COHORT_YEAR, type Account } from "../data/store";
import { Pill, GradientButton, Card, Avatar } from "../components/ui";
import Icon from "../components/Icon";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [id, setId] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; account?: Account }>(null);
  const [searched, setSearched] = useState(false);

  // Auto-verify when URL includes ?id=KR8...
  useEffect(() => {
    const queryId = searchParams.get("id")?.trim();
    if (queryId) {
      setId(queryId);
      setSearched(true);
      const res = verifyId(queryId);
      setResult(res);
    }
  }, [searchParams]);

  const lookup = (searchQuery?: string) => {
    const target = (searchQuery || id).trim();
    if (!target) return;
    setSearched(true);
    setResult(verifyId(target));
  };

  const skill = result?.account ? SKILLS.find((s) => s.key === result.account!.skill) : null;

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-16">
        <div className="text-center">
          <Pill>Verify a KR8 Identity</Pill>
          <h1 className="font-display mt-5 text-4xl text-white sm:text-5xl">
            Confirm a <span className="text-gradient">KR8 ID.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[#b8aecf]">
            Paste any KR8 Identity ID to confirm the holder's official training status and certification.
          </p>
        </div>

        <Card className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="e.g. KR82026KT0001GDVFD"
              className="flex-1 rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none"
            />
            <GradientButton onClick={() => lookup()}>Verify →</GradientButton>
          </div>
        </Card>

        {searched && result && (
          <div className="mt-6">
            {!result.ok || !result.account ? (
              <Card className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                  <Icon name="alert" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">This ID could not be verified</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">
                  No active student profile matches <strong className="text-white font-mono">{id}</strong>. Double-check the ID formatting and try again.
                </p>
              </Card>
            ) : (
              <Card>
                <div className="flex items-center gap-4">
                  <Avatar src={result.account.avatar} name={result.account.name} size={64} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{result.account.name}</h3>
                    <p className="font-mono text-xs text-pink-400">{result.account.id}</p>
                  </div>
                  {result.account.type === "founder" ? (
                    <span className="ml-auto rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold text-white shadow-lg glow-pink-sm">
                      👑 Founder & CEO
                    </span>
                  ) : result.account.type === "co-founder" ? (
                    <span className="ml-auto rounded-full bg-gradient-pink px-3.5 py-1 text-xs font-bold text-white shadow-lg glow-pink-sm">
                      ⭐ Co-Founder
                    </span>
                  ) : (
                    result.account.vip && (
                      <span className="ml-auto rounded-full bg-gradient-pink px-3 py-1 text-xs font-bold text-white">
                        VIP
                      </span>
                    )
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Info
                    label={result.account.type === "founder" || result.account.type === "co-founder" ? "Executive Role" : "Skill Track"}
                    value={
                      result.account.type === "founder"
                        ? "Founder & CEO · Executive Leadership"
                        : result.account.type === "co-founder"
                        ? "Co-Founder · Executive Leadership"
                        : skill?.name ?? result.account.skill ?? "—"
                    }
                  />
                  <Info
                    label="Cohort / Origin"
                    value={
                      result.account.type === "founder" || result.account.type === "co-founder"
                        ? "Founding Executive"
                        : String(result.account.year ?? COHORT_YEAR)
                    }
                  />
                  <Info
                    label="Status"
                    value={
                      result.account.type === "founder"
                        ? "Verified Founder & CEO ✓"
                        : result.account.type === "co-founder"
                        ? "Verified Co-Founder ✓"
                        : result.account.graduated
                        ? `Certified ✓ (${result.account.certTier ?? "Completion"})`
                        : "In Training"
                    }
                    highlight={result.account.graduated || result.account.type === "founder" || result.account.type === "co-founder"}
                  />
                </div>

                {result.account.type === "founder" ? (
                  <div className="mt-4 rounded-xl border border-pink-400/50 bg-gradient-to-r from-pink-500/15 via-[#1a0030] to-purple-600/15 p-4 shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-wider text-pink-300">
                      ✓ Official KR8 Digitals Executive Leadership
                    </p>
                    <p className="mt-1 text-sm text-[#cabfe0]">
                      This identity confirms <strong className="text-white">{result.account.name}</strong> as the official <strong className="text-white">Founder & Chief Executive Officer</strong> of KR8 Digitals.
                    </p>
                  </div>
                ) : result.account.type === "co-founder" ? (
                  <div className="mt-4 rounded-xl border border-pink-400/50 bg-gradient-to-r from-pink-500/15 via-[#1a0030] to-purple-600/15 p-4 shadow-lg">
                    <p className="text-xs font-semibold uppercase tracking-wider text-pink-300">
                      ✓ Official KR8 Digitals Executive Leadership
                    </p>
                    <p className="mt-1 text-sm text-[#cabfe0]">
                      This identity confirms <strong className="text-white">{result.account.name}</strong> as an official <strong className="text-white">Co-Founder</strong> of KR8 Digitals.
                    </p>
                  </div>
                ) : result.account.graduated && (
                  <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-green-300">
                      ✓ Official KR8 Digitals Graduate
                    </p>
                    <p className="mt-1 text-sm text-[#cabfe0]">
                      This holder has successfully graduated and holds a verified{" "}
                      <strong className="text-white">
                        Certificate of {result.account.certTier ?? "Completion"}
                      </strong>{" "}
                      in {skill?.name ?? "Digital Skills"}.
                    </p>
                    {result.account.certificateUrl && (
                      <div className="mt-3">
                        <a
                          href={result.account.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-300 hover:text-white"
                        >
                          <Icon name="certificate" size={14} /> View Verified Certificate Image →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {result.account.expandedVisibility ? (
                  <div className="mt-6 space-y-3 rounded-2xl border border-pink-400/30 bg-pink-500/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">
                      Expanded profile (opted in by holder)
                    </p>
                    <p className="text-sm text-[#cabfe0]">
                      Performance: {result.account.points} pts · {result.account.attendanceAccepted} sessions · {result.account.submissions} accepted submissions.
                    </p>
                    {result.account.verifyRemark && (
                      <div className="border-t border-white/10 pt-2 text-sm text-[#cabfe0]">
                        <span className="font-semibold text-pink-300">Admin Remarks / Notes:</span>{" "}
                        <span className="italic">{result.account.verifyRemark}</span>
                      </div>
                    )}
                    <p className="text-sm text-[#cabfe0]">
                      Recommendation: A dependable {skill?.name ?? "creative"} creator with a strong track record inside KR8 Digitals.
                    </p>
                  </div>
                ) : (
                  <p className="mt-6 rounded-xl bg-white/5 px-4 py-3 text-xs text-[#8a7ba8]">
                    This holder has kept their expanded profile private. Only core verification data is shown.
                  </p>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${highlight ? "border border-green-500/30 bg-green-500/10" : "bg-black/20"}`}>
      <p className="text-[11px] uppercase tracking-wider text-[#8a7ba8]">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${highlight ? "text-green-300" : "text-white"}`}>{value}</p>
    </div>
  );
}
