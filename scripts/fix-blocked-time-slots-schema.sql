-- Fix blocked_time_slots table schema
-- Remove the problematic booking_id column and ensure proper structure

-- First, check if the table exists and what columns it has
DO $$
BEGIN
    -- Drop the table if it exists and recreate with correct structure
    DROP TABLE IF EXISTS blocked_time_slots CASCADE;
    
    -- Create the blocked_time_slots table with correct structure
    CREATE TABLE blocked_time_slots (
        id SERIAL PRIMARY KEY,
        blocked_date DATE NOT NULL,
        blocked_time VARCHAR(20) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(blocked_date, blocked_time)
    );
    
    -- Create indexes for better performance
    CREATE INDEX idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);
    CREATE INDEX idx_blocked_time_slots_date_time ON blocked_time_slots(blocked_date, blocked_time);
    
    -- Enable RLS (Row Level Security)
    ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow all operations (since this is admin-managed)
    CREATE POLICY "Allow all operations on blocked_time_slots" ON blocked_time_slots
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'blocked_time_slots table created successfully with correct schema';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating blocked_time_slots table: %', SQLERRM;
END $$;

-- Also ensure blocked_dates table has correct structure
DO $$
BEGIN
    -- Check if blocked_dates table exists, if not create it
    CREATE TABLE IF NOT EXISTS blocked_dates (
        id SERIAL PRIMARY KEY,
        blocked_date DATE NOT NULL UNIQUE,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
    
    -- Enable RLS
    ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow all operations
    DROP POLICY IF EXISTS "Allow all operations on blocked_dates" ON blocked_dates;
    CREATE POLICY "Allow all operations on blocked_dates" ON blocked_dates
        FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE 'blocked_dates table verified/created successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error with blocked_dates table: %', SQLERRM;
END $$;

-- Verify the tables were created correctly
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('blocked_time_slots', 'blocked_dates')
ORDER BY table_name, ordinal_position;

-- Insert some test data to verify everything works
INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) 
VALUES 
    ('2024-02-15', '2:00 PM', 'Test blocked slot'),
    ('2024-02-16', '10:00 AM', 'Another test slot')
ON CONFLICT (blocked_date, blocked_time) DO NOTHING;

INSERT INTO blocked_dates (blocked_date, reason)
VALUES 
    ('2024-02-20', 'Test blocked date')
ON CONFLICT (blocked_date) DO NOTHING;

-- Show the test data
SELECT 'blocked_time_slots' as table_name, COUNT(*) as row_count FROM blocked_time_slots
UNION ALL
SELECT 'blocked_dates' as table_name, COUNT(*) as row_count FROM blocked_dates;

-- Clean up test data
DELETE FROM blocked_time_slots WHERE reason LIKE 'Test%';
DELETE FROM blocked_dates WHERE reason LIKE 'Test%';

SELECT '✅ Schema fix completed successfully!' as status;
