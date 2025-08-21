-- Replace GameMode enum with cleaned values
-- Run this step by step in Supabase SQL Editor

-- Step 1: Drop the dependent view
DROP VIEW IF EXISTS matches_view;

-- Step 2: Drop existing GameMode_new if it exists, then create new enum with only desired values
DROP TYPE IF EXISTS public."GameMode_new";
CREATE TYPE public."GameMode_new" AS ENUM ('boxfights', 'buildfights', 'realistic', 'zerobuild', 'zonewars', 'killrace', 'creative', 'battleroyale');

-- Step 3: Update existing data to map old values to new ones (if any exist)
-- Map Solo/Duo/Squad/Custom to appropriate game modes or set to a default
UPDATE public.matches
SET game_mode = 'battleroyale'::public."GameMode"
WHERE game_mode::text IN ('Solo', 'Duo', 'Squad');

UPDATE public.matches
SET game_mode = 'creative'::public."GameMode"
WHERE game_mode::text = 'Custom';

-- Step 4: Alter column to use new enum type
ALTER TABLE public.matches
ALTER COLUMN game_mode TYPE public."GameMode_new"
USING game_mode::text::public."GameMode_new";

-- Step 5: Drop old enum and rename new one
DROP TYPE public."GameMode";
ALTER TYPE public."GameMode_new" RENAME TO "GameMode";

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
