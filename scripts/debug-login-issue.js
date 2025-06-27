const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

// Load environment variables from .env.local if running locally
require("dotenv").config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ Set" : "❌ Missing")
  console.log("\n💡 Make sure your .env.local file contains these variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugLoginIssue() {
  console.log("🔍 Debugging Login Issue...\n")

  try {
    // Step 1: Check database connection
    console.log("1. Testing database connection...")
    const { data: connectionTest, error: connectionError } = await supabase.from("admin_users").select("count").single()

    if (connectionError) {
      console.error("❌ Database connection failed:", connectionError.message)
      console.log("💡 Please check your Supabase credentials and run the SQL script")
      return
    }
    console.log("✅ Database connection successful")

    // Step 2: Check if admin user exists
    console.log("\n2. Checking admin user...")
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    if (userError) {
      console.log("❌ Admin user not found. Creating new admin user...")

      // Create admin user with known password
      const passwordHash = await bcrypt.hash("admin123", 12)

      const { data: newUser, error: createError } = await supabase
        .from("admin_users")
        .insert({
          username: "admin",
          email: "lashedbydeedeee@gmail.com",
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
      console.log("✅ Admin user found:", user.email)

      // Reset password to known value
      console.log("🔄 Resetting password to 'admin123'...")
      const passwordHash = await bcrypt.hash("admin123", 12)

      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          password_changed_at: new Date().toISOString(),
          failed_login_attempts: 0,
          locked_until: null,
          is_active: true,
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("❌ Failed to reset password:", updateError.message)
        return
      }

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

    if (!isPasswordValid) {
      console.log("🔧 Fixing password hash...")
      const correctHash = await bcrypt.hash("admin123", 12)
      await supabase.from("admin_users").update({ password_hash: correctHash }).eq("id", testUser.id)
      console.log("✅ Password hash fixed")
    }

    // Step 4: Clean up old sessions and tokens
    console.log("\n4. Cleaning up old data...")

    // Clear all sessions for this user
    await supabase.from("admin_sessions").delete().eq("user_id", testUser.id)
    console.log("✅ Old sessions cleared")

    // Mark all reset tokens as used
    await supabase.from("password_reset_tokens").update({ used: true }).eq("user_id", testUser.id).eq("used", false)
    console.log("✅ Old reset tokens cleared")

    // Clear old 2FA codes
    await supabase.from("two_factor_codes").update({ used: true }).eq("user_id", testUser.id).eq("used", false)
    console.log("✅ Old 2FA codes cleared")

    // Step 5: Test login API
    console.log("\n5. Testing login API...")
    try {
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
        console.log("Error details:", loginResult)
      } else {
        console.log("Login successful! Response:", loginResult)
      }
    } catch (apiError) {
      console.log("⚠️  Could not test API (server may not be running)")
    }

    console.log("\n🎉 Debug Complete!")
    console.log("\n📋 Login Credentials:")
    console.log("Email: lashedbydeedeee@gmail.com")
    console.log("Password: admin123")
    console.log("\n🌐 Admin Panel: https://lashedbydeedee.com/egusi")
    console.log("\n💡 If login still fails, check the browser console for errors")
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

debugLoginIssue()
