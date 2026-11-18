-- RPC called by stripe-webhook on payment completion to increment promo code uses.
-- SECURITY DEFINER so the webhook (service role) can call it without direct table write access.

CREATE OR REPLACE FUNCTION public.increment_promo_uses(p_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.promo_codes
  SET uses = uses + 1
  WHERE code = upper(p_code) AND active = true;
$$;

GRANT EXECUTE ON FUNCTION public.increment_promo_uses(text) TO service_role;
