-- Add started_at column to matches table
ALTER TABLE matches 
ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;

-- Add comment to document the column
COMMENT ON COLUMN matches.started_at IS 'Timestamp when the match was started by the host';

-- Create index for better query performance
CREATE INDEX idx_matches_started_at ON matches(started_at);
