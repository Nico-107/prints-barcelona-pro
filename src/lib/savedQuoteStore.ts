// 4.3: IndexedDB store for the visitor's last price-window configuration.
// Keeps the quote for 7 days. Cleared after a purchase.

const DB_NAME = "d3d_saved_quote";
const STORE_NAME = "quote";
const KEY = "last";
const TTL_MS = 7 * 24 * 3600_000;

export interface SavedQuoteEntry {
  material: string;
  colour: string;
  qty: number;
  urgency: string;
  fileId?: string | null;
  fileName?: string | null;
  total: number;
  savedAt: number;
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveQuoteLocally(entry: Omit<SavedQuoteEntry, "savedAt">): Promise<void> {
  try {
    const db = await open();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ ...entry, savedAt: Date.now() }, KEY);
    await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
    db.close();
  } catch { /* IndexedDB unavailable (private mode, old browser) */ }
}

export async function loadSavedQuote(): Promise<SavedQuoteEntry | null> {
  try {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(KEY);
      req.onsuccess = () => {
        const entry = req.result as SavedQuoteEntry | undefined;
        db.close();
        if (!entry) return resolve(null);
        if (Date.now() - entry.savedAt > TTL_MS) { clearSavedQuote(); return resolve(null); }
        resolve(entry);
      };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  } catch { return null; }
}

export async function clearSavedQuote(): Promise<void> {
  try {
    const db = await open();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(KEY);
    db.close();
  } catch { /* ignore */ }
}
