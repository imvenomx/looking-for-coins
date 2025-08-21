-- Replace Region enum with cleaned values
-- Run this step by step in Supabase SQL Editor

-- Step 1: Drop the dependent view
DROP VIEW IF EXISTS matches_view;

-- Step 2: Drop existing Region_new if it exists, then create new enum with only desired values
DROP TYPE IF EXISTS public."Region_new";
CREATE TYPE public."Region_new" AS ENUM ('nae', 'naw', 'nac', 'eu', 'asia', 'oce', 'br');

-- Step 3: Update existing data to map old values to new ones (if any exist)
-- Map old region values to new ones
UPDATE public.matches
SET region = 'nae'::public."Region"
WHERE region::text = 'NA';

UPDATE public.matches
SET region = 'eu'::public."Region"
WHERE region::text = 'EU';

UPDATE public.matches
SET region = 'asia'::public."Region"
WHERE region::text = 'ASIA';

UPDATE public.matches
SET region = 'oce'::public."Region"
WHERE region::text = 'OCE';

UPDATE public.matches
SET region = 'br'::public."Region"
WHERE region::text IN ('SA', 'AFRICA');

-- Step 4: Alter column to use new enum type
ALTER TABLE public.matches
ALTER COLUMN region TYPE public."Region_new"
USING region::text::public."Region_new";

-- Step 5: Drop old enum and rename new one
DROP TYPE public."Region";
ALTER TYPE public."Region_new" RENAME TO "Region";

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
