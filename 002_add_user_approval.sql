-- Add is_approved column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- Update existing users to be approved (so you don't lock yourself out)
UPDATE profiles SET is_approved = TRUE;

-- Policy to allow users to read their own approval status (already covered by "Public profiles are viewable by everyone")
-- But we might want to ensure new users can be inserted with default false.
