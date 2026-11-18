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

ALTER TABLE public.checkout_recoveries ENABLE ROW LEVEL SECURITY;

-- Service role for direct access (edge functions)
GRANT SELECT, INSERT, UPDATE ON TABLE public.checkout_recoveries TO service_role;

-- Admin policy
CREATE POLICY checkout_recoveries_admin_select ON public.checkout_recoveries
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
