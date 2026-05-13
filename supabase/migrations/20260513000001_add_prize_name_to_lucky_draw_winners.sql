-- Store the prize tier awarded to each lucky draw winner.
-- The API inserts prize_name and the UI displays it in the winners list.
ALTER TABLE public.lucky_draw_winners
ADD COLUMN IF NOT EXISTS prize_name TEXT NOT NULL DEFAULT 'Prize';
