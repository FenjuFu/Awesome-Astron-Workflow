-- Create lucky_draw_participants table
CREATE TABLE IF NOT EXISTS public.lucky_draw_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    draw_id UUID REFERENCES public.lucky_draws(id) ON DELETE CASCADE,
    number SERIAL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lucky_draw_participants ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (allow insert and select)
CREATE POLICY "Allow public insert for lucky_draw_participants" ON public.lucky_draw_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select for lucky_draw_participants" ON public.lucky_draw_participants
    FOR SELECT USING (true);

-- Create lucky_draw_winners table
CREATE TABLE IF NOT EXISTS public.lucky_draw_winners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    draw_id UUID REFERENCES public.lucky_draws(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.lucky_draw_participants(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lucky_draw_winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access for lucky_draw_winners" ON public.lucky_draw_winners
    FOR ALL USING (true) WITH CHECK (true);
