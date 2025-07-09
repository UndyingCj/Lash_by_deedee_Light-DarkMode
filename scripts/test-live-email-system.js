// Test script to verify the live email system is working
async function testLiveEmailSystem() {
  console.log("🧪 Testing Live Email System...\n")

  try {
    // Test data that matches what would come from a real booking
    const testBookingData = {
      customerName: "Test Customer",
      customerEmail: "your-test-email@gmail.com", // Replace with your email
      customerPhone: "+2348123456789",
      services: ["Classic Lashes", "Brow Shaping"],
      bookingDate: "2024-01-15",
      bookingTime: "2:00 PM",
      totalAmount: 25000,
      depositAmount: 12500,
      reference: "TEST_" + Date.now(),
      notes: "Test booking for email system verification",
    }

    console.log("📋 Test booking data:", testBookingData)
    console.log("")

    // Test the payment verification endpoint directly
    console.log("🔍 Testing payment verification endpoint...")

    const response = await fetch("https://lashedbydeedee.com/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reference: testBookingData.reference,
      }),
    })

    const result = await response.json()

    console.log("📊 API Response Status:", response.status)
    console.log("📊 API Response:", result)

    if (response.ok && result.status === "ok") {
      console.log("✅ Payment verification endpoint working!")

      if (result.emails) {
        console.log("📧 Email Results:")
        console.log("   Customer Email:", result.emails.customer?.success ? "✅ Sent" : "❌ Failed")
        console.log("   Admin Email:", result.emails.admin?.success ? "✅ Sent" : "❌ Failed")

        if (result.emails.success) {
          console.log("🎉 ALL EMAILS SENT SUCCESSFULLY!")
          console.log("")
          console.log("📬 Check your email inbox for:")
          console.log("   1. Customer confirmation email")
          console.log("   2. Admin notification email")
        } else {
          console.log("⚠️ Some emails failed to send")
          if (result.emails.customer && !result.emails.customer.success) {
            console.log("   Customer email error:", result.emails.customer.error)
          }
          if (result.emails.admin && !result.emails.admin.success) {
            console.log("   Admin email error:", result.emails.admin.error)
          }
        }
      }
    } else {
      console.log("❌ Payment verification failed:", result.message)
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    console.log("")
    console.log("🔧 Troubleshooting:")
    console.log("1. Make sure your website is deployed and live")
    console.log("2. Check that all environment variables are set in production")
    console.log("3. Verify Resend API key is working")
    console.log("4. Check Supabase connection")
  }
}

// Run the test
testLiveEmailSystem()
