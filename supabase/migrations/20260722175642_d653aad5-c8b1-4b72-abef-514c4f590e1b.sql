GRANT UPDATE ON public.quote_requests TO anon;

CREATE POLICY "anon can submit uploaded quote request"
  ON public.quote_requests FOR UPDATE
  TO anon
  USING (status = 'uploaded')
  WITH CHECK (
    status = 'pending'
    AND (contact_email IS NOT NULL OR contact_phone IS NOT NULL)
  );