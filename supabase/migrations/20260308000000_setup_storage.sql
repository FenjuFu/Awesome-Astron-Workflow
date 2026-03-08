-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('activity-images', 'activity-images', true, 5242880, '{image/*}')
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow everyone to view images (SELECT)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Public Access"
        ON storage.objects FOR SELECT
        USING ( bucket_id = 'activity-images' );
    END IF;
END $$;

-- Allow authenticated users to upload (INSERT)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow authenticated upload"
        ON storage.objects FOR INSERT
        WITH CHECK ( bucket_id = 'activity-images' AND auth.role() = 'authenticated' );
    END IF;
END $$;

-- Allow authenticated users to update their own objects (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated update' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow authenticated update"
        ON storage.objects FOR UPDATE
        WITH CHECK ( bucket_id = 'activity-images' AND auth.role() = 'authenticated' );
    END IF;
END $$;

-- Allow authenticated users to delete their own objects (DELETE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow authenticated delete"
        ON storage.objects FOR DELETE
        USING ( bucket_id = 'activity-images' AND auth.role() = 'authenticated' );
    END IF;
END $$;

-- Allow service_role full access
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access' AND tablename = 'objects' AND schemaname = 'storage') THEN
        CREATE POLICY "Allow service_role full access"
        ON storage.objects FOR ALL
        USING ( auth.role() = 'service_role' )
        WITH CHECK ( auth.role() = 'service_role' );
    END IF;
END $$;
