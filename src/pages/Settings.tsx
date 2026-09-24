import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateAccount, getReferralUrl, getSkill } from "../data/store";
import { Card, Pill, GradientButton, GhostButton } from "../components/ui";
import Icon from "../components/Icon";
import {
  registerBiometric,
  getBiometricForStudent,
  removeBiometric,
  authenticateWithBiometrics,
  checkBiometricSupport,
  type BiometricCredential,
} from "../utils/biometrics";

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

  // Biometrics state
  const [biometric, setBiometric] = useState<BiometricCredential | undefined>(undefined);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioMessage, setBioMessage] = useState("");
  const [bioSuccess, setBioSuccess] = useState(false);
  const [supportInfo, setSupportInfo] = useState<{ supported: boolean; hasPlatformSensor: boolean; reason: string } | null>(null);

  useEffect(() => {
    if (student) {
      setBiometric(getBiometricForStudent(student.id));
    }
    checkBiometricSupport().then(setSupportInfo);
  }, [student]);

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

  const skill = getSkill(student.skill);

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

  const handleEnableBiometric = async () => {
    setBioLoading(true);
    setBioMessage("Awaiting hardware sensor touch... Please touch your fingerprint sensor or verify your passkey when prompted.");
    setBioSuccess(false);
    try {
      const res = await registerBiometric(student.id, student.name);
      if (res.ok && res.credential) {
        setBiometric(res.credential);
        setBioSuccess(true);
        setBioMessage("Sensor verified! Fingerprint passkey registered successfully for this device.");
        setTimeout(() => setBioMessage(""), 5000);
      } else {
        setBioSuccess(false);
        setBioMessage(res.error || "Sensor verification was not completed.");
      }
    } catch (e: unknown) {
      setBioSuccess(false);
      setBioMessage(e instanceof Error ? e.message : "Sensor registration error");
    } finally {
      setBioLoading(false);
    }
  };

  const handleTestBiometric = async () => {
    setBioLoading(true);
    setBioMessage("Touch your sensor now to verify identity...");
    setBioSuccess(false);
    try {
      const res = await authenticateWithBiometrics(student.id);
      if (res.ok) {
        setBioSuccess(true);
        setBioMessage("Biometric verified! Your fingerprint sensor is fully active and working.");
        setTimeout(() => setBioMessage(""), 5000);
      } else {
        setBioSuccess(false);
        setBioMessage(res.error || "Biometric sensor verification failed or was cancelled.");
      }
    } catch (e: unknown) {
      setBioSuccess(false);
      setBioMessage(e instanceof Error ? e.message : "Verification error");
    } finally {
      setBioLoading(false);
    }
  };

  const handleRemoveBiometric = () => {
    removeBiometric(student.id);
    setBiometric(undefined);
    setBioSuccess(true);
    setBioMessage("Fingerprint credentials removed from this device.");
    setTimeout(() => setBioMessage(""), 3000);
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(getReferralUrl(student.id));
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="section-bg min-h-screen px-5 py-14">
      <div className="mx-auto max-w-3xl">
        <Pill>
          {student.type === "founder"
            ? "Founder Executive Settings"
            : student.type === "co-founder"
            ? "Co-Founder Executive Settings"
            : "Account Settings"}
        </Pill>
        <h1 className="font-display mt-4 text-4xl text-white sm:text-5xl">
          {student.type === "founder" ? (
            <>Founder Account, <span className="text-gradient">Executive Control.</span></>
          ) : student.type === "co-founder" ? (
            <>Co-Founder Account, <span className="text-gradient">Executive Control.</span></>
          ) : (
            <>Your Account, <span className="text-gradient">Your Control.</span></>
          )}
        </h1>
        <p className="mt-2 text-sm text-[#b8aecf]">
          Manage your verification privacy, security, profile information, and referral link.
        </p>

        {/* Locked Identity Card */}
        <Card className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-bold text-white text-lg">
                {student.type === "founder" || student.type === "co-founder"
                  ? "Verified Executive Leadership Record"
                  : "Verified Identity Record"}
              </h2>
              <p className="text-xs text-[#8a7ba8]">
                {student.type === "founder" || student.type === "co-founder"
                  ? "These leadership credentials confirm your executive status across KR8 Digitals."
                  : "These official registration facts are locked to protect the integrity of your KR8 credential."}
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
              <span className="text-[#8a7ba8]">Platform Role</span>
              <p className="font-semibold text-white mt-1 text-sm">
                {student.type === "founder"
                  ? "Founder & CEO · Executive Leadership"
                  : student.type === "co-founder"
                  ? "Co-Founder · Executive Leadership"
                  : skill?.name ?? student.skill}
              </p>
            </div>
            <div className="rounded-xl bg-black/20 p-3">
              <span className="text-[#8a7ba8]">Status & Authority</span>
              <p className="font-semibold text-white mt-1 text-sm">
                {student.type === "founder"
                  ? "Founder & CEO · Full System Authority"
                  : student.type === "co-founder"
                  ? "Co-Founder · Executive Leadership Authority"
                  : `Cohort ${student.year ?? 2026} · ${student.graduated ? `Graduated (${student.certTier})` : "In Training"}`}
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

        {/* Biometrics & Fingerprint Authentication */}
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-pink text-white shadow-md">
                <Icon name="fingerprint" size={22} />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Fingerprint & Biometric Login</h2>
                <p className="text-xs text-[#b8aecf]">
                  Secure your account with Touch ID, Face ID, Windows Hello or device fingerprint passkey.
                </p>
              </div>
            </div>

            {biometric ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Active on this device
              </span>
            ) : (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#b8aecf]">
                Not registered
              </span>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            {/* Hardware sensor diagnostic banner */}
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs">
              <span className="text-pink-400">🔍</span>
              <span className="text-[#8a7ba8]">Hardware Sensor Status:</span>
              <span className="font-medium text-white">
                {supportInfo
                  ? supportInfo.hasPlatformSensor
                    ? "✓ Built-in Sensor Ready (Touch ID / Windows Hello / Android Fingerprint)"
                    : supportInfo.supported
                    ? "ℹ Passkey Authenticator Ready (Mobile QR / Security Key)"
                    : "⚠️ Biometrics Unavailable on this browser/window"
                  : "Checking hardware sensors..."}
              </span>
            </div>

            {biometric ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#8a7ba8]">Registered Hardware / Passkey:</span>
                  <span className="font-mono text-pink-300">{biometric.deviceLabel}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-[#8a7ba8]">Activated On:</span>
                  <span className="text-[#cabfe0]">
                    {new Date(biometric.registeredAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#cabfe0] pt-1">
                  You can now sign into your KR8 student account on this device with a single touch or face recognition prompt, without needing to re-enter your password each time.
                </p>

                <div className="mt-3 flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleTestBiometric}
                    disabled={bioLoading}
                    className="rounded-full border border-pink-400/50 bg-pink-500/10 px-4 py-2 text-xs font-bold text-pink-200 hover:bg-pink-500/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Icon name="fingerprint" size={14} />
                    {bioLoading ? "Scanning sensor..." : "Test Fingerprint Sensor"}
                  </button>
                  <button
                    onClick={handleRemoveBiometric}
                    className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                  >
                    Remove from this Device
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#b8aecf] leading-relaxed">
                  Register your device fingerprint sensor or passkey for instant, passwordless logins on your phone, tablet, or laptop. When you click register, your browser will prompt you to touch your fingerprint sensor or verify your screen lock. Zero biometric data is ever sent to external servers.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleEnableBiometric}
                    disabled={bioLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-pink px-5 py-2.5 text-xs font-bold text-white glow-pink-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    <Icon name="fingerprint" size={16} />
                    {bioLoading ? "Awaiting Sensor Touch..." : "Register Device Fingerprint / Passkey"}
                  </button>
                </div>
              </div>
            )}

            {bioMessage && (
              <div
                className={`mt-3 rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 ${
                  bioSuccess
                    ? "bg-green-500/15 border border-green-500/30 text-green-300"
                    : "bg-red-500/15 border border-red-500/30 text-red-300"
                }`}
              >
                <span>{bioSuccess ? "✓" : "⚠️"}</span>
                <span>{bioMessage}</span>
              </div>
            )}
          </div>
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
