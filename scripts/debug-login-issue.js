const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing environment variables:")
  console.error("SUPABASE_URL:", SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.error("SUPABASE_SERVICE_KEY:", SUPABASE_SERVICE_KEY ? "✅ Set" : "❌ Missing")
  console.log("\n💡 Please check your environment variables in .env.local or deployment settings")
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
      console.log("💡 Please check your Supabase credentials and ensure the admin_users table exists")
      return
    }

    console.log("✅ Database connection successful")

    // Check current admin user
    console.log("\n2️⃣ Checking current admin user...")
    const { data: users, error: usersError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")

    if (usersError) {
      console.error("❌ Error querying admin_users:", usersError.message)
      return
    }

    if (!users || users.length === 0) {
      console.log("❌ No admin user found. Creating new admin user...")

      // Create new admin user with current password
      const passwordHash = await bcrypt.hash("newpassword123", 12)

      const { data: newUser, error: createError } = await supabase
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

      if (createError) {
        console.error("❌ Failed to create admin user:", createError.message)
        return
      }

      console.log("✅ New admin user created successfully")
      console.log("📧 Email: lashedbydeedeee@gmail.com")
      console.log("🔑 Password: newpassword123")
    } else {
      const user = users[0]
      console.log("✅ Found admin user:", user.email)
      console.log("👤 User ID:", user.id)
      console.log("🔐 Two-factor enabled:", user.two_factor_enabled)
      console.log("🔒 Account locked:", user.locked_until ? "Yes" : "No")
      console.log("❌ Failed attempts:", user.failed_attempts || 0)

      // Check what password they're currently using
      console.log("\n3️⃣ Testing current password...")
      const testPasswords = ["admin123", "newpassword123", "password123", "Admin123!", "lashedbydeedee"]
      let currentPassword = null

      for (const testPassword of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPassword, user.password_hash)
          if (isValid) {
            currentPassword = testPassword
            console.log(`✅ Current password is: ${testPassword}`)
            break
          }
        } catch (error) {
          console.log(`❌ Error testing password "${testPassword}":`, error.message)
        }
      }

      if (!currentPassword) {
        console.log("❌ Could not determine current password. Setting new password...")

        // Set a new known password
        const newPasswordHash = await bcrypt.hash("newpassword123", 12)

        const { error: updateError } = await supabase
          .from("admin_users")
          .update({
            password_hash: newPasswordHash,
            failed_attempts: 0,
            locked_until: null,
            password_changed_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("❌ Failed to update password:", updateError.message)
          return
        }

        console.log("✅ Password updated successfully")
        console.log("🔑 New password: newpassword123")
        currentPassword = "newpassword123"
      }

      // Reset any account locks
      if (user.failed_attempts > 0 || user.locked_until) {
        console.log("\n4️⃣ Resetting account locks...")

        const { error: resetError } = await supabase
          .from("admin_users")
          .update({
            failed_attempts: 0,
            locked_until: null,
          })
          .eq("id", user.id)

        if (resetError) {
          console.error("❌ Failed to reset account locks:", resetError.message)
        } else {
          console.log("✅ Account locks reset")
        }
      }

      console.log("\n📋 Current login credentials:")
      console.log("📧 Email: lashedbydeedeee@gmail.com")
      console.log("🔑 Password:", currentPassword)
    }

    // Clean up old sessions
    console.log("\n5️⃣ Cleaning up old sessions...")
    const { error: cleanupError } = await supabase
      .from("admin_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString())

    if (cleanupError) {
      console.error("❌ Error cleaning sessions:", cleanupError.message)
    } else {
      console.log("✅ Old sessions cleaned up")
    }

    console.log("\n🎉 Debug complete!")
    console.log("🌐 Admin Panel: https://lashedbydeedee.com/egusi")
    console.log("\n💡 If login still fails, check the browser console for errors")
  } catch (error) {
    console.error("❌ Debug error:", error.message)
  }
}

debugLoginIssue()
