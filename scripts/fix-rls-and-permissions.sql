-- First, let's check what tables exist
SELECT table_name, row_security 
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE t.table_schema = 'public' 
AND t.table_name IN ('bookings', 'blocked_dates', 'blocked_time_slots')
ORDER BY t.table_name;

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Service role can do everything on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow service role full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can read bookings for availability" ON public.bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;

DROP POLICY IF EXISTS "Service role full access to blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Public can read blocked dates" ON public.blocked_dates;

DROP POLICY IF EXISTS "Service role full access to blocked_time_slots" ON public.blocked_time_slots;
DROP POLICY IF EXISTS "Public can read blocked time slots" ON public.blocked_time_slots;

-- Create comprehensive policies for service_role (full access)
CREATE POLICY "service_role_all_bookings" ON public.bookings
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_blocked_dates" ON public.blocked_dates
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_blocked_time_slots" ON public.blocked_time_slots
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for public access (anon/authenticated users)
CREATE POLICY "public_read_bookings" ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_insert_bookings" ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "public_read_blocked_dates" ON public.blocked_dates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_blocked_time_slots" ON public.blocked_time_slots
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant necessary table permissions
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.blocked_dates TO service_role;
GRANT ALL ON public.blocked_time_slots TO service_role;

GRANT SELECT, INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT ON public.blocked_dates TO anon, authenticated;
GRANT SELECT ON public.blocked_time_slots TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify the setup
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE schemaname = 'public' 
AND tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots')
ORDER BY tablename;

-- Show all policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots')
ORDER BY tablename, policyname;
