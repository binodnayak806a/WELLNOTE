-- This migration enables Row Level Security (RLS) on the public.users table
-- and creates policies to allow users to manage their own data.

-- 1. Enable RLS on the 'users' table if it's not already enabled.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to ensure a clean slate (optional but recommended)
DROP POLICY IF EXISTS "Users can view their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.users;
DROP POLICY IF EXISTS "Admins can manage all user profiles." ON public.users;

-- 3. Create a policy that allows users to SELECT (view) their own profile.
-- The `auth.uid()` function returns the ID of the currently logged-in user.
-- This policy checks if the user's ID matches the 'id' column in the row they are trying to access.
CREATE POLICY "Users can view their own profile."
ON public.users FOR SELECT
USING (auth.uid() = id);

-- 4. Create a policy that allows users to UPDATE their own profile.
CREATE POLICY "Users can update their own profile."
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. (Recommended) Create a policy that allows users with the 'hospital_admin' role to manage all profiles.
-- This gives admins the ability to view, update, and delete any user in their hospital system.
CREATE POLICY "Admins can manage all user profiles."
ON public.users FOR ALL
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'hospital_admin'
);