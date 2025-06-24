-- This migration adds a foreign key relationship between the 'users' and 'hospitals' tables.

-- Step 1: Add the 'hospital_id' column to the 'users' table if it doesn't already exist.
-- This column will store the ID of the hospital a user belongs to.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS hospital_id UUID;

-- Step 2: Add a foreign key constraint to link 'users.hospital_id' to 'hospitals.id'.
-- This tells the database that every 'hospital_id' in the 'users' table must match an 'id' in the 'hospitals' table.
-- It also ensures that if a hospital is deleted, any users associated with it will have their hospital_id set to NULL.
ALTER TABLE public.users
ADD CONSTRAINT fk_hospital
FOREIGN KEY (hospital_id)
REFERENCES public.hospitals(id)
ON DELETE SET NULL;