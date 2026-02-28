-- 创建活动表
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    max_participants INTEGER DEFAULT 0,
    registered_count INTEGER DEFAULT 0,
    registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
    category VARCHAR(50),
    cover_image VARCHAR(500),
    additional_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_registration_end ON activities(registration_end);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);

-- 创建报名表
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID DEFAULT auth.uid(), -- 添加 user_id 字段
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    position VARCHAR(100),
    custom_fields JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_registrations_activity_id ON registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

-- 访问权限设置

-- 活动表权限
GRANT SELECT ON activities TO anon;
GRANT ALL PRIVILEGES ON activities TO authenticated;
GRANT ALL PRIVILEGES ON activities TO service_role;

-- 报名表权限
GRANT SELECT ON registrations TO anon;
GRANT ALL PRIVILEGES ON registrations TO authenticated;
GRANT ALL PRIVILEGES ON registrations TO service_role;

-- 启用行级安全
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 活动读取策略（所有人可读）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Activities are viewable by everyone') THEN
        CREATE POLICY "Activities are viewable by everyone" ON activities
            FOR SELECT USING (true);
    END IF;
END $$;

-- 活动管理策略（管理员可操作，暂时简化为认证用户可操作，后期完善管理员逻辑）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Activities are manageable by authenticated users') THEN
        CREATE POLICY "Activities are manageable by authenticated users" ON activities
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 报名创建策略（任何人可创建，或者认证用户可创建）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can create registrations') THEN
        CREATE POLICY "Anyone can create registrations" ON registrations
            FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 报名查看策略（用户可查看自己的报名或管理员查看所有）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own registrations or admins all') THEN
        CREATE POLICY "Users can view own registrations or admins all" ON registrations
            FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'authenticated');
    END IF;
END $$;
