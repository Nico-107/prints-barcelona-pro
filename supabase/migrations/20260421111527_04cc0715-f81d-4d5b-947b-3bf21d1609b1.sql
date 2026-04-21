
CREATE POLICY "Anyone can upload print request files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'print-requests');
