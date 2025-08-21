-- Create matches table for the LFC gaming platform
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_type VARCHAR(10) NOT NULL CHECK (match_type IN ('public', 'private')),
  game_mode VARCHAR(20) NOT NULL,
  first_to VARCHAR(10) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  region VARCHAR(20) NOT NULL,
  team_size VARCHAR(10) NOT NULL,
  entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  prize VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'playing', 'submitting', 'finished', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional fields for future expansion
  host_id UUID,
  opponent_id UUID,
  winner_id UUID,
  map_code VARCHAR(50),
  rules TEXT,
  
  -- Indexes for better query performance
  INDEX idx_matches_status (status),
  INDEX idx_matches_created_at (created_at),
  INDEX idx_matches_game_mode (game_mode),
  INDEX idx_matches_region (region),
  INDEX idx_matches_platform (platform)
);

-- Enable Row Level Security (RLS)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your auth requirements)
CREATE POLICY "Allow public read access to matches" ON matches
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create matches" ON matches
  FOR INSERT WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_matches_updated_at 
  BEFORE UPDATE ON matches 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO matches (match_type, game_mode, first_to, platform, region, team_size, entry_fee, prize, expires_at) VALUES
('public', 'boxfights', '5', 'any', 'nae', '1v1', 5.00, '9.50', NOW() + INTERVAL '30 minutes'),
('public', 'bf', '3', 'pc', 'eu', '1v1', 1.00, '1.85', NOW() + INTERVAL '25 minutes'),
('private', 'realistic', '7', 'console', 'naw', '2v2', 10.00, '19.00', NOW() + INTERVAL '45 minutes');
