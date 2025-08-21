-- Add enum values one by one to avoid transaction conflicts
-- Run each ALTER TYPE statement separately in your Supabase SQL editor

-- Add GameMode values (run each line separately)
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'boxfights';
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'buildfights';
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'realistic';
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'zerobuild';
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'zonewars';
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'killrace';
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'creative';
ALTER TYPE public."GameMode" ADD VALUE IF NOT EXISTS 'battleroyale';

-- Add Platform values (run each line separately)
ALTER TYPE public."Platform" ADD VALUE IF NOT EXISTS 'pc';
ALTER TYPE public."Platform" ADD VALUE IF NOT EXISTS 'console';
ALTER TYPE public."Platform" ADD VALUE IF NOT EXISTS 'mobile';
ALTER TYPE public."Platform" ADD VALUE IF NOT EXISTS 'any';

-- Add Region values (run each line separately)
ALTER TYPE public."Region" ADD VALUE IF NOT EXISTS 'nae';
ALTER TYPE public."Region" ADD VALUE IF NOT EXISTS 'naw';
ALTER TYPE public."Region" ADD VALUE IF NOT EXISTS 'nac';
ALTER TYPE public."Region" ADD VALUE IF NOT EXISTS 'eu';
ALTER TYPE public."Region" ADD VALUE IF NOT EXISTS 'asia';
ALTER TYPE public."Region" ADD VALUE IF NOT EXISTS 'oce';
ALTER TYPE public."Region" ADD VALUE IF NOT EXISTS 'br';
