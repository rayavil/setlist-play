-- Script to create a Demo Setlist with ALL existing songs
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  target_user_id uuid;
  new_setlist_id uuid;
BEGIN
  -- 1. Get the first user found (Simulating "My User")
  -- If you want a specific user, replace this query with your UUID
  SELECT id INTO target_user_id FROM auth.users LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first.';
  END IF;

  -- 2. Create the Setlist
  INSERT INTO setlists (title, owner_id, is_public, is_live)
  VALUES ('Repertorio Completo (Importado)', target_user_id, true, false)
  RETURNING id INTO new_setlist_id;

  -- 3. Insert ALL songs into this setlist
  INSERT INTO setlist_items (setlist_id, song_id, position)
  SELECT 
    new_setlist_id, 
    id, 
    ROW_NUMBER() OVER (ORDER BY title) -- Order by title alphabetical
  FROM songs;

  RAISE NOTICE 'Created Setlist % with all existing songs for user %', new_setlist_id, target_user_id;
END $$;
