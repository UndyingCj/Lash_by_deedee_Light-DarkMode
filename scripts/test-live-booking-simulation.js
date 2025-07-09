import fetch from "node-fetch"

// Test configuration
const TEST_CONFIG = {
  siteUrl: "https://lashedbydeedee.com", // Your live site
  localUrl: "http://localhost:3000", // Local development
  customerEmail: "lashedbydeedeee@gmail.com", // Change this to your actual email
}

// Mock booking data for testing
const mockBookingData = {
  customerName: "Test Customer",
  customerEmail: TEST_CONFIG.customerEmail,
  customerPhone: "+2348123456789",
  services: ["Classic Lashes"],
  bookingDate: "2025-01-20",
  bookingTime: "11:00 AM",
  totalAmount: 15000,
  depositAmount: 7500,
  notes: "Test booking via live site simulation",
}

// Test if server is running
async function testServerConnection(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      timeout: 5000,
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// Test payment initialization
async function testPaymentInitialization(baseUrl) {
  try {
    console.log("🚀 Testing payment initialization...")

    const response = await fetch(`${baseUrl}/api/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mockBookingData),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Payment initialization successful!")
      console.log("💳 Authorization URL:", data.authorization_url)
      console.log("📧 Reference:", data.reference)
      return data
    } else {
      const errorData = await response.text()
      console.log("❌ Payment initialization failed:", response.status)
      console.log("Error:", errorData)
      return null
    }
  } catch (error) {
    console.log("❌ Payment initialization error:", error.message)
    return null
  }
}

// Test booking page accessibility
async function testBookingPage(baseUrl) {
  try {
    console.log("📄 Testing booking page accessibility...")

    const response = await fetch(`${baseUrl}/book`, {
      method: "GET",
      timeout: 10000,
    })

    if (response.ok) {
      console.log("✅ Booking page is accessible!")
      console.log("📊 Status:", response.status)
      return true
    } else {
      console.log("❌ Booking page not accessible:", response.status)
      return false
    }
  } catch (error) {
    console.log("❌ Booking page error:", error.message)
    return false
  }
}

// Main test function
async function testLiveBookingSystem() {
  console.log("🌐 Testing Live Booking System...")
  console.log("============================================================")

  // Test live site first
  console.log("🔍 Checking live site:", TEST_CONFIG.siteUrl)
  const liveServerRunning = await testServerConnection(TEST_CONFIG.siteUrl)

  if (liveServerRunning) {
    console.log("✅ Live site is accessible!")

    // Test booking page on live site
    const bookingPageWorking = await testBookingPage(TEST_CONFIG.siteUrl)

    if (bookingPageWorking) {
      console.log("✅ Live booking page is working!")

      // Test payment system on live site
      const paymentResult = await testPaymentInitialization(TEST_CONFIG.siteUrl)

      if (paymentResult) {
        console.log("🎉 Live booking system is fully functional!")
        console.log("💡 You can test a real booking at:", `${TEST_CONFIG.siteUrl}/book`)
      } else {
        console.log("⚠️ Live payment system needs attention")
      }
    } else {
      console.log("❌ Live booking page shows 404 error")
      console.log("💡 The booking page needs to be deployed to your live site")
    }
  } else {
    console.log("❌ Live site is not accessible")
  }

  console.log("\n" + "=".repeat(60))

  // Test local development server
  console.log("🔍 Checking local development server:", TEST_CONFIG.localUrl)
  const localServerRunning = await testServerConnection(TEST_CONFIG.localUrl)

  if (localServerRunning) {
    console.log("✅ Local development server is running!")

    // Test booking page locally
    const localBookingPageWorking = await testBookingPage(TEST_CONFIG.localUrl)

    if (localBookingPageWorking) {
      console.log("✅ Local booking page is working!")

      // Test payment system locally
      const localPaymentResult = await testPaymentInitialization(TEST_CONFIG.localUrl)

      if (localPaymentResult) {
        console.log("🎉 Local booking system is fully functional!")
        console.log("💡 You can test bookings at:", `${TEST_CONFIG.localUrl}/book`)
      }
    }
  } else {
    console.log("❌ Local development server is not running")
    console.log("💡 Start it with: npm run dev")
  }

  console.log("\n📋 Summary:")
  console.log("============================================================")
  console.log("🌐 Live Site Status:", liveServerRunning ? "✅ Online" : "❌ Offline")
  console.log("🏠 Local Dev Status:", localServerRunning ? "✅ Running" : "❌ Not Running")

  if (!liveServerRunning && !localServerRunning) {
    console.log("\n💡 Next Steps:")
    console.log("1. Start local development: npm run dev")
    console.log("2. Test booking at: http://localhost:3000/book")
    console.log("3. Deploy to production when ready")
  }
}

// Run the test
testLiveBookingSystem()
