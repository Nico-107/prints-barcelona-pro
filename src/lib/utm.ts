const UTM_KEY = "dim3d-utm";
const UTM_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface StoredUTM {
  utm_source: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  expires: number;
}

/**
 * Reads utm_source/medium/content from the URL and writes them to localStorage.
 * No-ops if: (a) no UTM params are present, or (b) an unexpired attribution already exists.
 * This ensures a returning visitor who types the URL directly keeps their original attribution.
 */
export function readAndPersistUTM(searchParams: URLSearchParams): void {
  const source = searchParams.get("utm_source");
  const medium = searchParams.get("utm_medium");
  const content = searchParams.get("utm_content");

  if (!source && !medium && !content) return;

  if (getStoredUTM() !== null) return;

  try {
    const payload: StoredUTM = {
      utm_source: source,
      utm_medium: medium,
      utm_content: content,
      expires: Date.now() + UTM_TTL_MS,
    };
    localStorage.setItem(UTM_KEY, JSON.stringify(payload));
  } catch {
    // localStorage may be unavailable (private browsing, storage quota exceeded, etc.)
  }
}

export function getStoredUTM(): StoredUTM | null {
  try {
    const raw = localStorage.getItem(UTM_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredUTM;
    if (Date.now() > stored.expires) {
      localStorage.removeItem(UTM_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}
