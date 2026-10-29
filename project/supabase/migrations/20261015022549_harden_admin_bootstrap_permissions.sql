/*
# Harden administrator bootstrap

1. Security Changes
- Serializes the one-time first-administrator claim with a transaction advisory lock.
- Removes direct browser table privileges from `admin_users`.

2. Data Safety
- Existing administrators and content remain unchanged.
- No rows are deleted.
*/

REVOKE ALL ON public.admin_users FROM anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('lycee_elhadji_baba_first_admin'));

  INSERT INTO public.admin_users (user_id)
  SELECT auth.uid()
  WHERE NOT EXISTS (SELECT 1 FROM public.admin_users)
  ON CONFLICT DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) INTO claimed;
  RETURN claimed;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;