CREATE TABLE public.quote_requests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  contact_email        text,
  contact_phone        text,
  material             text NOT NULL,
  color                text,
  infill               text NOT NULL,
  wall_loops           integer NOT NULL,
  quantity             integer NOT NULL,
  estimated_grams      numeric NOT NULL,
  estimated_hours      numeric NOT NULL,
  estimated_price_low  numeric NOT NULL,
  estimated_price_high numeric NOT NULL,
  file_paths           text[] NOT NULL DEFAULT '{}',
  status               text NOT NULL DEFAULT 'pending',
  converted_order_id   uuid REFERENCES public.orders(id)
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can insert quote requests"
  ON public.quote_requests FOR INSERT
  TO anon
  WITH CHECK (true);

GRANT SELECT, UPDATE ON public.quote_requests TO authenticated;

CREATE POLICY "Admins can view quote requests"
  ON public.quote_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update quote requests"
  ON public.quote_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
