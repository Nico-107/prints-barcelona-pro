// Pure helpers extracted for unit-testing; the edge function has the same logic inlined.

export function shouldSendConfirmation(currentStatus: string | null | undefined): boolean {
  return currentStatus !== "paid";
}

export function buildOrderPaidProps(
  session: {
    amount_total?: number | null;
    currency?: string | null;
    metadata?: Record<string, string>;
    id?: string;
  },
  order: { pieces?: unknown } | null,
): Record<string, unknown> {
  const meta = session.metadata ?? {};
  const pricingVersion = meta.pricing_version ? Number(meta.pricing_version) : null;
  const partCount = meta.part_count ? Number(meta.part_count) : null;
  const materialsStr = typeof meta.materials === "string" ? meta.materials : null;
  const isMixed = materialsStr ? materialsStr.includes(",") : null;

  let qualitySummary: string | null = null;
  let supportsSummary: string | null = null;
  if (pricingVersion === 3 && Array.isArray(order?.pieces)) {
    const v3Pieces = (order!.pieces as Array<Record<string, unknown>>);
    const qualities = [...new Set(v3Pieces.map(p => String(p.quality ?? "")))].filter(Boolean);
    const supportsVals = v3Pieces.map(p => p.supports);
    qualitySummary = qualities.length === 1 ? qualities[0] : qualities.length > 1 ? "mixed" : null;
    supportsSummary = supportsVals.every(s => s === true) ? "all" : supportsVals.every(s => s === false) ? "none" : "mixed";
  }

  return {
    order_id: meta.order_id ?? null,
    order_number: meta.order_number ?? null,
    value: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "eur").toUpperCase(),
    fulfillment: meta.fulfillment ?? null,
    source_path: meta.source_path ?? null,
    product_type: meta.product_type ?? null,
    part_slug: meta.part_slug ?? null,
    utm_source: meta.utm_source ?? null,
    utm_medium: meta.utm_medium ?? null,
    utm_content: meta.utm_content ?? null,
    utm_campaign: meta.utm_campaign ?? null,
    customer_ref: meta.customer_ref ?? null,
    $session_id: meta.ph_session_id ?? null,
    ...(pricingVersion != null ? { pricing_version: pricingVersion } : {}),
    ...(partCount != null ? { part_count: partCount } : {}),
    ...(materialsStr != null ? { materials: materialsStr } : {}),
    ...(isMixed != null ? { is_mixed: isMixed } : {}),
    ...(qualitySummary != null ? { quality: qualitySummary } : {}),
    ...(supportsSummary != null ? { supports: supportsSummary } : {}),
  };
}
