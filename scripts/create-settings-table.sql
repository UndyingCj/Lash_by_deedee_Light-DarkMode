-- Create business_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_settings (
  id SERIAL PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'Lashed by Deedee',
  business_email TEXT NOT NULL DEFAULT 'lashedbydeedeee@gmail.com',
  business_phone TEXT NOT NULL DEFAULT '+234 XXX XXX XXXX',
  business_address TEXT NOT NULL DEFAULT 'Rumigbo, Port Harcourt, Rivers State',
  business_hours JSONB NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": "12:00", "close": "16:00", "closed": true}
  }',
  notification_settings JSONB NOT NULL DEFAULT '{
    "emailNotifications": true,
    "smsNotifications": false,
    "bookingConfirmations": true,
    "reminderNotifications": true,
    "cancelationNotifications": true,
    "reminderHours": 24
  }',
  security_settings JSONB NOT NULL DEFAULT '{
    "twoFactorEnabled": false,
    "sessionTimeout": 24,
    "passwordExpiry": 90,
    "loginAttempts": 5
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read settings
CREATE POLICY business_settings_select_policy ON business_settings
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert settings if none exist
CREATE POLICY business_settings_insert_policy ON business_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update settings
CREATE POLICY business_settings_update_policy ON business_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default settings if none exist
INSERT INTO business_settings (business_name, business_email, business_phone, business_address)
SELECT 'Lashed by Deedee', 'lashedbydeedeee@gmail.com', '+234 XXX XXX XXXX', 'Rumigbo, Port Harcourt, Rivers State'
WHERE NOT EXISTS (SELECT 1 FROM business_settings);
