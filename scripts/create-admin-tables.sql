-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL UNIQUE,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blocked_time_slots table
CREATE TABLE IF NOT EXISTS blocked_time_slots (
  id SERIAL PRIMARY KEY,
  blocked_date DATE NOT NULL,
  blocked_time TIME NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocked_date, blocked_time)
);

-- Insert sample data
INSERT INTO bookings (client_name, phone, email, service, booking_date, booking_time, status, amount, notes) VALUES
('Sarah Johnson', '+234 801 234 5678', 'sarah@email.com', 'Ombré Brows', '2024-06-15', '10:00:00', 'confirmed', 45000.00, 'First time client'),
('Grace Okafor', '+234 802 345 6789', 'grace@email.com', 'Volume Lashes', '2024-06-15', '14:00:00', 'pending', 25000.00, 'Prefers natural look'),
('Jennifer Eze', '+234 803 456 7890', 'jennifer@email.com', 'Classic Lashes', '2024-06-16', '11:00:00', 'confirmed', 15000.00, ''),
('Blessing Okoro', '+234 804 567 8901', 'blessing@email.com', 'Microblading', '2024-06-17', '09:00:00', 'cancelled', 40000.00, 'Cancelled due to illness');

-- Insert sample blocked dates
INSERT INTO blocked_dates (blocked_date, reason) VALUES
('2024-06-20', 'Personal day'),
('2024-06-25', 'Holiday'),
('2024-06-30', 'Maintenance');
