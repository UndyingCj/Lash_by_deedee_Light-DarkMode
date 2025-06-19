-- Fix the database column types from timestamptz to date
-- This will solve the timezone shifting issue permanently

-- Check current column types
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('blocked_dates', 'blocked_time_slots', 'bookings') 
  AND column_name LIKE '%date%';

-- Show current data before conversion
SELECT 'blocked_dates' as table_name, blocked_date, pg_typeof(blocked_date) as current_type FROM blocked_dates LIMIT 3;
SELECT 'blocked_time_slots' as table_name, blocked_date, pg_typeof(blocked_date) as current_type FROM blocked_time_slots LIMIT 3;
SELECT 'bookings' as table_name, booking_date, pg_typeof(booking_date) as current_type FROM bookings LIMIT 3;

-- CRITICAL FIX: Change timestamptz columns to date type
-- This prevents timezone conversion issues

-- Fix blocked_dates table
ALTER TABLE blocked_dates 
ALTER COLUMN blocked_date TYPE date USING blocked_date::date;

-- Fix blocked_time_slots table  
ALTER TABLE blocked_time_slots 
ALTER COLUMN blocked_date TYPE date USING blocked_date::date;

-- Fix bookings table
ALTER TABLE bookings 
ALTER COLUMN booking_date TYPE date USING booking_date::date;

-- Verify the fix
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('blocked_dates', 'blocked_time_slots', 'bookings') 
  AND column_name LIKE '%date%';

-- Test with a sample insert to verify no timezone conversion
INSERT INTO blocked_dates (blocked_date, reason) 
VALUES ('2025-07-15', 'Test - should stay July 15th');

-- Verify it stayed as July 15th
SELECT 
  blocked_date,
  pg_typeof(blocked_date) as type_check,
  blocked_date = '2025-07-15'::date as exact_match
FROM blocked_dates 
WHERE reason = 'Test - should stay July 15th';

-- Clean up test
DELETE FROM blocked_dates WHERE reason = 'Test - should stay July 15th';

-- Show final state
SELECT COUNT(*) as total_blocked_dates FROM blocked_dates;
SELECT COUNT(*) as total_blocked_slots FROM blocked_time_slots;
SELECT COUNT(*) as total_bookings FROM bookings;

COMMIT;
