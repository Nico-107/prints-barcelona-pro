CREATE TABLE IF NOT EXISTS public.promo_codes (
  code          text        PRIMARY KEY CHECK (code = upper(code)),
  pct           smallint    NOT NULL CHECK (pct BETWEEN 1 AND 50),
  kind          text        NOT NULL CHECK (kind IN ('public', 'student', 'exit', 'manual')),
  starts_at     timestamptz NOT NULL DEFAULT now(),
  ends_at       timestamptz NOT NULL,
  max_uses      integer,                          -- NULL = unlimited
  uses          integer     NOT NULL DEFAULT 0,
  bound_email   text,                             -- NULL = any email; lowercase
  active        boolean     NOT NULL DEFAULT true,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.promo_codes TO authenticated;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read promo codes" ON public.promo_codes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert promo codes" ON public.promo_codes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update promo codes" ON public.promo_codes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.validate_promo(
  p_code  text,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row   public.promo_codes%ROWTYPE;
  v_now   timestamptz := now();
BEGIN
  SELECT * INTO v_row
  FROM public.promo_codes
  WHERE code = upper(trim(p_code)) AND active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'NOT_FOUND');
  END IF;

  IF v_now < v_row.starts_at THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'NOT_STARTED');
  END IF;

  IF v_now > v_row.ends_at THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'EXPIRED');
  END IF;

  IF v_row.max_uses IS NOT NULL AND v_row.uses >= v_row.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'EXHAUSTED');
  END IF;

  -- bound_email check: if code is bound, only the matching email can use it
  IF v_row.bound_email IS NOT NULL THEN
    IF p_email IS NULL OR lower(trim(p_email)) <> v_row.bound_email THEN
      RETURN jsonb_build_object('valid', false, 'reason', 'EMAIL_MISMATCH');
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'valid',   true,
    'pct',     v_row.pct,
    'ends_at', v_row.ends_at,
    'reason',  NULL
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.validate_promo(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_promo(text, text) TO authenticated;