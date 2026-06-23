
CREATE TABLE public.maker_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  city text NOT NULL,
  printers text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.maker_applications TO anon;
GRANT INSERT ON public.maker_applications TO authenticated;
GRANT ALL ON public.maker_applications TO service_role;

ALTER TABLE public.maker_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a maker application"
  ON public.maker_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view maker applications"
  ON public.maker_applications
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update maker applications"
  ON public.maker_applications
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete maker applications"
  ON public.maker_applications
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
