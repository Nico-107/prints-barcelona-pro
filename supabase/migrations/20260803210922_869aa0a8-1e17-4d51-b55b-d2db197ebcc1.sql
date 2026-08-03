GRANT INSERT ON public.price_estimates TO anon;

-- Ensure the anon INSERT policy exists (idempotent, matching quote_requests pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'price_estimates'
      AND policyname = 'anon_insert_estimates'
  ) THEN
    CREATE POLICY "anon_insert_estimates" ON public.price_estimates
      FOR INSERT TO anon WITH CHECK (true);
  END IF;
END
$$;