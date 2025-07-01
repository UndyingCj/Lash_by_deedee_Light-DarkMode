-- Complete reset of admin panel tables
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Create admin_users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    last_failed_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    deposit_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    service_id UUID REFERENCES services(id),
    service_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_reference VARCHAR(255),
    special_notes TEXT,
    status VARCHAR(50) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_dates table
CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blocked_time_slots table
CREATE TABLE blocked_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    time_slot TIME NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, time_slot)
);

-- Create settings table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services
INSERT INTO services (name, description, price, duration, deposit_amount) VALUES
('Classic Lashes', 'Natural-looking individual lash extensions', 150.00, 120, 50.00),
('Volume Lashes', 'Fuller, more dramatic lash extensions', 200.00, 150, 75.00),
('Lash Refill', 'Maintenance for existing lash extensions', 80.00, 90, 30.00),
('Brow Lamination & Tint', 'Eyebrow shaping and coloring service', 100.00, 60, 40.00),
('Ombre Brows', 'Semi-permanent eyebrow tattooing', 300.00, 180, 100.00);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('business_hours_start', '09:00', 'Business opening time'),
('business_hours_end', '18:00', 'Business closing time'),
('booking_advance_days', '30', 'How many days in advance bookings can be made'),
('default_service_duration', '120', 'Default service duration in minutes'),
('payment_required', 'true', 'Whether payment is required for bookings');

-- Create indexes
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_blocked_dates_date ON blocked_dates(date);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can access admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access admin_sessions" ON admin_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access blocked_dates" ON blocked_dates FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access blocked_time_slots" ON blocked_time_slots FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access services" ON services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access settings" ON settings FOR ALL USING (auth.role() = 'service_role');
