ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS pieces jsonb;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pieces jsonb;