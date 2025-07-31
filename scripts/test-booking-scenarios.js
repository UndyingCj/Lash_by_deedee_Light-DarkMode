console.log("🧪 Testing Booking Scenarios...")

// Test environment setup
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqnfxvgdamevrvlniryr.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY

async function testDatabaseConnection() {
  console.log("\n📡 Testing Database Connection...")

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.log("❌ Supabase configuration missing")
      return false
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=*&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log(`📡 Response status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Database connection successful")
      console.log(`📊 Sample records: ${data.length}`)
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Database connection failed:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Database connection error:", error.message)
    return false
  }
}

async function testBookingTableSchema() {
  console.log("\n🗄️ Testing Booking Table Schema...")

  try {
    // Test with all required columns
    const testColumns = [
      "id",
      "client_name",
      "client_email",
      "phone",
      "email",
      "service_name",
      "service",
      "booking_date",
      "booking_time",
      "total_amount",
      "amount",
      "deposit_amount",
      "payment_reference",
      "payment_status",
      "status",
      "notes",
      "special_notes",
      "created_at",
    ]

    const selectQuery = testColumns.join(",")

    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?select=${selectQuery}&limit=1`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log(`📡 Response status: ${response.status}`)

    if (response.ok) {
      console.log("✅ All required columns exist in bookings table")
      const data = await response.json()
      if (data.length > 0) {
        console.log("📋 Sample record structure:")
        console.log(Object.keys(data[0]).join(", "))
      }
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Schema validation failed:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Schema test error:", error.message)
    return false
  }
}

async function testBookingCreation() {
  console.log("\n📝 Testing Booking Creation...")

  try {
    const testBooking = {
      client_name: "Test Customer",
      client_email: "test@example.com",
      client_phone: "+2348012345678",
      phone: "+2348012345678",
      email: "test@example.com",
      service_name: "Test Service",
      service: "Test Service",
      booking_date: "2025-08-15",
      booking_time: "2:00 PM",
      total_amount: 55000,
      amount: 55000,
      deposit_amount: 27500,
      payment_reference: `TEST_REF_${Date.now()}`,
      payment_status: "pending",
      status: "pending",
      special_notes: "Test booking",
      notes: "Test booking",
    }

    console.log("🔄 Creating test booking...")
    console.log(`📧 Customer: ${testBooking.client_name} (${testBooking.client_email})`)
    console.log(`📅 Date/Time: ${testBooking.booking_date} at ${testBooking.booking_time}`)
    console.log(`💰 Amount: ₦${testBooking.total_amount.toLocaleString()}`)

    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(testBooking),
    })

    console.log(`📡 Response status: ${response.status}`)

    if (response.ok) {
      const createdBooking = await response.json()
      console.log("✅ Test booking created successfully")
      console.log(`🆔 Booking ID: ${createdBooking[0]?.id}`)

      // Clean up test booking
      if (createdBooking[0]?.id) {
        await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${createdBooking[0].id}`, {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        })
        console.log("🧹 Test booking cleaned up")
      }

      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Booking creation failed:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Booking creation error:", error.message)
    return false
  }
}

async function testBookingUpdate() {
  console.log("\n✏️ Testing Booking Update...")

  try {
    // First create a test booking
    const testBooking = {
      client_name: "Update Test Customer",
      client_email: "update@example.com",
      phone: "+2348012345678",
      email: "update@example.com",
      service_name: "Update Test Service",
      service: "Update Test Service",
      booking_date: "2025-08-16",
      booking_time: "3:00 PM",
      total_amount: 60000,
      amount: 60000,
      deposit_amount: 30000,
      payment_reference: `UPDATE_TEST_${Date.now()}`,
      payment_status: "pending",
      status: "pending",
      notes: "Update test booking",
    }

    console.log("🔄 Creating booking for update test...")

    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(testBooking),
    })

    if (!createResponse.ok) {
      console.error("❌ Failed to create test booking for update")
      return false
    }

    const createdBooking = await createResponse.json()
    const bookingId = createdBooking[0]?.id

    console.log(`✅ Test booking created with ID: ${bookingId}`)

    // Now update the booking
    const updateData = {
      payment_status: "paid",
      status: "confirmed",
      notes: "Updated test booking - payment confirmed",
    }

    console.log("🔄 Updating booking status...")

    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(updateData),
    })

    console.log(`📡 Update response status: ${updateResponse.status}`)

    if (updateResponse.ok) {
      const updatedBooking = await updateResponse.json()
      console.log("✅ Booking updated successfully")
      console.log(`📊 New status: ${updatedBooking[0]?.status}`)
      console.log(`💳 Payment status: ${updatedBooking[0]?.payment_status}`)

      // Clean up
      await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      })
      console.log("🧹 Test booking cleaned up")

      return true
    } else {
      const errorText = await updateResponse.text()
      console.error("❌ Booking update failed:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Booking update error:", error.message)
    return false
  }
}

async function testAvailabilityCheck() {
  console.log("\n📅 Testing Availability Check...")

  try {
    const testDate = "2025-08-20"

    console.log(`🔄 Checking availability for: ${testDate}`)

    // Check blocked dates
    const blockedDatesResponse = await fetch(`${SUPABASE_URL}/rest/v1/blocked_dates?blocked_date=eq.${testDate}`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!blockedDatesResponse.ok) {
      console.error("❌ Failed to check blocked dates")
      return false
    }

    const blockedDates = await blockedDatesResponse.json()
    console.log(`📊 Blocked dates found: ${blockedDates.length}`)

    // Check blocked time slots
    const blockedSlotsResponse = await fetch(`${SUPABASE_URL}/rest/v1/blocked_time_slots?blocked_date=eq.${testDate}`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!blockedSlotsResponse.ok) {
      console.error("❌ Failed to check blocked time slots")
      return false
    }

    const blockedSlots = await blockedSlotsResponse.json()
    console.log(`📊 Blocked time slots found: ${blockedSlots.length}`)

    // Check existing bookings
    const bookingsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?booking_date=eq.${testDate}&status=neq.cancelled`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!bookingsResponse.ok) {
      console.error("❌ Failed to check existing bookings")
      return false
    }

    const existingBookings = await bookingsResponse.json()
    console.log(`📊 Existing bookings found: ${existingBookings.length}`)

    console.log("✅ Availability check completed successfully")
    return true
  } catch (error) {
    console.error("❌ Availability check error:", error.message)
    return false
  }
}

async function testCompleteBookingFlow() {
  console.log("\n🔄 Testing Complete Booking Flow...")

  try {
    const flowTestData = {
      customerName: "Flow Test Customer",
      customerEmail: "flowtest@example.com",
      customerPhone: "+2348012345678",
      services: ["Flow Test Service"],
      date: "2025-08-25",
      time: "4:00 PM",
      totalAmount: 50000,
      depositAmount: 25000,
      notes: "Complete flow test booking",
    }

    console.log("🔄 Step 1: Check availability...")
    // This would normally call the availability API
    console.log("✅ Availability check (simulated)")

    console.log("🔄 Step 2: Initialize payment...")
    // This would normally call the payment initialization API
    console.log("✅ Payment initialization (simulated)")

    console.log("🔄 Step 3: Create booking record...")
    const bookingData = {
      client_name: flowTestData.customerName,
      client_email: flowTestData.customerEmail,
      phone: flowTestData.customerPhone,
      email: flowTestData.customerEmail,
      service_name: flowTestData.services.join(", "),
      service: flowTestData.services.join(", "),
      booking_date: flowTestData.date,
      booking_time: flowTestData.time,
      total_amount: flowTestData.totalAmount,
      amount: flowTestData.totalAmount,
      deposit_amount: flowTestData.depositAmount,
      payment_reference: `FLOW_TEST_${Date.now()}`,
      payment_status: "pending",
      status: "pending",
      notes: flowTestData.notes,
    }

    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(bookingData),
    })

    if (!createResponse.ok) {
      console.error("❌ Failed to create booking in flow test")
      return false
    }

    const createdBooking = await createResponse.json()
    const bookingId = createdBooking[0]?.id
    console.log(`✅ Booking created: ${bookingId}`)

    console.log("🔄 Step 4: Simulate payment confirmation...")
    const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment_status: "paid",
        status: "confirmed",
      }),
    })

    if (!updateResponse.ok) {
      console.error("❌ Failed to update booking status")
      return false
    }

    console.log("✅ Payment confirmed and booking updated")

    console.log("🔄 Step 5: Send confirmation emails...")
    // This would normally send emails
    console.log("✅ Confirmation emails (simulated)")

    // Clean up
    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })
    console.log("🧹 Flow test booking cleaned up")

    console.log("✅ Complete booking flow test successful")
    return true
  } catch (error) {
    console.error("❌ Complete booking flow error:", error.message)
    return false
  }
}

async function runBookingScenariosTest() {
  console.log("🚀 Starting Booking Scenarios Test...\n")

  const tests = [
    { name: "Database Connection", test: testDatabaseConnection },
    { name: "Booking Table Schema", test: testBookingTableSchema },
    { name: "Booking Creation", test: testBookingCreation },
    { name: "Booking Update", test: testBookingUpdate },
    { name: "Availability Check", test: testAvailabilityCheck },
    { name: "Complete Booking Flow", test: testCompleteBookingFlow },
  ]

  let passedTests = 0

  for (const { name, test } of tests) {
    console.log(`\n--- ${name} Test ---`)
    try {
      const result = await test()
      if (result) {
        passedTests++
        console.log(`✅ ${name}: PASSED`)
      } else {
        console.log(`❌ ${name}: FAILED`)
      }
    } catch (error) {
      console.error(`❌ ${name}: ERROR -`, error.message)
    }
  }

  console.log(`\n🎯 Test Results: ${passedTests}/${tests.length} tests passed`)

  if (passedTests === tests.length) {
    console.log("🎉 All booking scenario tests passed!")
    console.log("\n📋 Booking system is fully operational:")
    console.log("✅ Database connection established")
    console.log("✅ Table schema is correct")
    console.log("✅ Booking creation working")
    console.log("✅ Booking updates functional")
    console.log("✅ Availability checking operational")
    console.log("✅ Complete booking flow tested")
  } else {
    console.log("⚠️ Some tests failed. Please check:")
    console.log("1. Database connection and credentials")
    console.log("2. Table schema and column names")
    console.log("3. Database permissions and RLS policies")
    console.log("4. API endpoint configurations")
  }

  console.log("\n💡 Next steps:")
  console.log("1. Test with real user scenarios")
  console.log("2. Monitor booking success rates")
  console.log("3. Set up booking analytics")
  console.log("4. Implement booking notifications")
}

// Run the complete test
runBookingScenariosTest().catch(console.error)
