-- Drop existing table if it exists
DROP TABLE IF EXISTS bookings CASCADE;

-- Create the bookings table with proper schema
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    
    -- Customer information
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    
    -- Service information
    service_name TEXT NOT NULL,
    
    -- Booking details
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    
    -- Financial information
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount DECIMAL(10,2), -- For compatibility
    
    -- Payment information
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    paystack_transaction_id VARCHAR(100),
    
    -- Booking status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Additional information
    notes TEXT,
    special_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_verified_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_payment_reference ON bookings(payment_reference);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some test data to verify the schema works
INSERT INTO bookings (
    client_name,
    client_email,
    client_phone,
    service_name,
    booking_date,
    booking_time,
    total_amount,
    deposit_amount,
    amount,
    payment_reference,
    payment_status,
    status,
    notes
) VALUES (
    'Test Customer',
    'test@example.com',
    '+2348012345678',
    'Classic Lashes',
    '2025-02-01',
    '14:00:00',
    50000.00,
    25000.00,
    25000.00,
    'TEST_REF_123456',
    'pending',
    'pending',
    'This is a test booking to verify the schema'
);

-- Verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Show the test record
SELECT * FROM bookings WHERE payment_reference = 'TEST_REF_123456';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON TABLE bookings TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE bookings_id_seq TO your_app_user;

COMMIT;
