GRANT SELECT ON public.maker_applications TO authenticated;
DROP POLICY IF EXISTS "Admins can view maker applications" ON public.maker_applications;
CREATE POLICY "Admins can view maker applications" ON public.maker_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));