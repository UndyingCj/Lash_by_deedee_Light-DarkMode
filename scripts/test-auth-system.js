import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ Set" : "❌ Missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthSystem() {
  console.log("🧪 Testing Complete Authentication System...\n")

  try {
    // Step 1: Test database connection
    console.log("1. Testing database connection...")
    const { data, error } = await supabase.from("admin_users").select("count").single()

    if (error) {
      console.error("❌ Database connection failed:", error.message)
      console.log("📝 Please run the SQL script in your Supabase dashboard first")
      return
    }

    console.log("✅ Database connection successful")

    // Step 2: Check/Create admin user
    console.log("\n2. Checking admin user...")
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    if (userError) {
      console.log("👤 Creating default admin user...")
      const passwordHash = await bcrypt.hash("admin123", 12)

      const { data: newUser, error: createError } = await supabase
        .from("admin_users")
        .insert({
          email: "lashedbydeedeee@gmail.com",
          username: "admin",
          password_hash: passwordHash,
          is_active: true,
          two_factor_enabled: false,
        })
        .select()
        .single()

      if (createError) {
        console.error("❌ Failed to create admin user:", createError.message)
        return
      }

      console.log("✅ Admin user created successfully")
    } else {
      console.log("✅ Admin user exists")

      // Reset password to known value
      console.log("🔄 Resetting password to 'admin123'...")
      const passwordHash = await bcrypt.hash("admin123", 12)

      await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          password_changed_at: new Date().toISOString(),
          failed_login_attempts: 0,
          locked_until: null,
        })
        .eq("id", user.id)

      console.log("✅ Password reset to 'admin123'")
    }

    // Step 3: Test password verification
    console.log("\n3. Testing password verification...")
    const { data: testUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    const isPasswordValid = await bcrypt.compare("admin123", testUser.password_hash)
    console.log(`Password verification: ${isPasswordValid ? "✅ VALID" : "❌ INVALID"}`)

    // Step 4: Clean up old data
    console.log("\n4. Cleaning up old sessions and tokens...")

    // Clear old sessions
    await supabase.from("admin_sessions").delete().eq("user_id", testUser.id)
    console.log("✅ Old sessions cleared")

    // Clear old reset tokens
    await supabase.from("password_reset_tokens").update({ used: true }).eq("user_id", testUser.id).eq("used", false)
    console.log("✅ Old reset tokens cleared")

    // Step 5: Test API endpoints
    console.log("\n5. Testing API endpoints...")

    // Test login API
    console.log("🔐 Testing login API...")
    const loginResponse = await fetch("https://lashedbydeedee.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "lashedbydeedeee@gmail.com",
        password: "admin123",
      }),
    })

    const loginResult = await loginResponse.json()
    console.log(`Login API: ${loginResponse.ok ? "✅ SUCCESS" : "❌ FAILED"}`)
    if (!loginResponse.ok) {
      console.log("Error:", loginResult.error)
    }

    // Test forgot password API
    console.log("📧 Testing forgot password API...")
    const forgotResponse = await fetch("https://lashedbydeedee.com/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "lashedbydeedeee@gmail.com",
      }),
    })

    const forgotResult = await forgotResponse.json()
    console.log(`Forgot Password API: ${forgotResponse.ok ? "✅ SUCCESS" : "❌ FAILED"}`)
    if (!forgotResponse.ok) {
      console.log("Error:", forgotResult.error)
    }

    console.log("\n🎉 Authentication System Test Complete!")
    console.log("\n📋 Login Credentials:")
    console.log("Email: lashedbydeedeee@gmail.com")
    console.log("Password: admin123")
    console.log("\n🌐 Admin Panel: https://lashedbydeedee.com/egusi")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testAuthSystem()
