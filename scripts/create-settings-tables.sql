-- Create settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Insert default settings
INSERT INTO business_settings (setting_key, setting_value, setting_type) VALUES
('business_name', 'Lashed by Deedee', 'string'),
('business_email', 'info@lashedbydeedee.com', 'string'),
('business_phone', '+234 801 234 5678', 'string'),
('business_address', '123 Beauty Street, Lagos, Nigeria', 'string'),
('business_description', 'Where Beauty Meets Precision. Professional lash and brow services in Lagos.', 'string'),
('booking_buffer', '15', 'number'),
('max_advance_booking', '30', 'number'),
('cancellation_policy', '24', 'number'),
('auto_confirm_bookings', 'false', 'boolean'),
('email_notifications', 'true', 'boolean'),
('sms_notifications', 'false', 'boolean'),
('booking_reminders', 'true', 'boolean'),
('marketing_emails', 'false', 'boolean'),
('two_factor_auth', 'false', 'boolean'),
('session_timeout', '60', 'number'),
('password_expiry', '90', 'number'),
('theme', 'light', 'string'),
('primary_color', 'pink', 'string'),
('timezone', 'Africa/Lagos', 'string')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_settings_key ON business_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Enable RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for service role)
CREATE POLICY "Allow all operations for service role" ON business_settings
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for service role on notifications" ON notifications
  FOR ALL USING (true);
