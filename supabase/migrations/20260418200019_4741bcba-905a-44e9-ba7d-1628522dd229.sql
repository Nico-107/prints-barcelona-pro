
-- Sequence for human-friendly order numbers starting at 100
CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq START 100;

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number INTEGER NOT NULL UNIQUE DEFAULT nextval('public.orders_order_number_seq'),
  product_title TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL,
  phone_last3 TEXT GENERATED ALWAYS AS (RIGHT(regexp_replace(customer_phone, '\D', '', 'g'), 3)) STORED,
  status TEXT NOT NULL DEFAULT 'order_received',
  eta TIMESTAMPTZ,
  fulfillment TEXT NOT NULL DEFAULT 'pickup',
  notes TEXT NOT NULL DEFAULT '',
  photos TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER SEQUENCE public.orders_order_number_seq OWNED BY public.orders.order_number;

CREATE INDEX orders_order_number_idx ON public.orders(order_number);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Public can delete orders" ON public.orders FOR DELETE USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER orders_touch_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public) VALUES ('order-photos', 'order-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read order photos" ON storage.objects FOR SELECT USING (bucket_id = 'order-photos');
CREATE POLICY "Public upload order photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-photos');
CREATE POLICY "Public delete order photos" ON storage.objects FOR DELETE USING (bucket_id = 'order-photos');
