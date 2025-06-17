-- Fix RLS policies completely
-- This will enable RLS and create proper policies

-- First, enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can do everything on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow service role full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.business_settings;
DROP POLICY IF EXISTS "Service role full access to blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Service role full access to blocked_time_slots" ON public.blocked_time_slots;
DROP POLICY IF EXISTS "Service role full access to notifications" ON public.notifications;

-- Create comprehensive policies for service role (admin access)
CREATE POLICY "service_role_all_bookings" ON public.bookings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_blocked_dates" ON public.blocked_dates
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_blocked_time_slots" ON public.blocked_time_slots
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_business_settings" ON public.business_settings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Create public read policies for availability checking
CREATE POLICY "public_read_blocked_dates" ON public.blocked_dates
    FOR SELECT USING (true);

CREATE POLICY "public_read_blocked_time_slots" ON public.blocked_time_slots
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.blocked_dates TO service_role;
GRANT ALL ON public.blocked_time_slots TO service_role;
GRANT ALL ON public.business_settings TO service_role;
GRANT ALL ON public.notifications TO service_role;

GRANT SELECT ON public.blocked_dates TO anon;
GRANT SELECT ON public.blocked_time_slots TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify the setup
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled",
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as "Policy Count"
FROM pg_tables t 
WHERE schemaname = 'public' 
AND tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots', 'business_settings', 'notifications')
ORDER BY tablename;

-- Show all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
