-- RPC called by stripe-webhook on payment completion to increment promo code uses.
-- SECURITY DEFINER so the webhook (service role) can call it without direct table write access.

CREATE OR REPLACE FUNCTION increment_promo_uses(p_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE promo_codes
  SET uses = uses + 1
  WHERE code = upper(p_code) AND active = true;
$$;

GRANT EXECUTE ON FUNCTION increment_promo_uses(text) TO service_role;
