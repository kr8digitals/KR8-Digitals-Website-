/**
 * KR8 Digitals — High-Capacity IndexedDB Media Storage for Announcements & Uploads
 * Prevents localStorage QuotaExceededError when uploading large image/video assets.
 */

const DB_NAME = "kr8_media_vault_v1";
const STORE_NAME = "media_files";

function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

const memoryMediaCache = new Map<string, string>();

export async function saveMediaAsset(key: string, dataUrl: string): Promise<void> {
  memoryMediaCache.set(key, dataUrl);
  try {
    const db = await openMediaDb();
    if (db) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(dataUrl, key);
      await new Promise((resolve) => {
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    }
  } catch (err) {
    console.warn("Could not write media asset to IndexedDB:", err);
  }
}

export async function getMediaAsset(key: string): Promise<string | null> {
  if (memoryMediaCache.has(key)) {
    return memoryMediaCache.get(key) || null;
  }
  try {
    const db = await openMediaDb();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => {
        const val = req.result as string | undefined;
        if (val) {
          memoryMediaCache.set(key, val);
          resolve(val);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteMediaAsset(key: string): Promise<void> {
  memoryMediaCache.delete(key);
  try {
    const db = await openMediaDb();
    if (db) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Parses any video URL to detect if it's YouTube, Vimeo, or a direct video file/IDB key.
 */
export function parseVideoSource(url?: string): {
  type: "youtube" | "vimeo" | "native" | "idb";
  embedUrl?: string;
  sourceUrl?: string;
} {
  if (!url) return { type: "native", sourceUrl: "" };

  const trimmed = url.trim();

  if (trimmed.startsWith("idb:")) {
    return { type: "idb", sourceUrl: trimmed };
  }

  // YouTube detection
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
    };
  }

  // Vimeo detection
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return { type: "native", sourceUrl: trimmed };
}
