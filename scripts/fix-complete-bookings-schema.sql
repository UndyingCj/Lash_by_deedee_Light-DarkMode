-- Complete schema fix for bookings table
-- Add all missing columns that the application expects

DO $$ 
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'email') THEN
        ALTER TABLE bookings ADD COLUMN email TEXT;
    END IF;
    
    -- Add amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'amount') THEN
        ALTER TABLE bookings ADD COLUMN amount DECIMAL(10,2);
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'notes') THEN
        ALTER TABLE bookings ADD COLUMN notes TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'updated_at') THEN
        ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Update existing records to have default values
UPDATE bookings SET amount = 0 WHERE amount IS NULL;
UPDATE bookings SET email = '' WHERE email IS NULL;

-- Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure blocked_dates table has the right column names
DO $$ 
BEGIN
    -- Add blocked_date column if it doesn't exist (and date column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'blocked_dates' AND column_name = 'date')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'blocked_dates' AND column_name = 'blocked_date') THEN
        ALTER TABLE blocked_dates RENAME COLUMN date TO blocked_date;
    END IF;
END $$;

-- Ensure blocked_time_slots table has the right column names
DO $$ 
BEGIN
    -- Add blocked_date column if it doesn't exist (and date column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'blocked_time_slots' AND column_name = 'date')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'blocked_time_slots' AND column_name = 'blocked_date') THEN
        ALTER TABLE blocked_time_slots RENAME COLUMN date TO blocked_date;
    END IF;
    
    -- Add blocked_time column if it doesn't exist (and time column exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'blocked_time_slots' AND column_name = 'time')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'blocked_time_slots' AND column_name = 'blocked_time') THEN
        ALTER TABLE blocked_time_slots RENAME COLUMN time TO blocked_time;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);

-- Verify the complete schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
