-- Debug script to check current availability data
-- Run this to see what's actually in the database

-- Check blocked_dates table
SELECT 
  id,
  blocked_date,
  reason,
  created_at,
  'blocked_dates' as table_name
FROM blocked_dates 
ORDER BY blocked_date;

-- Check blocked_time_slots table  
SELECT 
  id,
  blocked_date,
  blocked_time,
  reason,
  created_at,
  'blocked_time_slots' as table_name
FROM blocked_time_slots 
ORDER BY blocked_date, blocked_time;

-- Check for July 31st specifically
SELECT 
  'July 31st in blocked_dates' as check_type,
  COUNT(*) as count,
  ARRAY_AGG(blocked_date) as dates
FROM blocked_dates 
WHERE blocked_date = '2025-07-31';

-- Check total counts
SELECT 
  (SELECT COUNT(*) FROM blocked_dates) as total_blocked_dates,
  (SELECT COUNT(*) FROM blocked_time_slots) as total_blocked_slots;
