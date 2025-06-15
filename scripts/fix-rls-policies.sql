-- Drop existing policies
DROP POLICY IF EXISTS "Service role can do everything on bookings" ON bookings;
DROP POLICY IF EXISTS "Service role can do everything on blocked_dates" ON blocked_dates;
DROP POLICY IF EXISTS "Service role can do everything on blocked_time_slots" ON blocked_time_slots;

-- Create new policies that work with service role key
CREATE POLICY "Allow service role full access to bookings" ON bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to blocked_dates" ON blocked_dates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access to blocked_time_slots" ON blocked_time_slots  
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Alternative: Disable RLS temporarily for admin operations
-- You can also disable RLS entirely for these tables since you're using service role key
-- ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY; 
-- ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;

-- Verify the policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots');
