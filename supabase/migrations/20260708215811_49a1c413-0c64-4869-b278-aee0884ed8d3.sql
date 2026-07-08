ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS product_name text;
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS customization jsonb;