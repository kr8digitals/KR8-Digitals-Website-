import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateAccount, getReferralUrl, SKILLS } from "../data/store";
import { Card, Pill, GradientButton, GhostButton } from "../components/ui";
import Icon from "../components/Icon";

export default function Settings() {
  const { student, signIn, signOut } = useAuth();
  const [expanded, setExpanded] = useState(!!student?.expandedVisibility);
  const [bio, setBio] = useState(student?.bio ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacy, setPrivacy] = useState<"Anyone" | "Friends only" | "No one">(
    student?.messagePrivacy ?? "Anyone"
  );
  const [savedBio, setSavedBio] = useState(false);
  const [savedPrivacy, setSavedPrivacy] = useState(false);
  const [savedPassword, setSavedPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [copiedRef, setCopiedRef] = useState(false);

  if (!student) {
    return (
      <div className="section-bg flex min-h-screen items-center justify-center px-5 py-16">
        <Card className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-pink text-white">
            <Icon name="lock" size={24} />
          </div>
          <h1 className="font-display text-2xl text-white">Account Settings</h1>
          <p className="mt-2 text-sm text-[#b8aecf]">Please sign in with your KR8 Identity to manage your account settings.</p>
          <div className="mt-6 flex flex-col gap-3">
            <GradientButton to="/academy" className="w-full">Sign In to KR8 Academy →</GradientButton>
            <GhostButton to="/">Return Home</GhostButton>
          </div>
        </Card>
      </div>
    );
  }

  const skill = SKILLS.find((s) => s.key === student.skill);

  const handleToggleExpanded = (val: boolean) => {
    setExpanded(val);
    const updated = updateAccount(student.id, { expandedVisibility: val });
    if (updated) signIn(updated);
  };

  const handleSaveBio = () => {
    const updated = updateAccount(student.id, { bio: bio.trim() });
    if (updated) {
      signIn(updated);
      setSavedBio(true);
      setTimeout(() => setSavedBio(false), 2000);
    }
  };

  const handleSavePrivacy = (val: "Anyone" | "Friends only" | "No one") => {
    setPrivacy(val);
    const updated = updateAccount(student.id, { messagePrivacy: val });
    if (updated) {
      signIn(updated);
      setSavedPrivacy(true);
      setTimeout(() => setSavedPrivacy(false), 2000);
    }
  };

  const handleUpdatePassword = () => {
    setPasswordError("");
    if (!password.trim() || password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    const updated = updateAccount(student.id, { password: password.trim() });
    if (updated) {
      signIn(updated);
      setPassword("");
      setConfirmPassword("");
      setSavedPassword(true);
      setTimeout(() => setSavedPassword(false), 2000);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(getReferralUrl(student.id));
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="section-bg min-h-screen px-5 py-14">
      <div className="mx-auto max-w-3xl">
        <Pill>Account Settings</Pill>
        <h1 className="font-display mt-4 text-4xl text-white sm:text-5xl">
          Your Account, <span className="text-gradient">Your Control.</span>
        </h1>
        <p className="mt-2 text-sm text-[#b8aecf]">
          Manage your verification privacy, security, profile information, and referral link.
        </p>

        {/* Locked Identity Card */}
        <Card className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-bold text-white text-lg">Verified Identity Record</h2>
              <p className="text-xs text-[#8a7ba8]">
                These official registration facts are locked to protect the integrity of your KR8 credential.
              </p>
            </div>
            <span className="rounded-full bg-pink-500/10 px-3 py-1 font-mono text-xs font-bold text-pink-400">
              {student.id}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl bg-black/20 p-3">
              <span className="text-[#8a7ba8]">Full Name</span>
              <p className="font-semibold text-white mt-1 text-sm">{student.name}</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <span className="text-[#8a7ba8]">Registered Email</span>
              <p className="font-semibold text-white mt-1 text-sm">{student.email}</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <span className="text-[#8a7ba8]">Skill Track</span>
              <p className="font-semibold text-white mt-1 text-sm">{skill?.name ?? student.skill}</p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <span className="text-[#8a7ba8]">Cohort Year & Status</span>
              <p className="font-semibold text-white mt-1 text-sm">
                Cohort {student.year ?? 2026} · {student.graduated ? `Graduated (${student.certTier})` : "In Training"}
              </p>
            </div>
          </div>
        </Card>

        {/* Public Verification Privacy */}
        <Card className="mt-6">
          <h2 className="font-bold text-white text-lg">Public Verify Page Visibility</h2>
          <p className="mt-1 text-xs text-[#b8aecf]">
            Control what information external visitors and employers see when looking up your KR8 ID on the public Verify page (<code className="text-pink-300">/verify?id={student.id}</code>).
          </p>

          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 cursor-pointer hover:border-pink-400/40">
            <input
              type="checkbox"
              checked={expanded}
              onChange={(e) => handleToggleExpanded(e.target.checked)}
              className="mt-1 accent-pink-500"
            />
            <div>
              <p className="text-sm font-semibold text-white">Enable Expanded Profile Visibility</p>
              <p className="text-xs text-[#8a7ba8] mt-1">
                When enabled, your verified attendance count, assignment submissions, total XP points, and admin remarks are visible to anyone verifying your certificate. When disabled, only your core graduation identity is displayed.
              </p>
            </div>
          </label>
        </Card>

        {/* Personal Bio */}
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-lg">Personal Bio</h2>
            {savedBio && <span className="text-xs text-green-300 font-semibold">✓ Bio saved!</span>}
          </div>
          <p className="mt-1 text-xs text-[#b8aecf]">A short description of yourself, your craft, and what you are building.</p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="e.g. Visual designer passionate about brand identity and typography in West Africa."
            className="mt-3 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none"
          />
          <div className="mt-3">
            <button
              onClick={handleSaveBio}
              className="rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white"
            >
              Save Bio
            </button>
          </div>
        </Card>

        {/* Messaging Privacy */}
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-lg">Messaging & Direct Communication</h2>
            {savedPrivacy && <span className="text-xs text-green-300 font-semibold">✓ Privacy updated!</span>}
          </div>
          <p className="mt-1 text-xs text-[#b8aecf]">Select who is permitted to send you direct messages inside the Tribe community.</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {(["Anyone", "Friends only", "No one"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleSavePrivacy(opt)}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-colors ${
                  privacy === opt
                    ? "bg-gradient-pink text-white"
                    : "border border-white/15 bg-black/20 text-[#cabfe0] hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </Card>

        {/* Password & Security */}
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white text-lg">Change Password</h2>
            {savedPassword && <span className="text-xs text-green-300 font-semibold">✓ Password updated successfully!</span>}
          </div>
          <p className="mt-1 text-xs text-[#b8aecf]">Update your login password for your KR8 Identity.</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[#8a7ba8]">New Password (min 6 chars)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white focus:border-pink-400/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#8a7ba8]">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="mt-1 w-full rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white focus:border-pink-400/60 focus:outline-none"
              />
            </div>
          </div>

          {passwordError && (
            <p className="mt-2 text-xs text-red-400">{passwordError}</p>
          )}

          <button
            onClick={handleUpdatePassword}
            className="mt-4 rounded-full bg-gradient-pink px-5 py-2 text-xs font-bold text-white"
          >
            Update Password
          </button>
        </Card>

        {/* Referral Link */}
        <Card className="mt-6">
          <h2 className="font-bold text-white text-lg">My Referral Program Link</h2>
          <p className="mt-1 text-xs text-[#b8aecf]">Earn points and badges by inviting fellow creatives to learn digital skills.</p>
          <div className="mt-3 flex items-center gap-2">
            <input
              readOnly
              value={getReferralUrl(student.id)}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 font-mono text-xs text-pink-300 focus:outline-none select-all"
            />
            <button
              onClick={copyReferral}
              className="rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white whitespace-nowrap"
            >
              {copiedRef ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
        </Card>

        {/* Navigation & Logout */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/academy" className="text-xs text-pink-300 hover:text-white">
            ← Return to My Academy Profile
          </Link>
          <button
            onClick={signOut}
            className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
          >
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
