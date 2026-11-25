-- saved_quotes: visitors who explicitly save their quote for email follow-up.
-- Distinct from quote_requests: each row represents opt-in email capture with
-- a reminder cycle (4.2) and an unsubscribe path (/baja?token=…).

CREATE TABLE IF NOT EXISTS public.saved_quotes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       uuid        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  email       text        NOT NULL,
  quote_payload jsonb,                 -- { material, colour, qty, urgency, fileId?, files[] }
  total       numeric(8,2),
  language    text,
  source_page text,
  reminded_at timestamptz,
  purchased   boolean     NOT NULL DEFAULT false,
  unsubscribed boolean    NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON TABLE public.saved_quotes TO service_role;
GRANT SELECT, UPDATE ON public.saved_quotes TO authenticated;
ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read saved quotes" ON public.saved_quotes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update saved quotes" ON public.saved_quotes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.unsubscribe_saved_quote(p_token uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.saved_quotes SET unsubscribed = true WHERE token = p_token;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count > 0;
END; $$;
GRANT EXECUTE ON FUNCTION public.unsubscribe_saved_quote(uuid) TO anon, authenticated;