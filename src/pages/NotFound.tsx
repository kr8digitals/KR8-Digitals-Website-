import { Link } from "react-router-dom";
import { Pill, GradientButton, GhostButton } from "../components/ui";
import { useSeo } from "../lib/useSeo";

/**
 * Branded 404 experience for unknown routes.
 * Keeps visitors inside the KR8 brand surface instead of an empty content area:
 * luminous logo hero, gradient 404 display, and clear next-step CTAs.
 */
export default function NotFound() {
  // 404s must never be indexed; canonical points at the home page.
  useSeo({
    title: "Page Not Found | KR8 Digitals",
    description:
      "The page you were looking for doesn't exist in the KR8 universe. Head back home or verify a certificate.",
    path: "/",
    noindex: true,
  });

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-10 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-xl flex-col items-center text-center">
        {/* Luminous logo hero (same container pattern as Sign-In / Verify portals) */}
        <div className="mb-4 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500/25 via-purple-500/15 to-transparent p-2 border border-pink-500/40 shadow-2xl shadow-pink-500/30">
            <img
              src="/branding/kr8_logo.png"
              alt="KR8 Digitals Logo"
              className="h-full w-full object-contain filter drop-shadow"
            />
          </div>
        </div>

        <Pill>KR8 Digitals</Pill>

        {/* Gradient 404 display */}
        <div
          aria-hidden="true"
          className="text-gradient font-display mt-4 text-7xl leading-none font-black tracking-tight sm:text-8xl"
        >
          404
        </div>

        <h1 className="font-display mt-4 text-2xl text-white sm:text-3xl">
          This page doesn&apos;t exist in the KR8 universe
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#b8aecf]">
          The link you followed may be broken, or the page may have moved.
          Head back home, or use one of the quick actions below to keep moving.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <GradientButton to="/" className="w-full sm:w-auto px-6 py-3 text-xs font-bold shadow-lg shadow-pink-500/25">
            ← Back to Home
          </GradientButton>
          <GhostButton to="/verify" className="w-full sm:w-auto px-6 py-3 text-xs font-bold">
            Verify a Certificate
          </GhostButton>
        </div>

        {/* Secondary quick links */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#8f85a8]">
          <Link to="/academy" className="transition-colors hover:text-pink-400">
            Academy
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/tribe" className="transition-colors hover:text-pink-400">
            KR8 Tribe
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/signin" className="transition-colors hover:text-pink-400">
            Member Sign In
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/leaderboard" className="transition-colors hover:text-pink-400">
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
