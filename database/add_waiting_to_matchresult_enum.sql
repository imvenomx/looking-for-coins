-- Add 'waiting' value to MatchResult enum
ALTER TYPE public."MatchResult" ADD VALUE IF NOT EXISTS 'waiting';
