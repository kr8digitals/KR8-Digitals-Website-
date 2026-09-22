import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ATTENDANCE_TYPES,
  getAttendanceSubmissions,
  reviewAttendance,
  getAttendanceTypesSettings,
  toggleAttendanceTypeOpen,
  type AttendanceSubmission,
} from "../data/store";
import { Card, Pill, GradientButton, GhostButton } from "../components/ui";
import Icon from "../components/Icon";

const ATTENDANCE_PASSWORD = "KR8@Atd2026";

export default function AttendanceReview() {
  const { student: currentUser, addNotification } = useAuth();
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // Submissions and Types state
  const [submissions, setSubmissions] = useState<AttendanceSubmission[]>(getAttendanceSubmissions());
  const [openTypes, setOpenTypes] = useState<Record<string, boolean>>(getAttendanceTypesSettings());
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "accepted" | "rejected">("pending");

  // Rejection modal/inline state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Screenshot viewer modal
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);
  const [viewScreenshotTitle, setViewScreenshotTitle] = useState("");

  const isAuthorized = !!(
    currentUser?.admin ||
    currentUser?.type === "founder" ||
    currentUser?.type === "co-founder"
  );

  const syncData = () => {
    setSubmissions(getAttendanceSubmissions());
    setOpenTypes(getAttendanceTypesSettings());
  };

  useEffect(() => {
    window.addEventListener("kr8:attendance-updated", syncData);
    window.addEventListener("kr8:attendance-types-updated", syncData);
    window.addEventListener("storage", syncData);
    return () => {
      window.removeEventListener("kr8:attendance-updated", syncData);
      window.removeEventListener("kr8:attendance-types-updated", syncData);
      window.removeEventListener("storage", syncData);
    };
  }, []);

  // Block unauthorized public visitors
  if (!currentUser || !isAuthorized) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-md text-center py-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            <Icon name="lock" size={28} />
          </div>
          <Pill>Staff & Faculty Area</Pill>
          <h1 className="font-display mt-4 text-2xl text-white sm:text-3xl">Restricted Access</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">
            The Attendance Review system is strictly reserved for authorized KR8 coaches and administration.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <GradientButton to="/academy">Go to Member Portal</GradientButton>
            <GhostButton to="/">Return to Homepage</GhostButton>
          </div>
        </Card>
      </div>
    );
  }

  const unlock = () => {
    if (
      password === ATTENDANCE_PASSWORD ||
      currentUser?.admin?.role === "ultimate" ||
      currentUser?.type === "founder" ||
      currentUser?.type === "co-founder"
    ) {
      setError(false);
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  if (!unlocked) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white">
            <Icon name="lock" size={23} />
          </div>
          <Pill>Faculty & Coach Review</Pill>
          <h1 className="font-display mt-5 text-3xl text-white">Attendance Review</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#b8aecf]">
            Welcome, {currentUser?.name || "Coach"}. Enter review password to manage manual submissions and attendance types.
          </p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && unlock()}
            placeholder="Coach password"
            className="mt-5 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white focus:border-pink-400/60 focus:outline-none"
          />
          {error && <p className="mt-2 text-xs text-red-400">Incorrect attendance review password.</p>}
          <button
            onClick={unlock}
            className="mt-4 w-full rounded-full bg-gradient-pink py-3 text-sm font-bold text-white hover:brightness-110 active:scale-95 transition-all"
          >
            Unlock Review Queue
          </button>
        </Card>
      </div>
    );
  }

  // Handle Approve
  const handleApprove = (id: string, studentName: string, type: string) => {
    const reviewer = currentUser?.name || "KR8 Faculty Reviewer";
    reviewAttendance(id, "accepted", "Approved by faculty coach.", reviewer);
    syncData();
    addNotification(`Approved ${type} submission for ${studentName}.`);
  };

  // Handle Reject
  const handleConfirmReject = (id: string, studentName: string, type: string) => {
    if (!rejectFeedback.trim()) {
      setRejectError("Please provide a reason so the student knows what to correct.");
      return;
    }
    const reviewer = currentUser?.name || "KR8 Faculty Reviewer";
    reviewAttendance(id, "rejected", rejectFeedback.trim(), reviewer);
    setRejectingId(null);
    setRejectFeedback("");
    setRejectError("");
    syncData();
    addNotification(`Rejected ${type} submission for ${studentName} with feedback.`);
  };

  const handleToggleType = (typeKey: string) => {
    const next = !openTypes[typeKey];
    toggleAttendanceTypeOpen(typeKey, next);
    setOpenTypes((prev) => ({ ...prev, [typeKey]: next }));
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus === "all") return true;
    return s.status === filterStatus;
  });

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-5 py-12">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Pill>Manual Review Queue</Pill>
            <h1 className="font-display mt-4 text-4xl text-white sm:text-5xl font-bold">
              Attendance <span className="text-gradient">Review</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-[#cabfe0] hover:text-white hover:bg-white/5"
            >
              Admin Dashboard →
            </Link>
            <button
              onClick={() => setUnlocked(false)}
              className="rounded-full border border-white/15 px-4 py-2 text-xs text-[#b8aecf] hover:text-white"
            >
              Lock Review
            </button>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#b8aecf]">
          All four attendance tracks are reviewed manually. Students see their updated accepted or rejected status with coach feedback in real time on their profile.
        </p>

        {/* Attendance Tracks Open / Closed Controls */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ATTENDANCE_TYPES.map((t) => {
            const isOpen = openTypes[t.key] !== undefined ? openTypes[t.key] : t.open;
            return (
              <div
                key={t.key}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{t.name}</span>
                    <button
                      onClick={() => handleToggleType(t.key)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase transition-all ${
                        isOpen
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-white/10 text-gray-400 border border-white/10"
                      }`}
                    >
                      {isOpen ? "Open" : "Closed"}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[#8a7ba8]">{t.schedule}</p>
                </div>
                <div className="mt-3 border-t border-white/5 pt-2 text-[11px] text-[#cabfe0]">
                  {isOpen ? "Students can submit proof" : "Submissions disabled"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submissions Filter Tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex gap-2">
            {[
              { key: "pending", label: "Pending", count: submissions.filter((s) => s.status === "pending").length },
              { key: "accepted", label: "Accepted", count: submissions.filter((s) => s.status === "accepted").length },
              { key: "rejected", label: "Rejected", count: submissions.filter((s) => s.status === "rejected").length },
              { key: "all", label: "All Submissions", count: submissions.length },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key as any)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  filterStatus === f.key
                    ? "bg-gradient-pink text-white shadow-md glow-pink-sm"
                    : "bg-white/5 text-[#b8aecf] hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{f.label}</span>
                <span className="rounded-full bg-black/30 px-1.5 py-0.2 text-[10px] font-mono">
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs text-[#8a7ba8]">
            Showing {filteredSubmissions.length} of {submissions.length} total entries
          </span>
        </div>

        {/* Submissions List Queue */}
        <div className="mt-6 space-y-4">
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-16 text-center text-sm text-[#8a7ba8]">
              No submissions found under the selected "{filterStatus}" filter.
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const isPending = sub.status === "pending";
              const isAccepted = sub.status === "accepted";
              const isRejected = sub.status === "rejected";

              return (
                <div
                  key={sub.id}
                  className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-sm transition-all hover:border-white/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left: Info & Topic */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-pink-300">{sub.studentId}</span>
                        <span className="text-xs text-[#8a7ba8]">·</span>
                        <span className="font-bold text-white text-sm">{sub.studentName}</span>
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#cabfe0]">
                          {sub.skill}
                        </span>
                        <span className="rounded-full bg-pink-500/20 border border-pink-500/30 px-2.5 py-0.5 text-[10px] font-bold text-pink-300 uppercase">
                          {sub.type}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            isAccepted
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : isRejected
                              ? "bg-red-500/20 text-red-300 border border-red-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {sub.status}
                        </span>

                        {/* DUPLICATE SCREENSHOT FLAG */}
                        {sub.isDuplicateScreenshot && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                            ⚠️ Duplicate Screenshot Flag (Verify closely)
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-white">
                        <strong className="text-[#cabfe0]">Topic / Covered: </strong>
                        <span className="font-medium">{sub.topic}</span>
                        {sub.speaker && (
                          <span className="ml-2 text-xs text-pink-300">
                            (Speaker: {sub.speaker})
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#8a7ba8]">
                        Submitted {new Date(sub.submittedAt).toLocaleString()}
                        {sub.reviewedBy && (
                          <span> · Reviewed by {sub.reviewedBy}</span>
                        )}
                      </div>

                      {/* Display Feedback if Rejected or Note attached */}
                      {sub.feedback && (
                        <div
                          className={`mt-2 rounded-xl p-3 text-xs leading-relaxed border ${
                            isRejected
                              ? "border-red-500/30 bg-red-950/30 text-red-200"
                              : "border-emerald-500/30 bg-emerald-950/30 text-emerald-200"
                          }`}
                        >
                          <strong>Coach Feedback: </strong>
                          <span>{sub.feedback}</span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* View Screenshot button */}
                      {sub.screenshotUrl && (
                        <button
                          onClick={() => {
                            setViewScreenshotUrl(sub.screenshotUrl);
                            setViewScreenshotTitle(`${sub.studentName} — ${sub.topic}`);
                          }}
                          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-all"
                        >
                          <Icon name="paperclip" size={13} />
                          <span>View Screenshot</span>
                        </button>
                      )}

                      {/* Approve button */}
                      {isPending && (
                        <button
                          onClick={() => handleApprove(sub.id, sub.studentName, sub.type)}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-md"
                        >
                          <span>✓ Approve</span>
                        </button>
                      )}

                      {/* Reject button */}
                      {isPending && rejectingId !== sub.id && (
                        <button
                          onClick={() => {
                            setRejectingId(sub.id);
                            setRejectFeedback("");
                            setRejectError("");
                          }}
                          className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 active:scale-95 transition-all"
                        >
                          ✕ Reject with Feedback
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Rejection Feedback Form */}
                  {rejectingId === sub.id && (
                    <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                      <label className="block text-xs font-bold text-red-300">
                        Required Feedback / Reason for Rejection:
                      </label>
                      <textarea
                        rows={2}
                        value={rejectFeedback}
                        onChange={(e) => {
                          setRejectFeedback(e.target.value);
                          setRejectError("");
                        }}
                        placeholder="e.g. Screenshot timestamp does not match class window, or missing homework code snippet..."
                        className="w-full rounded-xl border border-red-500/30 bg-black/50 p-3 text-xs text-white placeholder:text-gray-500 focus:border-red-400 focus:outline-none"
                      />
                      {rejectError && <p className="text-xs text-red-400 font-semibold">{rejectError}</p>}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="rounded-xl px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmReject(sub.id, sub.studentName, sub.type)}
                          className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-500 shadow-md"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VIEW SCREENSHOT MODAL */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#12001f] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <h3 className="font-bold text-white text-sm truncate">{viewScreenshotTitle}</h3>
              <button
                onClick={() => setViewScreenshotUrl(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/60">
              <img
                src={viewScreenshotUrl}
                alt={viewScreenshotTitle}
                className="max-h-[75vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>
            <div className="border-t border-white/10 px-5 py-2.5 text-right">
              <button
                onClick={() => setViewScreenshotUrl(null)}
                className="rounded-xl bg-white/10 px-4 py-1.5 text-xs font-bold text-white hover:bg-white/20"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
