-- 为活动添加可自定义链接标识（slug）
ALTER TABLE activities
ADD COLUMN IF NOT EXISTS link_slug VARCHAR(100);

-- 仅在有值时要求唯一
CREATE UNIQUE INDEX IF NOT EXISTS idx_activities_link_slug_unique
ON activities(link_slug)
WHERE link_slug IS NOT NULL;

-- 限制 slug 字符（小写字母、数字、连字符）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'activities_link_slug_format'
  ) THEN
    ALTER TABLE activities
    ADD CONSTRAINT activities_link_slug_format
    CHECK (link_slug IS NULL OR link_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
  END IF;
END $$;

