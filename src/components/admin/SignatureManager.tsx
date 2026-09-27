import { useState, useEffect } from "react";
import {
  getSignatures,
  saveSignature,
  deleteSignature,
  resetSignaturesToDefault,
  type SignatureRecord,
} from "../../data/signatureStore";
import { getSkills } from "../../data/store";
import { Card } from "../ui";
import Icon from "../Icon";

export default function SignatureManager() {
  const [signatures, setSignatures] = useState<SignatureRecord[]>(getSignatures());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeSig, setActiveSig] = useState<Partial<SignatureRecord> | null>(null);
  const [customSkill, setCustomSkill] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const skills = getSkills();

  const sync = () => setSignatures(getSignatures());

  useEffect(() => {
    sync();
    window.addEventListener("kr8:signatures-updated", sync);
    return () => window.removeEventListener("kr8:signatures-updated", sync);
  }, []);

  const handleOpenAdd = () => {
    setActiveSig({
      role: "coach",
      skillKey: "graphic",
      coachName: "",
      title: "Lead Track Coach",
      signatureUrl: "",
    });
    setCustomSkill("");
    setIsEditing(true);
  };

  const handleOpenEdit = (sig: SignatureRecord) => {
    setActiveSig({ ...sig });
    setCustomSkill(sig.skillKey || "");
    setIsEditing(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setActiveSig((prev) => (prev ? { ...prev, signatureUrl: result } : null));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSig) return;

    if (!activeSig.coachName?.trim()) {
      alert("Please provide the Coach or Administrator Name.");
      return;
    }
    if (!activeSig.signatureUrl) {
      alert("Please upload a signature image file (PNG/JPEG).");
      return;
    }

    const assignedSkill =
      activeSig.role === "coach"
        ? (customSkill.trim() || activeSig.skillKey || "graphic")
        : undefined;

    saveSignature({
      id: activeSig.id,
      role: activeSig.role || "coach",
      skillKey: assignedSkill,
      coachName: activeSig.coachName.trim(),
      title: activeSig.title?.trim() || "Lead Instructor",
      signatureUrl: activeSig.signatureUrl,
    });

    setIsEditing(false);
    setActiveSig(null);
    setStatusMsg("Signature saved successfully! It is now automatically mapped for all certificates.");
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this coach signature?")) {
      try {
        deleteSignature(id);
        setStatusMsg("Signature deleted.");
        setTimeout(() => setStatusMsg(null), 3000);
      } catch (err: any) {
        alert(err.message || "Could not delete signature.");
      }
    }
  };

  const handleReset = () => {
    if (confirm("Reset all coach and administrator signatures to factory defaults?")) {
      resetSignaturesToDefault();
      setStatusMsg("Signatures restored to verified Drive defaults.");
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const adminSig = signatures.find((s) => s.role === "admin");
  const coachSigs = signatures.filter((s) => s.role === "coach");

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                <Icon name="pen" size={16} />
              </span>
              <span>Coach & Administrator Signatures Management</span>
            </h2>
            <p className="mt-1 text-xs text-[#b8aecf]">
              Official signatures automatically mapped to each skill track. When a certificate is generated, the system dynamically stamps the correct coach signature and the administrator signature.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleReset}
              className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-[#cabfe0] hover:bg-white/5 transition-all"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-pink px-4 py-2 text-xs font-bold text-white shadow-lg shadow-pink-500/20 hover:opacity-90 transition-all"
            >
              <Icon name="check" size={14} />
              <span>+ Add Coach Signature</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2.5 text-xs font-semibold text-emerald-300 animate-fadeIn">
            ✓ {statusMsg}
          </div>
        )}
      </Card>

      {/* SECTION 1: ADMINISTRATOR SIGNATURE */}
      <Card>
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-pink-400">✦</span> Executive Administrator Signature
            </h3>
            <p className="text-[11px] text-[#9a8db8]">
              Stamped universally across all official KR8 Digitals certificates on the bottom right.
            </p>
          </div>
          {adminSig && (
            <button
              onClick={() => handleOpenEdit(adminSig)}
              className="rounded-lg border border-pink-400/40 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold text-pink-300 hover:bg-pink-500/20"
            >
              Edit / Replace
            </button>
          )}
        </div>

        {adminSig ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-white/10 bg-black/30">
            <div className="h-24 w-44 rounded-lg bg-white p-2 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <img
                src={adminSig.signatureUrl}
                alt="Administrator Signature"
                className="max-h-full max-w-full object-contain filter contrast-125"
              />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{adminSig.coachName}</h4>
              <p className="text-xs text-[#a89ec4]">{adminSig.title}</p>
              <p className="text-[10px] text-[#7c6f96] mt-2 font-mono">
                Asset: {adminSig.signatureUrl.startsWith("data:") ? "Custom Upload (Data URL)" : adminSig.signatureUrl}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-rose-300">No administrator signature configured.</p>
        )}
      </Card>

      {/* SECTION 2: COACH SIGNATURES BY SKILL */}
      <Card>
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-pink-400">✦</span> Coach Signatures (Mapped to Skill Tracks)
            </h3>
            <p className="text-[11px] text-[#9a8db8]">
              Each certificate automatically pulls the verified signature matching the student's registered skill.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coachSigs.map((sig) => (
            <div
              key={sig.id}
              className="p-4 rounded-xl border border-white/10 bg-black/30 flex flex-col justify-between space-y-4 hover:border-pink-500/30 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-300 font-mono">
                    {sig.skillKey || "Universal"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(sig)}
                      className="text-xs text-pink-400 hover:text-pink-300 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sig.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-20 rounded-lg bg-white p-2 flex items-center justify-center border border-white/20 shadow-inner">
                  <img
                    src={sig.signatureUrl}
                    alt={`${sig.coachName} signature`}
                    className="max-h-full max-w-full object-contain filter contrast-125"
                  />
                </div>

                <h4 className="mt-3 text-xs font-bold text-white">{sig.coachName}</h4>
                <p className="text-[11px] text-[#a89ec4]">{sig.title}</p>
              </div>

              <div className="pt-2 border-t border-white/5 text-[10px] text-[#7c6f96]">
                Updated: {new Date(sig.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* MODAL: ADD / EDIT SIGNATURE */}
      {isEditing && activeSig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#160029] p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Icon name="pen" size={16} className="text-pink-400" />
                <span>{activeSig.id ? "Edit Signature" : "Add Coach Signature"}</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-[#8a7ba8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {activeSig.role === "coach" && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                    Assign to Skill Track
                  </label>
                  <select
                    value={activeSig.skillKey || "custom"}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setActiveSig({ ...activeSig, skillKey: undefined });
                      } else {
                        setActiveSig({ ...activeSig, skillKey: e.target.value });
                        setCustomSkill(e.target.value);
                      }
                    }}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-pink-500 focus:outline-none"
                  >
                    {skills.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.name} ({s.key})
                      </option>
                    ))}
                    <option value="custom">+ Other / Custom Future Skill</option>
                  </select>

                  {(!activeSig.skillKey || activeSig.skillKey === "custom") && (
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Type custom skill name (e.g. AI Prompt Engineering)"
                      className="mt-2 w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                  {activeSig.role === "admin" ? "Administrator Full Name" : "Coach Full Name"}
                </label>
                <input
                  type="text"
                  value={activeSig.coachName || ""}
                  onChange={(e) => setActiveSig({ ...activeSig, coachName: e.target.value })}
                  placeholder="e.g. Kenneth Timothy Iziogo"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Official Title
                </label>
                <input
                  type="text"
                  value={activeSig.title || ""}
                  onChange={(e) => setActiveSig({ ...activeSig, title: e.target.value })}
                  placeholder="e.g. Lead Brand & Graphic Design Instructor"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-[#7c6f96] focus:border-pink-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#b8aecf] mb-1">
                  Upload Signature File (PNG / JPEG)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-[#a89ec4] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-600/30 file:text-pink-300 hover:file:bg-pink-600/50"
                />
              </div>

              {activeSig.signatureUrl && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <p className="text-[10px] text-[#a89ec4] uppercase font-bold mb-1.5">Preview on White Canvas:</p>
                  <div className="h-20 rounded bg-white p-2 flex items-center justify-center">
                    <img
                      src={activeSig.signatureUrl}
                      alt="Signature preview"
                      className="max-h-full max-w-full object-contain filter contrast-125"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs text-[#cabfe0] hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-pink px-5 py-2 text-xs font-bold text-white shadow-lg hover:opacity-90"
                >
                  Save Signature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
