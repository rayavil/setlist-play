-- Add owner_id to songs table
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);

-- Optional: If you want to update existing songs to belong to a specific user (you), un-comment and run:
-- UPDATE songs SET owner_id = 'YOUR_USER_ID_HERE' WHERE owner_id IS NULL;

-- Enable RLS if you want to protect songs (Optional for now as we want global search)
-- ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Songs are viewable by everyone" ON songs FOR SELECT USING (true);
-- CREATE POLICY "Users can create their own songs" ON songs FOR INSERT WITH CHECK (auth.uid() = owner_id);
-- CREATE POLICY "Users can update their own songs" ON songs FOR UPDATE USING (auth.uid() = owner_id);
