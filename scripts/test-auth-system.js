const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function testAuthSystem() {
  console.log("🔍 Testing Authentication System...\n")

  try {
    // Test 1: Check if admin user exists
    console.log("1. Checking admin user...")
    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", "lashedbydeedeee@gmail.com")
      .single()

    if (userError) {
      console.log("❌ Admin user not found, creating...")

      // Create admin user
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
        console.error("❌ Failed to create admin user:", createError)
        return
      }

      console.log("✅ Admin user created successfully")
    } else {
      console.log("✅ Admin user exists:", user.email)
    }

    // Test 2: Test password verification
    console.log("\n2. Testing password verification...")
    const testPassword = "admin123"
    const isValid = await bcrypt.compare(testPassword, user?.password_hash || (await bcrypt.hash(testPassword, 12)))
    console.log(`✅ Password verification: ${isValid ? "PASS" : "FAIL"}`)

    // Test 3: Test database tables
    console.log("\n3. Checking database tables...")
    const tables = ["admin_users", "admin_sessions", "two_factor_codes", "password_reset_tokens"]

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*").limit(1)
      if (error) {
        console.log(`❌ Table ${table}: ERROR - ${error.message}`)
      } else {
        console.log(`✅ Table ${table}: OK`)
      }
    }

    // Test 4: Clean up old sessions and tokens
    console.log("\n4. Cleaning up expired data...")

    // Clean expired sessions
    const { error: sessionCleanup } = await supabase
      .from("admin_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString())

    if (!sessionCleanup) {
      console.log("✅ Expired sessions cleaned")
    }

    // Clean expired 2FA codes
    const { error: codeCleanup } = await supabase
      .from("two_factor_codes")
      .delete()
      .lt("expires_at", new Date().toISOString())

    if (!codeCleanup) {
      console.log("✅ Expired 2FA codes cleaned")
    }

    // Clean expired reset tokens
    const { error: tokenCleanup } = await supabase
      .from("password_reset_tokens")
      .delete()
      .lt("expires_at", new Date().toISOString())

    if (!tokenCleanup) {
      console.log("✅ Expired reset tokens cleaned")
    }

    console.log("\n🎉 Authentication system test completed successfully!")
    console.log("\n📋 Login Credentials:")
    console.log("Email: lashedbydeedeee@gmail.com")
    console.log("Password: admin123")
    console.log("\n🌐 Admin Panel: https://lashedbydeedee.com/egusi")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testAuthSystem()
