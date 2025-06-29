-- Drop existing tables if they exist
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS blocked_time_slots CASCADE;
DROP TABLE IF EXISTS business_hours CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Create admin_users table with all required columns
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  auth_provider VARCHAR(50) DEFAULT 'email',
  google_id VARCHAR(255),
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  last_failed_login TIMESTAMP,
  password_changed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE admin_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_activity TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20),
  service_type VARCHAR(100) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255),
  paystack_transaction_id VARCHAR(255),
  payment_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create blocked_dates table
CREATE TABLE blocked_dates (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create blocked_time_slots table
CREATE TABLE blocked_time_slots (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time_slot TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create business_hours table
CREATE TABLE business_hours (
  id SERIAL PRIMARY KEY,
  monday_start TIME DEFAULT '09:00',
  monday_end TIME DEFAULT '17:00',
  monday_enabled BOOLEAN DEFAULT true,
  tuesday_start TIME DEFAULT '09:00',
  tuesday_end TIME DEFAULT '17:00',
  tuesday_enabled BOOLEAN DEFAULT true,
  wednesday_start TIME DEFAULT '09:00',
  wednesday_end TIME DEFAULT '17:00',
  wednesday_enabled BOOLEAN DEFAULT true,
  thursday_start TIME DEFAULT '09:00',
  thursday_end TIME DEFAULT '17:00',
  thursday_enabled BOOLEAN DEFAULT true,
  friday_start TIME DEFAULT '09:00',
  friday_end TIME DEFAULT '17:00',
  friday_enabled BOOLEAN DEFAULT true,
  saturday_start TIME DEFAULT '10:00',
  saturday_end TIME DEFAULT '16:00',
  saturday_enabled BOOLEAN DEFAULT true,
  sunday_start TIME DEFAULT '10:00',
  sunday_end TIME DEFAULT '16:00',
  sunday_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default business hours
INSERT INTO business_hours DEFAULT VALUES;

-- Insert admin user with hashed password (password: newpassword123)
INSERT INTO admin_users (email, username, name, password_hash, is_active, failed_attempts) 
VALUES (
  'lashedbydeedeee@gmail.com',
  'admin',
  'Deedee Admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGTrSvF5u',
  true,
  0
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  failed_attempts = 0,
  locked_until = NULL,
  updated_at = NOW();
