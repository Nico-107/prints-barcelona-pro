-- Ensure the anon role has INSERT privilege on quote_requests.
-- The RLS policy allows anon INSERT but the underlying PostgreSQL privilege
-- must also be granted explicitly in case ALTER DEFAULT PRIVILEGES was not set up.
GRANT INSERT ON public.quote_requests TO anon;
