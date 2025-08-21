-- Fix enum values to match frontend options
-- Run this in your Supabase SQL editor

-- First, let's check what values currently exist in each enum
SELECT 'Current GameMode values:' as info;
SELECT unnest(enum_range(NULL::public."GameMode")) AS current_values;

SELECT 'Current Platform values:' as info;
SELECT unnest(enum_range(NULL::public."Platform")) AS current_values;

SELECT 'Current Region values:' as info;
SELECT unnest(enum_range(NULL::public."Region")) AS current_values;

-- Add missing GameMode values that are used in the frontend
-- Based on CreateMatchModal.tsx, these values are needed:
DO $$
BEGIN
    -- Add GameMode values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'boxfights' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'boxfights';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'buildfights' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'buildfights';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'realistic' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'realistic';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'zerobuild' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'zerobuild';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'zonewars' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'zonewars';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'killrace' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'killrace';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'creative' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'creative';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'battleroyale' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'GameMode')) THEN
        ALTER TYPE public."GameMode" ADD VALUE 'battleroyale';
    END IF;
END $$;

-- Add missing Platform values
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pc' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Platform')) THEN
        ALTER TYPE public."Platform" ADD VALUE 'pc';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'console' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Platform')) THEN
        ALTER TYPE public."Platform" ADD VALUE 'console';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'mobile' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Platform')) THEN
        ALTER TYPE public."Platform" ADD VALUE 'mobile';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'any' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Platform')) THEN
        ALTER TYPE public."Platform" ADD VALUE 'any';
    END IF;
END $$;

-- Add missing Region values
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'nae' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Region')) THEN
        ALTER TYPE public."Region" ADD VALUE 'nae';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'naw' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Region')) THEN
        ALTER TYPE public."Region" ADD VALUE 'naw';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'nac' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Region')) THEN
        ALTER TYPE public."Region" ADD VALUE 'nac';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'eu' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Region')) THEN
        ALTER TYPE public."Region" ADD VALUE 'eu';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'asia' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Region')) THEN
        ALTER TYPE public."Region" ADD VALUE 'asia';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'oce' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Region')) THEN
        ALTER TYPE public."Region" ADD VALUE 'oce';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'br' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Region')) THEN
        ALTER TYPE public."Region" ADD VALUE 'br';
    END IF;
END $$;

-- Verify the updated enum values
SELECT 'Updated GameMode values:' as info;
SELECT unnest(enum_range(NULL::public."GameMode")) AS updated_values;

SELECT 'Updated Platform values:' as info;
SELECT unnest(enum_range(NULL::public."Platform")) AS updated_values;

SELECT 'Updated Region values:' as info;
SELECT unnest(enum_range(NULL::public."Region")) AS updated_values;
