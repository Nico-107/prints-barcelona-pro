
DROP POLICY IF EXISTS "Public read order photos" ON storage.objects;

CREATE POLICY "Admins can list order photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'order-photos' AND public.has_role(auth.uid(), 'admin'));
