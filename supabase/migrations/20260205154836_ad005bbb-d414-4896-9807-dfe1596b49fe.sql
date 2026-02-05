-- Create reviews table for storing approved reviews
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  order_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  approval_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can only read published reviews
CREATE POLICY "Anyone can view published reviews" 
ON public.reviews 
FOR SELECT 
USING (status = 'published');

-- Enable realtime for reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- Create index for faster queries
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_approval_token ON public.reviews(approval_token);