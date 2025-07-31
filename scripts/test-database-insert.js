import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

console.log("🧪 Testing Database Insert with Exact Booking Data")
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
  process.exit(1)
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function testDatabaseInsert() {
  try {
    console.log("🔍 Testing exact booking data insert...")

    // This mimics the exact data structure from the payment form
    const testBookingData = {
      client_name: "cj",
      client_email: "test@example.com",
      client_phone: "+234 800 000 0000",
      service_name: "Brow Touch-Up (2-4 months) - Done by Deedee",
      service: "Brow Touch-Up (2-4 months) - Done by Deedee", // Backup field
      booking_date: "2025-07-28",
      booking_time: "2:00 PM",
      total_amount: 25000,
      amount: 12500, // Deposit amount
      deposit_amount: 12500,
      payment_reference: `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      payment_status: "pending",
      status: "pending",
      notes: null,
      special_notes: null, // Backup field
    }

    console.log("📝 Test booking data:")
    console.log(JSON.stringify(testBookingData, null, 2))

    // Attempt the insert
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([testBookingData])
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Insert failed:", bookingError)
      console.error("❌ Error code:", bookingError.code)
      console.error("❌ Error message:", bookingError.message)
      console.error("❌ Error details:", bookingError.details)
      console.error("❌ Error hint:", bookingError.hint)

      // If it's a column error, try to identify missing columns
      if (bookingError.code === "42703") {
        const missingColumn = bookingError.message.match(/column "([^"]+)" does not exist/)
        if (missingColumn) {
          console.log(`🔧 Missing column: ${missingColumn[1]}`)
          console.log("💡 You need to run the schema fix script:")
          console.log("   scripts/fix-bookings-table-final.sql")
        }
      }

      // Try a minimal insert to see what works
      console.log("\n🔄 Trying minimal insert...")
      const minimalData = {
        client_name: "Test User",
        client_email: "test@example.com",
        service_name: "Test Service",
        booking_date: "2025-07-28",
        booking_time: "2:00 PM",
        amount: 12500,
        payment_reference: `MIN_${Date.now()}`,
        payment_status: "pending",
        status: "pending",
      }

      const { data: minBooking, error: minError } = await supabase
        .from("bookings")
        .insert([minimalData])
        .select()
        .single()

      if (minError) {
        console.error("❌ Even minimal insert failed:", minError.message)
        console.log("🔧 Your database schema needs to be fixed completely")
      } else {
        console.log("✅ Minimal insert worked:", minBooking.id)
        console.log("📊 Working columns:", Object.keys(minBooking))

        // Clean up
        await supabase.from("bookings").delete().eq("id", minBooking.id)
        console.log("🧹 Test record cleaned up")
      }

      return false
    }

    console.log("✅ Insert successful!")
    console.log("📊 Inserted booking:", booking)

    // Clean up the test record
    await supabase.from("bookings").delete().eq("id", booking.id)
    console.log("🧹 Test record cleaned up")

    return true
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    return false
  }
}

async function runTest() {
  console.log("🚀 Starting database insert test...\n")

  const result = await testDatabaseInsert()

  console.log("\n" + "=".repeat(50))
  if (result) {
    console.log("✅ DATABASE INSERT TEST PASSED!")
    console.log("🎉 Your database schema is working correctly")
  } else {
    console.log("❌ DATABASE INSERT TEST FAILED!")
    console.log("🔧 Run these scripts to fix the issue:")
    console.log("   1. scripts/fix-bookings-table-final.sql")
    console.log("   2. scripts/test-database-insert.js (to verify the fix)")
  }
}

// Run the test
runTest().catch(console.error)
