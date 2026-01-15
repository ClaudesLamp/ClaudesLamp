-- Harden access to the sensitive wishes table

-- Ensure RLS is enabled (idempotent)
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

-- Recreate admin-only read policy explicitly
DROP POLICY IF EXISTS "Admins can read all wishes" ON public.wishes;
CREATE POLICY "Admins can read all wishes"
ON public.wishes
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_admin());

-- Add explicit admin-only UPDATE / DELETE policies (defense-in-depth)
DROP POLICY IF EXISTS "Admins can update wishes" ON public.wishes;
CREATE POLICY "Admins can update wishes"
ON public.wishes
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can delete wishes" ON public.wishes;
CREATE POLICY "Admins can delete wishes"
ON public.wishes
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (is_admin());

-- Tighten table privileges so browser roles cannot SELECT/UPDATE/DELETE even if misconfigured.
-- (Keeps INSERT enabled for public wish submission.)
REVOKE ALL PRIVILEGES ON TABLE public.wishes FROM anon, authenticated;
GRANT INSERT ON TABLE public.wishes TO anon, authenticated;