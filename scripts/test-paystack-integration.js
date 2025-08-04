import fetch from "node-fetch"

async function testPaystackIntegration() {
  console.log("🧪 Testing Paystack Integration...\n")

  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
  const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

  if (!PAYSTACK_SECRET_KEY) {
    console.error("❌ PAYSTACK_SECRET_KEY not found in environment variables")
    return false
  }

  if (!PAYSTACK_PUBLIC_KEY) {
    console.error("❌ NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY not found in environment variables")
    return false
  }

  console.log("✅ Paystack keys found")
  console.log(`Public Key: ${PAYSTACK_PUBLIC_KEY.substring(0, 10)}...`)
  console.log(`Secret Key: ${PAYSTACK_SECRET_KEY.substring(0, 10)}...\n`)

  try {
    // Test 1: Verify API connectivity
    console.log("🔍 Test 1: Verifying API connectivity...")
    const verifyResponse = await fetch("https://api.paystack.co/transaction/verify/invalid_reference", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (verifyResponse.status === 404) {
      console.log("✅ API connectivity confirmed (404 expected for invalid reference)")
    } else {
      console.log(`⚠️ Unexpected response status: ${verifyResponse.status}`)
    }

    // Test 2: Initialize a test transaction
    console.log("\n🔍 Test 2: Initializing test transaction...")
    const initData = {
      email: "test@example.com",
      amount: 50000, // 500 NGN in kobo
      reference: `TEST_${Date.now()}`,
      callback_url: "https://example.com/callback",
    }

    const initResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(initData),
    })

    const initResult = await initResponse.json()

    if (initResponse.ok && initResult.status) {
      console.log("✅ Transaction initialization successful")
      console.log(`Reference: ${initResult.data.reference}`)
      console.log(`Authorization URL: ${initResult.data.authorization_url}`)
    } else {
      console.error("❌ Transaction initialization failed:", initResult.message)
      return false
    }

    // Test 3: List transactions (to verify read permissions)
    console.log("\n🔍 Test 3: Testing transaction listing...")
    const listResponse = await fetch("https://api.paystack.co/transaction?perPage=1", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const listResult = await listResponse.json()

    if (listResponse.ok && listResult.status) {
      console.log("✅ Transaction listing successful")
      console.log(`Total transactions: ${listResult.meta.total}`)
    } else {
      console.error("❌ Transaction listing failed:", listResult.message)
      return false
    }

    console.log("\n🎉 All Paystack tests passed!")
    console.log("✅ API connectivity: Working")
    console.log("✅ Transaction initialization: Working")
    console.log("✅ Transaction listing: Working")
    console.log("\n💡 Paystack integration is ready for production use.")

    return true
  } catch (error) {
    console.error("❌ Paystack test failed:", error.message)
    return false
  }
}

// Run the test
testPaystackIntegration().then((success) => {
  if (!success) {
    process.exit(1)
  }
})
