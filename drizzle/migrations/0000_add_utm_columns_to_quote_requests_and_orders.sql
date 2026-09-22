ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS utm_source  text,
  ADD COLUMN IF NOT EXISTS utm_medium  text,
  ADD COLUMN IF NOT EXISTS utm_content text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS utm_source  text,
  ADD COLUMN IF NOT EXISTS utm_medium  text,
  ADD COLUMN IF NOT EXISTS utm_content text;