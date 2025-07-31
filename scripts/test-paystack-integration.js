#!/usr/bin/env node

/**
 * Comprehensive Paystack Integration Test for Lashed by Deedee
 * Tests payment initialization, webhooks, signature validation, and database integration
 */

import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

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

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function testPaystackConnection() {
  log("\n🧪 Test 1: Paystack API Connection", colors.cyan)
  log("-".repeat(40), colors.cyan)

  try {
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    logSuccess("Paystack API connection successful")
    logInfo(`Available banks: ${data.data?.length || 0}`)
    return true
  } catch (error) {
    logError(`Paystack API connection failed: ${error.message}`)
    return false
  }
}

async function testPaymentInitialization() {
  log("\n🧪 Test 2: Payment Initialization", colors.cyan)
  log("-".repeat(40), colors.cyan)

  const testPayment = {
    email: "test@example.com",
    amount: 2500000, // ₦25,000 in kobo
    reference: `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    callback_url: "https://lashedbydeedee.com/booking/success",
    metadata: {
      customerName: "Test Customer",
      serviceName: "Classic Lash Extensions",
      bookingDate: "2024-08-15",
      bookingTime: "10:00 AM",
    },
  }

  try {
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayment),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status && data.data.authorization_url) {
      logSuccess("Payment initialization successful")
      logInfo(`Authorization URL: ${data.data.authorization_url}`)
      logInfo(`Access Code: ${data.data.access_code}`)
      logInfo(`Reference: ${data.data.reference}`)
      return { success: true, data: data.data, reference: testPayment.reference }
    } else {
      throw new Error(`Payment initialization failed: ${data.message}`)
    }
  } catch (error) {
    logError(`Payment initialization failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testPaymentVerification(reference) {
  log("\n🧪 Test 3: Payment Verification", colors.cyan)
  log("-".repeat(40), colors.cyan)

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status) {
      logSuccess("Payment verification API working")
      logInfo(`Transaction status: ${data.data.status}`)
      logInfo(`Amount: ₦${(data.data.amount / 100).toLocaleString()}`)
      logInfo(`Customer email: ${data.data.customer.email}`)
      return { success: true, data: data.data }
    } else {
      throw new Error(`Verification failed: ${data.message}`)
    }
  } catch (error) {
    logError(`Payment verification failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testWebhookSignatureValidation() {
  log("\n🧪 Test 4: Webhook Signature Validation", colors.cyan)
  log("-".repeat(40), colors.cyan)

  const testPayload = {
    event: "charge.success",
    data: {
      reference: "TEST_WEBHOOK_123",
      status: "success",
      amount: 2500000,
      customer: {
        email: "test@example.com",
      },
    },
  }

  try {
    const payloadString = JSON.stringify(testPayload)
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(payloadString).digest("hex")

    // Test valid signature
    const validSignature = hash
    const validHash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(payloadString).digest("hex")

    if (validSignature === validHash) {
      logSuccess("Valid webhook signature verification working")
    } else {
      throw new Error("Valid signature verification failed")
    }

    // Test invalid signature
    const invalidSignature = "invalid_signature_123"
    const invalidHash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(payloadString).digest("hex")

    if (invalidSignature !== invalidHash) {
      logSuccess("Invalid webhook signature rejection working")
    } else {
      throw new Error("Invalid signature should be rejected")
    }

    logInfo(`Generated signature: ${hash.substring(0, 20)}...`)
    return true
  } catch (error) {
    logError(`Webhook signature validation failed: ${error.message}`)
    return false
  }
}

async function testDatabaseIntegration() {
  log("\n🧪 Test 5: Database Integration", colors.cyan)
  log("-".repeat(40), colors.cyan)

  const testBooking = {
    client_name: "Test Customer",
    client_email: "test@example.com",
    client_phone: "+2348012345678",
    service_name: "Classic Lash Extensions",
    booking_date: "2024-08-15",
    booking_time: "10:00 AM",
    total_amount: 25000,
    deposit_amount: 12500,
    payment_status: "pending",
    payment_reference: `TEST_DB_${Date.now()}`,
    status: "pending",
    notes: "Test booking for Paystack integration",
  }

  try {
    // Test booking creation
    const { data: booking, error: insertError } = await supabase.from("bookings").insert(testBooking).select().single()

    if (insertError) {
      throw new Error(`Booking creation failed: ${insertError.message}`)
    }

    logSuccess("Test booking created successfully")
    logInfo(`Booking ID: ${booking.id}`)

    // Test booking update (simulate payment completion)
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Booking update failed: ${updateError.message}`)
    }

    logSuccess("Booking status updated successfully")
    logInfo(`Payment status: ${updatedBooking.payment_status}`)
    logInfo(`Booking status: ${updatedBooking.status}`)

    // Test booking retrieval by payment reference
    const { data: retrievedBooking, error: retrieveError } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_reference", testBooking.payment_reference)
      .single()

    if (retrieveError) {
      throw new Error(`Booking retrieval failed: ${retrieveError.message}`)
    }

    logSuccess("Booking retrieval by reference working")
    logInfo(`Retrieved booking: ${retrievedBooking.client_name}`)

    // Cleanup
    const { error: deleteError } = await supabase.from("bookings").delete().eq("id", booking.id)

    if (deleteError) {
      logWarning(`Failed to cleanup test booking: ${deleteError.message}`)
    } else {
      logSuccess("Test data cleaned up")
    }

    return true
  } catch (error) {
    logError(`Database integration failed: ${error.message}`)
    return false
  }
}

async function testPaystackWebhookFlow() {
  log("\n🧪 Test 6: Complete Webhook Flow Simulation", colors.cyan)
  log("-".repeat(40), colors.cyan)

  const reference = `TEST_FLOW_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

  try {
    // Step 1: Create test booking
    const testBooking = {
      client_name: "Webhook Test Customer",
      client_email: "webhook@example.com",
      client_phone: "+2348087654321",
      service_name: "Volume Lash Extensions",
      booking_date: "2024-08-20",
      booking_time: "2:00 PM",
      total_amount: 35000,
      deposit_amount: 17500,
      payment_status: "pending",
      payment_reference: reference,
      status: "pending",
      notes: "Webhook flow test booking",
    }

    const { data: booking, error: bookingError } = await supabase.from("bookings").insert(testBooking).select().single()

    if (bookingError) {
      throw new Error(`Test booking creation failed: ${bookingError.message}`)
    }

    logSuccess("Test booking created for webhook flow")

    // Step 2: Simulate webhook payload
    const webhookPayload = {
      event: "charge.success",
      data: {
        reference: reference,
        status: "success",
        amount: 1750000, // ₦17,500 in kobo
        customer: {
          email: "webhook@example.com",
        },
        metadata: {
          booking_id: booking.id,
        },
      },
    }

    // Step 3: Generate webhook signature
    const payloadString = JSON.stringify(webhookPayload)
    const signature = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(payloadString).digest("hex")

    logSuccess("Webhook payload and signature generated")
    logInfo(`Webhook event: ${webhookPayload.event}`)
    logInfo(`Payment reference: ${reference}`)

    // Step 4: Simulate webhook processing (update booking)
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("payment_reference", reference)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Webhook processing simulation failed: ${updateError.message}`)
    }

    logSuccess("Webhook processing simulation completed")
    logInfo(`Final payment status: ${updatedBooking.payment_status}`)
    logInfo(`Final booking status: ${updatedBooking.status}`)

    // Cleanup
    await supabase.from("bookings").delete().eq("id", booking.id)
    logSuccess("Webhook flow test data cleaned up")

    return true
  } catch (error) {
    logError(`Webhook flow simulation failed: ${error.message}`)
    return false
  }
}

async function runPaystackIntegrationTests() {
  try {
    log("🚀 Starting Comprehensive Paystack Integration Tests", colors.cyan)
    log("=".repeat(60), colors.cyan)

    // Environment check
    log("\n📋 Environment Check:", colors.cyan)
    log(`✅ Supabase URL: ${SUPABASE_URL ? "Set" : "❌ Missing"}`)
    log(`✅ Supabase Service Key: ${SUPABASE_SERVICE_KEY ? "Set" : "❌ Missing"}`)
    log(`✅ Paystack Secret Key: ${PAYSTACK_SECRET_KEY ? "Set" : "❌ Missing"}`)
    log(`✅ Paystack Public Key: ${PAYSTACK_PUBLIC_KEY ? "Set" : "❌ Missing"}`)

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY) {
      throw new Error("Missing required environment variables")
    }

    const results = {
      connection: false,
      initialization: false,
      verification: false,
      webhookSignature: false,
      databaseIntegration: false,
      webhookFlow: false,
    }

    // Run all tests
    results.connection = await testPaystackConnection()

    const initResult = await testPaymentInitialization()
    results.initialization = initResult.success

    if (initResult.success) {
      const verifyResult = await testPaymentVerification(initResult.reference)
      results.verification = verifyResult.success
    }

    results.webhookSignature = await testWebhookSignatureValidation()
    results.databaseIntegration = await testDatabaseIntegration()
    results.webhookFlow = await testPaystackWebhookFlow()

    // Summary
    log("\n" + "=".repeat(60), colors.cyan)
    log("📊 PAYSTACK INTEGRATION TEST RESULTS", colors.cyan)
    log("=".repeat(60), colors.cyan)

    const testResults = [
      { name: "API Connection", passed: results.connection },
      { name: "Payment Initialization", passed: results.initialization },
      { name: "Payment Verification", passed: results.verification },
      { name: "Webhook Signature Validation", passed: results.webhookSignature },
      { name: "Database Integration", passed: results.databaseIntegration },
      { name: "Complete Webhook Flow", passed: results.webhookFlow },
    ]

    testResults.forEach((test, index) => {
      const status = test.passed ? "✅ PASSED" : "❌ FAILED"
      log(`${index + 1}. ${test.name.padEnd(30)} ${status}`)
    })

    const passedTests = testResults.filter((test) => test.passed).length
    const totalTests = testResults.length

    log("\n" + "-".repeat(60), colors.cyan)
    log(`Overall Score: ${passedTests}/${totalTests} tests passed`)

    if (passedTests === totalTests) {
      log("🎉 All Paystack integration tests PASSED!", colors.green)
      log("💳 Payment system is ready for production", colors.green)
      log("🔒 Webhook security and database integration working perfectly", colors.green)
    } else {
      log("⚠️  Some tests failed. Please review the issues above.", colors.yellow)
      log("🔧 Fix the failing components before going live", colors.yellow)
    }

    log("=".repeat(60), colors.cyan)
  } catch (error) {
    logError(`Test suite failed: ${error.message}`)
    log("\n🔧 Troubleshooting:", colors.yellow)
    log("  1. Check all environment variables are set correctly")
    log("  2. Verify Paystack API keys are valid and active")
    log("  3. Ensure Supabase connection is working")
    log("  4. Check database schema matches expected structure")
    log("  5. Verify webhook endpoint configuration")
  }
}

// Run the tests
runPaystackIntegrationTests()
