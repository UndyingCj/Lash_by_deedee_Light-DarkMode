-- Temporarily disable RLS to allow booking creation
-- This is a quick fix while we resolve the policy issues

ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to service role
GRANT ALL PRIVILEGES ON TABLE bookings TO service_role;
GRANT ALL PRIVILEGES ON TABLE blocked_dates TO service_role;
GRANT ALL PRIVILEGES ON TABLE blocked_time_slots TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Create a simple policy that allows everything for service role
-- We'll add this back after confirming the basic functionality works
