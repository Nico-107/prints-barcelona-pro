-- price_estimates: logs each STL calculator usage for business monitoring.
-- RLS mirrors maker_applications exactly: anon INSERT only, admin SELECT only.
-- The STL file itself is never stored here — only computed values.

CREATE TABLE public.price_estimates (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  volume_cm3  numeric(12,4) NOT NULL,           -- parsed STL volume in cm³
  material    text          NOT NULL,
  infill_pct  integer       NOT NULL,
  quantity    integer       NOT NULL,
  grams       numeric(10,2) NOT NULL,           -- estimated material weight
  est_hours   numeric(8,2)  NOT NULL,           -- estimated print time
  price_low   numeric(10,2) NOT NULL,           -- lower bound of shown range
  price_high  numeric(10,2) NOT NULL,           -- upper bound of shown range
  file_name   text,                             -- original filename, no content
  language    text,                             -- ui language at time of estimate
  created_at  timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.price_estimates ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may log an estimate; they cannot read, update, or delete.
CREATE POLICY "anon can insert price estimates"
  ON public.price_estimates
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Grant SELECT to the authenticated role; RLS below restricts to admins only.
GRANT SELECT ON public.price_estimates TO authenticated;

-- Admin-only SELECT policy — mirrors maker_applications exactly.
CREATE POLICY "Admins can view price estimates"
  ON public.price_estimates
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
