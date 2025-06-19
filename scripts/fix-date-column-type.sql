-- Fix the date column type issue
-- Check current column types
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('blocked_dates', 'blocked_time_slots', 'bookings')
AND column_name LIKE '%date%'
ORDER BY table_name, column_name;

-- Fix blocked_dates table - change to DATE type
ALTER TABLE blocked_dates 
ALTER COLUMN blocked_date TYPE DATE;

-- Fix blocked_time_slots table - change to DATE type  
ALTER TABLE blocked_time_slots 
ALTER COLUMN blocked_date TYPE DATE;

-- Fix bookings table - change to DATE type
ALTER TABLE bookings 
ALTER COLUMN booking_date TYPE DATE;

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name IN ('blocked_dates', 'blocked_time_slots', 'bookings')
AND column_name LIKE '%date%'
ORDER BY table_name, column_name;

SELECT 'Date columns fixed to DATE type!' as status;
