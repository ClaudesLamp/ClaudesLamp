-- Add SELECT policy for admin_wish_logs so admins can view logs
CREATE POLICY "Admins can view admin wish logs"
ON public.admin_wish_logs
FOR SELECT
USING (public.is_admin());