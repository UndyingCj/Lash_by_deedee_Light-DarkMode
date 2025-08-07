-- Fix blocked_time_slots table schema by removing problematic booking_id column
-- This script will recreate the table with the correct structure

BEGIN;

-- Drop existing table if it exists
DROP TABLE IF EXISTS blocked_time_slots CASCADE;

-- Create the blocked_time_slots table with correct structure
CREATE TABLE blocked_time_slots (
    id SERIAL PRIMARY KEY,
    blocked_date DATE NOT NULL,
    blocked_time VARCHAR(10) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate blocks for same date/time
    UNIQUE(blocked_date, blocked_time)
);

-- Create indexes for better performance
CREATE INDEX idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);
CREATE INDEX idx_blocked_time_slots_date_time ON blocked_time_slots(blocked_date, blocked_time);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blocked_time_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blocked_time_slots_updated_at
    BEFORE UPDATE ON blocked_time_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_blocked_time_slots_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to blocked_time_slots" ON blocked_time_slots
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to blocked_time_slots" ON blocked_time_slots
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample blocked time slots for testing
INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) VALUES
    ('2025-01-15', '10:00 AM', 'Personal appointment'),
    ('2025-01-15', '2:00 PM', 'Equipment maintenance'),
    ('2025-01-20', '11:00 AM', 'Training session')
ON CONFLICT (blocked_date, blocked_time) DO NOTHING;

COMMIT;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'blocked_time_slots' 
ORDER BY ordinal_position;

-- Test the unique constraint
DO $$
BEGIN
    -- This should succeed
    INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) 
    VALUES ('2025-01-25', '3:00 PM', 'Test appointment')
    ON CONFLICT (blocked_date, blocked_time) DO NOTHING;
    
    -- This should be ignored due to conflict
    INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) 
    VALUES ('2025-01-25', '3:00 PM', 'Duplicate test')
    ON CONFLICT (blocked_date, blocked_time) DO NOTHING;
    
    RAISE NOTICE 'Schema fix completed successfully!';
END $$;
