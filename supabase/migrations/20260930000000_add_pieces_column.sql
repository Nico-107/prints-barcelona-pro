-- Per-piece quantity breakdown for multi-file orders.
-- This column is added via Lovable before this code ships; file is for record only.
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS pieces jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pieces jsonb;
