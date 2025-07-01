-- Drop existing table if it exists to recreate with correct structure
DROP TABLE IF EXISTS business_settings CASCADE;

-- Create business_settings table with correct column names
CREATE TABLE business_settings (
  id SERIAL PRIMARY KEY,
  businessName TEXT NOT NULL DEFAULT 'Lashed by Deedee',
  businessEmail TEXT NOT NULL DEFAULT 'lashedbydeedeee@gmail.com',
  businessPhone TEXT NOT NULL DEFAULT '+234 XXX XXX XXXX',
  businessAddress TEXT NOT NULL DEFAULT 'Rumigbo, Port Harcourt, Rivers State',
  businessHours JSONB NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": "12:00", "close": "16:00", "closed": true}
  }',
  notificationSettings JSONB NOT NULL DEFAULT '{
    "emailNotifications": true,
    "smsNotifications": false,
    "bookingConfirmations": true,
    "reminderNotifications": true,
    "cancelationNotifications": true,
    "reminderHours": 24
  }',
  securitySettings JSONB NOT NULL DEFAULT '{
    "twoFactorEnabled": false,
    "sessionTimeout": 24,
    "passwordExpiry": 90,
    "loginAttempts": 5
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now to avoid permission issues
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;

-- Insert default settings
INSERT INTO business_settings (businessName, businessEmail, businessPhone, businessAddress)
VALUES ('Lashed by Deedee', 'lashedbydeedeee@gmail.com', '+234 XXX XXX XXXX', 'Rumigbo, Port Harcourt, Rivers State');

-- Grant permissions
GRANT ALL ON business_settings TO postgres;
GRANT ALL ON business_settings TO anon;
GRANT ALL ON business_settings TO authenticated;
GRANT ALL ON business_settings TO service_role;
