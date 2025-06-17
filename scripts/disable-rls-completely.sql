-- Completely disable RLS on all tables to fix sync issues
-- This will allow the service role to access all data

-- Disable RLS on bookings table
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Disable RLS on blocked_dates table  
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;

-- Disable RLS on blocked_time_slots table
ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;

-- Disable RLS on settings table (if it exists)
ALTER TABLE IF EXISTS settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Allow service role full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow service role full access to blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "Allow service role full access to blocked_time_slots" ON blocked_time_slots;
DROP POLICY IF EXISTS "Allow service role full access to settings" ON settings;

-- Grant explicit permissions to service role
GRANT ALL ON bookings TO service_role;
GRANT ALL ON blocked_dates TO service_role;
GRANT ALL ON blocked_time_slots TO service_role;
GRANT ALL ON settings TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Verify tables exist and show their structure
SELECT 
    table_name,
    row_security_enabled
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Show current data counts
SELECT 'bookings' as table_name, count(*) as row_count FROM bookings
UNION ALL
SELECT 'blocked_dates' as table_name, count(*) as row_count FROM blocked_dates
UNION ALL
SELECT 'blocked_time_slots' as table_name, count(*) as row_count FROM blocked_time_slots;
