-- UTM attribution columns for Lemon Printers (and any future) referral tracking.
-- Stored on quote_requests at submission, then copied to orders when a quote is accepted.
-- Null means organic traffic — no attribution, no change to pricing logic.

ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS utm_source  text,
  ADD COLUMN IF NOT EXISTS utm_medium  text,
  ADD COLUMN IF NOT EXISTS utm_content text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS utm_source  text,
  ADD COLUMN IF NOT EXISTS utm_medium  text,
  ADD COLUMN IF NOT EXISTS utm_content text;
