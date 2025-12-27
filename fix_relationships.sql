-- Fix Setlist -> Profile Relationship
-- This is needed because Supabase/PostgREST needs a direct Foreign Key between tables to auto-detect the relationship for queries like select=*,profiles(*)

-- 1. Drop existing FK to auth.users (if it exists under this name, or we might just add the new one)
-- To be safe, let's just ADD the new constraint. PostgREST will pick it up.

ALTER TABLE setlists
DROP CONSTRAINT IF EXISTS setlists_owner_id_fkey;

ALTER TABLE setlists
ADD CONSTRAINT setlists_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES profiles(id);

-- Also ensure profiles exist for every user (trigger)
-- This is good practice anyway
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
