-- Fix the timezone issue by ensuring blocked_date is stored as DATE type, not TIMESTAMPTZ
-- This prevents timezone conversion issues

-- First, let's check the current column type
\d+ blocked_dates;

-- If blocked_date is TIMESTAMPTZ, we need to convert it to DATE
-- This will prevent JavaScript timezone conversion issues

-- Step 1: Create a backup of existing data
CREATE TABLE IF NOT EXISTS blocked_dates_backup AS 
SELECT * FROM blocked_dates;

-- Step 2: Drop and recreate the table with proper DATE column
DROP TABLE IF EXISTS blocked_dates CASCADE;

CREATE TABLE blocked_dates (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,  -- Use DATE type, not TIMESTAMPTZ
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Restore data, converting any timestamps to dates
INSERT INTO blocked_dates (blocked_date, reason, created_at)
SELECT 
  blocked_date::DATE,  -- Ensure it's stored as DATE
  reason,
  created_at
FROM blocked_dates_backup
ON CONFLICT (blocked_date) DO NOTHING;

-- Step 4: Do the same for blocked_time_slots
\d+ blocked_time_slots;

-- Backup blocked_time_slots
CREATE TABLE IF NOT EXISTS blocked_time_slots_backup AS 
SELECT * FROM blocked_time_slots;

-- Drop and recreate with proper DATE column
DROP TABLE IF EXISTS blocked_time_slots CASCADE;

CREATE TABLE blocked_time_slots (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,  -- Use DATE type, not TIMESTAMPTZ
  blocked_time VARCHAR(10) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocked_date, blocked_time)
);

-- Restore data
INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason, created_at)
SELECT 
  blocked_date::DATE,  -- Ensure it's stored as DATE
  blocked_time,
  reason,
  created_at
FROM blocked_time_slots_backup
ON CONFLICT (blocked_date, blocked_time) DO NOTHING;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);

-- Step 6: Recreate RLS policies
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can do everything on blocked_dates" ON blocked_dates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on blocked_time_slots" ON blocked_time_slots
  FOR ALL USING (auth.role() = 'service_role');

-- Step 7: Clean up backup tables (optional)
-- DROP TABLE blocked_dates_backup;
-- DROP TABLE blocked_time_slots_backup;

-- Verify the fix
SELECT 'blocked_dates' as table_name, blocked_date, pg_typeof(blocked_date) as data_type 
FROM blocked_dates 
LIMIT 5;

SELECT 'blocked_time_slots' as table_name, blocked_date, pg_typeof(blocked_date) as data_type 
FROM blocked_time_slots 
LIMIT 5;
