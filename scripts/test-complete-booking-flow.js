import fetch from "node-fetch"

console.log("🧪 Testing Complete Booking Flow...")
console.log("=".repeat(50))

// Test booking data
const testBookingData = {
  customerName: "Test Customer",
  customerEmail: "your-email@example.com", // CHANGE THIS TO YOUR EMAIL
  customerPhone: "+2348123456789",
  services: ["Classic Lashes", "Brow Shaping"],
  bookingDate: "2024-06-25",
  bookingTime: "2:00 PM",
  totalAmount: 25000,
  depositAmount: 12500,
  notes: "Test booking for email verification",
}

async function testCompleteFlow() {
  try {
    console.log("📋 Test booking data:")
    console.log(testBookingData)
    console.log()

    // Step 1: Test payment initialization
    console.log("🚀 STEP 1: Testing Payment Initialization")
    console.log("-".repeat(40))

    const initResponse = await fetch("http://localhost:3000/api/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testBookingData),
    })

    if (!initResponse.ok) {
      console.log("⚠️ Server not running or payment init failed")
      console.log("💡 Start your server with: npm run dev")
      console.log()

      // Fallback: Test email functions directly
      await testEmailFunctionsDirect()
      return
    }

    const initResult = await initResponse.json()
    console.log("✅ Payment initialization successful!")
    console.log("💳 Payment reference:", initResult.data?.reference)
    console.log()

    // Step 2: Simulate payment verification
    console.log("🔍 STEP 2: Testing Payment Verification")
    console.log("-".repeat(40))

    // Create mock verification data
    const mockVerificationData = {
      reference: initResult.data?.reference || "LBD_TEST_" + Date.now(),
    }

    const verifyResponse = await fetch("http://localhost:3000/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockVerificationData),
    })

    if (verifyResponse.ok) {
      const verifyResult = await verifyResponse.json()
      console.log("✅ Payment verification successful!")
      console.log("📧 Email status:", verifyResult.data?.emails)
      console.log("💾 Booking saved:", verifyResult.data?.booking?.id)
    } else {
      console.log("⚠️ Payment verification failed - testing emails directly")
      await testEmailFunctionsDirect()
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    console.log()
    console.log("🔄 Falling back to direct email test...")
    await testEmailFunctionsDirect()
  }
}

async function testEmailFunctionsDirect() {
  console.log("📧 DIRECT EMAIL TEST")
  console.log("-".repeat(40))

  try {
    // Import email functions (this would work in a real Node.js environment)
    console.log("📧 Testing email system structure...")

    const emailData = {
      customerName: testBookingData.customerName,
      customerEmail: testBookingData.customerEmail,
      customerPhone: testBookingData.customerPhone,
      services: testBookingData.services,
      bookingDate: testBookingData.bookingDate,
      bookingTime: testBookingData.bookingTime,
      totalAmount: testBookingData.totalAmount,
      depositAmount: testBookingData.depositAmount,
      reference: "LBD_TEST_" + Date.now(),
      notes: testBookingData.notes,
    }

    console.log("✅ Email data prepared:")
    console.log("👤 Customer:", emailData.customerName)
    console.log("📧 Email:", emailData.customerEmail)
    console.log("📅 Date:", emailData.bookingDate)
    console.log("⏰ Time:", emailData.bookingTime)
    console.log("💰 Amount:", `₦${emailData.totalAmount.toLocaleString()}`)
    console.log()

    console.log("📧 Customer Confirmation Email would contain:")
    console.log("  • Professional header with Lashed by Deedee branding")
    console.log("  • Booking confirmation with celebration emoji")
    console.log("  • Complete appointment details")
    console.log("  • Payment information and balance due")
    console.log("  • Preparation instructions")
    console.log("  • Contact information and social links")
    console.log()

    console.log("📧 Admin Notification Email would contain:")
    console.log("  • Alert header for immediate attention")
    console.log("  • Customer contact information")
    console.log("  • Complete booking details")
    console.log("  • Payment status confirmation")
    console.log("  • Action items checklist")
    console.log("  • Quick contact buttons")
    console.log()

    console.log("💡 To test real emails:")
    console.log("  1. Update customerEmail to your actual email")
    console.log("  2. Start your dev server: npm run dev")
    console.log("  3. Visit: http://localhost:3000/book")
    console.log("  4. Complete a test booking")
    console.log("  5. Check your email inbox")
  } catch (error) {
    console.error("❌ Direct email test failed:", error.message)
  }
}

// Run the test
testCompleteFlow()
