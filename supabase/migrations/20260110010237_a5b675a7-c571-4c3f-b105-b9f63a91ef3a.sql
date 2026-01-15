-- Drop the insecure public UPDATE policy (only service role should update)
DROP POLICY IF EXISTS "Anyone can update wish verdict" ON public.wishes;

-- Drop the public SELECT policy that exposes raw data
DROP POLICY IF EXISTS "Wishes are publicly readable" ON public.wishes;