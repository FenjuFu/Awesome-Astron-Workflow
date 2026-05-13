-- Consolidates the two conflicting 20260513000001_* migrations that shared
-- the same timestamp prefix, which may have prevented them from being applied.

-- 1. Ensure prize_name column exists on lucky_draw_winners
ALTER TABLE public.lucky_draw_winners
ADD COLUMN IF NOT EXISTS prize_name TEXT NOT NULL DEFAULT 'Prize';

-- 2. Ensure explicit grants for all lucky-draw tables (required after
--    Supabase Data API changes: https://supabase.com/docs/guides/database/api/api-grants)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draws TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_participants TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_winners TO anon, authenticated, service_role;

-- 3. Ensure grants for other tables that may also be missing
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redemptions TO anon, authenticated, service_role;
