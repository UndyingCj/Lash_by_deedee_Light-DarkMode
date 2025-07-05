-- Fix column mapping to match code expectations
-- First, let's rename columns to match what the code expects

-- Add the 'phone' column if it doesn't exist (it should exist based on your schema output)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'phone') THEN
        ALTER TABLE bookings ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Update existing data to populate the phone column from client_phone
UPDATE bookings SET phone = client_phone WHERE phone IS NULL OR phone = '';

-- Add the 'email' column and populate it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'email') THEN
        ALTER TABLE bookings ADD COLUMN email VARCHAR;
    END IF;
END $$;

UPDATE bookings SET email = client_email WHERE email IS NULL OR email = '';

-- Add the 'service' column for service name
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'service') THEN
        ALTER TABLE bookings ADD COLUMN service VARCHAR;
    END IF;
END $$;

UPDATE bookings SET service = service_name WHERE service IS NULL OR service = '';

-- Add the 'amount' column and sync with total_amount
UPDATE bookings SET amount = total_amount WHERE amount IS NULL OR amount = 0;

-- Add the 'notes' column and sync with special_notes
UPDATE bookings SET notes = special_notes WHERE notes IS NULL OR notes = '';

-- Ensure all columns have proper defaults
ALTER TABLE bookings ALTER COLUMN phone SET DEFAULT '';
ALTER TABLE bookings ALTER COLUMN email SET DEFAULT '';
ALTER TABLE bookings ALTER COLUMN service SET DEFAULT '';
ALTER TABLE bookings ALTER COLUMN amount SET DEFAULT 0;
ALTER TABLE bookings ALTER COLUMN payment_status SET DEFAULT 'pending';
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'confirmed';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_reference ON bookings(payment_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Display final schema to verify
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
