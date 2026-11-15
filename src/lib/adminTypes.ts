// Shared types for the admin surfaces (Phase 2). Extracted from Admin.tsx so
// the new orders queue, print queue, quotes inbox and search can import
// without pulling in the legacy page shell.

import type { OrderStatus } from "./orderStatus";

export type PieceInfo = {
  name: string;
  quantity: number;
  path?: string | null;
  material?: string | null;
  color?: string | null;
  infill?: number | null;
  wallLoops?: number | null;
  quality?: string | null;
  supports?: boolean | null;
  orientation?: string | number | null;
  multicolour?: boolean | null;
  costCents?: number | null;
  gramsPerUnit?: number | null;
  hoursPerUnit?: number | null;
  actualGrams?: number | null;
  actualHours?: number | null;
};

export type UploadedNotPurchased = { path: string; name: string };

export interface AdminOrder {
  id: string;
  order_number: number;
  product_title: string;
  customer_phone: string;
  customer_email?: string | null;
  customer_name?: string | null;
  status: OrderStatus;
  eta: string | null;
  fulfillment: string;
  notes: string;
  internal_notes?: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
  payment_method: string | null;
  stripe_payment_link: string | null;
  payment_status: string;
  file_paths?: string[] | null;
  pieces?: PieceInfo[] | null;
  uploaded_not_purchased?: UploadedNotPurchased[] | null;
  shipping_address?: Record<string, unknown> | null;
  // Shipment fields (phase 1 migration)
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  label_url?: string | null;
  shipment_ref?: string | null;
  tracking_token?: string | null;
  total_paid_cents?: number | null;
  language?: string | null;
}

export interface AdminQuote {
  id: string;
  created_at: string;
  contact_email: string | null;
  contact_phone: string | null;
  material: string;
  color: string | null;
  infill: string;
  wall_loops: number;
  quantity: number;
  estimated_grams: number;
  estimated_hours: number;
  estimated_price_low: number;
  estimated_price_high: number;
  file_paths: string[];
  status: string;
  converted_order_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  pieces?: PieceInfo[] | null;
  source_path?: string | null;
  page_language?: string | null;
  browser_language?: string | null;
  referrer_domain?: string | null;
  utm_json?: string | null;
  fulfillment?: string | null;
  // Free-form notes the customer added to the lead form.
  notes?: string | null;
}

// Work-queue filter buckets (item 2.1). Each order is assigned to exactly one
// bucket based on its current status.
export const QUEUE_BUCKETS = [
  { key: "to_review",   label: "Por revisar",         statuses: ["awaiting_payment", "order_received"] as OrderStatus[] },
  { key: "to_print",    label: "Por imprimir",        statuses: ["quote_approved"] as OrderStatus[] },
  { key: "printing",    label: "Imprimiendo",         statuses: ["printing_started"] as OrderStatus[] },
  { key: "qc",          label: "Control de calidad",  statuses: ["finishing_qc"] as OrderStatus[] },
  { key: "to_hand_off", label: "Por enviar / Por recoger", statuses: [] as OrderStatus[] }, // pickup+shipping ready-for-handoff
  { key: "shipped",     label: "Enviado",             statuses: ["shipped"] as OrderStatus[] },
  { key: "delivered",   label: "Entregado",           statuses: ["completed"] as OrderStatus[] },
] as const;

export type QueueBucket = (typeof QUEUE_BUCKETS)[number]["key"];

/** Decide which bucket an order falls in. "to_hand_off" covers both
 *  pickup-ready and ready-to-ship (shipping orders past QC but not yet
 *  shipped). */
export function bucketForOrder(o: Pick<AdminOrder, "status" | "fulfillment">): QueueBucket {
  const s = o.status;
  if (s === "ready_pickup") return "to_hand_off";
  if (s === "finishing_qc" && o.fulfillment === "shipping") return "qc"; // shipping path still in QC
  for (const b of QUEUE_BUCKETS) {
    if (b.statuses.includes(s)) return b.key;
  }
  return "to_review";
}

/** The single next action for the owner on this order (item 2.2). */
export interface NextAction {
  key: string;
  label: string;
  nextStatus: OrderStatus;
  /** Which status-email kind to send when this action runs. null = no email. */
  emailKind?: "in_production" | "shipped" | "ready_pickup" | "delivered" | "review" | null;
  /** Freeform description of what will happen, shown in the undo banner. */
  describe: string;
}

export function nextActionFor(o: Pick<AdminOrder, "status" | "fulfillment">): NextAction | null {
  switch (o.status) {
    case "awaiting_payment":
    case "order_received":
      return { key: "mark_reviewed", label: "Marcar revisado", nextStatus: "quote_approved", emailKind: null, describe: "Pasa el pedido a “Por imprimir”." };
    case "quote_sent":
      return { key: "mark_accepted", label: "Marcar aceptado", nextStatus: "quote_approved", emailKind: null, describe: "Pasa el pedido a “Por imprimir”." };
    case "quote_approved":
      return { key: "start_printing", label: "Empezar a imprimir", nextStatus: "printing_started", emailKind: "in_production", describe: "Envía el email “En producción” al cliente." };
    case "printing_started":
      return { key: "to_qc", label: "Pasar a control de calidad", nextStatus: "finishing_qc", emailKind: null, describe: "Marca la pieza como terminada en impresión." };
    case "finishing_qc":
      if (o.fulfillment === "pickup") {
        return { key: "ready_pickup", label: "Avisar: listo para recoger", nextStatus: "ready_pickup", emailKind: "ready_pickup", describe: "Envía el email “Listo para recoger” al cliente." };
      }
      return { key: "mark_shipped", label: "Crear envío", nextStatus: "shipped", emailKind: "shipped", describe: "Envía el email “Enviado” al cliente — primero completa el bloque de envío." };
    case "shipped":
      return { key: "mark_delivered", label: "Marcar entregado", nextStatus: "completed", emailKind: "delivered", describe: "Envía el email de entrega y cierra el pedido." };
    case "ready_pickup":
      return { key: "mark_collected", label: "Marcar recogido", nextStatus: "completed", emailKind: "delivered", describe: "Envía el email de recogida y cierra el pedido." };
    default:
      return null;
  }
}

/** Country flag emoji from an ISO-2 code. Returns the empty string for
 *  unknown inputs so the admin UI never shows a placeholder glyph. */
export function countryFlag(iso2: string | null | undefined): string {
  const c = (iso2 ?? "").trim().toUpperCase();
  if (c.length !== 2 || !/^[A-Z]{2}$/.test(c)) return "";
  const A = 0x1f1e6; // regional indicator A
  return String.fromCodePoint(A + c.charCodeAt(0) - 65) + String.fromCodePoint(A + c.charCodeAt(1) - 65);
}

/** Pulled from eta — hours between now and the ship-by. Negative = overdue. */
export function hoursUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return (t - Date.now()) / 3_600_000;
}
