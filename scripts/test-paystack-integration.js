const https = require("https")

const PAYSTACK_SECRET_KEY = "sk_test_be9286563f66334e6875c02a5143e321cda9d495"

async function testPaystackIntegration() {
  console.log("🧪 Testing Paystack Integration (No Crypto)...")

  const testPaymentData = {
    email: "test@example.com",
    amount: 1250000, // ₦12,500 in kobo
    currency: "NGN",
    reference: `test_${Date.now()}`,
    channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"], // NO CRYPTO
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: "Test Customer",
        },
        {
          display_name: "Services",
          variable_name: "services",
          value: "Classic Lashes",
        },
      ],
    },
  }

  const postData = JSON.stringify(testPaymentData)

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/transaction/initialize",
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ""

      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        try {
          const response = JSON.parse(data)

          if (res.statusCode === 200 && response.status) {
            console.log("✅ Paystack integration test successful!")
            console.log("📊 Test Results:")
            console.log(`   Reference: ${testPaymentData.reference}`)
            console.log(`   Amount: ₦${testPaymentData.amount / 100}`)
            console.log(`   Channels: ${testPaymentData.channels.join(", ")}`)
            console.log(`   Authorization URL: ${response.data.authorization_url}`)
            console.log("🚫 Crypto payments: DISABLED")
            console.log("✅ Traditional payments: ENABLED")
            resolve(response)
          } else {
            console.log("❌ Paystack test failed:", response)
            reject(new Error(response.message || "Test failed"))
          }
        } catch (error) {
          console.log("❌ Error parsing response:", error)
          reject(error)
        }
      })
    })

    req.on("error", (error) => {
      console.log("❌ Request error:", error)
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

// Run the test
testPaystackIntegration()
  .then(() => {
    console.log("\n🎉 Paystack integration is ready!")
    console.log("💳 Supported payment methods:")
    console.log("   • Debit/Credit Cards")
    console.log("   • Bank Transfer")
    console.log("   • USSD")
    console.log("   • Mobile Money")
    console.log("   • QR Code")
    console.log("🚫 Crypto payments are disabled")
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error.message)
  })
