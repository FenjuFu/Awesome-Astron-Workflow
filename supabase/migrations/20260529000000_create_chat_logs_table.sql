-- Store AI Chat turns (question + reply) for analysis / KB improvement.
-- Only written server-side via the service_role after the user has consented;
-- no anon/authenticated access, so logs are not publicly readable.
CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT,
    model VARCHAR(100),
    consent BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at);

-- RLS on, with no policies => anon/authenticated cannot read or write.
-- The server uses the service_role key, which bypasses RLS.
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

GRANT ALL PRIVILEGES ON chat_logs TO service_role;
