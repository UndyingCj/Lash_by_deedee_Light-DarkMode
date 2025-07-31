import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

console.log("🔍 DIAGNOSING DATABASE SCHEMA")
console.log("=".repeat(50))

// Check environment variables
const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
const missingVars = requiredVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error("❌ Missing environment variables:", missingVars)
  console.log("\n💡 Available environment variables:")
  Object.keys(process.env)
    .filter((key) => key.includes("SUPABASE"))
    .forEach((key) => console.log(`   ${key}: ${process.env[key] ? "✅ Set" : "❌ Not set"}`))

  console.log("\n🔧 Make sure you have these in your .env file:")
  console.log("   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url")
  console.log("   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key")
  process.exit(1)
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function diagnoseSchema() {
  try {
    console.log("🔍 Checking if bookings table exists...")

    // Try to get table structure
    const { data: columns, error: columnsError } = await supabase.from("bookings").select("*").limit(1)

    if (columnsError) {
      console.error("❌ Error accessing bookings table:", columnsError.message)
      console.log("🔧 Table might not exist or have permission issues")

      if (columnsError.code === "42P01") {
        console.log("📋 Table does not exist. Run the schema creation script:")
        console.log("   scripts/fix-bookings-table-final.sql")
      }

      return false
    }

    if (!columns || columns.length === 0) {
      console.log("⚠️  Bookings table exists but has no data")
      console.log("🔍 Attempting to get table structure...")

      // Try to insert a test record to see what columns are expected
      const testData = {
        client_name: "Test User",
        client_email: "test@example.com",
        service_name: "Test Service",
        booking_date: "2024-02-01",
        booking_time: "2:00 PM",
        amount: 100,
        payment_reference: "TEST_" + Date.now(),
        payment_status: "pending",
        status: "pending",
      }

      const { data: insertResult, error: insertError } = await supabase.from("bookings").insert([testData]).select()

      if (insertError) {
        console.error("❌ Test insert failed:", insertError.message)
        console.error("❌ Full error:", JSON.stringify(insertError, null, 2))

        // Try to analyze the error message for missing columns
        if (insertError.message.includes("column") && insertError.message.includes("does not exist")) {
          const missingColumn = insertError.message.match(/column "([^"]+)" does not exist/)
          if (missingColumn) {
            console.log(`🔧 Missing column detected: ${missingColumn[1]}`)
          }
        }

        return false
      }

      console.log("✅ Test insert successful:", insertResult)

      // Clean up test record
      if (insertResult && insertResult[0]) {
        await supabase.from("bookings").delete().eq("id", insertResult[0].id)
        console.log("🧹 Test record cleaned up")
      }

      return true
    }

    console.log("✅ Bookings table exists with data")
    console.log("📊 Sample record structure:")
    console.log(JSON.stringify(columns[0], null, 2))

    // Show available columns
    const availableColumns = Object.keys(columns[0])
    console.log("📋 Available columns:", availableColumns)

    // Check for required columns
    const requiredColumns = [
      "client_name",
      "client_email",
      "service_name",
      "booking_date",
      "booking_time",
      "amount",
      "payment_reference",
      "payment_status",
      "status",
    ]

    const missingColumns = requiredColumns.filter((col) => !availableColumns.includes(col))

    if (missingColumns.length > 0) {
      console.log("⚠️  Missing required columns:", missingColumns)

      // Check for alternative column names
      const alternativeMapping = {
        client_name: ["name", "customer_name", "full_name"],
        client_email: ["email", "customer_email", "user_email"],
        client_phone: ["phone", "customer_phone", "phone_number"],
        service_name: ["service", "services", "service_type"],
        total_amount: ["total", "total_price", "full_amount"],
        deposit_amount: ["deposit", "advance_payment", "partial_payment"],
      }

      console.log("🔍 Checking for alternative column names...")
      Object.entries(alternativeMapping).forEach(([standard, alternatives]) => {
        const found = alternatives.find((alt) => availableColumns.includes(alt))
        if (found) {
          console.log(`   ${standard} → ${found} ✅`)
        }
      })
    } else {
      console.log("✅ All required columns are present")
    }

    return true
  } catch (error) {
    console.error("❌ Diagnosis failed:", error.message)
    return false
  }
}

async function runDiagnosis() {
  console.log("🚀 Starting database schema diagnosis...\n")

  const result = await diagnoseSchema()

  console.log("\n" + "=".repeat(50))
  if (result) {
    console.log("✅ DIAGNOSIS COMPLETE - Check the output above for details")
    console.log("💡 Run the SQL script to fix any schema issues:")
    console.log("   scripts/fix-bookings-table-final.sql")
  } else {
    console.log("❌ DIAGNOSIS FAILED - Check the errors above")
    console.log("🔧 You may need to create or fix the bookings table")
  }
}

// Run the diagnosis
runDiagnosis().catch(console.error)
