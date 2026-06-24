-- Allow the authenticated role to SELECT from maker_applications.
-- RLS (below) then restricts actual row visibility to admin users only.
-- Anonymous users keep INSERT-only access; no public SELECT is added.
GRANT SELECT ON public.maker_applications TO authenticated;

-- Admin-only SELECT policy, mirroring the orders table pattern exactly.
DROP POLICY IF EXISTS "Admins can view maker applications" ON public.maker_applications;
CREATE POLICY "Admins can view maker applications"
  ON public.maker_applications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
