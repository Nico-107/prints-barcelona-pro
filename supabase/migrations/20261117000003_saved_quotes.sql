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

ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;

-- Service role only for direct access (edge functions)
GRANT SELECT, INSERT, UPDATE ON TABLE public.saved_quotes TO service_role;

-- Admin policies
CREATE POLICY saved_quotes_admin_select ON public.saved_quotes
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY saved_quotes_admin_update ON public.saved_quotes
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- unsubscribe_saved_quote: called from the browser via /baja?token=…
-- SECURITY DEFINER bypasses RLS so anon visitors can mark their own row.
-- Returns true when the row was found and updated; false when the token is unknown.
CREATE OR REPLACE FUNCTION public.unsubscribe_saved_quote(p_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.saved_quotes
  SET unsubscribed = true
  WHERE token = p_token AND unsubscribed = false;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.unsubscribe_saved_quote(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.unsubscribe_saved_quote(uuid) TO authenticated;
