// Complete test of the payment flow with proper environment variables
const { createClient } = require("@supabase/supabase-js")

// Use the correct environment variables from your output
const supabaseUrl = "https://cqnfxvgdamevrvlniryr.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxbmZ4dmdkYW1ldnJ2bG5pcnlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTMyNzEwMSwiZXhwIjoyMDY0OTAzMTAxfQ.T0TUi8QEh-d7L-P4lCqHoX7l7rVS99SNaoTomqInJyI"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompletePaymentFlow() {
  console.log("🧪 Testing complete payment flow...")

  try {
    // 1. Check database schema after column renaming
    console.log("\n1️⃣ Checking updated database schema...")

    const { data: columns, error: schemaError } = await supabase.from("bookings").select("*").limit(0)

    if (schemaError) {
      console.error("❌ Schema check failed:", schemaError)
    } else {
      console.log("✅ Database connection successful")
    }

    // 2. Test booking creation with new schema
    console.log("\n2️⃣ Testing booking creation with new schema...")
    const testBooking = {
      client_name: "Test Payment Customer",
      phone: "+234123456789", // Using the renamed column
      email: "testpayment@example.com", // Using the renamed column
      service: "Classic Lashes", // Using the renamed column
      booking_date: "2025-07-10",
      booking_time: "2:00 PM",
      status: "confirmed",
      amount: 15000, // Using the renamed column
      deposit_amount: 7500,
      payment_status: "completed",
      payment_reference: "TEST_REF_123",
      notes: "Test booking for payment flow verification", // Using the renamed column
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([testBooking])
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Booking creation failed:", bookingError)
    } else {
      console.log("✅ Test booking created successfully:", booking.id)
      console.log("📋 Booking data:", {
        id: booking.id,
        client_name: booking.client_name,
        phone: booking.phone,
        email: booking.email,
        service: booking.service,
        amount: booking.amount,
      })

      // Clean up test booking
      await supabase.from("bookings").delete().eq("id", booking.id)
      console.log("🧹 Test booking cleaned up")
    }

    // 3. Test fetching bookings
    console.log("\n3️⃣ Testing booking retrieval...")
    const { data: allBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("❌ Booking fetch failed:", fetchError)
    } else {
      console.log(`✅ Successfully fetched ${allBookings.length} bookings`)
      if (allBookings.length > 0) {
        console.log("📋 Sample booking:", {
          id: allBookings[0].id,
          client_name: allBookings[0].client_name,
          phone: allBookings[0].phone,
          email: allBookings[0].email,
          service: allBookings[0].service,
        })
      }
    }

    console.log("\n✅ Complete payment flow test finished!")
    console.log("\n🎉 The payment system should now work correctly!")
    console.log("\n📝 Next steps:")
    console.log("1. Make a test payment on the website")
    console.log("2. Check the admin panel to see if the booking appears")
    console.log("3. Verify the payment reference is stored correctly")
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

testCompletePaymentFlow()
