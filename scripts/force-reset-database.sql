-- 🔥 FORCE RESET - Handle existing and missing tables properly

-- Drop tables if they exist (using IF EXISTS to avoid errors)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop any existing policies (using IF EXISTS)
DO $$ 
BEGIN
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Service role can do everything on bookings" ON bookings;
    DROP POLICY IF EXISTS "Allow service role full access to bookings" ON bookings;
    DROP POLICY IF EXISTS "Allow public read access to bookings" ON bookings;
    DROP POLICY IF EXISTS "Allow all operations for service role" ON business_settings;
    DROP POLICY IF EXISTS "Allow all operations for service role on notifications" ON notifications;
EXCEPTION
    WHEN undefined_table THEN
        -- Ignore errors if tables don't exist
        NULL;
END $$;

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_bookings_date;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_blocked_dates_date;
DROP INDEX IF EXISTS idx_blocked_time_slots_date;
DROP INDEX IF EXISTS idx_business_settings_key;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_is_read;

-- Now create all tables fresh
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

CREATE TABLE blocked_dates (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blocked_time_slots (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time VARCHAR(10) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocked_date, blocked_time)
);

CREATE TABLE business_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);
CREATE INDEX idx_business_settings_key ON business_settings(setting_key);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Disable RLS for easier setup
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

-- Insert fresh business settings
INSERT INTO business_settings (setting_key, setting_value, setting_type) VALUES
('business_name', 'Lashed by Deedee', 'string'),
('business_email', 'info@lashedbydeedee.com', 'string'),
('business_phone', '+234 801 234 5678', 'string'),
('business_address', '123 Beauty Street, Lagos, Nigeria', 'string'),
('timezone', 'Africa/Lagos', 'string'),
('booking_buffer', '15', 'number'),
('max_advance_booking', '30', 'number');

-- Insert test blocked dates (including July 12th that was mentioned as problematic)
INSERT INTO blocked_dates (blocked_date, reason) VALUES
('2025-07-12', 'Fully booked - was showing as available but should be blocked'),
('2025-07-25', 'Personal day'),
('2025-08-01', 'Vacation');

-- Insert some test bookings
INSERT INTO bookings (client_name, phone, email, service, booking_date, booking_time, status, amount, notes) VALUES
('Sarah Johnson', '+234 801 234 5678', 'sarah@email.com', 'Ombré Brows', '2025-06-20', '10:00 AM', 'confirmed', 45000, 'Test booking'),
('Maria Garcia', '+234 802 345 6789', 'maria@email.com', 'Classic Lashes', '2025-06-21', '2:00 PM', 'pending', 35000, 'Test booking 2');

SELECT 'Database completely reset and recreated successfully!' as status;
