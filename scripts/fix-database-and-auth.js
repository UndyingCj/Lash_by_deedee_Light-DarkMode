const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fixDatabaseAndAuth() {
  try {
    console.log("🔧 Starting database and auth fix...")

    // 1. Create all necessary tables
    console.log("\n1️⃣ Creating database tables...")

    const createTablesSQL = `
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS admin_sessions CASCADE;
      DROP TABLE IF EXISTS admin_users CASCADE;
      DROP TABLE IF EXISTS blocked_dates CASCADE;
      DROP TABLE IF EXISTS blocked_time_slots CASCADE;
      DROP TABLE IF EXISTS business_hours CASCADE;

      -- Create admin_users table
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
      CREATE TABLE IF NOT EXISTS bookings (
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
    `

    // Execute the SQL using raw query
    const { error: createError } = await supabase.rpc("exec_sql", {
      sql: createTablesSQL,
    })

    if (createError) {
      console.error("❌ Failed to create tables:", createError)
      // Try alternative method
      console.log("🔄 Trying alternative table creation...")

      // Create tables one by one
      const tables = [
        {
          name: "admin_users",
          sql: `CREATE TABLE IF NOT EXISTS admin_users (
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
          )`,
        },
        {
          name: "admin_sessions",
          sql: `CREATE TABLE IF NOT EXISTS admin_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            ip_address VARCHAR(45),
            user_agent TEXT,
            last_activity TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
          )`,
        },
      ]

      for (const table of tables) {
        try {
          await supabase.rpc("exec_sql", { sql: table.sql })
          console.log(`✅ Created ${table.name} table`)
        } catch (tableError) {
          console.log(`⚠️ ${table.name} table might already exist`)
        }
      }
    } else {
      console.log("✅ All tables created successfully")
    }

    // 2. Create admin user
    console.log("\n2️⃣ Creating admin user...")

    const adminEmail = "lashedbydeedeee@gmail.com"
    const adminPassword = "newpassword123"
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    // Delete existing user first
    await supabase.from("admin_users").delete().eq("email", adminEmail)

    const { data: newUser, error: insertError } = await supabase
      .from("admin_users")
      .insert({
        email: adminEmail,
        username: "admin",
        name: "Deedee Admin",
        password_hash: passwordHash,
        is_active: true,
        two_factor_enabled: false,
        failed_attempts: 0,
      })
      .select()

    if (insertError) {
      console.error("❌ Failed to create admin user:", insertError)
    } else {
      console.log("✅ Admin user created successfully")
    }

    // 3. Test database connection
    console.log("\n3️⃣ Testing database connection...")

    const { data: users, error: testError } = await supabase.from("admin_users").select("*")

    if (testError) {
      console.error("❌ Database test failed:", testError)
    } else {
      console.log("✅ Database connection successful")
      console.log("📊 Admin users found:", users?.length || 0)
    }

    console.log("\n🎉 Database and auth fix completed!")
    console.log("\n📋 LOGIN CREDENTIALS:")
    console.log("🌐 URL: /egusi")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
  } catch (error) {
    console.error("❌ Fix error:", error)
  }
}

fixDatabaseAndAuth()
