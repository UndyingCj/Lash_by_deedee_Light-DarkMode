-- Drop existing tables if they exist
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS payment_settings CASCADE;

-- Create business_settings table
CREATE TABLE business_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    businessName TEXT DEFAULT 'Lashed by Deedee',
    businessEmail TEXT DEFAULT 'lashedbydeedeee@gmail.com',
    businessPhone TEXT DEFAULT '+234 123 456 7890',
    businessAddress TEXT DEFAULT 'Lagos, Nigeria',
    businessHours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "18:00", "closed": false}, "tuesday": {"open": "09:00", "close": "18:00", "closed": false}, "wednesday": {"open": "09:00", "close": "18:00", "closed": false}, "thursday": {"open": "09:00", "close": "18:00", "closed": false}, "friday": {"open": "09:00", "close": "18:00", "closed": false}, "saturday": {"open": "10:00", "close": "16:00", "closed": false}, "sunday": {"open": "12:00", "close": "16:00", "closed": false}}',
    timezone TEXT DEFAULT 'Africa/Lagos',
    currency TEXT DEFAULT 'NGN',
    bookingBuffer INTEGER DEFAULT 30,
    maxAdvanceBooking INTEGER DEFAULT 60,
    cancellationPolicy TEXT DEFAULT '24 hours notice required for cancellations',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    emailNotifications BOOLEAN DEFAULT true,
    smsNotifications BOOLEAN DEFAULT false,
    bookingConfirmations BOOLEAN DEFAULT true,
    bookingReminders BOOLEAN DEFAULT true,
    reminderHours INTEGER DEFAULT 24,
    cancellationNotifications BOOLEAN DEFAULT true,
    paymentNotifications BOOLEAN DEFAULT true,
    adminNotifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_settings table
CREATE TABLE payment_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paystackPublicKey TEXT DEFAULT 'pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7',
    paystackSecretKey TEXT DEFAULT 'sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb',
    requirePayment BOOLEAN DEFAULT true,
    depositPercentage INTEGER DEFAULT 50,
    refundPolicy TEXT DEFAULT 'Refunds processed within 5-7 business days',
    acceptedPaymentMethods JSONB DEFAULT '["card", "bank_transfer", "ussd"]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO business_settings (businessName, businessEmail, businessPhone, businessAddress) 
VALUES ('Lashed by Deedee', 'lashedbydeedeee@gmail.com', '+234 123 456 7890', 'Lagos, Nigeria')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notification_settings DEFAULT VALUES
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_settings (paystackPublicKey, paystackSecretKey) 
VALUES ('pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7', 'sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for service role" ON business_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON notification_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations for service role" ON payment_settings FOR ALL USING (true);
