-- Allow anonymous visitors to submit contact info on a quote_request they uploaded.
-- USING restricts targets to rows in "uploaded" status (pre-contact, not yet admin-visible).
-- WITH CHECK enforces that after the update the row has a contact method and status "pending".
-- A valid UUID is 2^122 possibilities — guessing an id in the wild is infeasible.

GRANT UPDATE ON public.quote_requests TO anon;

CREATE POLICY "anon can submit uploaded quote request"
  ON public.quote_requests FOR UPDATE
  TO anon
  USING (status = 'uploaded')
  WITH CHECK (
    status = 'pending'
    AND (contact_email IS NOT NULL OR contact_phone IS NOT NULL)
  );
