-- Source tracking columns for quote_requests
-- Added by Item 6 of site-polish-15
-- Edge function writes these via service-role UPDATE after the client INSERT;
-- wrapped in try/catch so a deploy without this migration just logs and continues.

ALTER TABLE quote_requests
  ADD COLUMN IF NOT EXISTS source_path      text,
  ADD COLUMN IF NOT EXISTS page_language    text,
  ADD COLUMN IF NOT EXISTS browser_language text,
  ADD COLUMN IF NOT EXISTS referrer_domain  text,
  ADD COLUMN IF NOT EXISTS utm_json         text,
  ADD COLUMN IF NOT EXISTS fulfillment      text;