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
  pricing_version?: number;
  estimated_hours?: number;
  support_cm3?: number;
  orientation_saving_eur?: number;
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
  is_mixed?: boolean;
  materials_count?: number;
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
  is_mixed?: boolean;
  materials_count?: number;
  pricing_version?: number;
  quality?: string;
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
  lang?: string;
  countryCode?: string;
  slug?: string;
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
  variant?: string;
  layer?: string;
  page_path?: string;
  lang?: string;
  forced?: boolean;
  placement?: "desktop" | "mobile";
}

interface CalculatorSeenProps {
  page_type?: string;
}

interface ExperimentErrorProps {
  experiment?: string;
  reason?: "visible_mismatch" | "no_visible_block";
  assigned?: number;
  visible?: number;
}

// ---- New events — Prompt 18 full-funnel tracking ----

interface UploadAreaViewProps {
  page_type?: string;
}

interface UploadStartedProps {
  method?: "drop" | "click";
  file_count?: number;
}

interface FileParsedProps {
  status?: "ok" | "error" | "image" | "link";
  size_kb?: number;
  ext?: string;
  reason?: string;
}

interface EstimateShownProps {
  price_eur_bucket?: "<15" | "15-30" | "30-60" | "60-100" | ">100";
  time_to_price_ms?: number;
  file_count?: number;
}

interface ConfigChangedProps {
  field?: "material" | "quantity" | "colour" | "quality" | "urgency";
  value?: string;
}

interface FulfillmentChosenProps {
  type?: "pickup" | "shipping";
}

interface ContactEnteredProps {
  field?: "email" | "phone" | "notes";
}

interface BuyClickedProps {
  price_eur_bucket?: string;
}

interface ReviewClickedProps {
  source?: string;
}

interface WhatsappFromModalProps {
  source?: string;
}

interface StripeRedirectProps {
  price_eur?: number;
  fulfillment?: "pickup" | "shipping";
}

interface ScrollDepthProps {
  depth?: 25 | 50 | 75 | 100;
  page_type?: string;
}

interface SectionViewProps {
  section?: string;
  page_type?: string;
}

interface CtaClickProps {
  cta_id?: string;
  section?: string;
  text_variant?: string;
}

interface ExitReasonProps {
  reason?: string;
  price_eur_bucket?: string;
}

interface ModalTimeOpenProps {
  duration_ms?: number;
}

interface QuoteCtaClickProps {
  location?: string;
}

interface GoogleReviewClickProps {
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

// ---- New events (Prompt 3 — per-part cart) ----

interface PartSettingsChangedProps {
  field?: "material" | "color" | "infill" | "walls" | "multicolour" | "qty";
  material?: string;
}

interface ApplyToAllClickProps {
  // no extra fields
}

interface PartResetClickProps {
  // no extra fields
}

// ---- New events (Prompt 17) ----

interface BuyBlockedProps {
  reason?: "no_fulfillment" | "invalid_email" | "uploading";
}

interface ReviewBlockedProps {
  reason?: "missing_contact" | "exit_intent_missing_contact";
}

interface CheckoutReturnedProps {
  result?: "success" | "cancelled";
}

// ---- Master map ----

export interface EventMap {
  // PostHog built-in
  $pageview: Record<string, never>;

  // Existing events
  estimate_generated: EstimateGeneratedProps;
  estimate_modal_shown: { has_bundle?: boolean };
  image_design_request_submitted: { lang: string };
  link_file_submitted: { lang: string };
  buy_button_visible: { device: string; files: number; lang: string };
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
  calculator_seen: CalculatorSeenProps;
  file_upload_error: FileUploadErrorProps;
  submit_error: SubmitErrorProps;
  estimate_add_more_click: EstimateAddMoreClickProps;

  google_review_click: GoogleReviewClickProps;

  // New events — Prompt 3 (per-part cart)
  part_settings_changed: PartSettingsChangedProps;
  apply_to_all_click: ApplyToAllClickProps;
  part_reset_click: PartResetClickProps;

  // New events — Checkout redesign (Prompt 3 phase 2)
  config_mode_changed: { mode: 'simple' | 'advanced' };
  use_case_chosen: { use_case: string; material: string | null };
  option_chosen: { group: 'quality' | 'strength' | 'supports' | 'orientation' | 'material' | 'colour'; value: string };
  review_blocked_missing_contact: { code: string };
  checkout_reopened: Record<string, never>;
  buy_blocked: BuyBlockedProps;
  review_blocked: ReviewBlockedProps;
  checkout_returned: CheckoutReturnedProps;

  // New events — Prompt 18 (full-funnel tracking)
  upload_area_view: UploadAreaViewProps;
  upload_started: UploadStartedProps;
  file_parsed: FileParsedProps;
  estimate_shown: EstimateShownProps;
  config_changed: ConfigChangedProps;
  fulfillment_chosen: FulfillmentChosenProps;
  contact_entered: ContactEnteredProps;
  buy_clicked: BuyClickedProps;
  review_clicked: ReviewClickedProps;
  whatsapp_from_modal: WhatsappFromModalProps;
  stripe_redirect: StripeRedirectProps;
  scroll_depth: ScrollDepthProps;
  section_view: SectionViewProps;
  cta_click: CtaClickProps;
  exit_reason: ExitReasonProps;
  modal_time_open: ModalTimeOpenProps;

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
  b2b_cta_primary_click: Record<string, unknown>;
  b2b_cta_whatsapp_click: Record<string, unknown>;
  b2b_free_prototype_click: Record<string, unknown>;
  b2b_cta_homepage_click: Record<string, unknown>;
  b2b_sticky_cta_click: Record<string, unknown>;

  // Intl native pages
  hub_cta_click: Record<string, unknown>;
  guide_cta_click: Record<string, unknown>;
  guide_page_view: Record<string, unknown>;

  // Language suggestion bar
  lang_suggest_shown: { from: string; to: string };
  lang_suggest_accepted: { from: string; to: string };
  lang_suggest_dismissed: { from: string; to: string };

  // B2B tracking
  b2b_page_view: { lang: string };
  b2b_cta_click: { which: string; section: string };

  // Checkout error / parse error recovery
  checkout_failed: { code: string; http_status: number; price_eur: number; file_count: number };
  checkout_failed_send_order: { code: string };
  parse_error_free_review_click: { name: string | undefined };
}

export type EventName = keyof EventMap;
