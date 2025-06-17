-- Simple RLS fix without problematic column references

-- Disable RLS on all tables
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocked_time_slots DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow service role full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bookings;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON bookings;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON bookings;
DROP POLICY IF EXISTS "Service role can do everything on bookings" ON bookings;

DROP POLICY IF EXISTS "Allow service role full access to blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "Enable read access for all users" ON blocked_dates;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blocked_dates;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blocked_dates;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON blocked_dates;
DROP POLICY IF EXISTS "Service role can do everything on blocked_dates" ON blocked_dates;

DROP POLICY IF EXISTS "Allow service role full access to blocked_time_slots" ON blocked_time_slots;
DROP POLICY IF EXISTS "Enable read access for all users" ON blocked_time_slots;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blocked_time_slots;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blocked_time_slots;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON blocked_time_slots;
DROP POLICY IF EXISTS "Service role can do everything on blocked_time_slots" ON blocked_time_slots;

-- Grant full permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Show existing tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
