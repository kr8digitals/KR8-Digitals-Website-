import { useState } from "react";
import { verifyId, SKILLS, COHORT_YEAR, type Account } from "../data/store";
import { Pill, GradientButton, Card, Avatar } from "../components/ui";
import Icon from "../components/Icon";

export default function Verify() {
  const [id, setId] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; account?: Account }>(null);
  const [count, setCount] = useState(0);

  const lookup = () => {
    // Rate-limit repeated lookups (client-side stand-in for server-side limit)
    if (count >= 8) {
      setResult({ ok: false });
      return;
    }
    setCount((c) => c + 1);
    setResult(verifyId(id));
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
            Paste any KR8 Identity ID to confirm the holder's training status and certification.
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
            <GradientButton onClick={lookup}>Verify →</GradientButton>
          </div>
        </Card>

        {result && (
          <div className="mt-6">
            {!result.ok || !result.account ? (
              <Card className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-300"><Icon name="alert" size={24} /></div>
                <h3 className="text-lg font-bold text-white">This ID could not be verified</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">Double-check the ID and try again.</p>
              </Card>
            ) : (
              <Card>
                <div className="flex items-center gap-4">
                  <Avatar src={result.account.avatar} name={result.account.name} size={64} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{result.account.name}</h3>
                    <p className="font-mono text-xs text-pink-400">{result.account.id}</p>
                  </div>
                  {result.account.vip && <span className="ml-auto rounded-full bg-gradient-pink px-3 py-1 text-xs font-bold text-white">VIP</span>}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Info label="Skill Track" value={skill?.name ?? "—"} />
                  <Info label="Cohort Year" value={String(result.account.year ?? COHORT_YEAR)} />
                  <Info label="Status" value={result.account.graduated ? `Certified ✓ (${result.account.certTier})` : "In Training"} />
                </div>

                {result.account.expandedVisibility ? (
                  <div className="mt-6 space-y-3 rounded-2xl border border-pink-400/30 bg-pink-500/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-pink-400">Expanded profile (opted in)</p>
                    <p className="text-sm text-[#cabfe0]">
                      Performance: {result.account.points} pts · {result.account.attendanceAccepted} sessions · {result.account.submissions} accepted submissions.
                    </p>
                    <p className="text-sm text-[#cabfe0]">
                      Admin remark: {result.account.graduated ? "Exemplary, consistent creator — recommended for real client work." : "Active learner in good standing."}
                    </p>
                    <p className="text-sm text-[#cabfe0]">
                      Recommendation: A dependable {skill?.name} creator with a strong track record inside KR8 Digitals.
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-[11px] uppercase tracking-wider text-[#8a7ba8]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
