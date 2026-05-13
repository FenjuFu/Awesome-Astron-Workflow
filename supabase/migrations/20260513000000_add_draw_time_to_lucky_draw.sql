-- Add draw_time to participants and winners to scope them to specific draw times
ALTER TABLE public.lucky_draw_participants ADD COLUMN draw_time TIMESTAMPTZ;
ALTER TABLE public.lucky_draw_winners ADD COLUMN draw_time TIMESTAMPTZ;

-- Update existing records to have the current draw_time from lucky_draws
UPDATE public.lucky_draw_participants p
SET draw_time = d.draw_time
FROM public.lucky_draws d
WHERE p.draw_id = d.id;

UPDATE public.lucky_draw_winners w
SET draw_time = d.draw_time
FROM public.lucky_draws d
WHERE w.draw_id = d.id;

-- Drop the old unique constraint
ALTER TABLE public.lucky_draw_participants DROP CONSTRAINT IF EXISTS unique_draw_ip;

-- Add the new unique constraint combining draw_id, draw_time, and ip_address
ALTER TABLE public.lucky_draw_participants ADD CONSTRAINT unique_draw_time_ip UNIQUE (draw_id, draw_time, ip_address);
