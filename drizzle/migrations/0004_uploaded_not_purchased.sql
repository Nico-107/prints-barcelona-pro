-- Item 1.3: record files that were uploaded during checkout but not purchased.
-- Shape: jsonb array of { "path": text, "name": text }. The owner email surfaces
-- these under "Subidos pero no comprados"; nothing on the customer order page
-- ever references this column.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS uploaded_not_purchased jsonb NOT NULL DEFAULT '[]'::jsonb;
