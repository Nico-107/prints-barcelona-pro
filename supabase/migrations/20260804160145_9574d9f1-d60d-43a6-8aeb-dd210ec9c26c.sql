ALTER TABLE public.price_estimates
  ADD COLUMN IF NOT EXISTS volume_cm3 numeric,
  ADD COLUMN IF NOT EXISTS material text,
  ADD COLUMN IF NOT EXISTS infill_pct integer,
  ADD COLUMN IF NOT EXISTS quantity integer,
  ADD COLUMN IF NOT EXISTS grams numeric,
  ADD COLUMN IF NOT EXISTS est_hours numeric,
  ADD COLUMN IF NOT EXISTS price_low numeric,
  ADD COLUMN IF NOT EXISTS price_high numeric,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_paths text[],
  ADD COLUMN IF NOT EXISTS file_names text[],
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS multicolour boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

NOTIFY pgrst, 'reload schema';