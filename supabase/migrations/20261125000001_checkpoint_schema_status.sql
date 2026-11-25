-- D5 — Schema status RPC used by the admin "Estado del sistema" page. Reports which
-- checkpoint tables/columns exist so missing migrations surface as red tiles instead of
-- 500s. SECURITY DEFINER with a strict search_path so RLS and schema hopping are safe.

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
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = e.t
          and column_name = e.c
      ) as exists_now
    from expected e;
end;
$$;

grant execute on function public.checkpoint_schema_status() to anon, authenticated;
