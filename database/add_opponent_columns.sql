-- Add missing opponent columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS opponent_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS opponent_name TEXT,
ADD COLUMN IF NOT EXISTS opponent_epic TEXT,
ADD COLUMN IF NOT EXISTS opponent_profile_picture TEXT,
ADD COLUMN IF NOT EXISTS opponent_ready BOOLEAN DEFAULT FALSE;
