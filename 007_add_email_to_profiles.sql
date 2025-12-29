-- Update trigger to store email in profiles
-- Run this in Supabase SQL Editor

create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, email, role, is_approved)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name',
    new.email, -- Store email from auth.users
    'user', 
    false -- Default to NOT approved
  );
  return new;
end;
$$ language plpgsql security definer;

-- Add email column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing profiles with emails from auth.users (requires admin access)
-- This needs to be run as a service_role or in Supabase dashboard
UPDATE profiles p
SET email = (
  SELECT email FROM auth.users u WHERE u.id = p.id
)
WHERE p.email IS NULL;
