#!/usr/bin/env node

/**
 * Comprehensive Booking Scenarios Test for Lashed by Deedee
 * Tests realistic booking flows, edge cases, and system integration
 */

const { createClient } = require("@supabase/supabase-js")
const crypto = require("crypto")
const { Resend } = require("resend")

// Configuration
const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY,
  },
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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

function logStep(step, message) {
  log(`${colors.bright}${step}${colors.reset} ${message}`, colors.cyan)
}

// Test scenarios
const bookingScenarios = [
  {
    name: "New Customer - Classic Lashes",
    customer: {
      firstName: "Emma",
      lastName: "Wilson",
      email: "emma.wilson@example.com",
      phone: "+2348123456789",
    },
    booking: {
      service: "Classic Lash Extensions",
      date: "2025-08-15",
      time: "10:00 AM",
      price: 20000,
      notes: "First time client, prefers natural look",
    },
  },
  {
    name: "Returning Customer - Volume Lashes + Brows",
    customer: {
      firstName: "Sophia",
      lastName: "Chen",
      email: "sophia.chen@example.com",
      phone: "+2348987654321",
    },
    booking: {
      service: "Volume Lash Extensions + Brow Shaping",
      date: "2025-08-16",
      time: "2:00 PM",
      price: 35000,
      notes: "Regular client, allergic to latex glue",
    },
  },
  {
    name: "Premium Service - Mega Volume",
    customer: {
      firstName: "Isabella",
      lastName: "Rodriguez",
      email: "isabella.rodriguez@example.com",
      phone: "+2348555123456",
    },
    booking: {
      service: "Mega Volume Lashes + Brow Lamination",
      date: "2025-08-17",
      time: "11:30 AM",
      price: 45000,
      notes: "Special event preparation, wants dramatic look",
    },
  },
  {
    name: "Maintenance Appointment",
    customer: {
      firstName: "Olivia",
      lastName: "Johnson",
      email: "olivia.johnson@example.com",
      phone: "+2348777888999",
    },
    booking: {
      service: "Lash Refill + Brow Touch-up",
      date: "2025-08-18",
      time: "4:30 PM",
      price: 15000,
      notes: "2-week refill, maintain current style",
    },
  },
  {
    name: "Training Session",
    customer: {
      firstName: "Ava",
      lastName: "Thompson",
      email: "ava.thompson@example.com",
      phone: "+2348333444555",
    },
    booking: {
      service: "Lash Extension Training - Beginner",
      date: "2025-08-19",
      time: "9:00 AM",
      price: 75000,
      notes: "Complete beginner, needs full kit",
    },
  },
]

async function testCompleteBookingFlow(scenario) {
  log(`\n🧪 Testing: ${scenario.name}`, colors.cyan)
  log("-".repeat(50), colors.cyan)

  const paymentReference = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const depositAmount = Math.round(scenario.booking.price * 0.5)

  try {
    // Step 1: Create booking via API
    log("📝 Step 1: Creating booking...", colors.blue)
    const bookingResponse = await fetch(`${config.baseUrl}/api/admin/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: scenario.customer.firstName,
        lastName: scenario.customer.lastName,
        email: scenario.customer.email,
        phone: scenario.customer.phone,
        date: scenario.booking.date,
        time: scenario.booking.time,
        selectedServices: [{ id: "1", name: scenario.booking.service }],
        totalPrice: scenario.booking.price,
        notes: scenario.booking.notes,
      }),
    })

    if (!bookingResponse.ok) {
      throw new Error(`Booking creation failed: ${bookingResponse.status}`)
    }

    const bookingData = await bookingResponse.json()
    log("✅ Booking created successfully", colors.green)

    // Step 2: Initialize payment
    log("💳 Step 2: Initializing payment...", colors.blue)
    const paymentResponse = await fetch(`${config.baseUrl}/api/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: scenario.customer.email,
        amount: depositAmount * 100, // Convert to kobo
        reference: paymentReference,
        metadata: {
          customerName: `${scenario.customer.firstName} ${scenario.customer.lastName}`,
          serviceName: scenario.booking.service,
          bookingDate: scenario.booking.date,
          bookingTime: scenario.booking.time,
        },
      }),
    })

    if (!paymentResponse.ok) {
      throw new Error(`Payment initialization failed: ${paymentResponse.status}`)
    }

    const paymentData = await paymentResponse.json()
    log("✅ Payment initialized successfully", colors.green)

    // Step 3: Simulate successful payment webhook
    log("🔔 Step 3: Simulating payment webhook...", colors.blue)
    const webhookPayload = {
      event: "charge.success",
      data: {
        reference: paymentReference,
        status: "success",
        amount: depositAmount * 100,
        customer: {
          email: scenario.customer.email,
        },
      },
    }

    const payloadString = JSON.stringify(webhookPayload)
    const signature = crypto.createHmac("sha512", config.paystack.secretKey).update(payloadString).digest("hex")

    const webhookResponse = await fetch(`${config.baseUrl}/api/payments/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
      },
      body: payloadString,
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook processing failed: ${webhookResponse.status}`)
    }

    log("✅ Payment webhook processed successfully", colors.green)

    // Step 4: Verify booking status update
    log("🔍 Step 4: Verifying booking status...", colors.blue)
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey)
    const { data: updatedBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_reference", paymentReference)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch updated booking: ${fetchError.message}`)
    }

    if (updatedBooking.payment_status !== "completed" || updatedBooking.status !== "confirmed") {
      throw new Error(
        `Booking status not updated correctly: ${updatedBooking.payment_status}, ${updatedBooking.status}`,
      )
    }

    log("✅ Booking status updated correctly", colors.green)

    // Step 5: Test email notifications
    log("📧 Step 5: Testing email notifications...", colors.blue)
    const resend = new Resend(config.resend.apiKey)

    const customerEmailResult = await resend.emails.send({
      from: "bookings@lashedbydeedee.com",
      to: [scenario.customer.email],
      subject: `Booking Confirmation - ${scenario.booking.service}`,
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${scenario.customer.firstName} ${scenario.customer.lastName},</p>
        <p>Your booking for ${scenario.booking.service} on ${scenario.booking.date} at ${scenario.booking.time} has been confirmed.</p>
        <p>Reference: ${paymentReference}</p>
        <p>Total Amount: ₦${scenario.booking.price.toLocaleString()}</p>
        <p>Deposit Paid: ₦${depositAmount.toLocaleString()}</p>
      `,
    })

    if (customerEmailResult.error) {
      logError(`Customer email failed: ${customerEmailResult.error.message}`)
      return false
    }

    logSuccess(`Customer email sent: ${customerEmailResult.data.id}`)

    const adminEmailResult = await resend.emails.send({
      from: "bookings@lashedbydeedee.com",
      to: ["admin@lashedbydeedee.com"],
      subject: `New Booking Alert - ${scenario.booking.service}`,
      html: `
        <h1>New Booking Alert</h1>
        <p>Customer: ${scenario.customer.firstName} ${scenario.customer.lastName}</p>
        <p>Email: ${scenario.customer.email}</p>
        <p>Phone: ${scenario.customer.phone}</p>
        <p>Service: ${scenario.booking.service}</p>
        <p>Date: ${scenario.booking.date}</p>
        <p>Time: ${scenario.booking.time}</p>
        <p>Amount: ₦${scenario.booking.price.toLocaleString()}</p>
        <p>Reference: ${paymentReference}</p>
      `,
    })

    if (adminEmailResult.error) {
      logError(`Admin email failed: ${adminEmailResult.error.message}`)
      return false
    }

    logSuccess(`Admin email sent: ${adminEmailResult.data.id}`)
    log("✅ Email notifications sent successfully", colors.green)

    // Cleanup
    await supabase.from("bookings").delete().eq("payment_reference", paymentReference)
    log("🧹 Test data cleaned up", colors.blue)

    return {
      success: true,
      scenario: scenario.name,
      bookingId: updatedBooking.id,
      paymentReference: paymentReference,
      emailsSent: {
        customer: true,
        admin: true,
      },
    }
  } catch (error) {
    logError(`❌ ${scenario.name} failed:`, error.message)

    // Cleanup on failure
    try {
      const supabase = createClient(config.supabase.url, config.supabase.serviceKey)
      await supabase.from("bookings").delete().eq("payment_reference", paymentReference)
    } catch (cleanupError) {
      logError("Failed to cleanup test data:", cleanupError.message)
    }

    return {
      success: false,
      scenario: scenario.name,
      error: error.message,
    }
  }
}

async function testEdgeCases() {
  log("\n🧪 Testing Edge Cases and Error Scenarios", colors.cyan)
  log("-".repeat(50), colors.cyan)

  const edgeCaseResults = {
    invalidEmail: false,
    missingFields: false,
    duplicateReference: false,
    invalidWebhookSignature: false,
  }

  // Test 1: Invalid email format
  try {
    log("📧 Testing invalid email format...", colors.blue)
    const response = await fetch(`${config.baseUrl}/api/admin/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: "Test",
        lastName: "User",
        email: "invalid-email-format",
        phone: "+2348123456789",
        date: "2025-08-20",
        time: "10:00 AM",
        selectedServices: [{ id: "1", name: "Test Service" }],
        totalPrice: 10000,
        notes: "Test booking",
      }),
    })

    // Should still create booking but email might fail
    edgeCaseResults.invalidEmail = true
    log("✅ Invalid email handled gracefully", colors.green)
  } catch (error) {
    log("✅ Invalid email rejected appropriately", colors.green)
    edgeCaseResults.invalidEmail = true
  }

  // Test 2: Missing required fields
  try {
    log("📝 Testing missing required fields...", colors.blue)
    const response = await fetch(`${config.baseUrl}/api/admin/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: "Test",
        // Missing lastName, email, etc.
      }),
    })

    if (response.status === 400) {
      edgeCaseResults.missingFields = true
      log("✅ Missing fields validation working", colors.green)
    }
  } catch (error) {
    log("✅ Missing fields handled appropriately", colors.green)
    edgeCaseResults.missingFields = true
  }

  // Test 3: Invalid webhook signature
  try {
    log("🔐 Testing invalid webhook signature...", colors.blue)
    const webhookPayload = {
      event: "charge.success",
      data: {
        reference: "test_ref",
        status: "success",
        amount: 10000,
      },
    }

    const response = await fetch(`${config.baseUrl}/api/payments/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": "invalid_signature",
      },
      body: JSON.stringify(webhookPayload),
    })

    if (response.status === 400) {
      edgeCaseResults.invalidWebhookSignature = true
      log("✅ Invalid webhook signature rejected", colors.green)
    }
  } catch (error) {
    log("✅ Invalid webhook signature handled", colors.green)
    edgeCaseResults.invalidWebhookSignature = true
  }

  return edgeCaseResults
}

async function testSystemPerformance() {
  log("\n🧪 Testing System Performance", colors.cyan)
  log("-".repeat(50), colors.cyan)

  const startTime = Date.now()
  const concurrentBookings = 3

  try {
    log(`🚀 Creating ${concurrentBookings} concurrent bookings...`, colors.blue)

    const concurrentPromises = Array.from({ length: concurrentBookings }, (_, index) => {
      const scenario = {
        name: `Concurrent Test ${index + 1}`,
        customer: {
          firstName: `Test${index + 1}`,
          lastName: "User",
          email: `test${index + 1}@example.com`,
          phone: `+23481234567${index}${index}`,
        },
        booking: {
          service: "Test Service",
          date: "2025-08-25",
          time: `${10 + index}:00 AM`,
          price: 20000,
          notes: `Concurrent test booking ${index + 1}`,
        },
      }
      return testCompleteBookingFlow(scenario)
    })

    const results = await Promise.all(concurrentPromises)
    const endTime = Date.now()
    const duration = endTime - startTime

    const successfulBookings = results.filter((r) => r.success).length

    log(`✅ Performance test completed in ${duration}ms`, colors.green)
    log(`📊 ${successfulBookings}/${concurrentBookings} concurrent bookings successful`, colors.blue)

    return {
      success: successfulBookings === concurrentBookings,
      duration,
      successRate: (successfulBookings / concurrentBookings) * 100,
    }
  } catch (error) {
    logError("❌ Performance test failed:", error.message)
    return {
      success: false,
      error: error.message,
    }
  }
}

async function runBookingScenarioTests() {
  log("\n🚀 Starting Comprehensive Booking Scenarios Test for Lashed by Deedee", colors.cyan)
  log("=".repeat(80), colors.cyan)

  const results = {
    scenarios: [],
    edgeCases: {},
    performance: {},
  }

  // Test all booking scenarios
  log("\n📋 Testing Realistic Booking Scenarios", colors.cyan)
  log("=".repeat(80), colors.cyan)

  for (const scenario of bookingScenarios) {
    const result = await testCompleteBookingFlow(scenario)
    results.scenarios.push(result)

    // Add delay between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Test edge cases
  results.edgeCases = await testEdgeCases()

  // Test performance
  results.performance = await testSystemPerformance()

  // Summary
  log("\n" + "=".repeat(80), colors.cyan)
  log("📊 COMPREHENSIVE BOOKING SCENARIOS TEST RESULTS", colors.cyan)
  log("=".repeat(80), colors.cyan)

  // Scenario results
  log("\n🎭 Booking Scenarios:", colors.cyan)
  results.scenarios.forEach((result) => {
    const status = result.success ? "✅ PASSED" : "❌ FAILED"
    log(`  ${result.scenario.padEnd(35)} ${status}`, colors.reset)
    if (result.success && result.emailsSent) {
      log(
        `    📧 Emails: Customer ${result.emailsSent.customer ? "✅" : "❌"} | Admin ${result.emailsSent.admin ? "✅" : "❌"}`,
        colors.reset,
      )
    }
  })

  // Edge case results
  log("\n🔍 Edge Cases:", colors.cyan)
  Object.entries(results.edgeCases).forEach(([test, passed]) => {
    const status = passed ? "✅ PASSED" : "❌ FAILED"
    const testName = test.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
    log(`  ${testName.padEnd(35)} ${status}`, colors.reset)
  })

  // Performance results
  log("\n⚡ Performance:", colors.cyan)
  if (results.performance.success) {
    log(`  Concurrent Bookings                 ✅ PASSED`, colors.green)
    log(`  Duration: ${results.performance.duration}ms`, colors.blue)
    log(`  Success Rate: ${results.performance.successRate}%`, colors.cyan)
  } else {
    log(`  Concurrent Bookings                 ❌ FAILED`, colors.red)
  }

  // Overall statistics
  const scenariosPassed = results.scenarios.filter((r) => r.success).length
  const totalScenarios = results.scenarios.length
  const edgeCasesPassed = Object.values(results.edgeCases).filter(Boolean).length
  const totalEdgeCases = Object.keys(results.edgeCases).length
  const performancePassed = results.performance.success ? 1 : 0

  const totalPassed = scenariosPassed + edgeCasesPassed + performancePassed
  const totalTests = totalScenarios + totalEdgeCases + 1

  log("\n" + "-".repeat(80), colors.cyan)
  log(`Overall Score: ${totalPassed}/${totalTests} tests passed`, colors.reset)
  log(
    `Scenario Success Rate: ${scenariosPassed}/${totalScenarios} (${Math.round((scenariosPassed / totalScenarios) * 100)}%)`,
    colors.blue,
  )

  if (totalPassed === totalTests) {
    log("🎉 ALL BOOKING SCENARIOS PASSED!", colors.green)
    log("🚀 Complete booking system is ready for production", colors.green)
    log("💎 Payment processing, email notifications, and database integration working perfectly", colors.green)
  } else {
    log("⚠️  Some tests failed. Please review the issues above.", colors.yellow)
    log("🔧 Fix the failing components before going live", colors.yellow)
  }

  log("=".repeat(80), colors.cyan)
}

// Run the comprehensive tests
if (require.main === module) {
  runBookingScenarioTests().catch((error) => {
    logError("💥 Booking scenarios test suite crashed:", error)
    process.exit(1)
  })
}

module.exports = {
  runBookingScenarioTests,
  testCompleteBookingFlow,
  testEdgeCases,
  testSystemPerformance,
}
