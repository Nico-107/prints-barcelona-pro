import type { ParsedFile, PartDefaults, BundleEstimateV2 } from "./pricing";
import { effectivePartSettings } from "./pricing";
import { summarizeParts } from "./summarizeParts";

export interface CheckoutPiece {
  name: string;
  quantity: number;
  path: string | null;
  material: string;
  infill: number;
  wallLoops: number;
  color: string | null;
  volumeMm3: number;
  multicolour: boolean;
}

export interface CheckoutBody {
  pricingVersion: 2;
  urgency: string;
  fulfillment: "pickup" | "shipping";
  exactPrice: number;
  pieces: CheckoutPiece[];
  material: string;
  color: string | null;
  infill: number | null;
  wallLoops: number | null;
  quantity: number;
  filePaths: string[];
  fileNames: string[];
  contactEmail: string | null;
  contactPhone: string | null;
  language: string;
  ph_distinct_id: string | null;
  ph_session_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_campaign: string | null;
  product_type: string;
  customer_ref: string | null;
}

export interface BuildCheckoutBodyParams {
  validFiles: ParsedFile[];
  defaults: PartDefaults;
  bundle: BundleEstimateV2;
  urgency: string;
  fulfillment: "pickup" | "shipping";
  uploaded: { paths: string[]; names: string[]; byId: Record<string, string> };
  contactEmail: string;
  contactPhone: string;
  colorPref: string;
  language: string;
  phId: string | null;
  phSid: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmContent: string | null;
  utmCampaign: string | null;
  checkoutRef: string | null;
}

export function buildCheckoutBody(p: BuildCheckoutBodyParams): CheckoutBody {
  const pieces: CheckoutPiece[] = p.validFiles.map(f => {
    const eff = effectivePartSettings(f, p.defaults);
    return {
      name: f.name,
      quantity: f.qty,
      path: p.uploaded.byId[f.id] ?? null,
      material: eff.material,
      infill: eff.infill,
      wallLoops: eff.wallLoops,
      color: eff.color || null,
      volumeMm3: f.volumeMm3,
      multicolour: eff.multicolour,
    };
  });

  const summary = summarizeParts(pieces);

  return {
    pricingVersion: 2,
    urgency: p.urgency,
    fulfillment: p.fulfillment,
    exactPrice: p.bundle.orderResult.chargedPrintCents / 100,
    pieces,
    material: summary.material,
    color: p.colorPref.trim() || null,
    infill: summary.infillNum,
    wallLoops: summary.isUniform ? summary.wallLoops : null,
    quantity: p.bundle.totalUnits,
    filePaths: p.uploaded.paths,
    fileNames: p.uploaded.names,
    contactEmail: p.contactEmail.trim() || null,
    contactPhone: p.contactPhone.trim() || null,
    language: p.language,
    ph_distinct_id: p.phId,
    ph_session_id: p.phSid,
    utm_source: p.utmSource,
    utm_medium: p.utmMedium,
    utm_content: p.utmContent,
    utm_campaign: p.utmCampaign,
    product_type: "stl_estimator",
    customer_ref: p.checkoutRef,
  };
}
