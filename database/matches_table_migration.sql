-- Migration script to update existing matches table to work with new match creation system
-- This preserves your existing data while adding required fields

-- Step 1: Add new columns needed by the API
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS match_type VARCHAR(10) DEFAULT 'public',
ADD COLUMN IF NOT EXISTS entry_fee NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS prize VARCHAR(20) DEFAULT '0.00',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'waiting',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Add constraints for new columns
ALTER TABLE public.matches 
ADD CONSTRAINT matches_match_type_check CHECK (match_type IN ('public', 'private'));

ALTER TABLE public.matches 
ADD CONSTRAINT matches_status_check CHECK (status IN ('waiting', 'ready', 'playing', 'submitting', 'finished', 'cancelled', 'disputed'));

-- Step 3: Update existing data to have proper values
-- Set entry_fee based on existing betting_amount
UPDATE public.matches 
SET entry_fee = betting_amount 
WHERE entry_fee = 0.00;

-- Calculate prize as 85% of double the entry fee (assuming 1v1 matches)
UPDATE public.matches 
SET prize = (entry_fee * 2 * 0.85)::VARCHAR 
WHERE prize = '0.00';

-- Set match_type based on is_public column
UPDATE public.matches 
SET match_type = CASE 
  WHEN is_public = true THEN 'public' 
  ELSE 'private' 
END;

-- Set status based on existing result (if you have completed matches)
UPDATE public.matches 
SET status = CASE 
  WHEN result IS NOT NULL THEN 'finished'
  ELSE 'waiting'
END;

-- Set expires_at to 30 minutes after created_at for existing matches
UPDATE public.matches 
SET expires_at = created_at + INTERVAL '30 minutes'
WHERE expires_at IS NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_game_mode ON public.matches(game_mode);
CREATE INDEX IF NOT EXISTS idx_matches_region ON public.matches(region);
CREATE INDEX IF NOT EXISTS idx_matches_platform ON public.matches(platform);
CREATE INDEX IF NOT EXISTS idx_matches_match_type ON public.matches(match_type);

-- Step 5: Update RLS policies if needed
-- (Your existing policies should work, but you might want to review them)

-- Optional: Create a view that maps your enum types to strings for the frontend
CREATE OR REPLACE VIEW matches_view AS
SELECT 
  id,
  user_id,
  opponent_name,
  match_date,
  result,
  betting_amount,
  created_at,
  game_mode::TEXT as game_mode,
  is_public,
  first_to,
  platform::TEXT as platform,
  region::TEXT as region,
  team_size,
  match_type,
  entry_fee,
  prize,
  status,
  expires_at
FROM public.matches;

-- Grant permissions on the view
GRANT SELECT ON matches_view TO authenticated;
GRANT SELECT ON matches_view TO anon;
