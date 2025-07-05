-- Fix column mapping to match what the code expects
-- The database has client_phone, client_email, service_name, etc.
-- But our code expects phone, email, service, etc.

-- Create aliases/views or rename columns to match the expected schema
-- Let's rename the columns to match our code expectations

DO $$ 
BEGIN
    -- Rename client_phone to phone if phone doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'client_phone')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'phone') THEN
        ALTER TABLE bookings RENAME COLUMN client_phone TO phone;
        RAISE NOTICE 'Renamed client_phone to phone';
    END IF;

    -- Rename client_email to email if email doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'client_email')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'email') THEN
        ALTER TABLE bookings RENAME COLUMN client_email TO email;
        RAISE NOTICE 'Renamed client_email to email';
    END IF;

    -- Rename service_name to service if service doesn't exist
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'service_name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'service') THEN
        ALTER TABLE bookings RENAME COLUMN service_name TO service;
        RAISE NOTICE 'Renamed service_name to service';
    END IF;

    -- Rename total_amount to amount if needed (keep both for compatibility)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'total_amount')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'amount') THEN
        ALTER TABLE bookings RENAME COLUMN total_amount TO amount;
        RAISE NOTICE 'Renamed total_amount to amount';
    END IF;

    -- Rename special_notes to notes if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'special_notes')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'bookings' AND column_name = 'notes') THEN
        ALTER TABLE bookings RENAME COLUMN special_notes TO notes;
        RAISE NOTICE 'Renamed special_notes to notes';
    END IF;

    -- Make phone column not null with default empty string
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'bookings' AND column_name = 'phone' AND is_nullable = 'YES') THEN
        UPDATE bookings SET phone = '' WHERE phone IS NULL;
        ALTER TABLE bookings ALTER COLUMN phone SET NOT NULL;
        ALTER TABLE bookings ALTER COLUMN phone SET DEFAULT '';
        RAISE NOTICE 'Made phone column NOT NULL with default';
    END IF;

END $$;

-- Show the final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
