-- Add ip_address column to lucky_draw_participants
ALTER TABLE public.lucky_draw_participants ADD COLUMN ip_address VARCHAR(255);

-- Add unique constraint to prevent same IP from participating multiple times in the same draw
ALTER TABLE public.lucky_draw_participants ADD CONSTRAINT unique_draw_ip UNIQUE (draw_id, ip_address);
