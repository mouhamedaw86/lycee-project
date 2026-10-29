/*
# Add secure administration for school content

1. New Tables
- `admin_users`: one row per authenticated account authorized to manage school content.

2. Modified Tables
- `courses`: adds `is_published`; unpublished courses are hidden from students.
- `assignments`: adds `is_published`; unpublished assignments are hidden from students.

3. Administration API
- `current_user_is_admin()` reports whether the signed-in account is an administrator.
- `claim_first_admin()` allows only the first authenticated account to initialize administration.
- Admin-only functions create and update courses and assignments, including publish/archive status.

4. Security
- Public reads now return only published courses and assignments.
- Direct table writes are revoked from browser roles.
- All content mutations run through SECURITY DEFINER functions that verify `auth.uid()` against `admin_users`.
- Function search paths are fixed to `public`, and anonymous execution is denied.

5. Important Notes
- Existing content is preserved and remains published.
- Archiving sets `is_published` to false instead of deleting school content.
- The first administrator should be initialized using the school owner's account before inviting students.
*/

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read their own access" ON public.admin_users;
CREATE POLICY "Admins can read their own access" ON public.admin_users FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;

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

  INSERT INTO public.admin_users (user_id)
  SELECT auth.uid()
  WHERE NOT EXISTS (SELECT 1 FROM public.admin_users)
  ON CONFLICT DO NOTHING;

  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) INTO claimed;
  RETURN claimed;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_course(
  p_title text,
  p_subject text,
  p_description text,
  p_resource_type text,
  p_duration_minutes integer,
  p_color text,
  p_is_published boolean DEFAULT true
)
RETURNS public.courses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_course public.courses;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF char_length(trim(p_title)) < 3 OR char_length(trim(p_title)) > 160 THEN RAISE EXCEPTION 'Invalid title'; END IF;
  IF p_duration_minutes < 1 OR p_duration_minutes > 600 THEN RAISE EXCEPTION 'Invalid duration'; END IF;
  INSERT INTO public.courses (title, subject, description, resource_type, duration_minutes, color, is_published)
  VALUES (trim(p_title), trim(p_subject), trim(p_description), trim(p_resource_type), p_duration_minutes, trim(p_color), p_is_published)
  RETURNING * INTO created_course;
  RETURN created_course;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_course(
  p_id uuid,
  p_title text,
  p_subject text,
  p_description text,
  p_resource_type text,
  p_duration_minutes integer,
  p_color text,
  p_is_published boolean
)
RETURNS public.courses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_course public.courses;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF p_duration_minutes < 1 OR p_duration_minutes > 600 THEN RAISE EXCEPTION 'Invalid duration'; END IF;
  UPDATE public.courses SET title = trim(p_title), subject = trim(p_subject), description = trim(p_description), resource_type = trim(p_resource_type), duration_minutes = p_duration_minutes, color = trim(p_color), is_published = p_is_published WHERE id = p_id RETURNING * INTO updated_course;
  RETURN updated_course;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_assignment(
  p_title text,
  p_subject text,
  p_assignment_type text,
  p_due_at timestamptz,
  p_is_published boolean DEFAULT true
)
RETURNS public.assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created_assignment public.assignments;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  INSERT INTO public.assignments (title, subject, assignment_type, due_at, is_published)
  VALUES (trim(p_title), trim(p_subject), trim(p_assignment_type), p_due_at, p_is_published)
  RETURNING * INTO created_assignment;
  RETURN created_assignment;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_assignment(
  p_id uuid,
  p_title text,
  p_subject text,
  p_assignment_type text,
  p_due_at timestamptz,
  p_is_published boolean
)
RETURNS public.assignments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_assignment public.assignments;
BEGIN
  IF NOT public.current_user_is_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.assignments SET title = trim(p_title), subject = trim(p_subject), assignment_type = trim(p_assignment_type), due_at = p_due_at, is_published = p_is_published WHERE id = p_id RETURNING * INTO updated_assignment;
  RETURN updated_assignment;
END;
$$;

REVOKE ALL ON FUNCTION public.current_user_is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.admin_create_course(text, text, text, text, integer, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_course(text, text, text, text, integer, text, boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.admin_update_course(uuid, text, text, text, text, integer, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_course(uuid, text, text, text, text, integer, text, boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.admin_create_assignment(text, text, text, timestamptz, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_assignment(text, text, text, timestamptz, boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.admin_update_assignment(uuid, text, text, text, timestamptz, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_assignment(uuid, text, text, text, timestamptz, boolean) TO authenticated;

DROP POLICY IF EXISTS "Public can read courses" ON public.courses;
CREATE POLICY "Public can read courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_published = true OR public.current_user_is_admin());
DROP POLICY IF EXISTS "Public can read assignments" ON public.assignments;
CREATE POLICY "Public can read assignments" ON public.assignments FOR SELECT TO anon, authenticated USING (is_published = true OR public.current_user_is_admin());

REVOKE INSERT, UPDATE, DELETE ON public.courses FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.assignments FROM anon, authenticated;
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT SELECT ON public.assignments TO anon, authenticated;