-- ⚠️  WARNING: This will DELETE ALL DATA in your database!
-- This script completely resets your Supabase database

-- Drop all existing tables (this will delete all data)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop all existing policies
DROP POLICY IF EXISTS "Service role can do everything on bookings" ON bookings;
DROP POLICY IF EXISTS "Allow service role full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow all operations for service role" ON business_settings;
DROP POLICY IF EXISTS "Allow all operations for service role on notifications" ON notifications;

-- Drop any existing indexes
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_blocked_dates_date;
DROP INDEX IF EXISTS idx_blocked_time_slots_date;
DROP INDEX IF EXISTS idx_business_settings_key;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_is_read;

-- Clean slate message
SELECT 'Database completely reset - all tables and data deleted' as status;
