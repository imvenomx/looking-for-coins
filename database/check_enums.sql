-- Query to check what values are allowed in your enums
-- Run these in your Supabase SQL editor to see allowed values

-- Check GameMode enum values
SELECT unnest(enum_range(NULL::GameMode)) AS game_mode_values;

-- Check Platform enum values  
SELECT unnest(enum_range(NULL::Platform)) AS platform_values;

-- Check Region enum values
SELECT unnest(enum_range(NULL::Region)) AS region_values;

-- Check MatchResult enum values
SELECT unnest(enum_range(NULL::MatchResult)) AS match_result_values;
