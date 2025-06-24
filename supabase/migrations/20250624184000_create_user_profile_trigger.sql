-- This function automatically creates a profile in public.users when a new user signs up.
-- It copies the user's ID, email, and metadata from auth.users to your public table.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role, hospital_id, employee_id, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'role',
    (new.raw_user_meta_data ->> 'hospital_id')::uuid,
    new.raw_user_meta_data ->> 'employee_id',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

-- Drop the trigger if it already exists to ensure a clean setup
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger that runs the handle_new_user function after a new user is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();