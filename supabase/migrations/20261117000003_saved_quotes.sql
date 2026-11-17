-- saved_quotes: visitors who explicitly save their quote for email follow-up.
-- Distinct from quote_requests: each row represents opt-in email capture with
-- a reminder cycle (4.2) and an unsubscribe path (/baja?token=…).

CREATE TABLE IF NOT EXISTS saved_quotes (
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

ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;
-- Service role only; no public read/write.
GRANT SELECT, INSERT, UPDATE ON TABLE saved_quotes TO service_role;
