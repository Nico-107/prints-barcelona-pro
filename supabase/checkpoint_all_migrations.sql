-- D6 — Dimension3D checkpoint 2026-11-25: combined migrations, safe to run twice.
-- Lovable: paste this whole file into the SQL editor when running `LOVABLE_DEPLOY.md`.
-- Ends with a verification SELECT that returns one row per expected column/table.

------------------------------------------------------------------------------------------
-- Previously-authored but possibly-never-applied migrations
------------------------------------------------------------------------------------------

-- 20261118000001 order_urgency_shipby.sql: urgency + ship_by_date on orders
alter table if exists public.orders
  add column IF NOT EXISTS urgency text,
  add column IF NOT EXISTS ship_by_date date;

-- 20261118000002 order_payment_breakdown.sql: payment breakdown columns
alter table if exists public.orders
  add column IF NOT EXISTS parts_subtotal_cents integer,
  add column IF NOT EXISTS shipping_cents integer,
  add column IF NOT EXISTS min_adj_cents integer,
  add column IF NOT EXISTS express_cents integer,
  add column IF NOT EXISTS promo_code text,
  add column IF NOT EXISTS promo_pct integer,
  add column IF NOT EXISTS promo_discount_cents integer,
  add column IF NOT EXISTS total_paid_cents integer;

------------------------------------------------------------------------------------------
-- 20261125 checkpoint tables + columns + schema status RPC
------------------------------------------------------------------------------------------

alter table if exists public.orders
  add column IF NOT EXISTS customer_name text,
  add column IF NOT EXISTS customer_email text,
  add column IF NOT EXISTS customer_phone text,
  add column IF NOT EXISTS shipping_address jsonb,
  add column IF NOT EXISTS page_group text,
  add column IF NOT EXISTS shipping_mode text,
  add column IF NOT EXISTS pickup_location text,
  add column IF NOT EXISTS language text,
  add column IF NOT EXISTS source_path text,
  add column IF NOT EXISTS xp_variants jsonb,
  add column IF NOT EXISTS is_test boolean not null default false;

create index IF NOT EXISTS orders_is_test_idx on public.orders (is_test);
create index IF NOT EXISTS orders_page_group_idx on public.orders (page_group);

create table IF NOT EXISTS public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  source text not null,
  event_type text not null,
  stripe_event_id text,
  payload jsonb,
  status text not null default 'received',
  error text
);
create index IF NOT EXISTS webhook_events_received_idx on public.webhook_events (received_at desc);

create table IF NOT EXISTS public.email_log (
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
create index IF NOT EXISTS email_log_order_idx on public.email_log (order_id);
create index IF NOT EXISTS email_log_sent_idx on public.email_log (sent_at desc);

create table IF NOT EXISTS public.checkout_failures (
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
create index IF NOT EXISTS checkout_failures_occurred_idx on public.checkout_failures (occurred_at desc);
create index IF NOT EXISTS checkout_failures_code_idx on public.checkout_failures (code);

create table IF NOT EXISTS public.leads (
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
create index IF NOT EXISTS leads_created_idx on public.leads (created_at desc);
create index IF NOT EXISTS leads_session_idx on public.leads (session_id);

-- Schema-status RPC used by /admin/estado (D5) -----------------------------------------
create or replace function public.checkpoint_schema_status()
returns table (table_name text, column_name text, exists_now boolean)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    with expected (t, c) as (
      values
        ('orders', 'customer_name'),
        ('orders', 'customer_email'),
        ('orders', 'customer_phone'),
        ('orders', 'shipping_address'),
        ('orders', 'total_paid_cents'),
        ('orders', 'parts_subtotal_cents'),
        ('orders', 'shipping_cents'),
        ('orders', 'min_adj_cents'),
        ('orders', 'express_cents'),
        ('orders', 'promo_code'),
        ('orders', 'promo_pct'),
        ('orders', 'promo_discount_cents'),
        ('orders', 'urgency'),
        ('orders', 'ship_by_date'),
        ('orders', 'page_group'),
        ('orders', 'shipping_mode'),
        ('orders', 'pickup_location'),
        ('orders', 'language'),
        ('orders', 'source_path'),
        ('orders', 'xp_variants'),
        ('orders', 'is_test'),
        ('webhook_events', 'id'),
        ('email_log', 'id'),
        ('email_log', 'kind'),
        ('email_log', 'to_address'),
        ('email_log', 'order_id'),
        ('email_log', 'resend_id'),
        ('email_log', 'status'),
        ('checkout_failures', 'id'),
        ('checkout_failures', 'code'),
        ('checkout_failures', 'http_status'),
        ('leads', 'id'),
        ('leads', 'session_id'),
        ('leads', 'files'),
        ('leads', 'price_cents')
    )
    select
      e.t::text as table_name,
      e.c::text as column_name,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = e.t and column_name = e.c
      ) as exists_now
    from expected e;
end;
$$;

grant execute on function public.checkpoint_schema_status() to anon, authenticated;

------------------------------------------------------------------------------------------
-- Verification: every expected column/table must exist. Copy the output back into
-- LOVABLE_DEPLOY.md so the deploy is auditable.
------------------------------------------------------------------------------------------

select table_name, column_name, exists_now
from public.checkpoint_schema_status()
order by exists_now asc, table_name, column_name;
