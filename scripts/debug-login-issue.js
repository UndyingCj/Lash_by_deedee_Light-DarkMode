const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing environment variables:")
  console.error("SUPABASE_URL:", SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.error("SUPABASE_SERVICE_KEY:", SUPABASE_SERVICE_KEY ? "✅ Set" : "❌ Missing")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function debugLoginIssue() {
  try {
    console.log("🔍 Debugging login issue...")
    console.log("📊 Supabase URL:", SUPABASE_URL)

    // Test database connection
    console.log("\n1️⃣ Testing database connection...")
    const { data: testData, error: testError } = await supabase.from("admin_users").select("count(*)").single()

    if (testError) {
      console.error("❌ Database connection failed:", testError.message)
      return
    }

    console.log("✅ Database connection successful")

    // Check if admin_users table exists and has data
    console.log("\n2️⃣ Checking admin_users table...")
    const { data: users, error: usersError } = await supabase.from("admin_users").select("*")

    if (usersError) {
      console.error("❌ Failed to query admin_users:", usersError.message)
      console.log("🔧 Creating admin_users table...")

      // Create the table
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS admin_users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            password_hash TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            two_factor_enabled BOOLEAN DEFAULT false,
            two_factor_code VARCHAR(6),
            two_factor_expires TIMESTAMP WITH TIME ZONE,
            failed_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP WITH TIME ZONE,
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createError) {
        console.error("❌ Failed to create table:", createError.message)
        return
      }
    }

    console.log("✅ Found", users?.length || 0, "admin users")

    // Check for the specific admin user
    console.log("\n3️⃣ Checking for admin user...")
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    if (adminError || !adminUser) {
      console.log("❌ Admin user not found, creating...")

      // Hash the password
      const passwordHash = await bcrypt.hash("admin123", 12)

      // Create admin user
      const { data: newUser, error: createUserError } = await supabase
        .from("admin_users")
        .insert({
          email: "lashedbydeedeee@gmail.com",
          username: "admin",
          name: "Deedee Admin",
          password_hash: passwordHash,
          is_active: true,
          two_factor_enabled: false,
        })
        .select()
        .single()

      if (createUserError) {
        console.error("❌ Failed to create admin user:", createUserError.message)
        return
      }

      console.log("✅ Admin user created successfully")
    } else {
      console.log("✅ Admin user found:", adminUser.email)

      // Test password verification
      console.log("\n4️⃣ Testing password verification...")
      const isValidPassword = await bcrypt.compare("admin123", adminUser.password_hash)

      if (!isValidPassword) {
        console.log("❌ Password verification failed, updating password...")

        // Update password
        const newPasswordHash = await bcrypt.hash("admin123", 12)
        const { error: updateError } = await supabase
          .from("admin_users")
          .update({
            password_hash: newPasswordHash,
            failed_attempts: 0,
            locked_until: null,
          })
          .eq("id", adminUser.id)

        if (updateError) {
          console.error("❌ Failed to update password:", updateError.message)
          return
        }

        console.log("✅ Password updated successfully")
      } else {
        console.log("✅ Password verification successful")
      }
    }

    // Check admin_sessions table
    console.log("\n5️⃣ Checking admin_sessions table...")
    const { data: sessions, error: sessionsError } = await supabase.from("admin_sessions").select("count(*)")

    if (sessionsError) {
      console.log("❌ admin_sessions table not found, creating...")

      const { error: createSessionsError } = await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS admin_sessions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (createSessionsError) {
        console.error("❌ Failed to create sessions table:", createSessionsError.message)
      } else {
        console.log("✅ admin_sessions table created")
      }
    } else {
      console.log("✅ admin_sessions table exists")
    }

    console.log("\n🎉 Debug complete! Try logging in with:")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: admin123")
    console.log("🌐 URL: https://lashedbydeedee.com/egusi")
  } catch (error) {
    console.error("❌ Debug error:", error.message)
  }
}

debugLoginIssue()
