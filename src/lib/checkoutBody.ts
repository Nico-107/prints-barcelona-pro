import type { ParsedFile, PartDefaults } from "./pricing";
import { effectivePartSettings } from "./pricing";
import type { BundleEstimateV3 } from "./estimate";
import { summarizeParts } from "./summarizeParts";

export interface CheckoutPieceV3 {
  name: string;
  quantity: number;
  path: string | null;
  material: string;
  infill: number;
  wallLoops: number;
  quality: string;
  supports: boolean;
  orientation: 'auto' | number;
  color: string | null;
  multicolour: boolean;
}

export interface CheckoutBody {
  pricingVersion: 3 | 4;
  urgency: string;
  fulfillment: "pickup" | "shipping";
  exactPrice: number;
  pieces: CheckoutPieceV3[];
  // Legacy summary fields (server ignores, notes/analytics use them)
  material: string;
  color: string | null;
  infill: number | null;
  wallLoops: number | null;
  quantity: number;
  filePaths: string[];
  fileNames: string[];
  /** Files the customer uploaded while the price window was open but did not
   *  buy (removed from cart, images used as references, link-only STLs, etc.).
   *  Each entry is {path, name}. The server stores this on the order so the
   *  owner sees "Subidos pero no comprados" (item 1.3). */
  uploadedNotPurchased?: Array<{ path: string; name: string }>;
  contactEmail: string | null;
  contactPhone: string | null;
  language: string;
  ph_distinct_id: string | null;
  ph_session_id: string | null;
  /** xp_<id>: variant snapshot at buy-click time. Edge function echoes
   *  these into Stripe success_url and session metadata so the /?checkout=
   *  landing stays on the same person + session as the buy click. */
  xp_variants: Record<string, string>;
  utm_source: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_campaign: string | null;
  product_type: string;
  customer_ref: string | null;
  returnPath?: string;
  // Source tracking (Item 6)
  source_path?: string | null;
  page_language?: string | null;
  promoCode?: string | null;
}

export interface BuildCheckoutBodyParams {
  validFiles: ParsedFile[];
  defaults: PartDefaults;
  bundle: BundleEstimateV3;
  urgency: string;
  fulfillment: "pickup" | "shipping";
  pricingVersion?: 3 | 4;
  uploaded: { paths: string[]; names: string[]; byId: Record<string, string> };
  contactEmail: string;
  contactPhone: string;
  colorPref: string;
  language: string;
  phId: string | null;
  phSid: string | null;
  xpVariants?: Record<string, string>;
  utmSource: string | null;
  utmMedium: string | null;
  utmContent: string | null;
  utmCampaign: string | null;
  checkoutRef: string | null;
  returnPath?: string;
  sourcePath?: string | null;
  pageLanguage?: string | null;
  promoCode?: string | null;
}

export function buildCheckoutBody(p: BuildCheckoutBodyParams): CheckoutBody {
  const pieces: CheckoutPieceV3[] = p.validFiles.map((f, i) => {
    const eff = effectivePartSettings(f, p.defaults);
    const estimate = p.bundle.estimates[i];
    const chosenOrientation: 'auto' | number = estimate
      ? estimate.orientation
      : eff.orientation;
    return {
      name: f.name,
      quantity: f.qty,
      path: p.uploaded.byId[f.id] ?? null,
      material: eff.material,
      infill: eff.infill,
      wallLoops: eff.wallLoops,
      quality: eff.quality,
      supports: eff.supports,
      orientation: chosenOrientation,
      color: eff.color || null,
      multicolour: eff.multicolour,
    };
  });

  const summary = summarizeParts(pieces.map(pc => ({
    material: pc.material,
    infill: pc.infill,
    wallLoops: pc.wallLoops,
    multicolour: pc.multicolour,
  })));

  // #264 fix: file_paths must align with priced pieces, not everything the
  // user ever uploaded. Build them from uploaded.byId keyed on the pieces
  // that actually made the cart, then surface the leftover uploads in a
  // dedicated field so the owner email can call them out separately.
  const purchasedPaths: string[] = [];
  const purchasedNames: string[] = [];
  const keptIds = new Set<string>();
  for (const f of p.validFiles) {
    const path = p.uploaded.byId[f.id];
    if (!path) continue;
    purchasedPaths.push(path);
    purchasedNames.push(f.name);
    keptIds.add(path);
  }
  const uploadedNotPurchased: Array<{ path: string; name: string }> = [];
  p.uploaded.paths.forEach((path, i) => {
    if (keptIds.has(path)) return;
    uploadedNotPurchased.push({ path, name: p.uploaded.names[i] ?? path });
  });

  return {
    pricingVersion: p.pricingVersion ?? 3,
    urgency: p.urgency,
    fulfillment: p.fulfillment,
    exactPrice: p.bundle.order.totalCents / 100,
    pieces,
    material: summary.material,
    color: p.colorPref.trim() || null,
    infill: summary.infillNum,
    wallLoops: summary.isUniform ? summary.wallLoops : null,
    quantity: p.bundle.totalUnits,
    filePaths: purchasedPaths,
    fileNames: purchasedNames,
    uploadedNotPurchased: uploadedNotPurchased.length > 0 ? uploadedNotPurchased : undefined,
    contactEmail: p.contactEmail.trim() || null,
    contactPhone: p.contactPhone.trim() || null,
    language: p.language,
    ph_distinct_id: p.phId,
    ph_session_id: p.phSid,
    xp_variants: p.xpVariants ?? {},
    utm_source: p.utmSource,
    utm_medium: p.utmMedium,
    utm_content: p.utmContent,
    utm_campaign: p.utmCampaign,
    product_type: "stl_estimator",
    customer_ref: p.checkoutRef,
    returnPath: p.returnPath,
    source_path: p.sourcePath ?? null,
    page_language: p.pageLanguage ?? null,
    promoCode: p.promoCode || undefined,
  };
}
