import { useAuth } from "../context/AuthContext";
import { Card, Pill, GhostButton } from "../components/ui";

export default function Settings() {
  useAuth();
  return <div className="section-bg min-h-screen px-5 py-16"><div className="mx-auto max-w-2xl"><Pill>Account settings</Pill><h1 className="font-display mt-5 text-4xl text-white">Your account, <span className="text-gradient">your control.</span></h1><Card className="mt-8"><h2 className="font-bold text-white">Profile editing</h2><p className="mt-2 text-sm leading-relaxed text-[#b8aecf]">Profile photo, cover image, personal bio and password can be edited from your signed-in Academy profile. Locked registration facts such as name, DOB, cohort year, KR8 ID and skill suffix cannot be changed.</p><div className="mt-5 flex flex-wrap gap-3"><GhostButton to="/academy">Open My Profile →</GhostButton></div></Card><Card className="mt-5"><h2 className="font-bold text-white">Messaging privacy</h2><p className="mt-2 text-sm text-[#b8aecf]">Manage Anyone, Friends only or No one messaging controls from the Connections section on your profile.</p></Card></div></div>;
}