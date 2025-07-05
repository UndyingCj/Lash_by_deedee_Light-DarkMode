-- Fix the bookings table schema completely
-- This script will ensure all required columns exist with correct names

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add phone column (this is the main issue)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'phone') THEN
        ALTER TABLE bookings ADD COLUMN phone TEXT NOT NULL DEFAULT '';
        RAISE NOTICE 'Added phone column';
    END IF;
    
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'email') THEN
        ALTER TABLE bookings ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column';
    END IF;
    
    -- Add amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'amount') THEN
        ALTER TABLE bookings ADD COLUMN amount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added amount column';
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'notes') THEN
        ALTER TABLE bookings ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'updated_at') THEN
        ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;

    -- Rename client_phone to phone if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'client_phone')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'phone') THEN
        ALTER TABLE bookings RENAME COLUMN client_phone TO phone;
        RAISE NOTICE 'Renamed client_phone to phone';
    END IF;

    -- Rename client_email to email if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'client_email')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'email') THEN
        ALTER TABLE bookings RENAME COLUMN client_email TO email;
        RAISE NOTICE 'Renamed client_email to email';
    END IF;
END $$;

-- Update existing records to have default values for new columns
UPDATE bookings SET phone = '' WHERE phone IS NULL;
UPDATE bookings SET email = '' WHERE email IS NULL;
UPDATE bookings SET amount = 0 WHERE amount IS NULL;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);

-- Show final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
