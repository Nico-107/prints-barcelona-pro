/**
 * Typed event catalogue for all PostHog events sent by this site.
 * Properties listed here are what CALLERS provide — auto-enriched context
 * (utm_*, page_path, page_type, site_language, is_internal) is added by the
 * capture() wrapper and is not included in these types.
 *
 * Use capture<E extends EventName> to get compile errors for misspelled event
 * names or property keys.
 */

// ---- Existing events ----

interface EstimateGeneratedProps {
  material?: string;
  infill?: number;
  urgency?: string;
  quantity?: number;
  estimated_grams?: number;
  price_low?: number;
  price_high?: number;
  file_count?: number;
  multicolour?: boolean;
}

interface EstimateAbandonedProps {
  price_low?: number;
  price_high?: number;
  material?: string;
}

interface WhatsappClickProps {
  source?: string;
  location?: string;
  path?: string;
}

interface QuoteSubmittedProps {
  has_email?: boolean;
  has_phone?: boolean;
  material?: string;
  urgency?: string;
  file_count?: number;
  estimated_price_low?: number;
  estimated_price_high?: number;
  color?: boolean;
  multicolour?: boolean;
  customer_ref?: string;
  quote_id?: string;
  value_estimate_mid?: number;
  currency?: string;
  piece_count?: number;
  total_units?: number;
  source_page?: string;
}

interface InstantCheckoutInitiatedProps {
  material?: string;
  exact_price?: number;
  quantity?: number;
  customer_ref?: string;
  value?: number;
  shipping_fee?: number;
  currency?: string;
  fulfillment?: "pickup" | "shipping";
  product_type?: string;
  part_slug?: string;
  file_count?: number;
  total_units?: number;
}

interface InstantCheckoutCompletedProps {
  value?: number;
  shipping_fee?: number;
  currency?: string;
  fulfillment?: "pickup" | "shipping";
  product_type?: string;
  part_slug?: string;
  file_count?: number;
  total_units?: number;
  material?: string;
}

// ---- New events (A6) ----

interface PartPageViewProps {
  part_slug?: string;
  category?: string;
  price?: number;
}

interface PartFulfillmentSelectedProps {
  part_slug?: string;
  fulfillment?: "pickup" | "shipping";
}

interface PartBuyClickProps {
  part_slug?: string;
  value?: number;
  fulfillment?: "pickup" | "shipping";
}

interface CatalogCardClickProps {
  item_type?: "part" | "catalog";
  slug?: string;
  position?: number;
}

interface CatalogProductViewProps {
  slug?: string;
}

interface CatalogRequestSubmittedProps {
  slug?: string;
  value?: number;
  customer_ref?: string;
  source_page?: string;
}

interface NavClickProps {
  menu?: "main" | "services" | "resources";
  label_key?: string;
  href?: string;
}

interface OutboundContactClickProps {
  channel?: "whatsapp" | "email" | "phone";
  element_location?: string;
}

// ---- New events (A7) ----

interface ExperimentExposureProps {
  experiment?: string;
  version?: number;
  language?: string;
  page_type?: string;
  forced?: boolean;
  visible_ok?: boolean;
}

interface ExperimentErrorProps {
  experiment?: string;
  reason?: "visible_mismatch" | "no_visible_block";
  assigned?: number;
  visible?: number;
}

interface QuoteCtaClickProps {
  location?: string;
}

interface FileUploadErrorProps {
  reason?: string;
  file_type?: string;
}

interface SubmitErrorProps {
  stage?: string;
  table?: string;
  code?: string;
}

interface EstimateAddMoreClickProps {
  location?: string;
}

// ---- Master map ----

export interface EventMap {
  // PostHog built-in
  $pageview: Record<string, never>;

  // Existing events
  estimate_generated: EstimateGeneratedProps;
  estimate_modal_shown: Record<string, never>;
  estimate_modal_dismissed: Record<string, never>;
  estimate_abandoned: EstimateAbandonedProps;
  whatsapp_click: WhatsappClickProps;
  quote_submitted: QuoteSubmittedProps;
  instant_checkout_completed: InstantCheckoutCompletedProps;
  instant_checkout_cancelled: Record<string, never>;
  instant_checkout_initiated: InstantCheckoutInitiatedProps;
  exit_intent_shown: Record<string, never>;
  exit_intent_recovered: Record<string, never>;
  exit_intent_dismissed: Record<string, never>;

  // New events — A6
  part_page_view: PartPageViewProps;
  part_fulfillment_selected: PartFulfillmentSelectedProps;
  part_buy_click: PartBuyClickProps;
  catalog_card_click: CatalogCardClickProps;
  catalog_product_view: CatalogProductViewProps;
  catalog_request_submitted: CatalogRequestSubmittedProps;
  nav_click: NavClickProps;
  outbound_contact_click: OutboundContactClickProps;

  // New events — A7
  experiment_exposure: ExperimentExposureProps;
  experiment_error: ExperimentErrorProps;
  file_upload_error: FileUploadErrorProps;
  submit_error: SubmitErrorProps;
  estimate_add_more_click: EstimateAddMoreClickProps;

  // Legacy / page-level events already used across the site
  quote_cta_click: QuoteCtaClickProps;
  "print request submitted": Record<string, unknown>;
  "banner dismissed": Record<string, unknown>;
  "review submitted": Record<string, unknown>;
  order_accepted: Record<string, unknown>;
  blog_read_75pct: Record<string, unknown>;
  city_cta_click: Record<string, unknown>;
  city_page_view: Record<string, unknown>;
  design_request_submitted: Record<string, unknown>;
  page_read_75pct: Record<string, unknown>;
  international_page_view: Record<string, unknown>;
  international_cta_click: Record<string, unknown>;
  landing_page_upload_cta_click: Record<string, unknown>;
  lemon_page_view: Record<string, unknown>;
  lemon_cta_click: Record<string, unknown>;
  "maker application submitted": Record<string, unknown>;
}

export type EventName = keyof EventMap;
