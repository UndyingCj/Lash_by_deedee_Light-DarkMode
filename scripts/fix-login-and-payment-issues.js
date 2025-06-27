const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcryptjs")

// Use the provided environment variables
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fixLoginAndPaymentIssues() {
  try {
    console.log("🔧 Fixing login and payment issues...")
    console.log("🔗 Supabase URL:", SUPABASE_URL)
    console.log("🔑 Service Key:", SUPABASE_SERVICE_KEY.substring(0, 20) + "...")

    // 1. Test database connection
    console.log("\n1️⃣ Testing database connection...")
    const { data: testData, error: testError } = await supabase
      .from("admin_users")
      .select("count(*)", { count: "exact", head: true })

    if (testError) {
      console.error("❌ Database connection failed:", testError.message)
      return
    }
    console.log("✅ Database connection successful")

    // 2. Fix admin user login
    console.log("\n2️⃣ Setting up admin user...")

    const passwordHash = await bcrypt.hash("newpassword123", 12)

    const { data: user, error: userError } = await supabase
      .from("admin_users")
      .upsert(
        {
          email: "lashedbydeedeee@gmail.com",
          username: "admin",
          name: "Deedee Admin",
          password_hash: passwordHash,
          is_active: true,
          two_factor_enabled: false,
          failed_attempts: 0,
          locked_until: null,
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "email",
        },
      )
      .select()
      .single()

    if (userError) {
      console.error("❌ Error setting up admin user:", userError.message)
    } else {
      console.log("✅ Admin user ready")
      console.log("📧 Email: lashedbydeedeee@gmail.com")
      console.log("🔑 Password: newpassword123")
    }

    // 3. Clean up old sessions
    console.log("\n3️⃣ Cleaning up old sessions...")
    const { error: cleanupError } = await supabase
      .from("admin_sessions")
      .delete()
      .lt("expires_at", new Date().toISOString())

    if (cleanupError) {
      console.error("❌ Error cleaning sessions:", cleanupError.message)
    } else {
      console.log("✅ Old sessions cleaned")
    }

    // 4. Test Paystack configuration
    console.log("\n4️⃣ Testing Paystack configuration...")

    // Use fallback Paystack keys
    const publicKey = "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7"
    const secretKey = "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb"

    console.log("Public Key:", publicKey ? `✅ Set (${publicKey.substring(0, 10)}...)` : "❌ Missing")
    console.log("Secret Key:", secretKey ? `✅ Set (${secretKey.substring(0, 10)}...)` : "❌ Missing")

    // 5. Test Paystack API connection
    if (secretKey) {
      console.log("\n5️⃣ Testing Paystack API connection...")

      try {
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            amount: 100000, // ₦1,000 in kobo
            reference: `TEST_${Date.now()}`,
          }),
        })

        const data = await response.json()

        if (response.ok && data.status) {
          console.log("✅ Paystack API connection successful")
        } else {
          console.log("❌ Paystack API error:", data.message)
        }
      } catch (error) {
        console.log("❌ Paystack API connection failed:", error.message)
      }
    }

    // 6. Check required tables exist
    console.log("\n6️⃣ Checking database tables...")

    const tables = ["admin_users", "admin_sessions", "bookings", "blocked_dates", "blocked_time_slots"]

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("*", { count: "exact", head: true })
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: exists`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: error checking`)
      }
    }

    console.log("\n🎉 Setup complete!")
    console.log("\n📋 Login credentials:")
    console.log("🌐 Admin URL: https://lashedbydeedee.com/egusi")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")

    console.log("\n💡 If issues persist:")
    console.log("1. Check browser console for JavaScript errors")
    console.log("2. Verify all environment variables are set in deployment")
    console.log("3. Check Paystack dashboard for transaction logs")
    console.log("4. Ensure domain is verified with Resend for emails")
    console.log("5. Make sure all API routes are deployed")
  } catch (error) {
    console.error("❌ Setup error:", error.message)
  }
}

fixLoginAndPaymentIssues()
