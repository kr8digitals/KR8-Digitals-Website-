import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  verifyId,
  getSkill,
  areAllRegistrationsClosed,
  getWaitlistWhatsAppUrl,
  type VerificationResult,
} from "../data/store";
import { Pill, GradientButton, GhostButton, Card, Avatar } from "../components/ui";
import Icon from "../components/Icon";
import CertificateDocumentView from "../components/CertificateDocumentView";
import { downloadCertificatePdf } from "../utils/certificate";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const [id, setId] = useState("");
  const [certQuery, setCertQuery] = useState("");
  const [result, setResult] = useState<null | VerificationResult>(null);
  const [searched, setSearched] = useState(false);
  const [allClosed, setAllClosed] = useState(() => areAllRegistrationsClosed());
  const waitlistUrl = getWaitlistWhatsAppUrl();

  useEffect(() => {
    const handleUpdate = () => setAllClosed(areAllRegistrationsClosed());
    window.addEventListener("kr8:skills-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("kr8:skills-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Auto-verify when URL includes ?id=... or ?cert=...
  useEffect(() => {
    const queryId = searchParams.get("id")?.trim() || "";
    const queryCert = searchParams.get("cert")?.trim() || "";
    if (queryId || queryCert) {
      setId(queryId || queryCert);
      setCertQuery(queryCert);
      setSearched(true);
      const res = verifyId(queryId, queryCert);
      setResult(res);
    }
  }, [searchParams]);

  const lookup = (searchQuery?: string) => {
    const target = (searchQuery || id).trim();
    if (!target) return;
    setSearched(true);
    const res = verifyId(target, certQuery);
    setResult(res);
  };

  const activeCert = result?.certificate;
  const isWithdrawn = result?.isWithdrawn || activeCert?.status === "withdrawn";
  const skill = result?.account ? getSkill(activeCert?.skill || result.account.skill) : null;
  const allCerts = result?.certificates || [];

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-2xl px-5 py-16">
        <div className="text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <img
              src="/branding/kr8_logo.png"
              alt="KR8 Digitals Logo"
              className="h-16 w-16 rounded-2xl object-contain shadow-xl shadow-pink-500/30"
            />
          </div>
          <Pill>Official KR8 Verification Portal</Pill>
          <h1 className="font-display mt-5 text-4xl text-white sm:text-5xl">
            Confirm a <span className="text-gradient">KR8 Identity.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[#b8aecf]">
            Paste any student ID or scan an issued certificate QR code to confirm official credentials and status.
          </p>
        </div>

        <Card className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="e.g. KR82026KT0001GDVFD or CERT-KR8-..."
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
                <h3 className="text-lg font-bold text-white">This credential could not be verified</h3>
                <p className="mt-2 text-sm text-[#b8aecf]">
                  No active student profile or certificate record matches <strong className="text-white font-mono">{id}</strong>. Double-check the ID or QR link and try again.
                </p>
              </Card>
            ) : (
              <Card className={isWithdrawn ? "border-amber-500/50 bg-amber-950/20" : ""}>
                {/* STATUS BANNER */}
                {isWithdrawn ? (
                  <div className="mb-6 rounded-2xl border-2 border-amber-500/60 bg-amber-500/15 p-5 text-left shadow-lg">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/30 text-amber-300">
                        <Icon name="alert" size={22} />
                      </span>
                      <div>
                        <h4 className="text-base font-bold text-amber-200">
                          ⚠️ Certificate Status: Withdrawn
                        </h4>
                        <p className="text-xs text-amber-300/80">
                          Official Record Updated · Reference: {activeCert?.id || id}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 border-t border-amber-500/30 pt-3 text-sm text-[#fae8c8]">
                      <p className="font-semibold text-amber-200">
                        This certificate has been withdrawn from the user for reasons known to the administrator.
                      </p>
                      <p className="text-xs text-[#eed6b4]">
                        Please make further inquiries directly from the certificate holder or contact KR8 administration.
                      </p>
                      {activeCert?.withdrawalReason && (
                        <div className="mt-2.5 rounded-xl bg-black/40 p-3 text-xs text-amber-200 border border-amber-500/30">
                          <strong className="text-amber-100">Official Withdrawal Stated Reason:</strong>{" "}
                          <span className="italic">"{activeCert.withdrawalReason}"</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : activeCert ? (
                  <div className="mb-6 rounded-2xl border border-green-500/40 bg-green-500/10 p-4 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-300">
                        <Icon name="check" size={18} />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-green-300">
                          ✓ Official Verified Credential
                        </h4>
                        <p className="text-xs text-[#b8aecf]">
                          Certificate of {activeCert.tier} in {activeCert.skillName} · Valid & In Good Standing
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* HOLDER IDENTITY */}
                <div className="flex items-center gap-4">
                  <Avatar src={result.account.avatar} name={result.account.name} size={64} />
                  <div>
                    <h3 className="text-xl font-bold text-white">{result.account.name}</h3>
                    <p className="font-mono text-xs text-pink-400">{result.account.id}</p>
                    {activeCert?.formattedName && (
                      <p className="text-[11px] font-semibold text-[#8a7ba8] mt-0.5">
                        Certificate Name: <span className="font-mono text-white">{activeCert.formattedName}</span>
                      </p>
                    )}
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

                {/* DETAILS GRID */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Info
                    label="Certified Discipline"
                    value={activeCert?.skillName ?? skill?.name ?? result.account.skill ?? "—"}
                  />
                  <Info
                    label="Certificate Type"
                    value={
                      activeCert
                        ? `Certificate of ${activeCert.tier}`
                        : result.account.graduated
                        ? `Certificate of ${result.account.certTier ?? "Completion"}`
                        : "In Training"
                    }
                  />
                  <Info
                    label="Standing Status"
                    value={
                      isWithdrawn
                        ? "Withdrawn ✕"
                        : activeCert
                        ? "Active & Valid ✓"
                        : result.account.graduated
                        ? "Certified ✓"
                        : "Active Student"
                    }
                    highlight={!isWithdrawn && (!!activeCert || result.account.graduated)}
                  />
                </div>

                {/* ACHIEVEMENT TEXT & NOTES */}
                {activeCert && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-xs space-y-2 text-[#cabfe0]">
                    <div>
                      <span className="font-semibold text-white">Achievement Citation:</span>
                      <p className="mt-0.5 italic text-[#e8ddf5]">
                        "{activeCert.achievementText}"
                      </p>
                    </div>
                    {activeCert.additionalNotes && (
                      <div className="border-t border-white/10 pt-2">
                        <span className="font-semibold text-pink-300">Special Honors / Recognition:</span>{" "}
                        <span className="text-white font-medium">{activeCert.additionalNotes}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 flex flex-wrap justify-between text-[11px] text-[#8a7ba8]">
                      <span>Reference: <code className="text-pink-400">{activeCert.id}</code></span>
                      <span>Issued: {new Date(activeCert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>

                    {/* Certificate Preview Image if active */}
                    {!isWithdrawn && activeCert && (
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-[#8a7ba8]">Verified Certificate Document:</p>
                          <button
                            onClick={() => downloadCertificatePdf(result.account?.name || activeCert.studentName, null, activeCert, result.account)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-300 hover:text-white underline underline-offset-2"
                          >
                            <Icon name="certificate" size={13} /> Download Official PDF →
                          </button>
                        </div>
                        <CertificateDocumentView
                          cert={activeCert}
                          student={result.account}
                          maxHeight="350px"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* MULTI-CERTIFICATE HISTORY (Requirement 7 & 16) */}
                {allCerts.length > 1 && (
                  <div className="mt-6 rounded-2xl border border-white/15 bg-black/40 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="certificate" size={16} className="text-pink-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Student Certification History ({allCerts.length} Credentials)
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {allCerts.map((c) => {
                        const isThisCert = c.id === activeCert?.id;
                        const cWithdrawn = c.status === "withdrawn";
                        return (
                          <div
                            key={c.id}
                            className={`flex flex-wrap items-center justify-between gap-2 rounded-xl p-2.5 text-xs border ${
                              isThisCert
                                ? "border-pink-500/50 bg-pink-500/10"
                                : "border-white/5 bg-white/[0.02]"
                            }`}
                          >
                            <div>
                              <span className="font-bold text-white">{c.skillName}</span>
                              <span className="text-[#8a7ba8] ml-2">· Certificate of {c.tier}</span>
                              {isThisCert && <span className="ml-2 font-mono text-[10px] text-pink-300 font-bold">(Viewing)</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  cWithdrawn
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : "bg-green-500/20 text-green-300 border border-green-500/40"
                                }`}
                              >
                                {cWithdrawn ? "Withdrawn" : "Active ✓"}
                              </span>
                              {!isThisCert && (
                                <Link
                                  to={`/verify?id=${encodeURIComponent(result.account?.id || id)}&cert=${encodeURIComponent(c.id)}`}
                                  className="text-[11px] font-semibold text-pink-400 hover:text-white"
                                >
                                  Inspect →
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* STEP 8: DYNAMIC CONVERSION CTA (Registration Open vs Closed) */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.05] via-[#160026] to-[#0d0017] p-6 sm:p-8 text-center shadow-2xl backdrop-blur-md">
          {!allClosed ? (
            /* REGISTRATION OPEN STATE */
            <div className="space-y-4 max-w-lg mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Applications Open · Cohort Onboarding Ongoing
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Inspired by this credential? <span className="text-gradient">Learn completely free.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#b8aecf] leading-relaxed">
                KR8 Digitals trains African youth and global creatives in high-income digital skills completely free — with 0 cost for certificate or training. Join the upcoming cohort today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <GradientButton
                  to="/academy?register=true"
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold shadow-lg shadow-pink-500/25"
                >
                  Register for Next Cohort →
                </GradientButton>
                <GhostButton
                  to="/academy"
                  className="w-full sm:w-auto px-5 py-3 text-xs font-semibold border-white/20 hover:border-pink-500/40"
                >
                  Explore Skill Tracks
                </GhostButton>
              </div>
            </div>
          ) : (
            /* REGISTRATION CLOSED STATE */
            <div className="space-y-4 max-w-lg mx-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
                <span>🔒</span>
                Cohort Full · Registration Currently Closed
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Be First in Line for <span className="text-gradient">the Next Cohort.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#b8aecf] leading-relaxed">
                Skill registrations are currently closed. Join the vibrant KR8 Tribe community of 5,000+ creators and get instant priority notifications the moment admissions unlock.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <GradientButton
                  to="/tribe"
                  className="w-full sm:w-auto px-6 py-3 text-xs font-bold shadow-lg shadow-pink-500/25"
                >
                  Join the KR8 Tribe →
                </GradientButton>
                {waitlistUrl && (
                  <a
                    href={waitlistUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <span>💬</span>
                    <span>Join WhatsApp Waitlist ↗</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
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
