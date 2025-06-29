const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

async function setupDatabase() {
  console.log("🚀 Starting database setup...")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables")
    console.log("Required variables:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL")
    console.log("- SUPABASE_SERVICE_ROLE_KEY")
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Test database connection
    console.log("🔗 Testing database connection...")
    const { data, error } = await supabase.from("admin_users").select("count(*)", { count: "exact" })

    if (error) {
      console.error("❌ Database connection failed:", error.message)
      return
    }

    console.log("✅ Database connection successful")
    console.log(`📊 Admin users found: ${data.length}`)

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    if (existingUser) {
      console.log("👤 Admin user already exists")
    } else {
      // Create admin user
      console.log("👤 Creating admin user...")
      const hashedPassword = await bcrypt.hash("newpassword123", 12)

      const { data: newUser, error: userError } = await supabase
        .from("admin_users")
        .insert({
          email: "lashedbydeedeee@gmail.com",
          name: "Deedee Admin",
          username: "deedee_admin",
          password_hash: hashedPassword,
          is_active: true,
          two_factor_enabled: false,
          auth_provider: "email",
          failed_attempts: 0,
        })
        .select()
        .single()

      if (userError) {
        console.error("❌ Failed to create admin user:", userError)
        return
      }

      console.log("✅ Admin user created successfully")
    }

    // Clean up old sessions
    console.log("🧹 Cleaning up old sessions...")
    await supabase.from("admin_sessions").delete().lt("expires_at", new Date().toISOString())

    console.log("✅ Old sessions cleaned up")

    console.log("🎉 Database setup completed!")
    console.log("")
    console.log("📋 LOGIN CREDENTIALS:")
    console.log("🌐 URL: /egusi")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
  } catch (error) {
    console.error("❌ Setup failed:", error)
  }
}

setupDatabase()
