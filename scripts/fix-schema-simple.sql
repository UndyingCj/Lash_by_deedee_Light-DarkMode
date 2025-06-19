-- Simple fix for the timezone issue
-- Run this in your Supabase SQL Editor

-- First, let's see what we have
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('blocked_dates', 'blocked_time_slots') 
  AND column_name = 'blocked_date';

-- Check current data
SELECT blocked_date, pg_typeof(blocked_date) as current_type 
FROM blocked_dates 
LIMIT 3;

-- If the above shows 'timestamp with time zone', we need to fix it

-- Method 1: Simple column type change (if no data exists)
-- ALTER TABLE blocked_dates ALTER COLUMN blocked_date TYPE DATE;
-- ALTER TABLE blocked_time_slots ALTER COLUMN blocked_date TYPE DATE;

-- Method 2: Safe conversion (if data exists)
-- For blocked_dates
ALTER TABLE blocked_dates 
ADD COLUMN blocked_date_temp DATE;

UPDATE blocked_dates 
SET blocked_date_temp = blocked_date::DATE;

ALTER TABLE blocked_dates 
DROP COLUMN blocked_date;

ALTER TABLE blocked_dates 
RENAME COLUMN blocked_date_temp TO blocked_date;

-- For blocked_time_slots
ALTER TABLE blocked_time_slots 
ADD COLUMN blocked_date_temp DATE;

UPDATE blocked_time_slots 
SET blocked_date_temp = blocked_date::DATE;

ALTER TABLE blocked_time_slots 
DROP COLUMN blocked_date;

ALTER TABLE blocked_time_slots 
RENAME COLUMN blocked_date_temp TO blocked_date;

-- Verify the fix
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('blocked_dates', 'blocked_time_slots') 
  AND column_name = 'blocked_date';

-- Test with new data
INSERT INTO blocked_dates (blocked_date, reason) 
VALUES ('2025-07-12', 'Schema fix test');

SELECT blocked_date, pg_typeof(blocked_date) as new_type 
FROM blocked_dates 
WHERE reason = 'Schema fix test';

-- Clean up test
DELETE FROM blocked_dates WHERE reason = 'Schema fix test';
