/**
 * Paystack Integration Test for Lashed by Deedee
 * Tests all Paystack functionality including payment initialization, verification, and webhooks
 */

import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Environment validation
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
  "PAYSTACK_SECRET_KEY",
]

console.log("🔍 Checking environment variables...")
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error("❌ Missing environment variables:", missingVars)
  process.exit(1)
}

console.log("✅ All required environment variables are present")

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Test data
const testBooking = {
  customerName: "John Doe",
  customerEmail: "john.doe@example.com",
  customerPhone: "+2348123456789",
  serviceName: "Classic Lash Extensions",
  bookingDate: "2025-08-15",
  bookingTime: "10:00 AM",
  totalAmount: 25000,
  depositAmount: 12500,
  paymentReference: `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
  notes: "First time client, allergic to latex",
}

async function testPaystackInitialization() {
  console.log("\n🧪 Testing Paystack Payment Initialization...")

  try {
    const response = await fetch("http://localhost:3000/api/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testBooking.customerEmail,
        amount: testBooking.depositAmount * 100, // Convert to kobo
        reference: testBooking.paymentReference,
        metadata: {
          customerName: testBooking.customerName,
          serviceName: testBooking.serviceName,
          bookingDate: testBooking.bookingDate,
          bookingTime: testBooking.bookingTime,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Payment initialization successful")
    console.log("📊 Response data:", {
      status: data.status,
      reference: data.data?.reference,
      authorization_url: data.data?.authorization_url ? "✅ Present" : "❌ Missing",
      access_code: data.data?.access_code ? "✅ Present" : "❌ Missing",
    })

    return data
  } catch (error) {
    console.error("❌ Payment initialization failed:", error.message)
    return null
  }
}

async function testPaystackVerification() {
  console.log("\n🧪 Testing Paystack Payment Verification...")

  try {
    const response = await fetch(
      `http://localhost:3000/api/payments/verify?reference=${testBooking.paymentReference}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Payment verification endpoint accessible")
    console.log("📊 Response:", {
      status: data.status || "pending",
      message: data.message || "No message",
    })

    return data
  } catch (error) {
    console.error("❌ Payment verification failed:", error.message)
    return null
  }
}

async function testWebhookSignature() {
  console.log("\n🧪 Testing Webhook Signature Verification...")

  const webhookPayload = {
    event: "charge.success",
    data: {
      reference: testBooking.paymentReference,
      status: "success",
      amount: testBooking.depositAmount * 100,
      customer: {
        email: testBooking.customerEmail,
      },
    },
  }

  const payloadString = JSON.stringify(webhookPayload)
  const signature = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(payloadString).digest("hex")

  try {
    const response = await fetch("http://localhost:3000/api/payments/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
      },
      body: payloadString,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Webhook signature verification successful")
    console.log("📊 Webhook response:", data)

    return data
  } catch (error) {
    console.error("❌ Webhook test failed:", error.message)
    return null
  }
}

async function testDatabaseIntegration() {
  console.log("\n🧪 Testing Database Integration...")

  try {
    // Create a test booking
    const { data: booking, error: insertError } = await supabase.from("bookings").insert({
      client_name: testBooking.customerName,
      client_email: testBooking.customerEmail,
      client_phone: testBooking.customerPhone,
      service_name: testBooking.serviceName,
      booking_date: testBooking.bookingDate,
      booking_time: testBooking.bookingTime,
      total_amount: testBooking.totalAmount,
      deposit_amount: testBooking.depositAmount,
      payment_reference: testBooking.paymentReference,
      payment_status: "pending",
      status: "pending",
      notes: testBooking.notes,
    })

    if (insertError) {
      throw insertError
    }

    console.log("✅ Test booking created successfully")

    // Test payment status update
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
      })
      .eq("payment_reference", testBooking.paymentReference)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    console.log("✅ Payment status update successful")
    console.log("📊 Updated booking:", {
      id: updatedBooking.id,
      payment_status: updatedBooking.payment_status,
      status: updatedBooking.status,
    })

    // Clean up test data
    await supabase.from("bookings").delete().eq("payment_reference", testBooking.paymentReference)
    console.log("🧹 Test data cleaned up")

    return true
  } catch (error) {
    console.error("❌ Database integration test failed:", error.message)
    return false
  }
}

async function testPaystackDirectAPI() {
  console.log("\n🧪 Testing Direct Paystack API Connection...")

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testBooking.customerEmail,
        amount: testBooking.depositAmount * 100,
        reference: testBooking.paymentReference,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Direct Paystack API connection successful")
    console.log("📊 API Response:", {
      status: data.status,
      message: data.message,
      authorization_url: data.data?.authorization_url ? "✅ Present" : "❌ Missing",
    })

    return data
  } catch (error) {
    console.error("❌ Direct Paystack API test failed:", error.message)
    return null
  }
}

async function runPaystackTests() {
  console.log("🚀 Starting Paystack Integration Tests for Lashed by Deedee")
  console.log("=".repeat(60))

  const results = {
    initialization: false,
    verification: false,
    webhook: false,
    database: false,
    directAPI: false,
  }

  // Test 1: Payment Initialization
  const initResult = await testPaystackInitialization()
  results.initialization = !!initResult

  // Test 2: Payment Verification
  const verifyResult = await testPaystackVerification()
  results.verification = !!verifyResult

  // Test 3: Webhook Processing
  const webhookResult = await testWebhookSignature()
  results.webhook = !!webhookResult

  // Test 4: Database Integration
  const dbResult = await testDatabaseIntegration()
  results.database = dbResult

  // Test 5: Direct Paystack API
  const apiResult = await testPaystackDirectAPI()
  results.directAPI = !!apiResult

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 PAYSTACK INTEGRATION TEST RESULTS")
  console.log("=".repeat(60))

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? "✅ PASSED" : "❌ FAILED"
    const testName = test.charAt(0).toUpperCase() + test.slice(1)
    console.log(`${testName.padEnd(20)} ${status}`)
  })

  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length

  console.log("\n" + "-".repeat(60))
  console.log(`Overall Score: ${passedTests}/${totalTests} tests passed`)

  if (passedTests === totalTests) {
    console.log("🎉 All Paystack integration tests PASSED!")
    console.log("💳 Payment system is ready for production")
  } else {
    console.log("⚠️  Some tests failed. Please review the issues above.")
    console.log("🔧 Fix the failing components before going live")
  }

  console.log("=".repeat(60))
}

// Run the tests
runPaystackTests().catch((error) => {
  console.error("💥 Test suite crashed:", error)
  process.exit(1)
})
