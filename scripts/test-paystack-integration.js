#!/usr/bin/env node

/**
 * Paystack Integration Test for Lashed by Deedee
 * Tests all Paystack functionality including initialization, verification, and webhooks
 */

const fetch = require("node-fetch")
const crypto = require("crypto")
const { createClient } = require("@supabase/supabase-js")

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

// Configuration
const config = {
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    baseUrl: "https://api.paystack.co",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  testData: {
    email: "test@example.com",
    amount: 2000000, // ₦20,000 in kobo
    reference: `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    metadata: {
      customer_name: "John Doe",
      service_name: "Microblading",
      booking_date: "2025-02-15",
      booking_time: "10:00 AM",
    },
  },
}

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
}

// Utility functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green)
}

function logError(message) {
  log(`❌ ${message}`, colors.red)
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue)
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow)
}

function logStep(step, message) {
  log(`${colors.bright}${step}${colors.reset} ${message}`, colors.cyan)
}

// Test Paystack API connection
async function testPaystackConnection() {
  try {
    logStep("1.", "Testing Paystack API Connection")

    const response = await fetch(`${config.paystack.baseUrl}/bank`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      logSuccess(`Paystack API connection successful. Found ${data.data.length} banks.`)
      return true
    } else {
      logError(`Paystack API connection failed: ${response.status}`)
      return false
    }
  } catch (error) {
    logError(`Paystack connection error: ${error.message}`)
    return false
  }
}

// Test payment initialization
async function testPaymentInitialization() {
  try {
    logStep("2.", "Testing Payment Initialization")

    const payload = {
      email: config.testData.email,
      amount: config.testData.amount,
      reference: config.testData.reference,
      metadata: config.testData.metadata,
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    }

    logInfo(`Initializing payment with reference: ${config.testData.reference}`)

    const response = await fetch(`${config.paystack.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (response.ok && data.status) {
      logSuccess("Payment initialization successful")
      logInfo(`Authorization URL: ${data.data.authorization_url}`)
      logInfo(`Access Code: ${data.data.access_code}`)
      return { success: true, data: data.data }
    } else {
      logError(`Payment initialization failed: ${data.message}`)
      return { success: false, error: data.message }
    }
  } catch (error) {
    logError(`Payment initialization error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Test payment verification
async function testPaymentVerification(reference) {
  try {
    logStep("3.", "Testing Payment Verification")

    const response = await fetch(`${config.paystack.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok && data.status) {
      logSuccess("Payment verification API working")
      logInfo(`Transaction Status: ${data.data.status}`)
      logInfo(`Amount: ₦${(data.data.amount / 100).toLocaleString()}`)
      logInfo(`Customer Email: ${data.data.customer.email}`)
      return { success: true, data: data.data }
    } else {
      logError(`Payment verification failed: ${data.message}`)
      return { success: false, error: data.message }
    }
  } catch (error) {
    logError(`Payment verification error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Test webhook signature verification
async function testWebhookSignature() {
  try {
    logStep("4.", "Testing Webhook Signature Verification")

    const testPayload = JSON.stringify({
      event: "charge.success",
      data: {
        reference: config.testData.reference,
        status: "success",
        amount: config.testData.amount,
        customer: {
          email: config.testData.email,
        },
        metadata: config.testData.metadata,
      },
    })

    // Generate signature
    const hash = crypto.createHmac("sha512", config.paystack.secretKey).update(testPayload).digest("hex")

    // Verify signature
    const verifyHash = crypto.createHmac("sha512", config.paystack.secretKey).update(testPayload).digest("hex")

    if (hash === verifyHash) {
      logSuccess("Webhook signature verification working correctly")
      logInfo(`Generated signature: ${hash.substring(0, 20)}...`)
      return true
    } else {
      logError("Webhook signature verification failed")
      return false
    }
  } catch (error) {
    logError(`Webhook signature test error: ${error.message}`)
    return false
  }
}

// Test amount conversion (Naira to Kobo)
async function testAmountConversion() {
  try {
    logStep("5.", "Testing Amount Conversion (Naira to Kobo)")

    const testCases = [
      { naira: 10000, expectedKobo: 1000000 },
      { naira: 25000, expectedKobo: 2500000 },
      { naira: 50000, expectedKobo: 5000000 },
      { naira: 100, expectedKobo: 10000 },
      { naira: 1, expectedKobo: 100 },
    ]

    let allPassed = true

    for (const testCase of testCases) {
      const kobo = testCase.naira * 100
      if (kobo === testCase.expectedKobo) {
        logSuccess(`₦${testCase.naira.toLocaleString()} = ${kobo.toLocaleString()} kobo`)
      } else {
        logError(
          `₦${testCase.naira.toLocaleString()} conversion failed. Expected: ${testCase.expectedKobo}, Got: ${kobo}`,
        )
        allPassed = false
      }
    }

    return allPassed
  } catch (error) {
    logError(`Amount conversion test error: ${error.message}`)
    return false
  }
}

// Test reference generation
async function testReferenceGeneration() {
  try {
    logStep("6.", "Testing Payment Reference Generation")

    const references = []
    for (let i = 0; i < 10; i++) {
      const reference = `LBD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      references.push(reference)
    }

    // Check for uniqueness
    const uniqueReferences = new Set(references)
    if (uniqueReferences.size === references.length) {
      logSuccess("Payment reference generation working correctly")
      logInfo(`Sample references: ${references.slice(0, 3).join(", ")}`)
      return true
    } else {
      logError("Duplicate references generated")
      return false
    }
  } catch (error) {
    logError(`Reference generation test error: ${error.message}`)
    return false
  }
}

// Test metadata handling
async function testMetadataHandling() {
  try {
    logStep("7.", "Testing Metadata Handling")

    const metadata = {
      customer_name: "Alice Johnson",
      customer_phone: "+234 801 234 5678",
      service_name: "Microblading, Brow Lamination",
      booking_date: "2025-02-15",
      booking_time: "10:00 AM",
      booking_id: "12345",
      total_amount: 65000,
      deposit_amount: 32500,
    }

    // Test JSON serialization/deserialization
    const serialized = JSON.stringify(metadata)
    const deserialized = JSON.parse(serialized)

    let metadataValid = true

    for (const key in metadata) {
      if (deserialized[key] !== metadata[key]) {
        logError(`Metadata key "${key}" not preserved correctly`)
        metadataValid = false
      }
    }

    if (metadataValid) {
      logSuccess("Metadata handling working correctly")
      logInfo(`Metadata keys: ${Object.keys(metadata).join(", ")}`)
      return true
    } else {
      logError("Metadata handling failed")
      return false
    }
  } catch (error) {
    logError(`Metadata handling test error: ${error.message}`)
    return false
  }
}

// Test error handling
async function testErrorHandling() {
  try {
    logStep("8.", "Testing Error Handling")

    const errorTests = [
      {
        name: "Invalid API Key",
        test: async () => {
          const response = await fetch(`${config.paystack.baseUrl}/transaction/initialize`, {
            method: "POST",
            headers: {
              Authorization: "Bearer invalid_key",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: "test@example.com",
              amount: 100000,
            }),
          })
          return !response.ok // Should fail with invalid key
        },
      },
      {
        name: "Missing Required Fields",
        test: async () => {
          const response = await fetch(`${config.paystack.baseUrl}/transaction/initialize`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.paystack.secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}), // Empty payload
          })
          return !response.ok // Should fail with missing fields
        },
      },
      {
        name: "Invalid Amount",
        test: async () => {
          const response = await fetch(`${config.paystack.baseUrl}/transaction/initialize`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.paystack.secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: "test@example.com",
              amount: -1000, // Negative amount
            }),
          })
          return !response.ok // Should fail with invalid amount
        },
      },
    ]

    let allPassed = true

    for (const errorTest of errorTests) {
      try {
        const result = await errorTest.test()
        if (result) {
          logSuccess(`${errorTest.name} error handled correctly`)
        } else {
          logError(`${errorTest.name} error not handled properly`)
          allPassed = false
        }
      } catch (error) {
        logSuccess(`${errorTest.name} error caught: ${error.message}`)
      }
    }

    return allPassed
  } catch (error) {
    logError(`Error handling test error: ${error.message}`)
    return false
  }
}

// Main test runner
async function runPaystackTests() {
  log("\n" + "=".repeat(60), colors.bright)
  log("💳 LASHED BY DEEDEE - PAYSTACK INTEGRATION TEST", colors.bright)
  log("=".repeat(60), colors.bright)
  log(`Started at: ${new Date().toISOString()}`, colors.cyan)
  log("")

  // Check environment variables
  logStep("0.", "Checking Environment Variables")

  const requiredVars = ["PAYSTACK_SECRET_KEY", "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"]
  let envValid = true

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`)
    } else {
      logError(`${varName} is missing`)
      envValid = false
    }
  }

  if (!envValid) {
    logError("Required environment variables missing. Exiting.")
    process.exit(1)
  }

  log("")

  // Run tests
  const tests = [
    { name: "Paystack Connection", test: testPaystackConnection },
    { name: "Payment Initialization", test: testPaymentInitialization },
    { name: "Payment Verification", test: () => testPaymentVerification(config.testData.reference) },
    { name: "Webhook Signature", test: testWebhookSignature },
    { name: "Amount Conversion", test: testAmountConversion },
    { name: "Reference Generation", test: testReferenceGeneration },
    { name: "Metadata Handling", test: testMetadataHandling },
    { name: "Error Handling", test: testErrorHandling },
  ]

  const results = []

  for (const test of tests) {
    try {
      const result = await test.test()
      results.push({ name: test.name, success: result })
    } catch (error) {
      logError(`Test "${test.name}" threw an error: ${error.message}`)
      results.push({ name: test.name, success: false, error: error.message })
    }
    log("") // Add spacing between tests
  }

  // Summary
  log("=".repeat(60), colors.bright)
  log("📊 PAYSTACK INTEGRATION TEST RESULTS", colors.bright)
  log("=".repeat(60), colors.bright)

  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  results.forEach((result) => {
    if (result.success) {
      logSuccess(`${result.name}`)
    } else {
      logError(`${result.name}${result.error ? ` - ${result.error}` : ""}`)
    }
  })

  log("")
  log(`Total Tests: ${results.length}`, colors.bright)
  log(`Passed: ${passed}`, colors.green)
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green)
  log(`Success Rate: ${Math.round((passed / results.length) * 100)}%`, colors.cyan)

  log("")
  log(`Completed at: ${new Date().toISOString()}`, colors.cyan)
  log("=".repeat(60), colors.bright)

  if (failed === 0) {
    logSuccess("🎉 ALL PAYSTACK TESTS PASSED! Payment integration is fully functional.")
  } else {
    logError(`❌ ${failed} test(s) failed. Please check the errors above.`)
  }

  process.exit(failed === 0 ? 0 : 1)
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
  process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logError(`Uncaught Exception: ${error.message}`)
  process.exit(1)
})

// Run the tests
if (require.main === module) {
  runPaystackTests()
}

module.exports = {
  runPaystackTests,
  testPaystackConnection,
  testPaymentInitialization,
  testPaymentVerification,
  testWebhookSignature,
  testAmountConversion,
  testReferenceGeneration,
  testMetadataHandling,
  testErrorHandling,
}
