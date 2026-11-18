CREATE TABLE IF NOT EXISTS public.checkout_recoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL UNIQUE,
  customer_email text NOT NULL,
  recovery_url text,
  language text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  recovered boolean NOT NULL DEFAULT false,
  recovered_session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON TABLE public.checkout_recoveries TO service_role;
GRANT SELECT ON public.checkout_recoveries TO authenticated;
ALTER TABLE public.checkout_recoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read checkout recoveries" ON public.checkout_recoveries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));