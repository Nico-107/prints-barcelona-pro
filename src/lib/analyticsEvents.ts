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
  instant_eligible?: boolean;
  ineligible_reasons?: string;
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
  instant_eligible?: boolean;
  ineligible_reasons?: string;
  // Prompt 2 — mesh diagnostics so we can monitor repair/cap in production.
  mesh_tris?: number;
  mesh_shells?: number;
  mesh_watertight?: boolean;
  mesh_area_cm2?: number;
  mesh_volume_cm3?: number;
  mesh_repaired?: boolean;
  price_capped?: boolean;
  estimate_ms?: number;
}

interface ConfigChangedProps {
  field?: "material" | "quantity" | "colour" | "quality" | "urgency";
  value?: string;
}

interface FulfillmentChosenProps {
  type?: "pickup" | "shipping";
  // Prompt 3 — the chosen option label (as shown in the UI) and the total
  // in EUR at the moment of selection; xp_shipping_r1 is already attached
  // by the super-property enrichment but we also pass it explicitly here
  // so the event matches the one the prompt specifies.
  option?: "pickup" | "shipping";
  total_eur?: number;
  xp_shipping_r1?: string;
}

interface ContactEnteredProps {
  field?: "email" | "phone" | "notes";
}

interface BuyClickedProps {
  price_eur_bucket?: string;
  // Prompt 2 — same mesh diagnostics attached at buy time so we can tie
  // outcomes (orders paid, refund requests) back to the mesh health.
  mesh_tris?: number;
  mesh_shells?: number;
  mesh_watertight?: boolean;
  mesh_area_cm2?: number;
  mesh_volume_cm3?: number;
  mesh_repaired?: boolean;
  price_capped?: boolean;
  estimate_ms?: number;
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
  /** Conv 1.6 — device + country sliced in the "what stopped you?" tile. */
  device?: string;
  country?: string | null;
  /** Free-text from "Otra cosa" chip. */
  text?: string;
}

interface ExitShortcutProps {
  action?: "back_to_price" | "email_quote" | "whatsapp";
}

interface OrderPaidProps {
  channel?: "stripe" | "manual";
  order_id?: string;
  value_eur?: number;
  currency?: string;
  shipping_eur?: number;
  fulfillment?: "pickup" | "shipping";
  item_count?: number;
  material?: string;
  price_bucket?: string;
  country?: string;
  language?: string;
  source?: string;
  note?: string;
}

interface QuoteEmailedProps {
  source?: string;
  email_domain?: string;
  path?: string;
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
  buy_button_visible: { device: string; files: number; lang: string; instant_eligible?: boolean; ineligible_reasons?: string; actions_branch?: 'buy' | 'quote' };
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
  exit_popup_shown: { variant: 'priced' | 'quote' | 'failed'; page_type: string; lang: string };
  exit_popup_action: { action: string };

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
  buy_wait_shown: Record<string, never>;
  pricing_version_resolved: { version: 3 | 4; source: 'cache' | 'fetch' };
  promo_line_shown: { has_public_code: boolean; code?: string };
  promo_applied: { code: string; pct: number; source: 'public' | 'manual' | 'url' };
  promo_invalid: { code: string };
  student_code_requested: { email_domain: string };
  review_clicked: ReviewClickedProps;
  whatsapp_from_modal: WhatsappFromModalProps;
  stripe_redirect: StripeRedirectProps;
  scroll_depth: ScrollDepthProps;
  section_view: SectionViewProps;
  cta_click: CtaClickProps;
  exit_reason: ExitReasonProps;
  /**
   * Prompt 1 Part D: single-tap "what stopped you" answer that unlocks
   * the 20% exit reward. One of the six reason keys defined in
   * ExitReasonCard / StlEstimator's exit toast.
   */
  exit_reason_answered: {
    reason: 'price' | 'shipping' | 'comparing' | 'material' | 'review' | 'other';
    price_eur_bucket?: string;
    device_type: 'mobile' | 'tablet' | 'desktop';
  };
  /**
   * Prompt 1 Part E: single-tap "what is this piece for" answer shown on
   * the ?checkout=success thank-you page.
   */
  piece_purpose_answered: {
    purpose: 'repair' | 'personal_project' | 'business' | 'gift_or_decor' | 'other';
    order_number?: string;
    value_eur?: number;
  };
  exit_shortcut: ExitShortcutProps;
  order_paid: OrderPaidProps;
  quote_emailed: QuoteEmailedProps;
  // Conv 4.4: lead events — quote_submitted (existing) also fires
  // review_requested so the funnel split by source can compare leads
  // with instant orders. photo_request_submitted is fired from the
  // mobile photo flow (section 3.2).
  review_requested: {
    quote_id: string;
    material?: string;
    urgency?: string;
    file_count?: number;
    piece_count?: number;
    total_units?: number;
    value_estimate_mid?: number;
    currency?: string;
    has_email?: boolean;
    has_phone?: boolean;
    source_page?: string;
  };
  photo_request_submitted: {
    has_email?: boolean;
    has_phone?: boolean;
    source_page?: string;
    note_length?: number;
    attachments?: number;
    lang?: string;
  };
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
  b2b_brief_submitted: { turnaround: string; hasFiles: boolean; language: string; company: string };
  page_read_75pct: Record<string, unknown>;
  international_page_view: { market: string; lang: string; slug?: string };
  international_cta_click: { market: string; lang: string; section: string };
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
  checkout_failed: {
    code: string;
    http_status: number;
    status?: number;
    error_message?: string;
    price_eur: number;
    amount?: number;
    country?: string;
    device?: string;
    file_count?: number;
    part_slug?: string;
    // H5: so we can audit Buy == Stripe in PostHog. Server totals come from the deployed
    // oracle (src/__checkpoint__/legacy/deployedServer.ts) or the v5 pricing-config response.
    client_total_cents?: number;
    legacy_server_total_cents?: number;
    page_group?: "local" | "non_local";
    fulfillment?: "pickup" | "shipping";
    max_file_mb?: number;
    mesh_watertight?: boolean;
    mesh_shells?: number;
  };
  checkout_failed_send_order: { code: string };
  instant_limit_file_too_large: {
    file_mb: number;
    total_file_mb?: number;
    file_count: number;
    trigger: "client_preflight" | "server_response";
    device?: string;
    country?: string;
  };
  parse_error_free_review_click: { name: string | undefined };

  // File preparation (STEP 1)
  file_prepared: {
    original_bytes: number;
    format: string;
    ascii_converted: boolean;
    simplified: boolean;
    triangles_before: number;
    triangles_after: number;
    final_bytes: number;
    ms: number;
  };

  // Consent (STEP 3.4)
  consent_prompt_shown: { placement: 'card' | 'sheet' | 'top-docked'; trigger: 'scroll' | 'click' | 'timer' };
  consent_decision: { decision: 'accept' | 'reject'; seconds_to_decision: number; page_type: string };

  // Prompt 25 — checkout redesign tracking
  /** Fires before Stripe redirect — one row per completed checkout session start. */
  checkout_started: {
    total: number; instant_eligible: boolean; material: string; delivery: string;
    page_type: string; country_page: string | null; device: 'mobile' | 'desktop';
  };
  /** Fires when the user opens the "¿Lo revisan primero?" path instead of Buy. */
  quote_path_chosen: { reason: string; total: number };
  /** Fires when "Ajustes avanzados" accordion is opened for the first time per session. */
  advanced_opened: { via: 'simple' | 'advanced' | 'per_part' };
  /** Fires when the "+12" extra colours chip is expanded. */
  more_colors_opened: Record<string, never>;
  /** Fires when "Más materiales" (ASA / Nylon + quote-only) is expanded. */
  more_materials_opened: Record<string, never>;
  /** conv-27 — fires when the viewer is expanded (mobile) or enters fullscreen. */
  viewer_expanded: { on?: boolean };
  /** conv-27 — fires when the colour dropdown trigger is opened. */
  color_dropdown_opened: Record<string, never>;
  /** conv-27 — fires when the "Más materiales" details is opened (replaces more_materials_opened as the preferred name). */
  material_more_opened: Record<string, never>;
  /** conv-27 — fires when the "Añadir nota" link expands the Simple-mode note textarea. */
  note_opened: Record<string, never>;
  /** Fires when "Enviarme este presupuesto" is submitted — saves a quote. */
  quote_saved: { email_hash: string; total: number; material: string };
  /** Fires when a shared quote link re-opens the modal with its config. */
  quote_link_opened: { restored_file: boolean };
  /** Fires when the live-colour swatch actually updates the viewer material. */
  color_changed_preview: { colour: string };
  /** Fires with every impression of the cutoff line so we can prove it swaps at 14:00. */
  cutoff_shown: { before_cutoff: boolean };
  /** Fires on every impression / interaction of the price view (R5). */
  price_viewed: {
    total: number; instant_eligible: boolean; ineligible_reason?: string;
    material: string; delivery: string; page_type: string;
    country_page: string | null; device: 'mobile' | 'desktop';
  };
  /** Prompt 26 §3 — one row per stage of the upload → prepare → measure → price pipeline.
   *  Lets us see where mobile uploads actually stall without guessing. */
  upload_pipeline_stage: {
    stage: 'read' | 'prepare_import' | 'prepare_done' | 'prepare_failed' | 'prepare_timeout'
      | 'server_measure_sent' | 'server_measure_ok' | 'server_measure_failed' | 'price_shown';
    file_mb: number;
    ms_since_upload: number;
    device: 'mobile' | 'desktop' | 'unknown';
    browser: string;
    /** First 200 characters of the underlying error, when the stage reports a failure. */
    error_message?: string;
  };
  /** Fires on first pageview when referrer is a known AI search/chat platform. */
  ai_referral: {
    ai_source: 'chatgpt' | 'perplexity' | 'gemini' | 'copilot' | 'claude' | 'other_ai';
    referrer_url: string;
    landing_path: string;
  };

  // ---- New events — UI overhaul ----

  /** Fires on every click of an upload entry point (hero btn, header btn, step card, etc.) */
  upload_entry_click: {
    source: 'hero' | 'header' | 'step_card' | 'path_card' | 'final_band' | 'sticky_bar' | 'page_drop';
    page_path?: string;
  };

  /** Fires when a file is dropped anywhere on the V2 homepage */
  page_drop_upload: {
    file_count?: number;
    page_path?: string;
  };

  /** Fires when the mobile "send link" share action is triggered */
  mobile_share_link: {
    method?: 'share_api' | 'copy';
    page_path?: string;
  };

  /** Fires when the mobile sticky bottom bar first appears on screen */
  sticky_bar_shown: {
    page_path?: string;
  };

  // ---- Section 4: reaching non-buyers ----
  saved_quote_bar_shown: { total: number; file_name?: string };
  saved_quote_bar_clicked: { action: 'resume' | 'dismiss' };
  lower_price_opened: { total: number };
  lower_price_option_applied: { option: string; saving_eur: number };
  budget_sent: { amount_eur: number; email_domain?: string };
  exit_code_requested: { email_domain?: string };

  // ---- Section 6: measurement — server-side events fired by stripe-webhook ----
  /** Fired by stripe-webhook on checkout.session.completed (paid). Idempotent via session.id. */
  order_paid_server: {
    order_id?: string;
    order_number?: string | number;
    value?: number;
    currency?: string;
    fulfillment?: string;
    pricing_version?: number;
    promo_code?: string;
    promo_kind?: string;
    recovered?: boolean;
    country?: string;
    ph_distinct_id?: string;
  };
  /** Fired by stripe-webhook on checkout.session.expired when recovery was sent. */
  checkout_expired_server: {
    stripe_session_id?: string;
    recovery_sent?: boolean;
    country?: string;
    pricing_version?: number;
    ph_distinct_id?: string;
  };
}

export type EventName = keyof EventMap;
