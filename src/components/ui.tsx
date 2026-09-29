import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { generateDefaultAvatar } from "../data/store";

function driveFallback(src: string) {
  const id = src.match(/[?&]id=([^&]+)/)?.[1];
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1200` : "";
}

export function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const retrySrc = driveFallback(src);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-[#180026] text-center text-[10px] uppercase tracking-wider text-pink-200 ${fallbackClassName || className}`}>
        Image unavailable<br />Check Drive sharing
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      onError={() => {
        if (retrySrc && currentSrc !== retrySrc) setCurrentSrc(retrySrc);
        else setFailed(true);
      }}
    />
  );
}

export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-2 rounded-full border border-pink-400/30 bg-pink-500/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d9a8e8] ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-gradient-pink" />
      {children}
    </span>
  );
}

export function GradientButton({
  children,
  to,
  href,
  onClick,
  className = "",
  type,
  disabled,
}: {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full bg-gradient-pink px-7 py-3.5 text-sm font-bold text-white glow-pink-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) {
    const isAnchor = href.startsWith("#");
    return <a href={href} target={isAnchor ? undefined : "_blank"} rel={isAnchor ? undefined : "noreferrer"} className={cls}>{children}</a>;
  }
  return <button type={type || "button"} disabled={disabled} onClick={onClick} className={cls}>{children}</button>;
}

export function GhostButton({
  children,
  to,
  href,
  onClick,
  className = "",
}: {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-pink-400/60 hover:text-[#e79bf0] ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) {
    const isAnchor = href.startsWith("#");
    return <a href={href} target={isAnchor ? undefined : "_blank"} rel={isAnchor ? undefined : "noreferrer"} className={cls}>{children}</a>;
  }
  return <button onClick={onClick} className={cls}>{children}</button>;
}

export function SectionHead({
  label,
  title,
  highlight,
  sub,
  center,
}: {
  label: string;
  title: ReactNode;
  highlight?: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      <Pill>{label}</Pill>
      <h2 className="font-display mt-5 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
        {title} {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {sub && <p className="mt-5 text-base leading-relaxed text-[#b8aecf]">{sub}</p>}
    </div>
  );
}

export function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm text-[#cabfe0]">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-pink text-[10px] text-white">
        ✓
      </span>
      {children}
    </li>
  );
}

export function GlowImage({
  src,
  alt,
  className = "",
  caption,
}: {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-pink opacity-30 blur-3xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10">
        <ImageWithFallback src={src} alt={alt} className="h-full w-full object-cover" />
        {caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-xs text-white/90">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

export function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const avatarSrc = src && src.trim().length > 0 ? src : generateDefaultAvatar(name);
  return (
    <img
      src={avatarSrc}
      alt={name}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover ring-2 ring-pink-400/30"
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}
