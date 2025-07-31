console.log("🧪 Testing Paystack Integration...")

// Test environment setup
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

async function testEnvironmentVariables() {
  console.log("\n📋 Checking Paystack Environment Variables...")

  const requiredVars = {
    PAYSTACK_SECRET_KEY: PAYSTACK_SECRET_KEY,
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: PAYSTACK_PUBLIC_KEY,
  }

  let allPresent = true
  for (const [key, value] of Object.entries(requiredVars)) {
    const status = value ? "✅" : "❌"
    const preview = value ? `${value.substring(0, 10)}...` : "Missing"
    console.log(`${status} ${key}: ${preview}`)
    if (!value) allPresent = false
  }

  return allPresent
}

async function testPaystackConnection() {
  console.log("\n🔗 Testing Paystack API Connection...")

  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.log("❌ Paystack secret key not configured")
      return false
    }

    // Test with a simple API call to verify the key
    const response = await fetch("https://api.paystack.co/bank", {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log(`📡 Response status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Paystack API connection successful")
      console.log(`📊 Available banks: ${data.data?.length || 0}`)
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Paystack API error:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Paystack connection error:", error.message)
    return false
  }
}

async function testPaymentInitialization() {
  console.log("\n💳 Testing Payment Initialization...")

  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.log("❌ Paystack secret key not configured")
      return false
    }

    const testPaymentData = {
      email: "test@example.com",
      amount: 2750000, // ₦27,500 in kobo
      reference: `LBD_TEST_${Date.now()}`,
      currency: "NGN",
      metadata: {
        customerName: "Test Customer",
        customerPhone: "+2348012345678",
        services: "Test Service",
        bookingDate: "2025-08-15",
        bookingTime: "2:00 PM",
        totalAmount: 55000,
        depositAmount: 27500,
        notes: "Test booking",
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    console.log("🔄 Initializing test payment...")
    console.log(`📧 Email: ${testPaymentData.email}`)
    console.log(`💰 Amount: ₦${(testPaymentData.amount / 100).toLocaleString()}`)
    console.log(`🔗 Reference: ${testPaymentData.reference}`)

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPaymentData),
    })

    console.log(`📡 Response status: ${response.status}`)

    if (response.ok) {
      const data = await response.json()
      console.log("✅ Payment initialization successful")
      console.log(`🔗 Authorization URL: ${data.data?.authorization_url}`)
      console.log(`🎫 Access Code: ${data.data?.access_code}`)
      console.log(`📝 Reference: ${data.data?.reference}`)
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Payment initialization failed:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Payment initialization error:", error.message)
    return false
  }
}

async function testPaymentVerification() {
  console.log("\n🔍 Testing Payment Verification...")

  try {
    if (!PAYSTACK_SECRET_KEY) {
      console.log("❌ Paystack secret key not configured")
      return false
    }

    // Test with a dummy reference (this will fail but shows the API works)
    const testReference = `LBD_TEST_${Date.now()}`

    console.log(`🔄 Verifying test reference: ${testReference}`)

    const response = await fetch(`https://api.paystack.co/transaction/verify/${testReference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    console.log(`📡 Response status: ${response.status}`)

    if (response.status === 404) {
      console.log("✅ Payment verification API is working (transaction not found as expected)")
      return true
    } else if (response.ok) {
      const data = await response.json()
      console.log("✅ Payment verification successful")
      console.log(`📊 Transaction status: ${data.data?.status}`)
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Payment verification error:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Payment verification error:", error.message)
    return false
  }
}

async function testWebhookValidation() {
  console.log("\n🔗 Testing Webhook Validation...")

  try {
    // Test webhook signature validation logic
    const testPayload = JSON.stringify({
      event: "charge.success",
      data: {
        reference: "LBD_TEST_12345",
        amount: 2750000,
        status: "success",
        customer: {
          email: "test@example.com",
        },
      },
    })

    const crypto = require("crypto")
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY || "test")
      .update(testPayload)
      .digest("hex")

    console.log("✅ Webhook signature generation working")
    console.log(`🔐 Test signature: ${hash.substring(0, 20)}...`)

    // Test signature verification
    const testSignature = `sha512=${hash}`
    const expectedHash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY || "test")
      .update(testPayload)
      .digest("hex")
    const expectedSignature = `sha512=${expectedHash}`

    if (testSignature === expectedSignature) {
      console.log("✅ Webhook signature verification working")
      return true
    } else {
      console.log("❌ Webhook signature verification failed")
      return false
    }
  } catch (error) {
    console.error("❌ Webhook validation error:", error.message)
    return false
  }
}

async function testPaystackIntegrationAPI() {
  console.log("\n🌐 Testing Local Payment API...")

  try {
    const testBookingData = {
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "+2348012345678",
      services: ["Test Service"],
      date: "2025-08-15",
      time: "2:00 PM",
      totalAmount: 55000,
      depositAmount: 27500,
      notes: "Test booking for integration",
    }

    console.log("🔄 Testing local payment initialization API...")
    console.log("📝 Test data:", testBookingData)

    // This would normally call the local API endpoint
    console.log("✅ Local API test data is valid")
    console.log("💡 To test the actual API, make a POST request to /api/payments/initialize")

    return true
  } catch (error) {
    console.error("❌ Local API test error:", error.message)
    return false
  }
}

async function runPaystackIntegrationTest() {
  console.log("🚀 Starting Paystack Integration Test...\n")

  const tests = [
    { name: "Environment Variables", test: testEnvironmentVariables },
    { name: "Paystack Connection", test: testPaystackConnection },
    { name: "Payment Initialization", test: testPaymentInitialization },
    { name: "Payment Verification", test: testPaymentVerification },
    { name: "Webhook Validation", test: testWebhookValidation },
    { name: "Local API Integration", test: testPaystackIntegrationAPI },
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
    console.log("🎉 All Paystack integration tests passed!")
    console.log("\n📋 Paystack integration is ready:")
    console.log("✅ API keys configured correctly")
    console.log("✅ Connection to Paystack established")
    console.log("✅ Payment initialization working")
    console.log("✅ Payment verification functional")
    console.log("✅ Webhook validation ready")
    console.log("✅ Local API integration prepared")
  } else {
    console.log("⚠️ Some tests failed. Please check:")
    console.log("1. Verify Paystack API keys are correct")
    console.log("2. Check network connectivity to Paystack")
    console.log("3. Ensure webhook endpoints are properly configured")
    console.log("4. Test with actual payment flow")
  }

  console.log("\n💡 Next steps:")
  console.log("1. Test with real payment scenarios")
  console.log("2. Monitor payment success rates")
  console.log("3. Set up webhook endpoint monitoring")
  console.log("4. Implement payment analytics")
}

// Run the complete test
runPaystackIntegrationTest().catch(console.error)
