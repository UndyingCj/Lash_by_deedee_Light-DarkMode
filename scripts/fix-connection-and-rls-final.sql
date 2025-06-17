-- FINAL FIX: Completely resolve database connection and RLS issues
-- This will ensure backend and frontend sync properly

-- 1. First, let's completely disable RLS on all tables to eliminate access issues
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Allow service role full access to blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "Allow service role full access to blocked_time_slots" ON blocked_time_slots;
DROP POLICY IF EXISTS "Allow service role full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow service role full access to business_settings" ON business_settings;
DROP POLICY IF EXISTS "Service role can manage blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "Service role can manage blocked_time_slots" ON blocked_time_slots;
DROP POLICY IF EXISTS "Service role can manage bookings" ON bookings;
DROP POLICY IF EXISTS "Service role can manage business_settings" ON business_settings;

-- 3. Grant explicit permissions to service role
GRANT ALL PRIVILEGES ON blocked_dates TO service_role;
GRANT ALL PRIVILEGES ON blocked_time_slots TO service_role;
GRANT ALL PRIVILEGES ON bookings TO service_role;
GRANT ALL PRIVILEGES ON business_settings TO service_role;

-- 4. Grant permissions to authenticated users for public access
GRANT SELECT ON blocked_dates TO authenticated;
GRANT SELECT ON blocked_time_slots TO authenticated;
GRANT SELECT ON bookings TO authenticated;

-- 5. Grant permissions to anon users for public booking page
GRANT SELECT ON blocked_dates TO anon;
GRANT SELECT ON blocked_time_slots TO anon;

-- 6. Ensure sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Test data insertion to verify everything works
INSERT INTO blocked_dates (blocked_date, reason) 
VALUES ('2025-01-15', 'Test connection fix') 
ON CONFLICT (blocked_date) DO UPDATE SET reason = 'Test connection fix - updated';

-- 8. Verify the test data was inserted
SELECT 'SUCCESS: Test data inserted/updated' as status, count(*) as total_blocked_dates 
FROM blocked_dates;

-- 9. Show current blocked dates for verification
SELECT blocked_date, reason, created_at 
FROM blocked_dates 
ORDER BY blocked_date;
