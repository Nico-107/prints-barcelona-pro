-- Phase 1: after-purchase foundations.
--
-- Additive-only. Live site must keep working if this migration has not been
-- deployed yet: every new frontend path checks for these columns / RPC and
-- degrades silently when absent.
--
-- 1. Shipment + tracking + name fields on orders.
-- 2. New order_events table (admin-only read, RPC-fed customer visibility).
-- 3. get_order_by_token RPC — token-authenticated customer order lookup.

-- ── 1. orders columns ─────────────────────────────────────────────────────────

-- 24+ char url-safe token. encode(gen_random_bytes(18), 'base64') yields 24 chars;
-- translate() replaces the three non-url-safe base64 glyphs so the token is safe
-- inside a URL path without further escaping.
CREATE OR REPLACE FUNCTION public.gen_order_tracking_token()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT translate(encode(gen_random_bytes(18), 'base64'), '+/=', '-_.');
$$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_token   text,
  ADD COLUMN IF NOT EXISTS customer_name    text,
  ADD COLUMN IF NOT EXISTS total_paid_cents integer,
  ADD COLUMN IF NOT EXISTS carrier          text,
  ADD COLUMN IF NOT EXISTS tracking_number  text,
  ADD COLUMN IF NOT EXISTS tracking_url     text,
  ADD COLUMN IF NOT EXISTS label_url        text,
  ADD COLUMN IF NOT EXISTS shipment_ref     text,
  ADD COLUMN IF NOT EXISTS shipped_at       timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at     timestamptz,
  ADD COLUMN IF NOT EXISTS internal_notes   text NOT NULL DEFAULT '';

-- Backfill tokens for existing rows that are missing one.
UPDATE public.orders
SET    tracking_token = public.gen_order_tracking_token()
WHERE  tracking_token IS NULL;

-- Make the column NOT NULL + unique with a default for future rows.
ALTER TABLE public.orders
  ALTER COLUMN tracking_token SET DEFAULT public.gen_order_tracking_token();

ALTER TABLE public.orders
  ALTER COLUMN tracking_token SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'orders_tracking_token_key'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_tracking_token_key UNIQUE (tracking_token);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS orders_tracking_token_idx ON public.orders(tracking_token);

-- ── 2. order_events table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.order_events (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  -- kind: status_change, email_sent, shipment_update, note, photo_added, review_requested, …
  kind                text NOT NULL,
  status              text,            -- new status on a status_change event
  message             text,            -- human-readable snippet (owner note or email subject)
  visible_to_customer boolean NOT NULL DEFAULT false,
  email_id            text,            -- Resend message id when kind = email_sent
  actor               text             -- 'system' | 'owner' | 'customer' | 'webhook:<source>'
);

CREATE INDEX IF NOT EXISTS order_events_order_id_idx
  ON public.order_events(order_id, created_at DESC);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read order events"   ON public.order_events;
DROP POLICY IF EXISTS "Admins can insert order events" ON public.order_events;
DROP POLICY IF EXISTS "Admins can update order events" ON public.order_events;
DROP POLICY IF EXISTS "Admins can delete order events" ON public.order_events;

CREATE POLICY "Admins can read order events"
  ON public.order_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert order events"
  ON public.order_events FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order events"
  ON public.order_events FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order events"
  ON public.order_events FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 3. get_order_by_token RPC ─────────────────────────────────────────────────
--
-- Returns only fields safe to show on /pedido/<token>. No email, no phone,
-- no file paths, no internal_notes. The pieces summary strips the storage
-- path for every piece. customer_events is a json array of order_events
-- rows with visible_to_customer = true.

CREATE OR REPLACE FUNCTION public.get_order_by_token(_token text)
RETURNS TABLE (
  order_number     int,
  status           text,
  eta              timestamptz,
  fulfillment      text,
  first_name       text,
  city             text,
  country          text,
  pieces_summary   jsonb,
  photos           text[],
  carrier          text,
  tracking_number  text,
  tracking_url     text,
  shipped_at       timestamptz,
  delivered_at     timestamptz,
  customer_events  jsonb,
  customer_notes   text,
  created_at       timestamptz,
  updated_at       timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ord AS (
    SELECT o.*
    FROM public.orders o
    WHERE o.tracking_token = _token
    LIMIT 1
  ),
  -- Strip anything the customer should not see from each piece.
  pieces_scrub AS (
    SELECT
      ord.id,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'name',     piece->>'name',
              'quantity', (piece->>'quantity')::int,
              'material', piece->>'material',
              'color',    piece->>'color',
              'infill',   piece->'infill',
              'wallLoops', piece->'wallLoops'
            )
          )
          FROM jsonb_array_elements(COALESCE(ord.pieces, '[]'::jsonb)) AS piece
        ),
        '[]'::jsonb
      ) AS pieces
    FROM ord
  ),
  events AS (
    SELECT
      ord.id,
      COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'kind',       e.kind,
              'status',     e.status,
              'message',    e.message,
              'created_at', e.created_at
            )
            ORDER BY e.created_at ASC
          )
          FROM public.order_events e
          WHERE e.order_id = ord.id
            AND e.visible_to_customer = true
        ),
        '[]'::jsonb
      ) AS visible_events
    FROM ord
  )
  SELECT
    ord.order_number,
    ord.status,
    ord.eta,
    ord.fulfillment,
    -- First name from customer_name, falling back to the email local-part so
    -- older orders still render something friendly on the order page.
    COALESCE(
      NULLIF(split_part(COALESCE(ord.customer_name, ''), ' ', 1), ''),
      NULLIF(split_part(COALESCE(ord.customer_email, ''), '@', 1), '')
    ) AS first_name,
    NULLIF(ord.shipping_address->>'city',    '')  AS city,
    NULLIF(ord.shipping_address->>'country', '')  AS country,
    pieces_scrub.pieces                          AS pieces_summary,
    ord.photos,
    ord.carrier,
    ord.tracking_number,
    ord.tracking_url,
    ord.shipped_at,
    ord.delivered_at,
    events.visible_events                        AS customer_events,
    -- `notes` is a free-text field the owner uses as customer-visible notes
    -- today. internal_notes stays private and is never returned here.
    ord.notes                                    AS customer_notes,
    ord.created_at,
    ord.updated_at
  FROM ord
  LEFT JOIN pieces_scrub ON pieces_scrub.id = ord.id
  LEFT JOIN events       ON events.id       = ord.id;
$$;

REVOKE ALL ON FUNCTION public.get_order_by_token(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_order_by_token(text) TO anon, authenticated;
