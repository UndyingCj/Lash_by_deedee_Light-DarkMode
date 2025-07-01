const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

async function setupDatabase() {
  console.log("🚀 Starting database setup...")

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing environment variables:")
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
    console.error("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✅" : "❌")
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
      console.log("✅ Admin user already exists")
    } else {
      // Create admin user
      console.log("👤 Creating admin user...")
      const hashedPassword = await bcrypt.hash("newpassword123", 12)

      const { data: newUser, error: userError } = await supabase
        .from("admin_users")
        .insert({
          email: "lashedbydeedeee@gmail.com",
          name: "Deedee Admin",
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
    }

    // Test services table
    const { data: services, error: servicesError } = await supabase.from("services").select("*").limit(1)

    if (servicesError) {
      console.error("❌ Services table error:", servicesError.message)
    } else {
      console.log("✅ Services table accessible")
    }

    // Test bookings table
    const { data: bookings, error: bookingsError } = await supabase.from("bookings").select("*").limit(1)

    if (bookingsError) {
      console.error("❌ Bookings table error:", bookingsError.message)
    } else {
      console.log("✅ Bookings table accessible")
    }

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
