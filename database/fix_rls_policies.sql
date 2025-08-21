-- Fix RLS policies for matches table to allow match creation
-- Run this in your Supabase SQL editor

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'matches';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can only see their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can only insert their own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can only update their own matches" ON public.matches;

-- Create more permissive policies for development
-- Allow authenticated users to insert matches
CREATE POLICY "Allow authenticated users to insert matches" ON public.matches
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Allow everyone to read public matches
CREATE POLICY "Allow reading public matches" ON public.matches
    FOR SELECT 
    TO authenticated, anon
    USING (is_public = true OR user_id = auth.uid());

-- Allow users to update their own matches
CREATE POLICY "Allow users to update own matches" ON public.matches
    FOR UPDATE 
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own matches
CREATE POLICY "Allow users to delete own matches" ON public.matches
    FOR DELETE 
    TO authenticated
    USING (user_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.matches TO authenticated;
GRANT SELECT ON public.matches TO anon;
