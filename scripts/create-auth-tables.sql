-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_code VARCHAR(6),
    two_factor_expires TIMESTAMP,
    reset_token TEXT,
    reset_token_expires TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    last_failed_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_reset_token ON admin_users(reset_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, name, password_hash, two_factor_enabled)
VALUES (
    'lashedbydeedeee@gmail.com',
    'Deedee Admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm',
    false
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Clean up expired sessions and tokens
DELETE FROM admin_sessions WHERE expires_at < NOW();
UPDATE admin_users SET 
    reset_token = NULL, 
    reset_token_expires = NULL,
    two_factor_code = NULL,
    two_factor_expires = NULL
WHERE reset_token_expires < NOW() OR two_factor_expires < NOW();
