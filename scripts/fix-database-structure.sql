-- Fix database structure issues
-- First, let's see what tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Drop problematic tables if they exist
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Create bookings table
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
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

-- Create business_settings table
CREATE TABLE business_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Disable RLS on all tables
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT ON blocked_dates TO anon;
GRANT SELECT ON blocked_time_slots TO anon;
GRANT SELECT ON bookings TO anon;

-- Insert test data
INSERT INTO blocked_dates (blocked_date, reason) VALUES 
('2025-06-20', 'Test blocked date for debugging');

SELECT 'Database structure fixed successfully!' as status;
