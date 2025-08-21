-- Query to check the actual column types in your matches table
-- Run this in your Supabase SQL editor to see the real structure

SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'matches' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there are any custom enum types
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('gamemode', 'platform', 'region', 'matchresult')
ORDER BY t.typname, e.enumsortorder;
