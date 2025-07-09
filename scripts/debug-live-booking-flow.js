// Debug script to check the live booking flow step by step
async function debugLiveBookingFlow() {
  console.log("🔍 Debugging Live Booking Flow...\n")

  const baseUrl = "https://lashedbydeedee.com"

  try {
    // Step 1: Test if the booking page loads
    console.log("1️⃣ Testing booking page...")
    const bookingPageResponse = await fetch(`${baseUrl}/book`)
    console.log("   Booking page status:", bookingPageResponse.status)

    if (bookingPageResponse.ok) {
      console.log("   ✅ Booking page loads successfully")
    } else {
      console.log("   ❌ Booking page failed to load")
      return
    }

    // Step 2: Test availability API
    console.log("\n2️⃣ Testing availability API...")
    const availabilityResponse = await fetch(`${baseUrl}/api/admin/availability`)
    console.log("   Availability API status:", availabilityResponse.status)

    if (availabilityResponse.ok) {
      const availabilityData = await availabilityResponse.json()
      console.log("   ✅ Availability API working")
      console.log("   Available dates count:", availabilityData.availableDates?.length || 0)
    } else {
      console.log("   ❌ Availability API failed")
    }

    // Step 3: Test payment initialization
    console.log("\n3️⃣ Testing payment initialization...")
    const testPaymentData = {
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "+2348123456789",
      services: ["Classic Lashes"],
      bookingDate: "2024-01-15",
      bookingTime: "2:00 PM",
      totalAmount: 25000,
      depositAmount: 12500,
      notes: "Test booking",
    }

    const initResponse = await fetch(`${baseUrl}/api/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPaymentData),
    })

    console.log("   Payment init status:", initResponse.status)

    if (initResponse.ok) {
      const initData = await initResponse.json()
      console.log("   ✅ Payment initialization working")
      console.log("   Has public key:", !!initData.data?.public_key)
      console.log("   Reference:", initData.data?.reference)
    } else {
      const errorData = await initResponse.json()
      console.log("   ❌ Payment initialization failed:", errorData.message)
    }

    // Step 4: Test environment variables (indirectly)
    console.log("\n4️⃣ Testing environment setup...")

    // Test if we can reach the verification endpoint
    const verifyTestResponse = await fetch(`${baseUrl}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reference: "TEST_INVALID" }),
    })

    console.log("   Verify endpoint status:", verifyTestResponse.status)

    if (verifyTestResponse.status === 400) {
      console.log("   ✅ Verify endpoint is accessible (expected 400 for invalid reference)")
    } else if (verifyTestResponse.status === 500) {
      console.log("   ⚠️ Verify endpoint has server errors - check environment variables")
    } else {
      console.log("   ❓ Unexpected verify endpoint response")
    }

    // Step 5: Check database connection
    console.log("\n5️⃣ Testing database connection...")
    const bookingsResponse = await fetch(`${baseUrl}/api/admin/bookings`)
    console.log("   Bookings API status:", bookingsResponse.status)

    if (bookingsResponse.ok) {
      console.log("   ✅ Database connection working")
    } else {
      console.log("   ❌ Database connection failed")
    }

    console.log("\n📋 Summary:")
    console.log("- Make sure all environment variables are set in production")
    console.log("- RESEND_API_KEY should be configured")
    console.log("- PAYSTACK_SECRET_KEY should be configured")
    console.log("- SUPABASE credentials should be configured")
    console.log("- Check Vercel deployment logs for any errors")
  } catch (error) {
    console.error("❌ Debug failed:", error.message)
  }
}

// Run the debug
debugLiveBookingFlow()
