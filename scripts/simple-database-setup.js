const { createClient } = require("@supabase/supabase-js")

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function setupDatabase() {
  try {
    console.log("🔧 Setting up database...")

    // Test connection first
    const { data: testData, error: testError } = await supabase.from("admin_users").select("count", { count: "exact" })

    if (testError && testError.code === "PGRST204") {
      console.log("📋 Tables don't exist yet, they will be created manually")
    } else if (testError) {
      console.error("❌ Database connection failed:", testError)
      return
    } else {
      console.log("✅ Database connection successful")
    }

    // Try to create admin user directly (table should exist from SQL script)
    console.log("👤 Creating admin user...")

    const bcrypt = require("bcryptjs")
    const passwordHash = await bcrypt.hash("newpassword123", 12)

    // Delete existing user first
    await supabase.from("admin_users").delete().eq("email", "lashedbydeedeee@gmail.com")

    const { data: newUser, error: insertError } = await supabase
      .from("admin_users")
      .insert({
        email: "lashedbydeedeee@gmail.com",
        username: "admin",
        name: "Deedee Admin",
        password_hash: passwordHash,
        is_active: true,
        two_factor_enabled: false,
        failed_attempts: 0,
        auth_provider: "email",
      })
      .select()

    if (insertError) {
      console.error("❌ Failed to create admin user:", insertError)
      console.log("💡 Please run the SQL script manually in Supabase dashboard")
    } else {
      console.log("✅ Admin user created successfully")
    }

    // Test final connection
    const { data: users, error: finalError } = await supabase.from("admin_users").select("*")

    if (finalError) {
      console.error("❌ Final test failed:", finalError)
    } else {
      console.log("✅ Setup completed successfully")
      console.log("📊 Admin users found:", users?.length || 0)
      if (users && users.length > 0) {
        console.log("👤 Users:", users.map((u) => u.email).join(", "))
      }
    }

    console.log("\n🎉 Database setup completed!")
    console.log("\n📋 LOGIN CREDENTIALS:")
    console.log("🌐 URL: /egusi")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
  } catch (error) {
    console.error("❌ Setup error:", error)
  }
}

setupDatabase()
