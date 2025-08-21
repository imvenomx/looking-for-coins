-- Replace Platform enum with cleaned values
-- Run this step by step in Supabase SQL Editor

-- Step 1: Drop the dependent view
DROP VIEW IF EXISTS matches_view;

-- Step 2: Drop existing Platform_new if it exists, then create new enum with only desired values
DROP TYPE IF EXISTS public."Platform_new";
CREATE TYPE public."Platform_new" AS ENUM ('pc', 'console', 'mobile', 'any');

-- Step 3: Update existing data to map old values to new ones
UPDATE public.matches
SET platform = 'console'::public."Platform"
WHERE platform::text IN ('Playstation', 'Xbox', 'Switch');

-- Step 4: Alter column to use new enum type
ALTER TABLE public.matches
ALTER COLUMN platform TYPE public."Platform_new"
USING platform::text::public."Platform_new";

-- Step 5: Drop old enum and rename new one
DROP TYPE public."Platform";
ALTER TYPE public."Platform_new" RENAME TO "Platform";

-- Step 6: Recreate the matches_view with original definition
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
