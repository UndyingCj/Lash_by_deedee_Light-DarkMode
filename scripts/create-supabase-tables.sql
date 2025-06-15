-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
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
CREATE TABLE IF NOT EXISTS blocked_dates (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_time_slots table
CREATE TABLE IF NOT EXISTS blocked_time_slots (
  id BIGSERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time VARCHAR(10) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocked_date, blocked_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_time_slots_date ON blocked_time_slots(blocked_date);

-- Insert some sample data
INSERT INTO bookings (client_name, phone, email, service, booking_date, booking_time, status, amount, notes) VALUES
('Sarah Johnson', '+234 801 234 5678', 'sarah@email.com', 'Ombré Brows', '2024-06-20', '10:00 AM', 'confirmed', 45000, 'First time client'),
('Maria Garcia', '+234 802 345 6789', 'maria@email.com', 'Classic Lashes', '2024-06-21', '2:00 PM', 'pending', 35000, 'Referred by Sarah'),
('Jennifer Lee', '+234 803 456 7890', 'jennifer@email.com', 'Volume Lashes', '2024-06-22', '11:00 AM', 'confirmed', 50000, 'Regular client'),
('Amanda Brown', '+234 804 567 8901', 'amanda@email.com', 'Lash Refill', '2024-06-23', '3:00 PM', 'completed', 25000, 'Refill after 3 weeks')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (admin panel)
CREATE POLICY "Service role can do everything on bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on blocked_dates" ON blocked_dates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on blocked_time_slots" ON blocked_time_slots
  FOR ALL USING (auth.role() = 'service_role');
