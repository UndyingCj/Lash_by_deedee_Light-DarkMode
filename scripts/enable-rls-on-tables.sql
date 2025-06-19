-- ENABLE RLS ON TABLES THAT HAVE POLICIES BUT RLS DISABLED
-- This fixes the specific security issues found in your report

-- Enable RLS on tables that have policies but RLS is disabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Verify RLS is now enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('bookings', 'business_settings', 'blocked_dates', 'blocked_time_slots', 'notifications')
ORDER BY tablename;

-- Show existing policies to confirm they're still there
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('bookings', 'business_settings', 'blocked_dates', 'blocked_time_slots', 'notifications')
ORDER BY tablename, policyname;

-- Test message
SELECT '🎉 RLS has been enabled on all tables with existing policies!' as result;
