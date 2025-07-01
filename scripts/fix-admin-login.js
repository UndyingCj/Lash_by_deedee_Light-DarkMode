const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

async function fixAdminLogin() {
  console.log("🔧 Fixing admin login issue...")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log("🔍 Checking database connection...")

    // Test connection
    const { data: testData, error: testError } = await supabase.from("admin_users").select("count").single()

    if (testError) {
      console.error("❌ Database connection failed:", testError.message)
      return
    }

    console.log("✅ Database connection successful")

    // Check if admin user exists
    console.log("👤 Checking for existing admin user...")
    const { data: existingUser, error: checkError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    if (existingUser) {
      console.log("👤 Admin user already exists, updating password...")
      const hashedPassword = await bcrypt.hash("newpassword123", 12)

      const { error: updateError } = await supabase
        .from("admin_users")
        .update({
          password_hash: hashedPassword,
          is_active: true,
          failed_attempts: 0,
          locked_until: null,
        })
        .eq("email", "lashedbydeedeee@gmail.com")

      if (updateError) {
        console.error("❌ Failed to update admin user:", updateError.message)
        return
      }

      console.log("✅ Admin user password updated")
    } else {
      console.log("👤 Creating new admin user...")
      const hashedPassword = await bcrypt.hash("newpassword123", 12)

      const { error: createError } = await supabase.from("admin_users").insert({
        email: "lashedbydeedeee@gmail.com",
        name: "Deedee Admin",
        password_hash: hashedPassword,
        is_active: true,
        two_factor_enabled: false,
        failed_attempts: 0,
        created_at: new Date().toISOString(),
      })

      if (createError) {
        console.error("❌ Failed to create admin user:", createError.message)
        return
      }

      console.log("✅ Admin user created successfully")
    }

    // Clean up old sessions
    console.log("🧹 Cleaning up old sessions...")
    await supabase.from("admin_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    console.log("🎉 Admin login fixed!")
    console.log("")
    console.log("📋 LOGIN CREDENTIALS:")
    console.log("🌐 URL: /egusi")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
    console.log("")
    console.log("🔧 Next steps:")
    console.log("1. Clear your browser cache and cookies")
    console.log("2. Go to /egusi and login with these credentials")
    console.log("3. The admin panel should work properly now")
  } catch (error) {
    console.error("❌ Fix failed:", error.message)
  }
}

fixAdminLogin()
