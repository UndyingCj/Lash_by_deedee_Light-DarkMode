-- Drop existing tables to start fresh
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Create bookings table with correct schema
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service_name VARCHAR(500) NOT NULL,
  service VARCHAR(500) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(10) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  payment_reference VARCHAR(100) UNIQUE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_dates table
CREATE TABLE blocked_dates (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_time_slots table
CREATE TABLE blocked_time_slots (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time VARCHAR(10) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocked_date, blocked_time)
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_payment_reference ON bookings(payment_reference);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some test blocked dates and time slots
INSERT INTO blocked_dates (blocked_date, reason) VALUES
('2025-01-15', 'Fully booked'),
('2025-01-20', 'Personal day'),
('2025-01-25', 'Training day')
ON CONFLICT (blocked_date) DO NOTHING;

INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) VALUES
('2025-01-16', '9:00 AM', 'Already booked'),
('2025-01-16', '2:00 PM', 'Already booked'),
('2025-01-17', '11:00 AM', 'Already booked'),
('2025-01-18', '4:00 PM', 'Already booked')
ON CONFLICT (blocked_date, blocked_time) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can do everything on bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on blocked_dates" ON blocked_dates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on blocked_time_slots" ON blocked_time_slots
  FOR ALL USING (auth.role() = 'service_role');

-- Insert sample booking data for testing
INSERT INTO bookings (
  client_name, client_email, client_phone, phone, email, 
  service_name, service, booking_date, booking_time, 
  total_amount, amount, deposit_amount, payment_reference, 
  payment_status, status, notes
) VALUES
(
  'Sarah Johnson', 'sarah@example.com', '+234 801 234 5678', '+234 801 234 5678', 'sarah@example.com',
  'Ombré Brows', 'Ombré Brows', '2025-02-15', '10:00 AM',
  45000, 22500, 22500, 'TEST_SAMPLE_001',
  'completed', 'confirmed', 'Sample booking for testing'
),
(
  'Maria Garcia', 'maria@example.com', '+234 802 345 6789', '+234 802 345 6789', 'maria@example.com',
  'Classic Lashes', 'Classic Lashes', '2025-02-16', '2:00 PM',
  15000, 7500, 7500, 'TEST_SAMPLE_002',
  'pending', 'pending', 'Another sample booking'
)
ON CONFLICT (payment_reference) DO NOTHING;

-- Verify the schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
