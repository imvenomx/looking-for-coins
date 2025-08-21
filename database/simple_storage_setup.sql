-- Simple storage setup for avatars bucket
-- Run this in your Supabase SQL Editor

-- First, make sure the avatars bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- Create simple storage policies
-- Allow authenticated users to insert files
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Allow public read access to all avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
