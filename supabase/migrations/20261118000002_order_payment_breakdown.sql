-- A4: add payment-breakdown columns to orders (all nullable for older rows)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS min_adj_cents integer;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS express_cents integer;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_pct integer;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS promo_discount_cents integer;
