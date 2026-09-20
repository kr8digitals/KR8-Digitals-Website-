import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Pill, GradientButton } from "../components/ui";
import Icon from "../components/Icon";

type Msg = { role: "user" | "ai"; text: string };

const prompts = [
  "Suggest a 30-day roadmap for graphic design",
  "Review my portfolio approach",
  "What tools should a video editor learn?",
  "How do I get my first client?",
];

function reply(q: string): string {
  const l = q.toLowerCase();
  if (l.includes("roadmap"))
    return "Here's a solid 30-day roadmap:\n\nWeek 1 — Fundamentals: learn the core tools and principles.\nWeek 2 — Guided practice: recreate 3 real-world pieces.\nWeek 3 — Original work: build 2 portfolio projects.\nWeek 4 — Ship & share: post your work in the Tribe, get feedback, and apply for your first gig.\n\nConsistency beats intensity — 1 focused hour a day wins.";
  if (l.includes("client"))
    return "Getting your first client:\n1. Package 3 strong portfolio pieces.\n2. Offer a small, clear service (not 'everything').\n3. Post it in the KR8 Tribe and ask for referrals.\n4. Reach out to 5 local businesses a day.\n5. Over-deliver on the first job — referrals compound.";
  if (l.includes("tool"))
    return "For video editing, start with DaVinci Resolve (free & powerful) or CapCut for fast social edits. Learn: cutting to rhythm, color correction, audio leveling, and simple motion graphics. Master one deeply before adding more.";
  if (l.includes("portfolio"))
    return "A strong portfolio shows outcomes, not just visuals. For each piece include: the problem, your approach, and the result. 4 great projects beat 20 average ones. Lead with your best work.";
  return "Great question! Break it into the smallest next step you can take today, then act on it. Want me to turn this into a step-by-step plan for your skill track? Tell me which skill you're on and your current level.";
}

export default function AIPage() {
  const { student } = useAuth();
  const LIMIT = 3;
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: `Hi${student ? " " + student.name.split(" ")[0] : ""}! I'm KR8 AI — your always-on creative mentor. Ask me anything about skills, projects, roadmaps or tools.` },
  ]);
  const [input, setInput] = useState("");
  const [used, setUsed] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const locked = !student && used >= LIMIT;

  const send = (text: string) => {
    if (!text.trim() || locked) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    if (!student) setUsed((u) => u + 1);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "ai", text: reply(text) }]);
    }, 500);
  };

  return (
    <div className="section-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-5 py-14">
        <div className="text-center">
          <Pill>Always-On Creative Copilot</Pill>
          <h1 className="font-display mt-5 text-4xl uppercase text-white sm:text-6xl font-bold">
            Your 24/7 creative mentor. <span className="text-gradient">Zero judgment.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[#cabfe0] leading-relaxed">
            Stuck on client pricing? Need a critique on your visual balance? Brainstorming high-retention video hooks? Ask KR8 AI for battle-tested advice calibrated for real market demand.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-3 border-b border-white/10 bg-[#12001f] px-5 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-pink text-white"><Icon name="bot" size={18} /></span>
            <div>
              <p className="text-sm font-bold text-white">KR8 AI</p>
              <p className="text-[11px] text-green-400">● Online{!student && ` · ${LIMIT - used} free messages left`}</p>
            </div>
          </div>

          <div className="h-[380px] space-y-4 overflow-y-auto p-5">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-gradient-pink text-white" : "border border-white/10 bg-black/30 text-[#cabfe0]"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {locked && (
              <div className="rounded-2xl border border-pink-400/40 bg-pink-500/10 p-5 text-center">
                <p className="text-sm text-white">You've used your 3 free messages.</p>
                <p className="mt-1 text-xs text-[#b8aecf]">Register free for unlimited access and saved history.</p>
                <div className="mt-4"><GradientButton to="/academy">Join for Free →</GradientButton></div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button key={p} onClick={() => send(p)} disabled={locked} className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-[#b8aecf] hover:border-pink-400/50 disabled:opacity-40">
                  {p}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 text-lg text-[#b8aecf]">
                <Icon name="paperclip" size={17} /><input type="file" className="hidden" />
              </label>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                disabled={locked}
                placeholder={locked ? "Register to continue…" : "Ask KR8 AI anything…"}
                className="flex-1 rounded-xl border border-white/15 bg-black/20 px-4 text-sm text-white placeholder:text-[#6f6390] focus:border-pink-400/60 focus:outline-none disabled:opacity-40"
              />
              <button onClick={() => send(input)} disabled={locked} className="rounded-xl bg-gradient-pink px-5 text-sm font-bold text-white disabled:opacity-40">Send</button>
            </div>
            {student && (
              <button onClick={() => setMsgs(msgs.slice(0, 1))} className="mt-3 text-xs text-[#8a7ba8] hover:text-pink-400">Clear conversation history</button>
            )}
          </div>
        </div>

        {!student && (
          <p className="mt-6 text-center text-xs text-[#8a7ba8]">
            Signed-in accounts get unlimited access & saved history. <Link to="/academy" className="text-pink-400">Register free →</Link>
          </p>
        )}
      </div>
    </div>
  );
}
