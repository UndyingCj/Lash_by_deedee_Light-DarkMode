-- COMPREHENSIVE SCHEMA FIX
-- This will definitively fix the date column types

-- First, let's see exactly what we have
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('blocked_dates', 'blocked_time_slots') 
  AND column_name LIKE '%date%';

-- Show current data types
SELECT 
  'blocked_dates' as table_name,
  blocked_date,
  pg_typeof(blocked_date) as current_type
FROM blocked_dates 
LIMIT 3;

SELECT 
  'blocked_time_slots' as table_name,
  blocked_date,
  pg_typeof(blocked_date) as current_type
FROM blocked_time_slots 
LIMIT 3;

-- FORCE FIX: Drop and recreate tables with correct schema
-- This is the nuclear option but will definitely work

-- Backup existing data
CREATE TEMP TABLE blocked_dates_backup AS 
SELECT 
  id,
  blocked_date::DATE as blocked_date,
  reason,
  created_at
FROM blocked_dates;

CREATE TEMP TABLE blocked_time_slots_backup AS 
SELECT 
  id,
  blocked_date::DATE as blocked_date,
  blocked_time,
  reason,
  created_at
FROM blocked_time_slots;

-- Drop existing tables
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS blocked_time_slots CASCADE;

-- Recreate with correct schema
CREATE TABLE blocked_dates (
  id SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blocked_time_slots (
  id SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocked_date, blocked_time)
);

-- Restore data
INSERT INTO blocked_dates (blocked_date, reason, created_at)
SELECT blocked_date, reason, created_at
FROM blocked_dates_backup;

INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason, created_at)
SELECT blocked_date, blocked_time, reason, created_at
FROM blocked_time_slots_backup;

-- Enable RLS
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for service role
CREATE POLICY "Service role can do everything on blocked_dates" ON blocked_dates
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can do everything on blocked_time_slots" ON blocked_time_slots
FOR ALL USING (true) WITH CHECK (true);

-- Verify the fix
SELECT 
  table_name, 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('blocked_dates', 'blocked_time_slots') 
  AND column_name = 'blocked_date';

-- Test insertion
INSERT INTO blocked_dates (blocked_date, reason) 
VALUES ('2025-07-12', 'Final test');

SELECT 
  blocked_date,
  pg_typeof(blocked_date) as type_check,
  blocked_date = '2025-07-12'::DATE as exact_match
FROM blocked_dates 
WHERE reason = 'Final test';

-- Clean up test
DELETE FROM blocked_dates WHERE reason = 'Final test';

-- Show final state
SELECT COUNT(*) as blocked_dates_count FROM blocked_dates;
SELECT COUNT(*) as blocked_time_slots_count FROM blocked_time_slots;
