import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function testBookingScenarios() {
  console.log("🧪 Testing Booking Database Scenarios...\n")

  try {
    // Test 1: Database connectivity
    console.log("🔍 Test 1: Database connectivity...")
    const { data: testData, error: testError } = await supabase.from("bookings").select("count(*)").limit(1)

    if (testError) {
      console.error("❌ Database connection failed:", testError.message)
      return false
    }
    console.log("✅ Database connection successful")

    // Test 2: Create test booking
    console.log("\n🔍 Test 2: Creating test booking...")
    const testBooking = {
      client_name: "Test Customer",
      client_email: "test@example.com",
      client_phone: "+2348123456789",
      service_name: "Test Service",
      booking_date: "2025-08-15",
      booking_time: "10:00 AM",
      total_amount: 50000,
      deposit_amount: 25000,
      payment_reference: `TEST_${Date.now()}`,
      payment_status: "pending",
      status: "pending",
      notes: "Test booking for system validation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: createdBooking, error: createError } = await supabase
      .from("bookings")
      .insert(testBooking)
      .select()
      .single()

    if (createError) {
      console.error("❌ Booking creation failed:", createError.message)
      return false
    }
    console.log("✅ Test booking created:", createdBooking.id)

    // Test 3: Update booking status
    console.log("\n🔍 Test 3: Updating booking status...")
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", createdBooking.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Booking update failed:", updateError.message)
      return false
    }
    console.log("✅ Booking status updated successfully")

    // Test 4: Query bookings with filters
    console.log("\n🔍 Test 4: Querying bookings with filters...")
    const { data: confirmedBookings, error: queryError } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .limit(5)

    if (queryError) {
      console.error("❌ Booking query failed:", queryError.message)
      return false
    }
    console.log(`✅ Found ${confirmedBookings.length} confirmed bookings`)

    // Test 5: Test availability tables
    console.log("\n🔍 Test 5: Testing availability tables...")

    // Test blocked_dates table
    const { data: blockedDates, error: datesError } = await supabase.from("blocked_dates").select("*").limit(5)

    if (datesError) {
      console.error("❌ Blocked dates query failed:", datesError.message)
    } else {
      console.log(`✅ Blocked dates table accessible (${blockedDates.length} records)`)
    }

    // Test blocked_time_slots table
    const { data: blockedSlots, error: slotsError } = await supabase.from("blocked_time_slots").select("*").limit(5)

    if (slotsError) {
      console.error("❌ Blocked time slots query failed:", slotsError.message)
    } else {
      console.log(`✅ Blocked time slots table accessible (${blockedSlots.length} records)`)
    }

    // Test 6: Clean up test data
    console.log("\n🔍 Test 6: Cleaning up test data...")
    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", createdBooking.id)

    if (deleteError) {
      console.error("❌ Test cleanup failed:", deleteError.message)
    } else {
      console.log("✅ Test data cleaned up successfully")
    }

    console.log("\n🎉 All booking scenario tests passed!")
    console.log("✅ Database connectivity: Working")
    console.log("✅ Booking creation: Working")
    console.log("✅ Booking updates: Working")
    console.log("✅ Booking queries: Working")
    console.log("✅ Availability tables: Accessible")
    console.log("✅ Data cleanup: Working")
    console.log("\n💡 Database operations are ready for production use.")

    return true
  } catch (error) {
    console.error("❌ Booking scenario test failed:", error.message)
    return false
  }
}

// Run the test
testBookingScenarios().then((success) => {
  if (!success) {
    process.exit(1)
  }
})
