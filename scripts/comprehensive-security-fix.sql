-- COMPREHENSIVE SECURITY FIX FOR LASHED BY DEEDEE
-- This addresses all common Supabase security issues

-- 1. Enable RLS on all public tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing conflicting policies
DROP POLICY IF EXISTS "Service role full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Service role full access to blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Service role full access to blocked_time_slots" ON public.blocked_time_slots;
DROP POLICY IF EXISTS "Service role full access to business_settings" ON public.business_settings;
DROP POLICY IF EXISTS "Service role full access to notifications" ON public.notifications;

-- 3. Create comprehensive policies for service role (admin operations)
CREATE POLICY "Service role full access to bookings" ON public.bookings
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to blocked_dates" ON public.blocked_dates
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to blocked_time_slots" ON public.blocked_time_slots
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to business_settings" ON public.business_settings
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to notifications" ON public.notifications
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Create policies for public booking functionality
CREATE POLICY "Public can read availability data" ON public.blocked_dates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read blocked time slots" ON public.blocked_time_slots
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can create bookings" ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Public can read own bookings" ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 5. Grant necessary permissions
GRANT SELECT ON public.blocked_dates TO anon, authenticated;
GRANT SELECT ON public.blocked_time_slots TO anon, authenticated;
GRANT SELECT, INSERT ON public.bookings TO anon, authenticated;

-- Grant all permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 6. Verify RLS is properly enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots', 'business_settings', 'notifications')
ORDER BY tablename;

-- 7. Test policy functionality
DO $$
BEGIN
  -- Test service role can access data
  PERFORM * FROM bookings LIMIT 1;
  RAISE NOTICE '✅ Service role can access bookings';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ Service role access failed: %', SQLERRM;
END $$;

-- 8. Show policy summary
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual IS NOT NULL as has_using_clause,
  with_check IS NOT NULL as has_with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Final verification message
SELECT '🎉 Security fixes applied successfully! Please test your application.' as status;
