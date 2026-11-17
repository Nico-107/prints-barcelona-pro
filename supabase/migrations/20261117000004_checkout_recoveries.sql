CREATE TABLE IF NOT EXISTS checkout_recoveries (
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

ALTER TABLE checkout_recoveries ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON TABLE checkout_recoveries TO service_role;
