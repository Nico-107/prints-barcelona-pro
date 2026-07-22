ALTER TABLE public.quote_requests ADD COLUMN urgency text;
ALTER TABLE public.quote_requests ADD COLUMN file_names text[];
ALTER TABLE public.price_estimates ADD COLUMN file_paths text[];
ALTER TABLE public.price_estimates ADD COLUMN file_names text[];