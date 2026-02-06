-- Create a public view for reviews that excludes sensitive email data
CREATE VIEW public.reviews_public
WITH (security_invoker=on) AS
  SELECT id, name, review_text, rating, published_at, status
  FROM public.reviews
  WHERE status = 'published';

-- Drop the existing SELECT policy that exposes all columns
DROP POLICY IF EXISTS "Anyone can view published reviews" ON public.reviews;

-- Create a restrictive policy that denies direct table access for SELECT
CREATE POLICY "No direct public SELECT on reviews base table"
  ON public.reviews FOR SELECT
  USING (false);