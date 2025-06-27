import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// Use the provided environment variables
const SUPABASE_URL = "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

console.log("🔧 Starting comprehensive fix for login and payment issues...")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fixLoginIssue() {
  console.log("\n🔐 Fixing login issue...")

  try {
    // Hash the password: newpassword123
    const hashedPassword = await bcrypt.hash("newpassword123", 12)

    // Create/update admin user
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
      console.error("❌ Error creating admin user:", error)
      return false
    }

    console.log("✅ Admin user created/updated successfully")
    console.log("📧 Email: lashedbydeedeee@gmail.com")
    console.log("🔑 Password: newpassword123")
    return true
  } catch (error) {
    console.error("❌ Error in fixLoginIssue:", error)
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
      console.log("🔑 Public Key:", publicKey)
      console.log("🔐 Secret Key: [CONFIGURED]")
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

async function checkDatabaseTables() {
  console.log("\n🗄️ Checking database tables...")

  try {
    // Check if admin_auth table exists
    const { data: authData, error: authError } = await supabase.from("admin_auth").select("count(*)").limit(1)

    if (authError) {
      console.log("❌ admin_auth table missing, creating...")
      // Create the table
      const { error: createError } = await supabase.rpc("exec_sql", {
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

      if (createError) {
        console.error("❌ Error creating admin_auth table:", createError)
        return false
      }
    }

    console.log("✅ Database tables verified")
    return true
  } catch (error) {
    console.error("❌ Error checking database tables:", error)
    return false
  }
}

async function main() {
  console.log("🚀 Running comprehensive system fix...")

  const results = {
    database: await checkDatabaseTables(),
    login: await fixLoginIssue(),
    paystack: await testPaystackConnection(),
  }

  console.log("\n📊 Fix Results:")
  console.log("Database:", results.database ? "✅ Fixed" : "❌ Failed")
  console.log("Login:", results.login ? "✅ Fixed" : "❌ Failed")
  console.log("Paystack:", results.paystack ? "✅ Working" : "❌ Failed")

  if (results.login) {
    console.log("\n🎉 LOGIN CREDENTIALS:")
    console.log("Email: lashedbydeedeee@gmail.com")
    console.log("Password: newpassword123")
    console.log("URL: https://lashedbydeedee.com/egusi")
  }

  if (results.paystack) {
    console.log("\n💳 PAYSTACK STATUS: Working")
    console.log("Payment processing should work now")
  }

  console.log("\n🔧 NEXT STEPS:")
  console.log("1. Make sure these environment variables are set in your deployment:")
  console.log("   NEXT_PUBLIC_SUPABASE_URL=" + SUPABASE_URL)
  console.log("   SUPABASE_SERVICE_ROLE_KEY=" + SUPABASE_SERVICE_KEY)
  console.log("   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_edddbd4959b95ee7d1eebe12b71b68f8ce5ff0a7")
  console.log("   PAYSTACK_SECRET_KEY=sk_live_f3437bf92100d5b73c6aa72e78d7db300d9029bb")
  console.log("2. Redeploy your application")
  console.log("3. Try logging in with the credentials above")
  console.log("4. Test a payment to verify Paystack integration")
}

main().catch(console.error)
