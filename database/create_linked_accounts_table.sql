-- Drop table if it exists to start fresh
DROP TABLE IF EXISTS linked_accounts;

-- Create linked_accounts table to store external account connections
CREATE TABLE linked_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'epic_games', 'twitch', 'twitter', etc.
    provider_user_id VARCHAR(255) NOT NULL, -- External account ID
    username VARCHAR(255), -- Display name/username from external service
    email VARCHAR(255), -- Email from external service (if available)
    profile_data JSONB, -- Additional profile data from external service
    access_token TEXT, -- OAuth access token (encrypted in production)
    refresh_token TEXT, -- OAuth refresh token (encrypted in production)
    expires_at TIMESTAMP WITH TIME ZONE, -- Token expiration
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints after table creation
ALTER TABLE linked_accounts ADD CONSTRAINT unique_user_provider UNIQUE(user_id, provider);
ALTER TABLE linked_accounts ADD CONSTRAINT unique_provider_user UNIQUE(provider, provider_user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_linked_accounts_provider ON linked_accounts(provider);

-- Enable RLS (Row Level Security)
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own linked accounts
CREATE POLICY "Users can view their own linked accounts" ON linked_accounts
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own linked accounts
CREATE POLICY "Users can insert their own linked accounts" ON linked_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own linked accounts
CREATE POLICY "Users can update their own linked accounts" ON linked_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own linked accounts
CREATE POLICY "Users can delete their own linked accounts" ON linked_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_linked_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_linked_accounts_updated_at_trigger
    BEFORE UPDATE ON linked_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_linked_accounts_updated_at();
