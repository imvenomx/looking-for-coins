-- Add opponent_ready column to matches table
ALTER TABLE matches 
ADD COLUMN opponent_ready BOOLEAN DEFAULT FALSE;
