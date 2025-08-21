-- Update matches status constraint to include 'disputed' status
-- This fixes the constraint violation when setting match status to 'disputed'

-- Drop the existing constraint
ALTER TABLE public.matches 
DROP CONSTRAINT IF EXISTS matches_status_check;

-- Add the updated constraint with 'disputed' status included
ALTER TABLE public.matches 
ADD CONSTRAINT matches_status_check CHECK (status IN ('waiting', 'ready', 'playing', 'submitting', 'finished', 'cancelled', 'disputed'));
