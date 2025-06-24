-- supabase/migrations/YYYYMMDDHHMMSS_create_user_handle.sql

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

-- Drop existing trigger if it exists to ensure a clean setup
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger to run the function when a new user is created in the auth schema
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();