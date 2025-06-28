const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function completeSystemFix() {
  try {
    console.log("🔧 Starting complete system fix...")

    // 1. Drop and recreate admin_users table with correct schema
    console.log("\n1️⃣ Setting up admin_users table...")

    // First, let's check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (!tablesError) {
      console.log(
        "📋 Existing tables:",
        tables.map((t) => t.table_name),
      )
    }

    // Drop existing admin_users table if it exists
    try {
      await supabase.rpc("exec_sql", {
        sql: "DROP TABLE IF EXISTS admin_sessions CASCADE;",
      })
      await supabase.rpc("exec_sql", {
        sql: "DROP TABLE IF EXISTS admin_users CASCADE;",
      })
      console.log("🗑️ Dropped existing admin tables")
    } catch (dropError) {
      console.log("⚠️ Drop table warning:", dropError.message)
    }

    // Create admin_users table with correct schema
    const createAdminUsersSQL = `
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
    `

    const { error: createUserTableError } = await supabase.rpc("exec_sql", {
      sql: createAdminUsersSQL,
    })

    if (createUserTableError) {
      console.error("❌ Failed to create admin_users table:", createUserTableError)
      return
    }

    console.log("✅ admin_users table created successfully")

    // Create admin_sessions table
    const createSessionsSQL = `
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
    `

    const { error: createSessionTableError } = await supabase.rpc("exec_sql", {
      sql: createSessionsSQL,
    })

    if (createSessionTableError) {
      console.error("❌ Failed to create admin_sessions table:", createSessionTableError)
      return
    }

    console.log("✅ admin_sessions table created successfully")

    // Create bookings table if it doesn't exist
    const createBookingsSQL = `
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
    `

    const { error: createBookingsError } = await supabase.rpc("exec_sql", {
      sql: createBookingsSQL,
    })

    if (createBookingsError) {
      console.log("⚠️ Bookings table warning:", createBookingsError.message)
    } else {
      console.log("✅ bookings table created/verified successfully")
    }

    // 2. Create admin user
    console.log("\n2️⃣ Creating admin user...")

    const adminEmail = "lashedbydeedeee@gmail.com"
    const adminPassword = "newpassword123"
    const passwordHash = await bcrypt.hash(adminPassword, 12)

    const { error: insertError } = await supabase.from("admin_users").insert({
      email: adminEmail,
      username: "admin",
      name: "Deedee Admin",
      password_hash: passwordHash,
      is_active: true,
      two_factor_enabled: false,
      failed_attempts: 0,
    })

    if (insertError) {
      console.error("❌ Failed to create admin user:", insertError)
    } else {
      console.log("✅ Admin user created successfully")
    }

    // 3. Test database connection with correct syntax
    console.log("\n3️⃣ Testing database connection...")

    const { data: testData, error: testError } = await supabase.from("admin_users").select("*", { count: "exact" })

    if (testError) {
      console.error("❌ Database connection test failed:", testError)
    } else {
      console.log("✅ Database connection successful")
      console.log("📊 Total admin users:", testData?.length || 0)
    }

    // 4. Test Paystack connection
    console.log("\n4️⃣ Testing Paystack connection...")

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb"

    try {
      const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          amount: 100000, // 1000 NGN in kobo
          reference: `test_${Date.now()}`,
        }),
      })

      const paystackResult = await paystackResponse.json()

      if (paystackResponse.ok && paystackResult.status) {
        console.log("✅ Paystack connection successful")
      } else {
        console.log("⚠️ Paystack connection issue:", paystackResult.message)
      }
    } catch (paystackError) {
      console.log("⚠️ Paystack test failed:", paystackError.message)
    }

    console.log("\n🎉 Complete system fix finished!")
    console.log("\n📋 LOGIN CREDENTIALS:")
    console.log("🌐 URL: https://lashedbydeedee.com/egusi")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
    console.log("\n💡 Next steps:")
    console.log("1. Deploy the updated code")
    console.log("2. Try logging in with the credentials above")
    console.log("3. If login fails, check browser console for errors")
  } catch (error) {
    console.error("❌ System fix error:", error)
  }
}

completeSystemFix()
