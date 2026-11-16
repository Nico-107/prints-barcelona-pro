-- Item 1.5: /track now accepts an email address as an alternative to the
-- last 3 digits of the phone, matching the promise in the confirmation
-- email. Lookup is case-insensitive.

CREATE OR REPLACE FUNCTION public.get_order_tracking_by_email(_order_number int, _email text)
RETURNS TABLE (
  id uuid,
  order_number int,
  product_title text,
  status text,
  eta timestamptz,
  fulfillment text,
  notes text,
  photos text[],
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.order_number, o.product_title, o.status, o.eta,
         o.fulfillment, o.notes, o.photos, o.created_at, o.updated_at
  FROM public.orders o
  WHERE o.order_number = _order_number
    AND lower(COALESCE(o.customer_email, '')) = lower(COALESCE(_email, ''))
    AND o.customer_email IS NOT NULL
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_order_tracking_by_email(int, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_order_tracking_by_email(int, text) TO anon, authenticated;
