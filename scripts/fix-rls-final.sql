-- Fix RLS issues without referencing non-existent tables

-- Disable RLS on existing tables only
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocked_time_slots DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (only if tables exist)
DO $$ 
BEGIN
    -- Drop policies for bookings
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        DROP POLICY IF EXISTS "Allow service role full access to bookings" ON bookings;
        DROP POLICY IF EXISTS "Enable read access for all users" ON bookings;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bookings;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON bookings;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON bookings;
    END IF;

    -- Drop policies for blocked_dates
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_dates') THEN
        DROP POLICY IF EXISTS "Allow service role full access to blocked_dates" ON blocked_dates;
        DROP POLICY IF EXISTS "Enable read access for all users" ON blocked_dates;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blocked_dates;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blocked_dates;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON blocked_dates;
    END IF;

    -- Drop policies for blocked_time_slots
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_time_slots') THEN
        DROP POLICY IF EXISTS "Allow service role full access to blocked_time_slots" ON blocked_time_slots;
        DROP POLICY IF EXISTS "Enable read access for all users" ON blocked_time_slots;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON blocked_time_slots;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON blocked_time_slots;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON blocked_time_slots;
    END IF;
END $$;

-- Grant explicit permissions to service role (only on existing tables)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        GRANT ALL ON bookings TO service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_dates') THEN
        GRANT ALL ON blocked_dates TO service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_time_slots') THEN
        GRANT ALL ON blocked_time_slots TO service_role;
    END IF;
END $$;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Show what tables actually exist
SELECT 
    table_name,
    CASE 
        WHEN row_security_enabled THEN 'RLS ENABLED' 
        ELSE 'RLS DISABLED' 
    END as rls_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show current data (only for existing tables)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
        RAISE NOTICE 'Bookings table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_dates') THEN
        RAISE NOTICE 'Blocked_dates table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blocked_time_slots') THEN
        RAISE NOTICE 'Blocked_time_slots table exists';
    END IF;
END $$;
