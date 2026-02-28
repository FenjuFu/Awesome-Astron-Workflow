-- Allow anonymous users to insert, update, and delete activities
-- WARNING: This is for development only. In production, use authenticated users or a backend proxy.

-- Drop existing restricted policy
DROP POLICY IF EXISTS "Activities are manageable by authenticated users" ON activities;

-- Create new permissive policy
CREATE POLICY "Activities are manageable by everyone" ON activities
    FOR ALL USING (true) WITH CHECK (true);
