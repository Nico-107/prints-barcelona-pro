CREATE TABLE public.maker_applications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  email        text NOT NULL,
  phone        text,
  city         text NOT NULL,
  printers     text NOT NULL,
  message      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maker_applications ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may submit an application; they may not read, update, or delete.
CREATE POLICY "anon can insert maker applications"
  ON public.maker_applications FOR INSERT
  TO anon
  WITH CHECK (true);
