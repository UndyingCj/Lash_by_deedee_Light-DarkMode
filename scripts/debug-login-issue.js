import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables:")
  console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
  console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅" : "❌")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugLoginIssue() {
  try {
    console.log("🔍 Debugging login issue...")

    // Check if admin_users table exists
    const { data: tables, error: tablesError } = await supabase.from("admin_users").select("*").limit(1)

    if (tablesError) {
      console.error("❌ admin_users table not found:", tablesError.message)
      console.log("📝 Please run the create-auth-tables.sql script first")
      return
    }

    // Check current admin user
    const { data: users, error: usersError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")

    if (usersError) {
      console.error("❌ Error fetching user:", usersError.message)
      return
    }

    if (!users || users.length === 0) {
      console.log("👤 Creating default admin user...")

      // Create default admin user
      const passwordHash = await bcrypt.hash("admin123", 12)

      const { data: newUser, error: createError } = await supabase
        .from("admin_users")
        .insert({
          email: "lashedbydeedeee@gmail.com",
          name: "Deedee Admin",
          password_hash: passwordHash,
          two_factor_enabled: false,
        })
        .select()
        .single()

      if (createError) {
        console.error("❌ Error creating user:", createError.message)
        return
      }

      console.log("✅ Default admin user created successfully")
      console.log("📧 Email: lashedbydeedeee@gmail.com")
      console.log("🔑 Password: admin123")
    } else {
      const user = users[0]
      console.log("👤 Found existing user:", user.email)
      console.log("🔐 Two-factor enabled:", user.two_factor_enabled)
      console.log("🔒 Account locked:", user.locked_until ? "Yes" : "No")
      console.log("❌ Failed attempts:", user.failed_attempts || 0)

      // Reset password to known value
      console.log('🔄 Resetting password to "admin123"...')
      const passwordHash = await bcrypt.hash("admin123", 12)

      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: passwordHash,
          failed_attempts: 0,
          locked_until: null,
          reset_token: null,
          reset_token_expires: null,
          two_factor_code: null,
          two_factor_expires: null,
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("❌ Error updating user:", updateError.message)
        return
      }

      console.log("✅ Password reset successfully")
    }

    // Clean up old sessions
    console.log("🧹 Cleaning up expired sessions...")
    const { error: cleanupError } = await supabase
      .from("admin_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString())

    if (cleanupError) {
      console.error("❌ Error cleaning sessions:", cleanupError.message)
    } else {
      console.log("✅ Expired sessions cleaned up")
    }

    console.log("\n🎉 Login issue debug complete!")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: admin123")
    console.log("🌐 URL: https://lashedbydeedee.com/egusi")
  } catch (error) {
    console.error("❌ Debug error:", error)
  }
}

debugLoginIssue()
