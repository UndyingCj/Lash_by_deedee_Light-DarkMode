#!/usr/bin/env node

/**
 * Booking Scenarios Test for Lashed by Deedee
 * Tests various booking scenarios and edge cases
 */

const { createClient } = require("@supabase/supabase-js")
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
const testScenarios = [
  {
    name: "Standard Booking",
    data: {
      customerName: "Alice Johnson",
      customerEmail: "alice.johnson@example.com",
      customerPhone: "+234 801 234 5678",
      services: ["Classic Lashes"],
      date: "2025-02-15",
      time: "10:00 AM",
      totalAmount: 25000,
      depositAmount: 12500,
      notes: "First time customer",
    },
  },
  {
    name: "Multiple Services Booking",
    data: {
      customerName: "Sarah Williams",
      customerEmail: "sarah.williams@example.com",
      customerPhone: "+234 802 345 6789",
      services: ["Mega Volume Lashes", "Brow Lamination"],
      date: "2025-02-16",
      time: "2:00 PM",
      totalAmount: 45000,
      depositAmount: 22500,
      notes: "Returning customer, prefers natural look",
    },
  },
  {
    name: "Premium Service Booking",
    data: {
      customerName: "Emma Davis",
      customerEmail: "emma.davis@example.com",
      customerPhone: "+234 803 456 7890",
      services: ["Microblading"],
      date: "2025-02-17",
      time: "11:00 AM",
      totalAmount: 65000,
      depositAmount: 32500,
      notes: "Special occasion - wedding preparation",
    },
  },
  {
    name: "Weekend Booking",
    data: {
      customerName: "Grace Thompson",
      customerEmail: "grace.thompson@example.com",
      customerPhone: "+234 804 567 8901",
      services: ["Volume Lashes"],
      date: "2025-02-22", // Saturday
      time: "1:00 PM",
      totalAmount: 30000,
      depositAmount: 15000,
      notes: "Weekend appointment",
    },
  },
  {
    name: "Early Morning Booking",
    data: {
      customerName: "Lisa Brown",
      customerEmail: "lisa.brown@example.com",
      customerPhone: "+234 805 678 9012",
      services: ["Classic Lashes"],
      date: "2025-02-18",
      time: "9:00 AM",
      totalAmount: 25000,
      depositAmount: 12500,
      notes: "Early morning appointment before work",
    },
  },
]

// Test functions
async function testEnvironmentSetup() {
  logStep("1.", "Testing Environment Setup")

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PAYSTACK_SECRET_KEY",
    "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
    "RESEND_API_KEY",
  ]

  let allPresent = true

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`)
    } else {
      logError(`${varName} is missing`)
      allPresent = false
    }
  }

  return allPresent
}

async function testDatabaseConnection() {
  logStep("2.", "Testing Database Connection")

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey)

    const { data, error } = await supabase.from("bookings").select("count", { count: "exact", head: true })

    if (error) {
      logError(`Database connection failed: ${error.message}`)
      return false
    }

    logSuccess(`Database connection successful. Found ${data} existing bookings`)
    return true
  } catch (error) {
    logError(`Database connection error: ${error.message}`)
    return false
  }
}

async function testAvailabilitySystem() {
  logStep("3.", "Testing Availability System")

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey)

    // Test blocked dates
    const { data: blockedDates, error: datesError } = await supabase.from("blocked_dates").select("*")

    if (datesError) {
      logError(`Blocked dates query failed: ${datesError.message}`)
      return false
    }

    logSuccess(`Blocked dates system working. Found ${blockedDates.length} blocked dates`)

    // Test blocked time slots
    const { data: blockedSlots, error: slotsError } = await supabase.from("blocked_time_slots").select("*")

    if (slotsError) {
      logError(`Blocked time slots query failed: ${slotsError.message}`)
      return false
    }

    logSuccess(`Blocked time slots system working. Found ${blockedSlots.length} blocked slots`)
    return true
  } catch (error) {
    logError(`Availability system error: ${error.message}`)
    return false
  }
}

async function testBookingCreation(scenario) {
  logInfo(`Testing: ${scenario.name}`)

  try {
    const supabase = createClient(config.supabase.url, config.supabase.serviceKey)
    const paymentReference = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Create booking record
    const bookingData = {
      client_name: scenario.data.customerName,
      client_email: scenario.data.customerEmail,
      client_phone: scenario.data.customerPhone,
      phone: scenario.data.customerPhone,
      email: scenario.data.customerEmail,
      service_name: scenario.data.services.join(", "),
      service: scenario.data.services.join(", "),
      booking_date: scenario.data.date,
      booking_time: scenario.data.time,
      total_amount: scenario.data.totalAmount,
      amount: scenario.data.depositAmount,
      deposit_amount: scenario.data.depositAmount,
      payment_reference: paymentReference,
      status: "pending",
      payment_status: "pending",
      notes: scenario.data.notes,
      special_notes: scenario.data.notes,
    }

    const { data: booking, error: bookingError } = await supabase.from("bookings").insert(bookingData).select().single()

    if (bookingError) {
      logError(`${scenario.name} - Booking creation failed: ${bookingError.message}`)
      return { success: false, error: bookingError.message }
    }

    logSuccess(`${scenario.name} - Booking created: ${booking.id}`)

    // Test payment status update
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
      })
      .eq("id", booking.id)
      .select()
      .single()

    if (updateError) {
      logError(`${scenario.name} - Status update failed: ${updateError.message}`)
      return { success: false, error: updateError.message, bookingId: booking.id }
    }

    logSuccess(`${scenario.name} - Status updated to confirmed`)

    return {
      success: true,
      bookingId: booking.id,
      paymentReference,
      booking: updatedBooking,
    }
  } catch (error) {
    logError(`${scenario.name} - Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function testPaystackIntegration(scenario) {
  logInfo(`Testing Paystack integration for: ${scenario.name}`)

  try {
    const paymentReference = `PAYSTACK_TEST_${Date.now()}`
    const amountInKobo = scenario.data.depositAmount * 100

    const payload = {
      email: scenario.data.customerEmail,
      amount: amountInKobo,
      reference: paymentReference,
      metadata: {
        customer_name: scenario.data.customerName,
        customer_phone: scenario.data.customerPhone,
        service_name: scenario.data.services.join(", "),
        booking_date: scenario.data.date,
        booking_time: scenario.data.time,
      },
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.paystack.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (!response.ok || !result.status) {
      logError(`${scenario.name} - Paystack initialization failed: ${result.message}`)
      return false
    }

    logSuccess(`${scenario.name} - Paystack initialization successful`)
    logInfo(`   Authorization URL: ${result.data.authorization_url}`)
    return true
  } catch (error) {
    logError(`${scenario.name} - Paystack error: ${error.message}`)
    return false
  }
}

async function testEmailNotifications(booking) {
  logInfo(`Testing email notifications for booking: ${booking.id}`)

  try {
    const resend = new Resend(config.resend.apiKey)

    // Test customer confirmation email
    const customerEmailResult = await resend.emails.send({
      from: "bookings@lashedbydeedee.com",
      to: [booking.client_email],
      subject: `Booking Confirmation - ${booking.service_name}`,
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${booking.client_name},</p>
        <p>Your booking for ${booking.service_name} on ${booking.booking_date} at ${booking.booking_time} has been confirmed.</p>
        <p>Reference: ${booking.payment_reference}</p>
        <p>Total Amount: ₦${booking.total_amount.toLocaleString()}</p>
        <p>Deposit Paid: ₦${booking.deposit_amount.toLocaleString()}</p>
      `,
    })

    if (customerEmailResult.error) {
      logError(`Customer email failed: ${customerEmailResult.error.message}`)
      return false
    }

    logSuccess(`Customer email sent: ${customerEmailResult.data.id}`)

    // Test admin notification email
    const adminEmailResult = await resend.emails.send({
      from: "bookings@lashedbydeedee.com",
      to: ["admin@lashedbydeedee.com"],
      subject: `New Booking Alert - ${booking.service_name}`,
      html: `
        <h1>New Booking Alert</h1>
        <p>Customer: ${booking.client_name}</p>
        <p>Email: ${booking.client_email}</p>
        <p>Phone: ${booking.client_phone}</p>
        <p>Service: ${booking.service_name}</p>
        <p>Date: ${booking.booking_date}</p>
        <p>Time: ${booking.booking_time}</p>
        <p>Amount: ₦${booking.total_amount.toLocaleString()}</p>
        <p>Reference: ${booking.payment_reference}</p>
      `,
    })

    if (adminEmailResult.error) {
      logError(`Admin email failed: ${adminEmailResult.error.message}`)
      return false
    }

    logSuccess(`Admin email sent: ${adminEmailResult.data.id}`)
    return true
  } catch (error) {
    logError(`Email notification error: ${error.message}`)
    return false
  }
}

async function testCompleteBookingScenarios() {
  logStep("4.", "Testing Complete Booking Scenarios")

  const results = []

  for (const scenario of testScenarios) {
    try {
      // Test booking creation
      const bookingResult = await testBookingCreation(scenario)

      if (!bookingResult.success) {
        results.push({
          scenario: scenario.name,
          success: false,
          error: bookingResult.error,
        })
        continue
      }

      // Test Paystack integration
      const paystackResult = await testPaystackIntegration(scenario)

      // Test email notifications
      const emailResult = await testEmailNotifications(bookingResult.booking)

      // Clean up test booking
      const supabase = createClient(config.supabase.url, config.supabase.serviceKey)
      await supabase.from("bookings").delete().eq("id", bookingResult.bookingId)
      logInfo(`${scenario.name} - Test data cleaned up`)

      results.push({
        scenario: scenario.name,
        success: paystackResult && emailResult,
        bookingCreated: true,
        paystackWorking: paystackResult,
        emailsWorking: emailResult,
      })
    } catch (error) {
      logError(`${scenario.name} - Scenario test failed: ${error.message}`)
      results.push({
        scenario: scenario.name,
        success: false,
        error: error.message,
      })
    }

    log("") // Add spacing between scenarios
  }

  return results
}

async function testEdgeCases() {
  logStep("5.", "Testing Edge Cases")

  const supabase = createClient(config.supabase.url, config.supabase.serviceKey)
  const edgeCases = []

  try {
    // Test 1: Duplicate payment reference
    logInfo("Testing duplicate payment reference handling...")
    const duplicateRef = `DUPLICATE_${Date.now()}`

    const booking1 = {
      client_name: "Test Customer 1",
      client_email: "test1@example.com",
      client_phone: "+234000000001",
      phone: "+234000000001",
      email: "test1@example.com",
      service_name: "Test Service",
      service: "Test Service",
      booking_date: "2025-08-01",
      booking_time: "10:00 AM",
      total_amount: 25000,
      amount: 12500,
      deposit_amount: 12500,
      payment_reference: duplicateRef,
      status: "pending",
      payment_status: "pending",
    }

    const { data: firstBooking, error: firstError } = await supabase.from("bookings").insert(booking1).select().single()

    if (firstError) {
      logError(`First booking with duplicate ref failed: ${firstError.message}`)
      edgeCases.push({ test: "Duplicate Reference", success: false })
    } else {
      // Try to insert second booking with same reference
      const booking2 = { ...booking1, client_name: "Test Customer 2", client_email: "test2@example.com" }
      const { error: secondError } = await supabase.from("bookings").insert(booking2)

      if (secondError && secondError.code === "23505") {
        logSuccess("Duplicate payment reference properly rejected")
        edgeCases.push({ test: "Duplicate Reference", success: true })
      } else {
        logError("Duplicate payment reference not properly handled")
        edgeCases.push({ test: "Duplicate Reference", success: false })
      }

      // Clean up
      await supabase.from("bookings").delete().eq("id", firstBooking.id)
    }

    // Test 2: Invalid date format
    logInfo("Testing invalid date format handling...")
    const invalidDateBooking = {
      ...booking1,
      payment_reference: `INVALID_DATE_${Date.now()}`,
      booking_date: "invalid-date",
    }

    const { error: invalidDateError } = await supabase.from("bookings").insert(invalidDateBooking)

    if (invalidDateError) {
      logSuccess("Invalid date format properly rejected")
      edgeCases.push({ test: "Invalid Date Format", success: true })
    } else {
      logError("Invalid date format not properly handled")
      edgeCases.push({ test: "Invalid Date Format", success: false })
    }

    // Test 3: Missing required fields
    logInfo("Testing missing required fields...")
    const incompleteBooking = {
      client_name: "Incomplete Customer",
      // Missing required fields
    }

    const { error: incompleteError } = await supabase.from("bookings").insert(incompleteBooking)

    if (incompleteError && incompleteError.code === "23502") {
      logSuccess("Missing required fields properly rejected")
      edgeCases.push({ test: "Missing Required Fields", success: true })
    } else {
      logError("Missing required fields not properly handled")
      edgeCases.push({ test: "Missing Required Fields", success: false })
    }
  } catch (error) {
    logError(`Edge case testing error: ${error.message}`)
    edgeCases.push({ test: "Edge Cases", success: false, error: error.message })
  }

  return edgeCases
}

// Main test runner
async function runBookingScenarioTests() {
  log("\n" + "=".repeat(60), colors.bright)
  log("📋 LASHED BY DEEDEE - BOOKING SCENARIOS TEST", colors.bright)
  log("=".repeat(60), colors.bright)
  log(`Started at: ${new Date().toISOString()}`, colors.cyan)
  log("")

  // Run all tests
  const envTest = await testEnvironmentSetup()
  if (!envTest) {
    logError("Environment setup failed. Exiting.")
    process.exit(1)
  }
  log("")

  const dbTest = await testDatabaseConnection()
  if (!dbTest) {
    logError("Database connection failed. Exiting.")
    process.exit(1)
  }
  log("")

  const availabilityTest = await testAvailabilitySystem()
  log("")

  const scenarioResults = await testCompleteBookingScenarios()
  log("")

  const edgeCaseResults = await testEdgeCases()
  log("")

  // Summary
  log("=".repeat(60), colors.bright)
  log("📊 BOOKING SCENARIOS TEST RESULTS", colors.bright)
  log("=".repeat(60), colors.bright)

  // Environment and basic tests
  logInfo("Basic System Tests:")
  logSuccess(`Environment Setup: ${envTest ? "PASSED" : "FAILED"}`)
  logSuccess(`Database Connection: ${dbTest ? "PASSED" : "FAILED"}`)
  logSuccess(`Availability System: ${availabilityTest ? "PASSED" : "FAILED"}`)
  log("")

  // Scenario tests
  logInfo("Booking Scenario Tests:")
  const passedScenarios = scenarioResults.filter((r) => r.success).length
  const totalScenarios = scenarioResults.length

  scenarioResults.forEach((result) => {
    if (result.success) {
      logSuccess(`${result.scenario}: PASSED`)
    } else {
      logError(`${result.scenario}: FAILED${result.error ? ` - ${result.error}` : ""}`)
    }
  })

  log("")
  logInfo(`Scenario Tests: ${passedScenarios}/${totalScenarios} passed`)
  log("")

  // Edge case tests
  logInfo("Edge Case Tests:")
  const passedEdgeCases = edgeCaseResults.filter((r) => r.success).length
  const totalEdgeCases = edgeCaseResults.length

  edgeCaseResults.forEach((result) => {
    if (result.success) {
      logSuccess(`${result.test}: PASSED`)
    } else {
      logError(`${result.test}: FAILED${result.error ? ` - ${result.error}` : ""}`)
    }
  })

  log("")
  logInfo(`Edge Case Tests: ${passedEdgeCases}/${totalEdgeCases} passed`)
  log("")

  // Overall summary
  const totalTests = 3 + totalScenarios + totalEdgeCases // 3 basic tests + scenarios + edge cases
  const totalPassed =
    (envTest ? 1 : 0) + (dbTest ? 1 : 0) + (availabilityTest ? 1 : 0) + passedScenarios + passedEdgeCases

  log(`Total Tests: ${totalTests}`, colors.bright)
  log(`Passed: ${totalPassed}`, colors.green)
  log(`Failed: ${totalTests - totalPassed}`, totalPassed === totalTests ? colors.green : colors.red)
  log(`Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`, colors.cyan)

  log("")
  log(`Completed at: ${new Date().toISOString()}`, colors.cyan)
  log("=".repeat(60), colors.bright)

  if (totalPassed === totalTests) {
    logSuccess("🎉 ALL BOOKING SCENARIO TESTS PASSED! System is fully functional.")
  } else {
    logError(`❌ ${totalTests - totalPassed} test(s) failed. Please check the errors above.`)
  }

  process.exit(totalPassed === totalTests ? 0 : 1)
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
  runBookingScenarioTests()
}

module.exports = {
  runBookingScenarioTests,
  testEnvironmentSetup,
  testDatabaseConnection,
  testAvailabilitySystem,
  testBookingCreation,
  testPaystackIntegration,
  testEmailNotifications,
  testCompleteBookingScenarios,
  testEdgeCases,
}
