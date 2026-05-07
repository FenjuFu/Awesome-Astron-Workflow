-- Create lucky_draws table
CREATE TABLE IF NOT EXISTS public.lucky_draws (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    prizes JSONB NOT NULL DEFAULT '[]',
    draw_time TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lucky_draws ENABLE ROW LEVEL SECURITY;

-- Create policy for public viewing
CREATE POLICY "Allow public read access for lucky_draws" ON public.lucky_draws
    FOR SELECT USING (true);

-- Create policy for admin management (Since we use a custom password, we'll allow all for now but the UI will handle protection)
-- In a real scenario, we'd use service role or specific auth, but for this simple task we'll allow all and protect at UI level
CREATE POLICY "Allow all access for lucky_draws" ON public.lucky_draws
    FOR ALL USING (true) WITH CHECK (true);

-- Add sample data
INSERT INTO public.lucky_draws (title, description, prizes, draw_time)
VALUES (
    'Astron Lucky Draw',
    'Try your luck and win amazing prizes!',
    '[
        {"id": 0, "name": "Points", "quantity": 100, "icon": "Coins", "color": "bg-yellow-100 text-yellow-600"},
        {"id": 1, "name": "Astron Swag", "quantity": 10, "icon": "Gift", "color": "bg-blue-100 text-blue-600"},
        {"id": 2, "name": "AstronClaw Membership", "quantity": 5, "icon": "Trophy", "color": "bg-purple-100 text-purple-600"},
        {"id": 3, "name": "Thanks for participating", "quantity": 999, "icon": "Info", "color": "bg-gray-100 text-gray-600"}
    ]'::jsonb,
    NOW() + INTERVAL '7 days'
);
