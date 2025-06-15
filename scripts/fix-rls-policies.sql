-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Service role can do everything on bookings" ON bookings;
DROP POLICY IF EXISTS "Service role can do everything on blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "Service role can do everything on blocked_time_slots" ON blocked_time_slots;

-- Disable RLS temporarily to allow service role operations
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with proper policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for service role
CREATE POLICY "Allow service role full access to bookings" ON bookings
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to blocked_dates" ON blocked_dates
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to blocked_time_slots" ON blocked_time_slots
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also create policies for authenticated users (if needed for public booking)
CREATE POLICY "Allow public read access to bookings" ON bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant necessary permissions to service role
GRANT ALL ON bookings TO service_role;
GRANT ALL ON blocked_dates TO service_role;
GRANT ALL ON blocked_time_slots TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
