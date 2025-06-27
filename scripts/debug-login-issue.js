import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// Use environment variables directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ Set" : "❌ Missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugLoginIssue() {
  console.log("🔍 Debugging Login Issue After Password Reset...\n")

  try {
    // Step 1: Check current admin user
    console.log("1. Checking current admin user...")
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    if (userError) {
      console.error("❌ User not found:", userError.message)
      console.log("Creating default admin user...")

      // Create default admin user
      const defaultPasswordHash = await bcrypt.hash("admin123", 12)
      const { data: newUser, error: createError } = await supabase
        .from("admin_users")
        .insert({
          email: "lashedbydeedeee@gmail.com",
          username: "admin",
          password_hash: defaultPasswordHash,
          is_active: true,
        })
        .select()
        .single()

      if (createError) {
        console.error("❌ Failed to create user:", createError.message)
        return
      }

      console.log("✅ Default admin user created")
      return
    }

    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      username: user.username,
      is_active: user.is_active,
      failed_login_attempts: user.failed_login_attempts,
      locked_until: user.locked_until,
      password_changed_at: user.password_changed_at,
    })

    // Step 2: Test password verification with common passwords
    console.log("\n2. Testing password verification...")
    const testPasswords = ["admin123", "newpassword", "password123", "Admin123!", "lashedbydeedee"]

    for (const testPassword of testPasswords) {
      try {
        const isValid = await bcrypt.compare(testPassword, user.password_hash)
        console.log(`Password "${testPassword}": ${isValid ? "✅ VALID" : "❌ INVALID"}`)
      } catch (error) {
        console.log(`Password "${testPassword}": ❌ ERROR - ${error.message}`)
      }
    }

    // Step 3: Check recent password reset tokens
    console.log("\n3. Checking recent password reset tokens...")
    const { data: tokens, error: tokensError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (tokensError) {
      console.log("❌ Error checking tokens:", tokensError.message)
    } else {
      console.log(`Found ${tokens.length} recent reset tokens:`)
      tokens.forEach((token, index) => {
        console.log(`  ${index + 1}. Created: ${token.created_at}, Used: ${token.used}, Expires: ${token.expires_at}`)
      })
    }

    // Step 4: Reset password to known value
    console.log("\n4. Resetting password to 'admin123'...")
    const newPasswordHash = await bcrypt.hash("admin123", 12)

    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        password_hash: newPasswordHash,
        password_changed_at: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("❌ Failed to reset password:", updateError.message)
      return
    }

    console.log("✅ Password reset to 'admin123'")

    // Step 5: Verify new password
    console.log("\n5. Verifying new password...")
    const isNewPasswordValid = await bcrypt.compare("admin123", newPasswordHash)
    console.log(`New password verification: ${isNewPasswordValid ? "✅ VALID" : "❌ INVALID"}`)

    // Step 6: Clean up old sessions and tokens
    console.log("\n6. Cleaning up old data...")

    // Delete old sessions
    const { error: sessionCleanup } = await supabase.from("admin_sessions").delete().eq("user_id", user.id)

    if (!sessionCleanup) {
      console.log("✅ Old sessions cleared")
    }

    // Mark old reset tokens as used
    const { error: tokenCleanup } = await supabase
      .from("password_reset_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("used", false)

    if (!tokenCleanup) {
      console.log("✅ Old reset tokens marked as used")
    }

    console.log("\n🎉 Login issue debugging completed!")
    console.log("\n📋 Try logging in with:")
    console.log("Email: lashedbydeedeee@gmail.com")
    console.log("Password: admin123")
    console.log("\n🌐 Admin Panel: https://lashedbydeedee.com/egusi")
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

debugLoginIssue()
