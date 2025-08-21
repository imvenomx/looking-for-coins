-- Add result submission columns to matches table
ALTER TABLE matches 
ADD COLUMN host_result VARCHAR(20),
ADD COLUMN opponent_result VARCHAR(20),
ADD COLUMN winner_id UUID REFERENCES auth.users(id),
ADD COLUMN finished_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN disputed_at TIMESTAMP WITH TIME ZONE;

-- Add comments to document the columns
COMMENT ON COLUMN matches.host_result IS 'Result submitted by host: host or opponent';
COMMENT ON COLUMN matches.opponent_result IS 'Result submitted by opponent: host or opponent';
COMMENT ON COLUMN matches.winner_id IS 'ID of the winning user';
COMMENT ON COLUMN matches.finished_at IS 'Timestamp when the match was finished';
COMMENT ON COLUMN matches.disputed_at IS 'Timestamp when the match results were disputed';

-- Create indexes for better query performance
CREATE INDEX idx_matches_winner_id ON matches(winner_id);
CREATE INDEX idx_matches_finished_at ON matches(finished_at);
CREATE INDEX idx_matches_disputed_at ON matches(disputed_at);
