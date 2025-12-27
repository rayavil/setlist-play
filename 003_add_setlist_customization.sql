-- Add customization columns to setlists table
ALTER TABLE setlists 
ADD COLUMN IF NOT EXISTS hex_color TEXT DEFAULT '#4f46e5', -- Default Indigo
ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'ph-playlist';

-- Optional: Update existing setlists to have random colors/icons so they aren't boring
-- Using hashtext involves less casting and is safe for UUIDs
UPDATE setlists 
SET hex_color = CASE abs(hashtext(id::text)) % 5
    WHEN 0 THEN '#ef4444' -- Red
    WHEN 1 THEN '#f97316' -- Orange
    WHEN 2 THEN '#10b981' -- Emerald
    WHEN 3 THEN '#8b5cf6' -- Violet
    ELSE '#4f46e5'        -- Indigo
END
WHERE hex_color = '#4f46e5';
