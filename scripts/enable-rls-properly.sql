-- Enable RLS on all tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Allow service role full access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow service role full access to blocked_dates" ON public.blocked_dates;
DROP POLICY IF EXISTS "Allow service role full access to blocked_time_slots" ON public.blocked_time_slots;

-- Create comprehensive policies for service role (admin operations)
CREATE POLICY "Service role full access to bookings" ON public.bookings
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to blocked_dates" ON public.blocked_dates
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access to blocked_time_slots" ON public.blocked_time_slots
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for anonymous users (public booking page)
CREATE POLICY "Public can read bookings for availability" ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read blocked dates" ON public.blocked_dates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can read blocked time slots" ON public.blocked_time_slots
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policy for public booking creation
CREATE POLICY "Public can create bookings" ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON public.blocked_dates TO anon, authenticated;
GRANT SELECT ON public.blocked_time_slots TO anon, authenticated;
GRANT SELECT ON public.bookings TO anon, authenticated;
GRANT INSERT ON public.bookings TO anon, authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.bookings TO service_role;
GRANT ALL ON public.blocked_dates TO service_role;
GRANT ALL ON public.blocked_time_slots TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('bookings', 'blocked_dates', 'blocked_time_slots');
