-- Allow anonymous users to view and manage registrations
-- WARNING: This is for development only. In production, use authenticated users or a backend proxy.

-- Drop existing restricted policy if it exists
DROP POLICY IF EXISTS "Users can view own registrations or admins all" ON registrations;

-- Create new permissive policy for SELECT
CREATE POLICY "Registrations are viewable by everyone" ON registrations
    FOR SELECT USING (true);

-- Create new permissive policy for UPDATE (to allow status changes)
CREATE POLICY "Registrations are updateable by everyone" ON registrations
    FOR UPDATE USING (true);

-- Create new permissive policy for DELETE
CREATE POLICY "Registrations are deletable by everyone" ON registrations
    FOR DELETE USING (true);
