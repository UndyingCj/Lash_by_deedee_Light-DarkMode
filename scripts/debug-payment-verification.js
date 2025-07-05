// Debug script to test payment verification
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Found" : "❌ Missing")
  console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✅ Found" : "❌ Missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugPaymentVerification() {
  console.log("🔍 Testing payment verification flow...")

  try {
    // Test Paystack API connection
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecret) {
      console.error("❌ Missing PAYSTACK_SECRET_KEY")
      return
    }

    console.log("✅ Paystack secret key found")
    console.log("✅ Supabase URL:", supabaseUrl)
    console.log("✅ Supabase key found")

    // Test a sample verification call
    const testReference = "TEST_REF_" + Date.now()
    console.log("🧪 Testing with reference:", testReference)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${testReference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()
    console.log("📋 Paystack API response:", {
      status: response.status,
      ok: response.ok,
      data: data,
    })

    // Test database connection
    const { data: testData, error } = await supabase.from("bookings").select("*").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
    } else {
      console.log("✅ Database connection successful")
      console.log("📊 Sample bookings:", testData?.length || 0)
    }

    // Test creating a sample booking
    const sampleBooking = {
      client_name: "Test Client",
      phone: "1234567890",
      email: "test@example.com",
      service: "Classic Lashes",
      booking_date: "2025-07-10",
      booking_time: "10:00 AM",
      status: "confirmed",
      amount: 15000,
      notes: "Test booking for debugging",
    }

    const { data: newBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert([sampleBooking])
      .select()
      .single()

    if (bookingError) {
      console.error("❌ Test booking creation failed:", bookingError)
    } else {
      console.log("✅ Test booking created successfully:", newBooking.id)

      // Clean up test booking
      await supabase.from("bookings").delete().eq("id", newBooking.id)
      console.log("🧹 Test booking cleaned up")
    }

    console.log("🔍 Debug complete")
  } catch (error) {
    console.error("❌ Debug error:", error)
  }
}

debugPaymentVerification()
