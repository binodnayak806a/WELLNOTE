-- This migration adds a policy to allow anyone to create a new hospital.
-- This is necessary for the public hospital registration page to work,
-- as the user is not authenticated when they submit the form.

-- Drop the policy if it already exists to ensure a clean slate.
DROP POLICY IF EXISTS "Anyone can create a hospital." ON public.hospitals;

-- Create the policy that allows public INSERT access.
-- The `with check (true)` clause allows any insert operation to proceed.
CREATE POLICY "Anyone can create a hospital."
ON public.hospitals FOR INSERT
WITH CHECK (true);