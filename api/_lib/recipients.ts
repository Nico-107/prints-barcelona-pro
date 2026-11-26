export function parseOwnerEmails(env: string | undefined): string[] {
  if (!env) return [];
  return env
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.includes("@"));
}

export function isSevilla(metadataOrPath: {
  source_path?: string | null;
  page_language?: string | null;
  pickup_location?: string | null;
}): boolean {
  const s = (metadataOrPath.source_path ?? "").toLowerCase();
  const pickup = (metadataOrPath.pickup_location ?? "").toLowerCase();
  return s.includes("sevilla") || s.includes("seville") || pickup === "sevilla";
}

export function recipientsFor(args: {
  ownerEmails: string[];
  danielEmail: string | null;
  sevilla: boolean;
}): string[] {
  const base = Array.from(new Set(args.ownerEmails));
  if (args.sevilla && args.danielEmail) {
    if (!base.includes(args.danielEmail)) base.push(args.danielEmail);
  }
  return base;
}

export const SENDER = "Dimension3D <noreply@dimension3dprints.com>";
