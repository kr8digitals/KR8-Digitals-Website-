import { useEffect, useState } from "react";
import { getMediaAsset } from "../utils/mediaStorage";

/** Bundled /events/ images ship alongside an optimized "-web" variant
 *  (smaller file, identical content). Use the variant when present and
 *  fall back to the original if the file is missing. Custom flyers
 *  (Drive URLs, media-vault keys) pass through untouched. */
export function webVariant(path: string): string {
  return path.startsWith("/events/") && !/-web\.(jpe?g|png)$/i.test(path)
    ? path.replace(/\.(png|jpe?g)$/i, "-web.jpg")
    : path;
}

/** Image that understands every source the Mindset Shift event config
 *  allows: public paths (with the -web optimization + fallback), remote
 *  URLs, and "idb:" media-vault keys (admin uploads) resolved from
 *  IndexedDB. Renders nothing until an idb: key has resolved. */
export function AssetImage({ src, alt, className, loading = "lazy" }: { src: string; alt: string; className?: string; loading?: "lazy" | "eager" }) {
  const isIdb = !!src && src.startsWith("idb:");
  const [resolvedKey, setResolvedKey] = useState<string | null>(isIdb ? null : src || null);
  const [variantIdx, setVariantIdx] = useState(0);

  useEffect(() => {
    if (!src) {
      setResolvedKey(null);
      return;
    }
    if (!src.startsWith("idb:")) {
      setResolvedKey(src);
      return;
    }
    let live = true;
    setResolvedKey(null);
    getMediaAsset(src).then((asset) => {
      if (live) setResolvedKey(asset || null);
    });
    return () => {
      live = false;
    };
  }, [src]);

  // Reset the web-variant fallback position whenever the source changes
  useEffect(() => {
    setVariantIdx(0);
  }, [resolvedKey]);

  const effective = resolvedKey;
  if (!effective) return null;
  const web = webVariant(effective);
  const variants = web !== effective ? [web, effective] : [effective];
  return (
    <img
      key={effective}
      src={variants[Math.min(variantIdx, variants.length - 1)]}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setVariantIdx((v) => Math.min(v + 1, variants.length - 1))}
    />
  );
}
