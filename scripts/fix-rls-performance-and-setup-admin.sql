-- Fix RLS performance issues and setup admin authentication
-- This resolves the performance warnings by using (select auth.<function>()) pattern
-- and creates a proper admin authentication system

-- First, enable RLS on all tables (if not already enabled)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create admin_users table for secure admin authentication
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with optimized versions
DROP POLICY IF EXISTS "service_role_all_bookings" ON public.bookings;
DROP POLICY IF EXISTS "service_role_all_blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "service_role_all_blocked_time_slots" ON public.blocked_time_slots;
DROP POLICY IF EXISTS "service_role_all_business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "service_role_all_notifications" ON public.notifications;
DROP POLICY IF EXISTS "service_role_all_admin_users" ON public.admin_users;

-- Create optimized RLS policies using (select auth.<function>()) pattern for better performance
CREATE POLICY "service_role_all_bookings" ON public.bookings
    FOR ALL USING ((select auth.role()) = 'service_role');

CREATE POLICY "service_role_all_blocked_dates" ON public.blocked_dates
    FOR ALL USING ((select auth.role()) = 'service_role');

CREATE POLICY "service_role_all_blocked_time_slots" ON public.blocked_time_slots
    FOR ALL USING ((select auth.role()) = 'service_role');

CREATE POLICY "service_role_all_business_settings" ON public.business_settings
    FOR ALL USING ((select auth.role()) = 'service_role');

CREATE POLICY "service_role_all_notifications" ON public.notifications
    FOR ALL USING ((select auth.role()) = 'service_role');

CREATE POLICY "service_role_all_admin_users" ON public.admin_users
    FOR ALL USING ((select auth.role()) = 'service_role');

-- Create public read policies for availability checking (unchanged as they don't have auth functions)
CREATE POLICY "public_read_blocked_dates" ON public.blocked_dates
    FOR SELECT USING (true);

CREATE POLICY "public_read_blocked_time_slots" ON public.blocked_time_slots
    FOR SELECT USING (true);

-- Create admin sessions table for session management
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_admin_sessions" ON public.admin_sessions
    FOR ALL USING ((select auth.role()) = 'service_role');

-- Grant necessary permissions
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.blocked_dates TO service_role;
GRANT ALL ON public.blocked_time_slots TO service_role;
GRANT ALL ON public.business_settings TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.admin_users TO service_role;
GRANT ALL ON public.admin_sessions TO service_role;

GRANT SELECT ON public.blocked_dates TO anon;
GRANT SELECT ON public.blocked_time_slots TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Create default admin user (password: Deedee@700)
-- Password hash for 'Deedee@700' using bcrypt
INSERT INTO public.admin_users (username, email, password_hash)
VALUES (
    'lashedbydeedeee',
    'lashedbydeedeee@gmail.com',
    '$2b$10$QH8/uhy9ua3n4lnr7TESluLzpIFDBya3bBoliHPcKIA0JaiyB.f8q'
) ON CONFLICT (email) DO NOTHING;

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_admin_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate admin session
CREATE OR REPLACE FUNCTION validate_admin_session(token TEXT)
RETURNS TABLE (
    admin_id UUID,
    username VARCHAR(50),
    email VARCHAR(255),
    is_valid BOOLEAN
) AS $$
BEGIN
    -- Clean expired sessions first
    PERFORM clean_expired_admin_sessions();

    -- Return admin info if session is valid
    RETURN QUERY
    SELECT
        au.id,
        au.username,
        au.email,
        (s.session_token IS NOT NULL AND s.expires_at > NOW()) as is_valid
    FROM public.admin_users au
    LEFT JOIN public.admin_sessions s ON au.id = s.admin_id AND s.session_token = token
    WHERE s.session_token IS NOT NULL OR s.session_token IS NULL;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, NULL::VARCHAR(50), NULL::VARCHAR(255), false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the setup
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled",
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as "Policy Count"
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots', 'business_settings', 'notifications', 'admin_users', 'admin_sessions')
ORDER BY tablename;

-- Show all policies to verify they use the optimized pattern
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots', 'business_settings', 'notifications', 'admin_users', 'admin_sessions')
ORDER BY tablename, policyname;