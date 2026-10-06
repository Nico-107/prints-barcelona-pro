export interface CalibPiece {
  name: string;
  material?: string | null;
  infill?: number | null;
  wallLoops?: number | null;
  quality?: string | null;
  supports?: boolean | null;
  orientation?: string | number | null;
  gramsPerUnit?: number | null;
  hoursPerUnit?: number | null;
  costCents?: number | null;
  actualGrams?: number | null;
  actualHours?: number | null;
}

export interface CalibOrder {
  order_number: number;
  pieces?: CalibPiece[] | null;
}

function cell(v: string | number | boolean | null | undefined): string {
  const s = String(v ?? "");
  return s.includes('"') || s.includes(",") || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEADER = "order_number,piece_name,material,infill,walls,quality,supports,orientation,predicted_g,predicted_h,predicted_price_eur,actual_g,actual_h,price_charged_eur";

export function buildCalibrationCsv(orders: CalibOrder[]): string {
  const rows: string[] = [HEADER];
  for (const o of orders) {
    for (const p of o.pieces ?? []) {
      if (p.actualGrams == null && p.actualHours == null) continue;
      rows.push([
        o.order_number,
        cell(p.name),
        cell(p.material ?? ""),
        p.infill ?? "",
        p.wallLoops ?? "",
        cell(p.quality ?? ""),
        p.supports != null ? String(p.supports) : "",
        cell(String(p.orientation ?? "")),
        p.gramsPerUnit != null ? Number(p.gramsPerUnit).toFixed(2) : "",
        p.hoursPerUnit != null ? Number(p.hoursPerUnit).toFixed(3) : "",
        p.costCents != null ? (p.costCents / 100).toFixed(2) : "",
        p.actualGrams != null ? Number(p.actualGrams).toFixed(2) : "",
        p.actualHours != null ? Number(p.actualHours).toFixed(3) : "",
        p.costCents != null ? (p.costCents / 100).toFixed(2) : "",
      ].join(","));
    }
  }
  return rows.join("\n");
}