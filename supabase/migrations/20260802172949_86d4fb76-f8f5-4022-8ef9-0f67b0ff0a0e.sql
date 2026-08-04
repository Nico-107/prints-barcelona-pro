ALTER TABLE public.price_estimates ADD COLUMN IF NOT EXISTS multicolour boolean DEFAULT false;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS multicolour boolean DEFAULT false;