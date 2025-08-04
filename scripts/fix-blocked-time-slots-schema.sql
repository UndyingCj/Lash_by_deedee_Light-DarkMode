-- Fix the blocked_time_slots table schema by removing the problematic booking_id column
-- and ensuring proper structure for the booking system

-- Drop existing table if it exists to start fresh
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;

-- Create blocked_dates table for fully blocked dates
CREATE TABLE blocked_dates (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_time_slots table for specific time slot blocking
CREATE TABLE blocked_time_slots (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL,
    blocked_time TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocked_date, blocked_time)
);

-- Create indexes for better performance
CREATE INDEX idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);
CREATE INDEX idx_blocked_time_slots_date_time ON blocked_time_slots(blocked_date, blocked_time);

-- Create triggers for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blocked_dates_updated_at 
    BEFORE UPDATE ON blocked_dates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocked_time_slots_updated_at 
    BEFORE UPDATE ON blocked_time_slots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on blocked_dates" ON blocked_dates
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on blocked_time_slots" ON blocked_time_slots
    FOR SELECT USING (true);

-- Create policies for service role full access
CREATE POLICY "Allow service role full access on blocked_dates" ON blocked_dates
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access on blocked_time_slots" ON blocked_time_slots
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample blocked dates for testing
INSERT INTO blocked_dates (blocked_date, reason) VALUES 
    ('2024-12-25', 'Christmas Day - Closed'),
    ('2024-01-01', 'New Year Day - Closed')
ON CONFLICT (blocked_date) DO NOTHING;

-- Insert some sample blocked time slots for testing
INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) VALUES 
    ('2024-12-24', '9:00 AM', 'Christmas Eve - Limited Hours'),
    ('2024-12-31', '4:00 PM', 'New Year Eve - Early Close')
ON CONFLICT (blocked_date, blocked_time) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON blocked_dates TO service_role;
GRANT ALL ON blocked_time_slots TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Verify the schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('blocked_dates', 'blocked_time_slots')
ORDER BY table_name, ordinal_position;

COMMIT;
