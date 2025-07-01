const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

async function resetAdminPanel() {
  console.log("🔄 Resetting admin panel...")

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log("🔗 Testing database connection...")

    // Test connection with simple query
    const { data, error } = await supabase.from("admin_users").select("id").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error.message)
      console.log("💡 Please run the SQL script first in Supabase dashboard")
      return
    }

    console.log("✅ Database connection successful")

    // Create admin user
    console.log("👤 Creating fresh admin user...")
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Delete existing admin user first
    await supabase.from("admin_users").delete().eq("email", "admin@lashedbydeedee.com")

    const { data: newUser, error: userError } = await supabase
      .from("admin_users")
      .insert({
        email: "admin@lashedbydeedee.com",
        name: "Admin User",
        password_hash: hashedPassword,
        is_active: true,
        two_factor_enabled: false,
        failed_attempts: 0,
      })
      .select()
      .single()

    if (userError) {
      console.error("❌ Failed to create admin user:", userError)
      return
    }

    console.log("✅ Admin user created successfully")

    // Clean up old sessions
    console.log("🧹 Cleaning up old sessions...")
    await supabase.from("admin_sessions").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    console.log("🎉 Admin panel reset completed!")
    console.log("")
    console.log("📋 NEW LOGIN CREDENTIALS:")
    console.log("🌐 URL: /egusi")
    console.log("📧 Email: admin@lashedbydeedee.com")
    console.log("🔑 Password: admin123")
    console.log("")
    console.log("🔧 Next steps:")
    console.log("1. Clear your browser cache and cookies")
    console.log("2. Go to /egusi and login with the new credentials")
    console.log("3. The admin panel should work properly now")
  } catch (error) {
    console.error("❌ Reset failed:", error)
  }
}

resetAdminPanel()
