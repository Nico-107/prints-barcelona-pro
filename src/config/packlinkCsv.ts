// O8 — Packlink CSV export. Headers derived from `docs/checkpoint/inputs/packlink-example.csv`
// when present (exact match required); otherwise the documented generic headers below.

export const GENERIC_PACKLINK_HEADERS = [
  "Reference",
  "First name",
  "Last name",
  "Email",
  "Phone",
  "Country",
  "Postcode",
  "City",
  "Street",
  "Number",
  "Additional",
  "Length (cm)",
  "Width (cm)",
  "Height (cm)",
  "Weight (kg)",
  "Declared value (EUR)",
  "Insurance",
  "Reference internal",
  "Observations",
] as const;

export interface PacklinkOrderRow {
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  postcode: string;
  city: string;
  street: string;
  number: string;
  additional?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  declaredValueEur?: number;
  insurance?: "yes" | "no";
  internalReference?: string;
  observations?: string;
}

function esc(cell: string | number | undefined): string {
  if (cell === undefined || cell === null) return "";
  const s = String(cell);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(rows: PacklinkOrderRow[], headers: readonly string[] = GENERIC_PACKLINK_HEADERS): string {
  const lines: string[] = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.reference,
        r.firstName,
        r.lastName,
        r.email,
        r.phone,
        r.country,
        // Postcodes keep leading zeros — always wrap with quotes.
        `"${r.postcode}"`,
        r.city,
        r.street,
        r.number,
        r.additional ?? "",
        r.lengthCm,
        r.widthCm,
        r.heightCm,
        r.weightKg.toFixed(1), // use dot as decimal
        r.declaredValueEur !== undefined ? r.declaredValueEur.toFixed(2) : "",
        r.insurance ?? "no",
        r.internalReference ?? "",
        r.observations ?? "",
      ].map((c) => esc(c as string | number)).join(","),
    );
  }
  return lines.join("\n");
}

// Parcel suggestion: bbox of packed parts + 20 mm padding, rounded up to whole cm.
// Weight: sum(grams × qty) × 1.15 + 150 g packaging, rounded up to 0.1 kg.
export interface Piece { grams: number; qty: number; bboxMm: [number, number, number] }

export function suggestParcel(pieces: Piece[]): { lengthCm: number; widthCm: number; heightCm: number; weightKg: number } {
  const bbox: [number, number, number] = [0, 0, 0];
  for (const p of pieces) {
    for (let i = 0; i < 3; i++) bbox[i] = Math.max(bbox[i], p.bboxMm[i]);
  }
  const padded = bbox.map((d) => d + 20);
  const sortedDesc = [...padded].sort((a, b) => b - a) as [number, number, number];
  const weightG = pieces.reduce((a, p) => a + p.grams * p.qty, 0) * 1.15 + 150;
  return {
    lengthCm: Math.ceil(sortedDesc[0] / 10),
    widthCm: Math.ceil(sortedDesc[1] / 10),
    heightCm: Math.ceil(sortedDesc[2] / 10),
    weightKg: Math.ceil(weightG / 100) / 10, // round up to 0.1 kg
  };
}
