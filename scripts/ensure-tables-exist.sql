-- Ensure all required tables exist with correct structure

-- Create blocked_dates table if it doesn't exist
CREATE TABLE IF NOT EXISTS blocked_dates (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_time_slots table if it doesn't exist
CREATE TABLE IF NOT EXISTS blocked_time_slots (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL,
    blocked_time TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocked_date, blocked_time)
);

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on all tables to ensure access
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Grant full access to service role
GRANT ALL ON blocked_dates TO service_role;
GRANT ALL ON blocked_time_slots TO service_role;
GRANT ALL ON bookings TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Insert a test blocked date
INSERT INTO blocked_dates (blocked_date, reason) 
VALUES ('2025-06-20', 'Test blocked date - ' || NOW()::text)
ON CONFLICT (blocked_date) 
DO UPDATE SET reason = 'Updated test - ' || NOW()::text;

-- Insert a test blocked time slot
INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) 
VALUES ('2025-06-21', '2:00 PM', 'Test blocked slot - ' || NOW()::text)
ON CONFLICT (blocked_date, blocked_time) 
DO UPDATE SET reason = 'Updated test slot - ' || NOW()::text;

-- Show final state
SELECT 'blocked_dates' as table_name, COUNT(*) as count FROM blocked_dates
UNION ALL
SELECT 'blocked_time_slots' as table_name, COUNT(*) as count FROM blocked_time_slots
UNION ALL
SELECT 'bookings' as table_name, COUNT(*) as count FROM bookings;
