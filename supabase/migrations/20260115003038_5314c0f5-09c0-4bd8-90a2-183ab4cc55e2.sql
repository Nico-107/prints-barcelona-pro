-- Create storage bucket for 3D print request files
INSERT INTO storage.buckets (id, name, public)
VALUES ('print-requests', 'print-requests', false);

-- Allow authenticated and anonymous users to upload files
CREATE POLICY "Anyone can upload print request files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'print-requests');

-- Allow service role to read files (for edge function to generate signed URLs)
CREATE POLICY "Service role can read print request files"
ON storage.objects FOR SELECT
USING (bucket_id = 'print-requests');