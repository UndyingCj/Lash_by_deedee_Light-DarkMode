-- 🌱 Seed fresh database with sample data

-- Insert business settings
INSERT INTO business_settings (setting_key, setting_value, setting_type) VALUES
('business_name', 'Lashed by Deedee', 'string'),
('business_email', 'info@lashedbydeedee.com', 'string'),
('business_phone', '+234 801 234 5678', 'string'),
('business_address', '123 Beauty Street, Lagos, Nigeria', 'string'),
('timezone', 'Africa/Lagos', 'string'),
('booking_buffer', '15', 'number'),
('max_advance_booking', '30', 'number');

-- Insert some sample bookings
INSERT INTO bookings (client_name, phone, email, service, booking_date, booking_time, status, amount, notes) VALUES
('Sarah Johnson', '+234 801 234 5678', 'sarah@email.com', 'Ombré Brows', '2025-06-20', '10:00 AM', 'confirmed', 45000, 'First time client'),
('Maria Garcia', '+234 802 345 6789', 'maria@email.com', 'Classic Lashes', '2025-06-21', '2:00 PM', 'pending', 35000, 'Referred by Sarah');

-- Insert some blocked dates for testing
INSERT INTO blocked_dates (blocked_date, reason) VALUES
('2025-07-12', 'Fully booked'),
('2025-07-25', 'Personal day'),
('2025-08-01', 'Vacation');

-- Insert some blocked time slots
INSERT INTO blocked_time_slots (blocked_date, blocked_time, reason) VALUES
('2025-07-15', '10:00 AM', 'Equipment maintenance'),
('2025-07-15', '11:00 AM', 'Equipment maintenance');

SELECT 'Sample data inserted successfully!' as status;
