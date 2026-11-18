-- Migration: promo_codes table, validate_promo RPC, and seed
-- Section 3.1 of GOAL-pricing-codes-capture.md

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

-- Service role can read/write directly (edge functions, webhooks)
GRANT SELECT, INSERT, UPDATE ON TABLE public.promo_codes TO service_role;

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Admin policies: authenticated users with the 'admin' role can manage promo codes
CREATE POLICY promo_codes_admin_select ON public.promo_codes
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY promo_codes_admin_insert ON public.promo_codes
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY promo_codes_admin_update ON public.promo_codes
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- validate_promo: returns { valid, pct, ends_at, reason } without leaking other codes
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

-- Allow anon to call validate_promo (the SECURITY DEFINER bypasses RLS)
GRANT EXECUTE ON FUNCTION public.validate_promo(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_promo(text, text) TO authenticated;

-- Seed: DIMENSION11 — 10 %, public, ends 30 Nov 2026 23:59 Europe/Madrid (= UTC 22:59)
-- INSERT executed as data (not via migration) to avoid re-running on each deploy:
-- INSERT INTO public.promo_codes (code, pct, kind, starts_at, ends_at, max_uses, active, note)
-- VALUES ('DIMENSION11', 10, 'public', '2026-11-01T00:00:00Z', '2026-11-30T22:59:59Z', NULL, true, 'Launch discount November 2026')
-- ON CONFLICT (code) DO NOTHING;
