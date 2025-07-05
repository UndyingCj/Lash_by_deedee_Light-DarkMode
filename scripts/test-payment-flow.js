// Test script to verify the complete payment flow
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPaymentFlow() {
  console.log("🧪 Testing payment flow...")

  try {
    // 1. Check database schema
    console.log("\n1️⃣ Checking database schema...")
    const { data: columns, error: schemaError } = await supabase.rpc("exec_sql", {
      sql: `SELECT column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_name = 'bookings' 
              ORDER BY ordinal_position;`,
    })

    if (schemaError) {
      console.error("❌ Schema check failed:", schemaError)
    } else {
      console.log("✅ Database schema:")
      console.table(columns)
    }

    // 2. Test booking creation
    console.log("\n2️⃣ Testing booking creation...")
    const testBooking = {
      client_name: "Test Customer",
      phone: "+234123456789",
      email: "test@example.com",
      service: "Classic Lashes",
      booking_date: "2025-07-10",
      booking_time: "2:00 PM",
      status: "confirmed",
      amount: 15000,
      notes: "Test booking from payment flow test",
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([testBooking])
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Booking creation failed:", bookingError)
    } else {
      console.log("✅ Test booking created:", booking.id)

      // Clean up test booking
      await supabase.from("bookings").delete().eq("id", booking.id)
      console.log("🧹 Test booking cleaned up")
    }

    // 3. Test API endpoints
    console.log("\n3️⃣ Testing API endpoints...")

    // Test payment initialization
    try {
      const initResponse = await fetch("http://localhost:3000/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Test Customer",
          customerEmail: "test@example.com",
          customerPhone: "+234123456789",
          services: ["Classic Lashes"],
          bookingDate: "2025-07-10",
          bookingTime: "2:00 PM",
          totalAmount: 15000,
          depositAmount: 7500,
          notes: "Test payment",
        }),
      })

      if (initResponse.ok) {
        console.log("✅ Payment initialization endpoint working")
      } else {
        console.log("⚠️ Payment initialization endpoint returned:", initResponse.status)
      }
    } catch (apiError) {
      console.log("⚠️ API test skipped (server not running):", apiError.message)
    }

    console.log("\n✅ Payment flow test completed!")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testPaymentFlow()
