-- This migration creates a helper function to get a user's role and
-- updates the RLS policy on the 'users' table to use this function,
-- fixing an infinite recursion error.

-- Create the function to get the role of the currently authenticated user.
-- It's marked as SECURITY DEFINER to run with elevated privileges, allowing it
-- to bypass RLS to read the role.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Drop the old, recursive policy for admins.
DROP POLICY IF EXISTS "Admins can manage all user profiles." ON public.users;

-- Create the new, corrected policy for admins that uses our helper function.
-- This breaks the infinite loop.
CREATE POLICY "Admins can manage all user profiles."
ON public.users FOR ALL
USING (
  public.get_my_role() = 'hospital_admin'
);