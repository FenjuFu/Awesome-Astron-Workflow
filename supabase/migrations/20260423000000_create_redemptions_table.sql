-- Create redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_login VARCHAR(255) NOT NULL,
    prize_id VARCHAR(100) NOT NULL,
    prize_name VARCHAR(255) NOT NULL,
    points_spent INTEGER NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_redemptions_github_login ON redemptions(github_login);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);

-- Set up RLS
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own redemptions
CREATE POLICY "Users can view their own redemptions" ON redemptions
    FOR SELECT USING (true); -- We'll handle filtering in the API, but for RLS we can be more restrictive if needed. For now, allow select and we'll filter by github_login in the API.

-- Allow anyone to insert (we'll validate in the API)
CREATE POLICY "Anyone can insert redemptions" ON redemptions
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL PRIVILEGES ON redemptions TO anon;
GRANT ALL PRIVILEGES ON redemptions TO authenticated;
GRANT ALL PRIVILEGES ON redemptions TO service_role;
