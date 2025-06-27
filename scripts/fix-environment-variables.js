import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

console.log("🔧 Fixing environment variable issues and setting up authentication...")

// Use the correct environment variables
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function setupAuthentication() {
  try {
    console.log("🔐 Setting up admin authentication...")

    // Hash the password: newpassword123
    const hashedPassword = await bcrypt.hash("newpassword123", 12)

    // Create/update admin user
    const { data, error } = await supabase
      .from("admin_users")
      .upsert(
        [
          {
            email: "lashedbydeedeee@gmail.com",
            username: "admin",
            name: "Deedee Admin",
            password_hash: hashedPassword,
            is_active: true,
            two_factor_enabled: false,
            failed_attempts: 0,
            locked_until: null,
            password_changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "email",
        },
      )
      .select()

    if (error) {
      console.error("❌ Error creating admin user:", error)
      return false
    }

    console.log("✅ Admin user created/updated successfully")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
    return true
  } catch (error) {
    console.error("❌ Error in setupAuthentication:", error)
    return false
  }
}

async function testPaystackConnection() {
  console.log("\n💳 Testing Paystack connection...")

  const publicKey = "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7"
  const secretKey = "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb"

  try {
    const response = await fetch("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      console.log("✅ Paystack API connection successful")
      return true
    } else {
      console.log("❌ Paystack API connection failed:", response.status)
      return false
    }
  } catch (error) {
    console.error("❌ Error testing Paystack:", error)
    return false
  }
}

async function main() {
  console.log("🚀 Running comprehensive system setup...")

  const authResult = await setupAuthentication()
  const paystackResult = await testPaystackConnection()

  console.log("\n📊 Setup Results:")
  console.log("Authentication:", authResult ? "✅ Ready" : "❌ Failed")
  console.log("Paystack:", paystackResult ? "✅ Working" : "❌ Failed")

  console.log("\n🔧 REQUIRED ENVIRONMENT VARIABLES:")
  console.log("Add these to your deployment platform:")
  console.log("")
  console.log("NEXT_PUBLIC_SUPABASE_URL=" + SUPABASE_URL)
  console.log("SUPABASE_SERVICE_ROLE_KEY=" + SUPABASE_SERVICE_KEY)
  console.log(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjcxMDEsImV4cCI6MjA2NDkwMzEwMX0._VGwfTZ5Rr4CU-j-K1aDOtEXAzVr1C_vZ66ED_3C8Kk",
  )
  console.log("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7")
  console.log("PAYSTACK_SECRET_KEY=sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb")
  console.log("NEXT_PUBLIC_SITE_URL=https://lashedbydeedee.com")
  console.log("RESEND_API_KEY=your_resend_api_key")

  if (authResult) {
    console.log("\n🎉 LOGIN CREDENTIALS:")
    console.log("URL: https://lashedbydeedee.com/egusi")
    console.log("Email: lashedbydeedeee@gmail.com")
    console.log("Password: newpassword123")
  }

  console.log("\n📝 NEXT STEPS:")
  console.log("1. Set ALL environment variables in your deployment platform")
  console.log("2. Redeploy your application")
  console.log("3. Test login with the credentials above")
  console.log("4. Test payment functionality")
}

main().catch(console.error)
