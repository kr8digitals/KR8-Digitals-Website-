import { useEffect, useMemo } from "react";

/**
 * Lightweight per-route SEO/head manager (no external dependency).
 *
 * Sets document.title, the meta description, the <link rel="canonical">,
 * Open Graph / Twitter preview tags, and an optional route-level JSON-LD
 * block (the global EducationalOrganization JSON-LD in index.html is left
 * untouched).
 *
 * Usage:
 *   useSeo({
 *     title: "Academy — Free Digital Skills Training | KR8 Digitals",
 *     description: "...",
 *     path: "/academy",
 *     jsonLd: { ... } | undefined,
 *     noindex: true, // private/app pages
 *   });
 *
 * The effect re-runs only when the serialized options actually change, so a
 * stable options object runs once on mount (safe to coexist with pages that
 * manage their own dynamic meta, e.g. /verify).
 */
export interface SeoOptions {
  title?: string;
  description?: string;
  /** Canonical path (e.g. "/academy"). Defaults to the current pathname. */
  path?: string;
  /** Route-level structured data (injected into a single #kr8-route-jsonld slot). */
  jsonLd?: Record<string, unknown>;
  /** Emits <meta name="robots" content="noindex, nofollow"> for private/app pages. */
  noindex?: boolean;
  /** og:image / twitter:image (absolute URL). Falls back to the site OG image. */
  image?: string;
  /** og:type — e.g. "event" for the Mindset Shift page. Defaults to "website". */
  ogType?: string;
}

const BASE_URL = "https://kr8digitals.com";
const DEFAULT_OG_IMAGE = "https://kr8digitals.com/og-image.png";
const ROUTE_JSONLD_ID = "kr8-route-jsonld";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function useSeo(options: SeoOptions) {
  const key = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    let opts: SeoOptions;
    try {
      opts = JSON.parse(key) as SeoOptions;
    } catch {
      return;
    }
    if (!opts) return;

    const path = opts.path ?? window.location.pathname;
    const url = path === "/" ? `${BASE_URL}/` : `${BASE_URL}${path}`;

    if (opts.title) document.title = opts.title;
    if (opts.description) upsertMeta("name", "description", opts.description);

    // One canonical per page.
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // Robots directive for private/app pages.
    const prevRobots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (opts.noindex) {
      upsertMeta("name", "robots", "noindex, nofollow");
    } else if (prevRobots) {
      prevRobots.remove();
    }

    // Social previews.
    if (opts.title) {
      upsertMeta("property", "og:title", opts.title);
      upsertMeta("name", "twitter:title", opts.title);
    }
    if (opts.description) {
      upsertMeta("property", "og:description", opts.description);
      upsertMeta("name", "twitter:description", opts.description);
    }
    upsertMeta("property", "og:url", url);
    // Reset to the site defaults when a route doesn't override them, so
    // SPA navigation never leaves a stale event image/type behind.
    upsertMeta("property", "og:image", opts.image || DEFAULT_OG_IMAGE);
    upsertMeta("name", "twitter:image", opts.image || DEFAULT_OG_IMAGE);
    upsertMeta("property", "og:type", opts.ogType || "website");

    // Route structured data: single slot, replaced (and cleaned up on
    // unmount / option change) so routes never stack stale JSON-LD.
    const prev = document.getElementById(ROUTE_JSONLD_ID);
    if (prev) prev.remove();
    if (opts.jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = ROUTE_JSONLD_ID;
      script.textContent = JSON.stringify(opts.jsonLd);
      document.head.appendChild(script);
    }
  }, [key]);
}
