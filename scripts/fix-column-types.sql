-- Fix the timezone issue by changing column types from timestamptz to date

-- First, let's see what we're working with
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blocked_dates' 
  AND table_schema = 'public';

-- Check current data
SELECT blocked_date, pg_typeof(blocked_date) as data_type 
FROM blocked_dates 
LIMIT 5;

-- Fix blocked_dates table
-- Step 1: Add a new date column
ALTER TABLE blocked_dates 
ADD COLUMN blocked_date_new DATE;

-- Step 2: Copy data, converting timestamps to dates
UPDATE blocked_dates 
SET blocked_date_new = blocked_date::date;

-- Step 3: Drop the old column
ALTER TABLE blocked_dates 
DROP COLUMN blocked_date;

-- Step 4: Rename the new column
ALTER TABLE blocked_dates 
RENAME COLUMN blocked_date_new TO blocked_date;

-- Fix blocked_time_slots table
-- Step 1: Add a new date column
ALTER TABLE blocked_time_slots 
ADD COLUMN blocked_date_new DATE;

-- Step 2: Copy data, converting timestamps to dates
UPDATE blocked_time_slots 
SET blocked_date_new = blocked_date::date;

-- Step 3: Drop the old column
ALTER TABLE blocked_time_slots 
DROP COLUMN blocked_date;

-- Step 4: Rename the new column
ALTER TABLE blocked_time_slots 
RENAME COLUMN blocked_date_new TO blocked_date;

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('blocked_dates', 'blocked_time_slots')
  AND table_schema = 'public'
  AND column_name = 'blocked_date';

-- Test with sample data
SELECT blocked_date, pg_typeof(blocked_date) as data_type 
FROM blocked_dates 
LIMIT 3;

SELECT blocked_date, pg_typeof(blocked_date) as data_type 
FROM blocked_time_slots 
LIMIT 3;
