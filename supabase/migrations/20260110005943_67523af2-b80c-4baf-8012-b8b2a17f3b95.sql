-- 1. Create user_roles table for admin management FIRST
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'moderator', 'user')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 2. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Now create admin role check function (table exists now)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- 4. Only allow admins to read user_roles
CREATE POLICY "Admins can view roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.is_admin());

-- 5. Create policy for admin-only full access to wishes table
CREATE POLICY "Admins can read all wishes" ON public.wishes
FOR SELECT TO authenticated
USING (public.is_admin());