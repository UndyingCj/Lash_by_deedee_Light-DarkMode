-- First, let's see what we have
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Drop existing tables completely to start fresh
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Create the bookings table with the EXACT columns our code expects
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  
  -- Customer information (both formats for compatibility)
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20),
  
  -- Legacy columns that might be expected
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Service information (both formats for compatibility)
  service_name TEXT NOT NULL,
  service TEXT,
  
  -- Booking details
  booking_date DATE NOT NULL,
  booking_time VARCHAR(20) NOT NULL,
  
  -- Financial information
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit_amount DECIMAL(10,2),
  
  -- Payment tracking
  payment_reference VARCHAR(100) UNIQUE,
  payment_status VARCHAR(20) DEFAULT 'pending',
  
  -- Booking status
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Additional information
  notes TEXT,
  special_notes TEXT,
  
  -- Timestamps
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
  blocked_time VARCHAR(20) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocked_date, blocked_time)
);

-- Create indexes
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_payment_reference ON bookings(payment_reference);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS temporarily to avoid issues
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;

-- Insert test blocked dates
INSERT INTO blocked_dates (blocked_date, reason) VALUES
('2025-01-15', 'Fully booked'),
('2025-01-20', 'Personal day'),
('2025-01-25', 'Training day')
ON CONFLICT (blocked_date) DO NOTHING;

-- Insert test blocked time slots
INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) VALUES
('2025-01-16', '9:00 AM', 'Already booked'),
('2025-01-16', '2:00 PM', 'Already booked'),
('2025-01-17', '11:00 AM', 'Already booked'),
('2025-01-18', '4:00 PM', 'Already booked')
ON CONFLICT (blocked_date, blocked_time) DO NOTHING;

-- Verify the schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
