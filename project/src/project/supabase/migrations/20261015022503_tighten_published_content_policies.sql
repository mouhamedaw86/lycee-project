/*
# Tighten published content visibility

1. Policy Changes
- Students and visitors can read only published courses and assignments.
- Authenticated administrators can read all courses and assignments, including archived drafts.

2. Security
- Removes the mixed policy that could evaluate the administrator helper for anonymous visitors.
- Keeps administrator access behind the server-side `admin_users` check.

3. Data Safety
- No rows or columns are deleted or modified.
*/

DROP POLICY IF EXISTS "Public can read courses" ON public.courses;
DROP POLICY IF EXISTS "Public can read assignments" ON public.assignments;
DROP POLICY IF EXISTS "Public can read published courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can read all courses" ON public.courses;
DROP POLICY IF EXISTS "Public can read published assignments" ON public.assignments;
DROP POLICY IF EXISTS "Admins can read all assignments" ON public.assignments;

CREATE POLICY "Public can read published courses" ON public.courses FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can read all courses" ON public.courses FOR SELECT TO authenticated USING (public.current_user_is_admin());
CREATE POLICY "Public can read published assignments" ON public.assignments FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can read all assignments" ON public.assignments FOR SELECT TO authenticated USING (public.current_user_is_admin());