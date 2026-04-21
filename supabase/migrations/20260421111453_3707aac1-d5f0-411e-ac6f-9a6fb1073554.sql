
-- 1. Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Replace permissive orders policies
DROP POLICY IF EXISTS "Public can read orders" ON public.orders;
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Public can update orders" ON public.orders;
DROP POLICY IF EXISTS "Public can delete orders" ON public.orders;

CREATE POLICY "Admins can read orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Public tracking RPC (2FA: order# + last 3 phone digits). Returns only safe fields.
CREATE OR REPLACE FUNCTION public.get_order_tracking(_order_number int, _phone_last3 text)
RETURNS TABLE (
  id uuid,
  order_number int,
  product_title text,
  status text,
  eta timestamptz,
  fulfillment text,
  notes text,
  photos text[],
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.order_number, o.product_title, o.status, o.eta,
         o.fulfillment, o.notes, o.photos, o.created_at, o.updated_at
  FROM public.orders o
  WHERE o.order_number = _order_number
    AND o.phone_last3 = _phone_last3
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_order_tracking(int, text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(int, text) TO anon, authenticated;

-- 4. Storage policies — admin-only for write/delete on order-photos
DROP POLICY IF EXISTS "Public upload order photos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete order photos" ON storage.objects;

CREATE POLICY "Admins can upload order photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'order-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'order-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'order-photos' AND public.has_role(auth.uid(), 'admin'));

-- 5. Lock down print-requests uploads: require auth + size limit
DROP POLICY IF EXISTS "Anyone can upload print request files" ON storage.objects;

-- Keep uploads possible from the edge function (uses service role) only
-- Remove client-side upload capability entirely
UPDATE storage.buckets
SET file_size_limit = 52428800  -- 50MB
WHERE id = 'print-requests';

UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10MB per photo
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif']
WHERE id = 'order-photos';
