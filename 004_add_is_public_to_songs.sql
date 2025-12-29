-- Add is_public column to songs table
ALTER TABLE songs 
ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- Update existing songs to be private (or public depending on logic, let's default to private for safety, 
-- or TRUE if we want everything legacy to be visible)
-- Given the app logic filters Global by (is_public = true AND owner != me), 
-- and Mine by (owner = me), safe default is FALSE or TRUE?
-- If false, they only show up in "Mine" if I own them.
-- Let's set default FALSE to be safe, but update all existing to TRUE if they are generic?
-- Actually, let's just add the column defaulting to FALSE.

-- Policy update might be needed if RLS is strict, but usually adding a column is enough if insert policy covers it.
-- Existing songs:
UPDATE songs SET is_public = false WHERE is_public IS NULL;
