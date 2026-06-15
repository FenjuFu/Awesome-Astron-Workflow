-- Ensure Data API inserts keep working for SERIAL-backed columns after
-- Supabase requires explicit grants on newly created public tables.
--
-- lucky_draw_participants.number uses SERIAL, so inserts that rely on the
-- default nextval also need access to the backing sequence.

GRANT USAGE, SELECT ON SEQUENCE public.lucky_draw_participants_number_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.lucky_draw_participants_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.lucky_draw_participants_number_seq TO service_role;
