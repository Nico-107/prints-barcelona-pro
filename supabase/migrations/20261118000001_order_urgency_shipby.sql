-- A1: add urgency and ship_by_date to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS urgency text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ship_by_date text;
