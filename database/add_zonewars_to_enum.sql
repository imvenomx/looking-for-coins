-- Add the missing 'zonewars' value to the "GameMode" enum type.
-- Run this in your Supabase SQL editor to apply the change.

ALTER TYPE "GameMode" ADD VALUE 'zonewars';
