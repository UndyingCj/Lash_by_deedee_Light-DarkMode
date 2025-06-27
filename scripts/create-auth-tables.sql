-- Create admin_auth table for authentication
CREATE TABLE IF NOT EXISTS admin_auth (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  two_factor_code VARCHAR(255),
  two_factor_expires TIMESTAMP,
  reset_token VARCHAR(255),
  reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: newpassword123)
INSERT INTO admin_auth (email, password, name) 
VALUES (
  'lashedbydeedeee@gmail.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXig/pPKIDaa', 
  'Deedee'
) ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  updated_at = CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_auth_email ON admin_auth(email);
CREATE INDEX IF NOT EXISTS idx_admin_auth_reset_token ON admin_auth(reset_token);
CREATE INDEX IF NOT EXISTS idx_admin_auth_two_factor_expires ON admin_auth(two_factor_expires);
