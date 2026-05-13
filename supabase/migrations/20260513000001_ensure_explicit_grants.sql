-- Ensure explicit grants for all tables to comply with Supabase Data API changes
-- https://supabase.com/docs/guides/database/api/api-grants

-- By granting all standard permissions, we maintain the pre-May-30 behavior
-- where access control is entirely deferred to Row Level Security (RLS) policies.

-- Grants for lucky_draws
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draws TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draws TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draws TO service_role;

-- Grants for lucky_draw_participants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_participants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_participants TO service_role;

-- Grants for lucky_draw_winners
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_winners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_winners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lucky_draw_winners TO service_role;

-- Grants for activities
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO service_role;

-- Grants for registrations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO service_role;

-- Grants for redemptions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redemptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redemptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.redemptions TO service_role;
