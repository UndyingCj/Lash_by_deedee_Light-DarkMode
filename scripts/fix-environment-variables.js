import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

console.log("🔧 Fixing environment variable issues and setting up authentication...")

// Environment variables that should be set
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: "https://cqnfxvgdamevrvlniryr.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjcxMDEsImV4cCI6MjA2NDkwMzEwMX0._VGwfTZ5Rr4CU-j-K1aDOtEXAzVr1C_vZ66ED_3C8Kk",
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: "pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7",
  PAYSTACK_SECRET_KEY: "sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb",
  NEXT_PUBLIC_SITE_URL: "https://lashedbydeedee.com",
  RESEND_API_KEY: "re_123456789", // You'll need to get this from Resend
}

const supabase = createClient(requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL, requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY)

async function setupAuthentication() {
  console.log("🔐 Setting up admin authentication...")

  try {
    // Create admin_auth table if it doesn't exist
    const { error: tableError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_auth (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          two_factor_code VARCHAR(255),
          two_factor_expires TIMESTAMP,
          reset_token VARCHAR(255),
          reset_expires TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    if (tableError) {
      console.log("Table might already exist, continuing...")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("newpassword123", 12)

    // Insert/update admin user
    const { data, error } = await supabase
      .from("admin_auth")
      .upsert(
        [
          {
            email: "lashedbydeedeee@gmail.com",
            password: hashedPassword,
            name: "Deedee",
            updated_at: new Date().toISOString(),
          },
        ],
        {
          onConflict: "email",
        },
      )
      .select()

    if (error) {
      console.error("❌ Error setting up admin:", error)
      return false
    }

    console.log("✅ Admin authentication setup complete")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
    return true
  } catch (error) {
    console.error("❌ Authentication setup failed:", error)
    return false
  }
}

async function testPaystackConnection() {
  console.log("💳 Testing Paystack connection...")

  try {
    const response = await fetch("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${requiredEnvVars.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      console.log("✅ Paystack connection successful")
      return true
    } else {
      console.log("❌ Paystack connection failed:", response.status)
      return false
    }
  } catch (error) {
    console.error("❌ Paystack test failed:", error)
    return false
  }
}

async function main() {
  console.log("🚀 Running comprehensive system setup...")

  const results = {
    auth: await setupAuthentication(),
    paystack: await testPaystackConnection(),
  }

  console.log("\n📊 Setup Results:")
  console.log("Authentication:", results.auth ? "✅ Ready" : "❌ Failed")
  console.log("Paystack:", results.paystack ? "✅ Ready" : "❌ Failed")

  console.log("\n🔧 REQUIRED ENVIRONMENT VARIABLES:")
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`)
  })

  console.log("\n🎯 NEXT STEPS:")
  console.log("1. Set ALL environment variables in your deployment platform")
  console.log("2. Redeploy the application")
  console.log("3. Login at: https://lashedbydeedee.com/egusi")
  console.log("4. Email: lashedbydeedeee@gmail.com")
  console.log("5. Password: newpassword123")
}

main().catch(console.error)
