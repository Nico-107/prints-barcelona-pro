-- D6 — Checkpoint core tables: webhook_events, email_log, checkout_failures, leads; plus
-- new order columns needed by O1 (payment breakdown, pickup/shipping, test flag, variants).
-- Idempotent (IF NOT EXISTS). Re-including never-applied 20261118 migrations is handled by
-- supabase/checkpoint_all_migrations.sql which concatenates every file.

-- Order payment breakdown + fulfillment metadata ------------------------------------------
alter table if exists public.orders
  add column if not exists customer_name text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists shipping_address jsonb,
  add column if not exists total_paid_cents integer,
  add column if not exists parts_subtotal_cents integer,
  add column if not exists shipping_cents integer,
  add column if not exists min_adj_cents integer,
  add column if not exists express_cents integer,
  add column if not exists promo_code text,
  add column if not exists promo_pct integer,
  add column if not exists promo_discount_cents integer,
  add column if not exists urgency text,
  add column if not exists ship_by_date date,
  add column if not exists page_group text,
  add column if not exists shipping_mode text,
  add column if not exists pickup_location text,
  add column if not exists language text,
  add column if not exists source_path text,
  add column if not exists xp_variants jsonb,
  add column if not exists is_test boolean not null default false;

create index if not exists orders_is_test_idx on public.orders (is_test);
create index if not exists orders_page_group_idx on public.orders (page_group);

-- webhook_events --------------------------------------------------------------------------
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  source text not null,
  event_type text not null,
  stripe_event_id text,
  payload jsonb,
  status text not null default 'received',
  error text
);
create index if not exists webhook_events_received_idx on public.webhook_events (received_at desc);

-- email_log -------------------------------------------------------------------------------
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz not null default now(),
  kind text not null,
  to_address text not null,
  subject text,
  order_id uuid,
  resend_id text,
  status text not null,
  error text
);
create index if not exists email_log_order_idx on public.email_log (order_id);
create index if not exists email_log_sent_idx on public.email_log (sent_at desc);

-- checkout_failures -----------------------------------------------------------------------
create table if not exists public.checkout_failures (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  code text not null,
  http_status integer,
  client_total_cents integer,
  server_total_cents integer,
  page_group text,
  fulfillment text,
  file_count integer,
  max_file_mb numeric,
  mesh_watertight boolean,
  mesh_shells integer,
  ph_distinct_id text,
  ph_session_id text,
  error_message text
);
create index if not exists checkout_failures_occurred_idx on public.checkout_failures (occurred_at desc);
create index if not exists checkout_failures_code_idx on public.checkout_failures (code);

-- leads (calculator sessions) -------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text,
  files jsonb,
  price_cents integer,
  page text,
  country text,
  device text,
  language text,
  started_checkout boolean not null default false,
  failed_code text,
  paid boolean not null default false,
  contact jsonb
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_session_idx on public.leads (session_id);
