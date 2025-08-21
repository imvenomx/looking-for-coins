-- Simple fix: Ensure game_mode, platform, region columns accept any text
-- This removes enum constraints if they exist and makes columns flexible

-- Check current column types
\d public.matches;

-- If columns are enum types, convert them to text
-- (Only run these if the columns are actually enum types)

-- ALTER TABLE public.matches ALTER COLUMN game_mode TYPE TEXT;
-- ALTER TABLE public.matches ALTER COLUMN platform TYPE TEXT;  
-- ALTER TABLE public.matches ALTER COLUMN region TYPE TEXT;

-- Alternative: Just ensure the columns exist and can accept text
-- This should work regardless of current column types
ALTER TABLE public.matches 
  ALTER COLUMN game_mode TYPE TEXT USING game_mode::TEXT,
  ALTER COLUMN platform TYPE TEXT USING platform::TEXT,
  ALTER COLUMN region TYPE TEXT USING region::TEXT;
